// ================================================================================
// SUBMISSION CLASS TEMPLATE
// ================================================================================
import { Request } from 'express';

import { checkLogin, validatePermission } from './userlib';
import CF from '../../config';
import ERR, { ErrorObj, isError } from '../../lib/error';
import { currentTime, isStringJSON } from '../../lib/globallib';
import { NoResponse } from '../../lib/result';
import SubmissionQuery from '../../queries/submissionQuery';
import {
  AnySubmission,
  queueCode,
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
  // Either standard or staff user
  async createSubmission(
    _request: Request,
    payload: AnySubmission,
    otherUid?: number
  ) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) return getLogin as ErrorObj;
    const currentUser = getLogin as User;
    const ownSubmission = !otherUid;

    // Verify permission
    const permitted = await validatePermission(
      _request,
      ownSubmission ? 'can_submit' : 'acp_modq'
    );
    if (!permitted) {
      return ERR(ownSubmission ? 'userPermission' : 'userStaffPermit');
    }

    // Validate/Prepare payload
    if (!this.validateDataKeys(payload)) return ERR('submissionMissingParam');
    const uid = ownSubmission ? currentUser.uid : otherUid;

    // Execute
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
  async getQueueList() {
    return {} as AnySubmission;
  }
  
  async voteSubmission(
    _request: Request,
    id: number,
    decision: number,
    message: string,
    override?: boolean
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
    if (submission?.queue_code !== queueCode.new) {
      return ERR('submissionNotInQueue');
    }

    // Process submission votes
    return await this.processVotes(
      uid,
      submission,
      decision,
      message,
      override
    );
  }

  async voteSubmissionUpdate(
    _request: Request,
    id: number,
    decision: number,
    message: string,
    override?: boolean
  ) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) return getLogin as ErrorObj;

    // Verify permission
    const uid = (getLogin as User)?.uid ?? 0;
    const permitted = await validatePermission(
      _request,
      override ? 'acp_super' : 'acp_modq'
    );
    if (!permitted) return ERR(override ? 'userRootPermit' : 'userStaffPermit');

    // Grab the existing update, ensure there is no error
    const getUpdate = await this.query.getSubmissionUpdatesByVid(id);
    if (isError(getUpdate)) return getUpdate;

    // Ensure the submission is in queue
    const update = getUpdate as SubmissionVersion;
    if (update?.in_queue !== queueCode.new) {
      return ERR('submissionNotInQueue');
    }

    // Process submission votes
    return await this.processVotesUpdate(
      uid,
      update,
      decision,
      message,
      override
    );
  }

  async updateSubmissionStaff(
    _request: Request,
    id: number,
    payload: AnySubmission,
    message: string,
    version: string
  ) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) return getLogin as ErrorObj;

    // Verify permission
    const permitted = await validatePermission(_request, 'acp_modq');
    if (!permitted) return ERR('userStaffPermit');

    // Verify submission exists
    const checkSubmission = await this.getSubmissionDetails(id);
    if (isError(checkSubmission)) return checkSubmission as ErrorObj;

    // Execute & resolve
    const result = await this.query.updateSubmission(
      id,
      payload,
      message,
      version,
      true
    );
    if (isError(result)) return result as ErrorObj;
    return result as NoResponse;
  }

  async deleteSubmission(_request: Request, id: number) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) return getLogin as ErrorObj;

    // Verify permission
    const permitted = await validatePermission(_request, 'acp_modq');
    if (!permitted) return ERR('userStaffPermit');

    // Verify submission exists
    const checkSubmission = await this.getSubmissionDetails(id);
    if (isError(checkSubmission)) return checkSubmission as ErrorObj;
    const toDelete = checkSubmission as AnySubmission;

    // Execute & resolve
    const deletion = await this.query.deleteSubmission(id);
    if (!isError(deletion)) this.deleteSubmissionFiles(toDelete);
    return deletion;
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
    message: string,
    override?: boolean
  ) {
    // Grab the submission votes
    const { id } = submission;
    const getVotes = await this.query.getVotesById(id, false);
    if (isError(getVotes)) return getVotes;

    // Determine if the user has voted already
    let alreadyVoted = 0;
    const existingVote = getVotes as StaffVote[];
    const findUserVote = existingVote.find((data) => data.uid === uid);
    if (findUserVote) {
      alreadyVoted = findUserVote.voteid;
      if (findUserVote.decision === decision && !override) {
        return ERR('submissionAlreadyVoted');
      }
    }

    // count the number of votes including the current decision
    const accepts =
      existingVote.filter((vote) => vote.decision >= 1).length +
      (decision ? 1 : 0);
    const declines =
      existingVote.filter((vote) => vote.decision === 0).length +
      (decision ? 0 : 1);

    // Register vote
    const vote = alreadyVoted
      ? await this.query.updateVote(alreadyVoted, decision, message)
      : await this.query.addVote(uid, id, decision, message);
    if (isError(vote)) return vote as ErrorObj;

    // Accept
    if (accepts >= CF.QC_VOTES_NEW || (override && decision)) {
      const payload = this.queueUpdatePayload(queueCode.accepted, false);
      return await this.query.updateSubmissionLazy(id, payload);
    }
    // Decline
    else if (declines >= CF.QC_VOTES_NEW || (override && !decision)) {
      const payload = this.queueUpdatePayload(queueCode.declined, false);
      this.deleteSubmissionFiles(submission);
      return await this.query.updateSubmissionLazy(id, payload);
    }
    return vote;
  }

  private async processVotesUpdate(
    uid: number,
    update: SubmissionVersion,
    decision: number,
    message: string,
    override?: boolean
  ) {
    // Grab the submission votes
    const { vid, rid } = update;
    const getVotes = await this.query.getVotesById(vid, true);
    if (isError(getVotes)) return getVotes;

    // Determine if the user has voted already
    let alreadyVoted = 0;
    const existingVote = getVotes as StaffVote[];
    const findUserVote = existingVote.find((data) => data.uid === uid);
    if (findUserVote) {
      alreadyVoted = findUserVote.voteid;
      if (findUserVote.decision === decision && !override) {
        return ERR('submissionAlreadyVoted');
      }
    }

    // Grab the existing submission, ensure there is no error
    const getSubmission = alreadyVoted
      ? await this.query.updateVote(alreadyVoted, decision, message)
      : await this.query.getSubmissionById(rid);
    if (isError(getSubmission)) return getSubmission;
    const submission = getSubmission as AnySubmission;

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

    // Parse update data (ensure the data is valid too)
    if (!isStringJSON(update.data)) {
      const decline = await this.query.updateSubmissionVersion(vid, false);
      if (isError(decline)) return decline as ErrorObj;
      return ERR('submissionUpdateData');
    }
    const updateData = JSON.parse(update.data) as AnySubmission;

    // Accept
    if (accepts >= CF.QC_VOTES_UPDATE || (override && decision)) {
      // Update the vid row in versions table
      const updateVer = await this.query.updateSubmissionVersion(vid, true);
      if (isError(updateVer)) return updateVer as ErrorObj;
      // Remove the outdated files
      this.deleteSubmissionFiles(submission);
      // Prepare data to update the real submission
      const accept = this.queueUpdatePayload(queueCode.accepted, true);
      const payload = { ...accept, ...updateData } as AnySubmission;
      return await this.query.updateSubmissionLazy(rid, payload);
    }
    // Decline
    else if (declines >= CF.QC_VOTES_UPDATE || (override && !decision)) {
      // Update the vid row in versions table
      const updateVer = await this.query.updateSubmissionVersion(vid, false);
      if (isError(updateVer)) return updateVer as ErrorObj;
      // Remove update files
      this.deleteSubmissionFiles(updateData);
      // Prepare data to update the real submission
      // Will put this as accepted since the original submission is already accepted
      const payload = this.queueUpdatePayload(queueCode.accepted, true);
      return await this.query.updateSubmissionLazy(rid, payload);
    }
    return vote;
  }

  private queueUpdatePayload(queue_code: number, update?: boolean) {
    const acceptDate =
      queue_code === queueCode.accepted
        ? update
          ? { update_accept_date: currentTime() }
          : { accept_date: currentTime() }
        : {};
    let filesToRemove: AnySubmission = {};
    if (this.kind === 'sprites') {
      filesToRemove = {
        file: '',
        thumbnail: '',
      };
    }
    if (this.kind === 'games') {
      filesToRemove = {
        file: '',
        preview: '',
        thumbnail: '',
      };
    }
    const output: AnySubmission = {
      queue_code,
      decision: '',
      ...acceptDate,
      ...filesToRemove,
    };
    return output;
  }

  private deleteSubmissionFiles(submission: AnySubmission) {
    switch (this.kind) {
      case 'sprites':
        deleteSpriteFile(submission.file, submission.thumbnail);
        break;
    }
  }
}
