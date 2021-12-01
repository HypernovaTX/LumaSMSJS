// ================================================================================
// SUBMISSION CLASS TEMPLATE
// ================================================================================
import { Request } from 'express';

import { checkLogin, validatePermission } from './userlib';
import CF from '../../config';
import ERR, { ErrorObj, isError } from '../../lib/error';
import { noContentResponse, NoResponse } from '../../lib/result';
import SubmissionQuery from '../../queries/submissionQuery';
import {
  AnySubmission,
  queue_code,
  StaffVote,
  SubmissionKinds,
  SubmissionVersion,
} from '../../schema/submissionType';
import { User } from '../../schema/userTypes';

import { deleteFile as deleteSpriteFile } from '../subSprite';

// Types/constants
type ListPublicFunction = Parameters<
  (
    page: number,
    count: number,
    column: string,
    asc: boolean,
    filter: [string, string][]
  ) => Promise<ErrorObj | SubmissionVersion[]>
>;

export default class Submission {
  kind: SubmissionKinds;
  query: SubmissionQuery;

  constructor(submissionKind: SubmissionKinds) {
    this.kind = submissionKind;
    this.query = new SubmissionQuery(submissionKind);
  }

  // ----- READ ONLY METHODS -----
  async getPublicList(...args: ListPublicFunction) {
    const getData = await this.query.getSubmissionList('accepted', ...args);
    if (isError(getData)) return getData as ErrorObj;
    const submissions = getData as AnySubmission[];
    const cleanedData = submissions.map((submission) =>
      this.removeSensitiveSubProp(submission)
    );
    return cleanedData as AnySubmission[];
  }

  async getSubmissionDetails(id: number) {
    const getData = await this.query.getSubmissionById(id);
    if (isError(getData)) return getData as ErrorObj;
    const submission = this.removeSensitiveSubProp(getData as AnySubmission);
    return submission as AnySubmission;
  }

  async getSubmissionHistory(rid: number) {
    const getData = await this.query.getSubmissionUpdatesByRid(rid);
    if (isError(getData)) return getData as ErrorObj;
    return getData as SubmissionVersion[];
  }

  // ----- WRITE METHODS -----
  async createSubmission(_request: Request, payload: AnySubmission) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) return getLogin as ErrorObj;

    // Verify permission
    const permitted = await validatePermission(_request, 'can_submit');
    if (!permitted) return ERR('userPermission');

    // Validate payload
    if (!this.validateDataKeys(payload)) return ERR('submissionMissingParam');

    // Execute
    const { uid } = getLogin as AnySubmission;
    const firstResult = await this.query.createSubmission(uid, payload);
    return firstResult;
  }

  async updateSubmission(
    _request: Request,
    id: number,
    payload: AnySubmission,
    message: string,
    version: string,
    queue?: boolean
  ) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) return getLogin as ErrorObj;

    // Verify permission
    const permitted = await validatePermission(_request, 'can_submit');
    if (!permitted) return ERR('userPermission');

    // Verify submission exists
    const checkSubmission = await this.getSubmissionDetails(id);
    if (isError(checkSubmission)) return checkSubmission as ErrorObj;

    // Verify the submission is created by the same user
    const currentUser = getLogin as User;
    const getSubmission = checkSubmission as AnySubmission;
    if (currentUser?.uid !== getSubmission?.uid) {
      return ERR('submissionNotAllowed');
    }

    // Execute & resolve
    const result = await (queue
      ? this.query.createSubmissionVersion(id, payload, message, version)
      : this.query.updateSubmission(id, payload, message, version));
    if (isError(result)) return result as ErrorObj;
    return result as NoResponse;
  }

  // ----- STAFF METHODS -----
  async voteSubmission(
    _request: Request,
    id: number,
    decision: number,
    message: string
  ) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) return getLogin as ErrorObj;

    // Verify permission
    const uid = (getLogin as User)?.uid ?? 0;
    const permitted = await validatePermission(_request, 'acp_modq');
    if (!permitted) return ERR('userStaffPermit');

    // Grab the existing submission, ensure there is no error
    const getSubmission = await this.query.getSubmissionById(id);
    if (isError(getSubmission)) return getSubmission;

    // Ensure the submission is in queue
    const submission = getSubmission as AnySubmission;
    if (submission?.queue_code !== queue_code.new) {
      return ERR('submissionNotInQueue');
    }

    // Process submission votes
    return await this.processVotes(uid, submission, decision, message);
  }

  // Only root admin can delete submissions
  async deleteSubmission(_request: Request, id: number) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) return getLogin as ErrorObj;

    // Verify permission
    const permitted = await validatePermission(_request, 'acp_super');
    if (!permitted) return ERR('userStaffPermit');

    // Execute & resolve
    return await this.query.deleteSubmission(id);
  }

  // !!!!! PRIVATE METHODS !!!!!
  private removeSensitiveSubProp(submission: AnySubmission) {
    if (submission?.queue_code) delete submission?.queue_code;
    if (submission?.decision) delete submission?.decision;
    return submission;
  }

  private validateDataKeys(payload: AnySubmission) {
    const missingGeneralKeys =
      !payload?.title ||
      !payload?.description ||
      !payload?.file ||
      !payload?.thumbnail ||
      !payload?.file_mime;
    if (missingGeneralKeys) return false;
    return true;
  }

  private async processVotes(
    uid: number,
    submission: AnySubmission,
    decision: number,
    message: string
  ) {
    // Grab the submission votes
    const { id } = submission;
    const getVotes = await this.query.getVotesById(id, false);
    if (isError(getVotes)) return getVotes;

    // Determine if the user has voted already
    const existingVote = getVotes as StaffVote[];
    const findUser = existingVote.filter((data) => data.uid === uid);
    if (findUser.length > 0) return ERR('submissionAlreadyVoted');

    // count the number of votes including the current decision
    const accepts =
      existingVote.filter((vote) => vote.decision >= 1).length +
      (decision ? 1 : 0);
    const declines =
      existingVote.filter((vote) => vote.decision === 0).length +
      (decision ? 0 : 1);

    // Register vote
    const vote = await this.query.addVote(uid, id, decision, message);
    if (isError(vote)) return vote as ErrorObj;

    // Accept
    if (accepts >= CF.QC_VOTES_NEW) {
      const payload = this.queueUpdatePayload(queue_code.accepted);
      return await this.query.updateSubmissionLazy(id, payload);
    }
    // Decline
    else if (declines >= CF.QC_VOTES_NEW) {
      const payload = this.queueUpdatePayload(queue_code.declined);
      this.deleteSubmissionFiles(submission);
      return await this.query.updateSubmissionLazy(id, payload);
    }
    return vote;
  }

  private async processVotesUpdate(
    uid: number,
    update: SubmissionVersion,
    decision: number,
    message: string
  ) {
    // Grab the submission votes
    const { vid, rid } = update;
    const getVotes = await this.query.getVotesById(vid, true);
    if (isError(getVotes)) return getVotes;

    // Determine if the user has voted already
    const existingVote = getVotes as StaffVote[];
    const findUser = existingVote.filter((data) => data.uid === uid);
    if (findUser.length > 0) return ERR('submissionAlreadyVoted');

    // count the number of votes including the current decision
    const accepts =
      existingVote.filter((vote) => vote.decision >= 1).length +
      (decision ? 1 : 0);
    const declines =
      existingVote.filter((vote) => vote.decision === 0).length +
      (decision ? 0 : 1);

    // Register vote
    const vote = await this.query.addVote(uid, vid, decision, message, true);
    if (isError(vote)) return vote as ErrorObj;

    // Accept
    if (accepts >= CF.QC_VOTES_UPDATE) {
      // Update the vid row in versions table
      const updateVer = await this.query.updateSubmissionVersion(vid, true);
      if (isError(updateVer)) return updateVer as ErrorObj;
      // Prepare data to update the real submission
      const accept = this.queueUpdatePayload(queue_code.accepted);
      const payload = { ...accept, ...update.data };
      return await this.query.updateSubmissionLazy(rid, payload);
    }
    // Decline
    else if (declines >= CF.QC_VOTES_UPDATE) {
      // Update the vid row in versions table
      const updateVer = await this.query.updateSubmissionVersion(vid, false);
      if (isError(updateVer)) return updateVer as ErrorObj;
      // Prepare data to update the real submission
      // Will put this as accepted since the original submission is already accepted
      const payload = this.queueUpdatePayload(queue_code.accepted);
      this.deleteSubmissionFiles(update.data as AnySubmission);
      return await this.query.updateSubmissionLazy(rid, payload);
    }
    return vote;
  }

  private queueUpdatePayload(queue_code: number) {
    return {
      queue_code,
      decision: '',
    };
  }

  private deleteSubmissionFiles(submission: AnySubmission) {
    switch (this.kind) {
      case 'sprites':
        deleteSpriteFile(submission.file, submission.thumbnail);
        break;
    }
  }
}
