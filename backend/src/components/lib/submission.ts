// ================================================================================
// SUBMISSION CLASS TEMPLATE
// ================================================================================
import { Request } from 'express';
import fs from 'fs';

import { checkLogin, validatePermission } from './userlib';
import CF from '../../config';
import ERR, { ErrorObj, isError } from '../../lib/error';
import { isStringJSON } from '../../lib/globallib';
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

  // READ ONLY METHODS
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

  // WRITE METHODS
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
      ? this.query.updateSubmissionQueue(id, payload, message, version)
      : this.query.updateSubmission(id, payload, message, version));
    if (isError(result)) return result as ErrorObj;
    return result as NoResponse;
  }

  // STAFF METHODS
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

    // Grab the submission votes
    const existingVote: StaffVote[] = isStringJSON(submission?.decision || '')
      ? JSON.parse(submission?.decision)
      : [];

    // Determine if the user has voted already
    const findUser = existingVote.filter((data) => data.uid === uid);
    if (findUser.length > 0) return ERR('submissionAlreadyVoted');

    // Add the current vote
    existingVote.push({ uid, decision, message });

    // Process submission votes
    return await this.processVotes(id, existingVote);
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

  // PRIVATE METHODS
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
    id: number,
    votes: StaffVote[],
    isUpdate?: boolean
  ) {
    // count the number of votes
    const accepts = votes.filter((vote) => vote.decision >= 1).length;
    const declines = votes.filter((vote) => vote.decision === 0).length;
    // Process new submission
    if (!isUpdate) {
      // Accept
      if (accepts >= CF.QC_VOTES_NEW) {
        const payload: AnySubmission = {
          queue_code: queue_code.accepted,
          //decision: [],
        };
        return await this.query.updateSubmissionLazy(id, payload);
      }
      // Decline
      else if (declines >= CF.QC_VOTES_NEW) {
        const payload: AnySubmission = { queue_code: queue_code.declined };
        return await this.query.updateSubmissionLazy(id, payload);
      }
      // Apply votes
      else {
        //const payload: AnySubmission = { decision: votes };
        // return await this.query.updateSubmissionLazy(id, payload);
      }
    }
    // Process update submission
    if (accepts >= CF.QC_VOTES_UPDATE) {
      // Grab the update details
      const data = await this.query.getSubmissionUpdatesByRid(id);
      if (isError(data)) {
        return data as ErrorObj;
      }
      // Prepare the data
      // const updatePayload = {
      //   ...(data as SubmissionVersion).data,
      //   queue_code: 0,
      //   decision: [],
      // } as AnySubmission;
      // return await this.query.updateSubmissionLazy(id, updatePayload);
    }
    // Decline
    else if (declines >= CF.QC_VOTES_NEW) {
      this.declineSubmission(id);
      return noContentResponse();
    }
    // Apply votes
    else {
      // const payload: AnySubmission = { decision: votes };
      // return await this.query.updateSubmissionLazy(id, payload);
    }
  }

  private declineSubmission(id: number) {
    console.log(id);
  }
}
