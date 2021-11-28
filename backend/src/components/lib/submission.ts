// ================================================================================
// SUBMISSION CLASS TEMPLATE
// ================================================================================
import { Request } from 'express';
import schedule from 'node-schedule';

import { checkLogin, validatePermission } from './userlib';
import CF from '../../config';
import ERR, { ErrorObj, isError } from '../../lib/error';
import { isStringJSON } from '../../lib/globallib';
import { noContentResponse, NoResponse } from '../../lib/result';
import SubmissionQuery from '../../queries/submissionQuery';
import {
  AnySubmission,
  AnySubmissionResponse,
  queue_code,
  staffVoteList,
  submissionKinds,
  SubmissionVersionResponse,
} from '../../schema/submissionType';
import { User } from '../../schema/userTypes';

type ListPublicFunction = Parameters<
  (
    page: number,
    count: number,
    column: string,
    asc: boolean,
    filter: [string, string][]
  ) => Promise<ErrorObj | SubmissionVersionResponse[]>
>;

export default class Submission {
  kind: submissionKinds;
  query: SubmissionQuery;

  constructor(submissionKind: submissionKinds) {
    this.kind = submissionKind;
    this.query = new SubmissionQuery(submissionKind);
  }

  // READ ONLY METHODS
  async getPublicList(...args: ListPublicFunction) {
    const getData = await this.query.getSubmissionList('accepted', ...args);
    if (isError(getData)) {
      return getData as ErrorObj;
    }
    const submissions = getData as AnySubmissionResponse[];
    const cleanedData = submissions.map((submission) =>
      this.removeSensitiveSubProp(submission)
    );
    return cleanedData as AnySubmissionResponse[];
  }

  async getSubmissionDetails(id: number) {
    const getData = await this.query.getSubmissionById(id);
    if (isError(getData)) {
      return getData as ErrorObj;
    }
    const submission = this.removeSensitiveSubProp(
      getData as AnySubmissionResponse
    );
    return submission as AnySubmissionResponse;
  }

  async getSubmissionHistory(rid: number) {
    const getData = await this.query.getSubmissionUpdatesByRid(rid);
    if (isError(getData)) {
      return getData as ErrorObj;
    }
    return getData as SubmissionVersionResponse[];
  }

  // WRITE METHODS
  async createSubmission(_request: Request, payload: AnySubmission) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) {
      return getLogin as ErrorObj;
    }
    // Verify permission
    const permitted = await validatePermission(_request, 'can_submit');
    if (!permitted) {
      return ERR('userPermission');
    }
    // Validate payload
    if (!this.validatePayloadKeys(payload)) {
      return ERR('submissionMissingParam');
    }
    // Execute
    const { uid } = getLogin as AnySubmissionResponse;
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
    if (isError(getLogin)) {
      return getLogin as ErrorObj;
    }
    // Verify permission
    const permitted = await validatePermission(_request, 'can_submit');
    if (!permitted) {
      return ERR('userPermission');
    }
    // Verify submission exists
    const checkSubmission = await this.getSubmissionDetails(id);
    if (isError(checkSubmission)) {
      return checkSubmission as ErrorObj;
    }
    // Verify the submission is created by the same user
    const currentUser = getLogin as User;
    const getSubmission = checkSubmission as AnySubmissionResponse;
    if (currentUser?.uid !== getSubmission?.uid) {
      return ERR('submissionNotAllowed');
    }
    // Execute
    const result = await (queue
      ? this.query.updateSubmissionQueue(id, payload, message, version)
      : this.query.updateSubmission(id, payload, message, version));
    if (isError(result)) {
      return result as ErrorObj;
    }
    return result as NoResponse;
  }

  // STAFF METHODS
  async voteSubmission(
    _request: Request,
    id: number,
    decision: number,
    reason: string
  ) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) {
      return getLogin as ErrorObj;
    }
    const uid = (getLogin as User)?.uid ?? 0;
    // Verify permission
    const permitted = await validatePermission(_request, 'acp_modq');
    if (!permitted) {
      return ERR('userStaffPermit');
    }
    // Grab the existing submission, ensure there is no error
    const getSubmission = await this.query.getSubmissionById(id);
    if (isError(getSubmission)) {
      return getSubmission;
    }
    // Grab the submission votes
    const submission = getSubmission as AnySubmissionResponse;
    const existingVote: staffVoteList = isStringJSON(submission?.decision || '')
      ? JSON.parse(submission?.decision)
      : [];
    // Determine if the user has voted already
    const findUser = existingVote.filter((data) => data.uid === uid);
    if (findUser.length > 0) {
      return ERR('submissionAlreadyVoted');
    }
    // Add the current vote
    existingVote.push({ uid, decision, reason });
  }

  // Only root admin can delete submissions
  async deleteSubmission(_request: Request, id: number) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) {
      return getLogin as ErrorObj;
    }
    // Verify permission
    const permitted = await validatePermission(_request, 'acp_super');
    if (!permitted) {
      return ERR('userStaffPermit');
    }
    return await this.query.deleteSubmission(id);
  }

  // PRIVATE METHODS
  private removeSensitiveSubProp(submission: AnySubmissionResponse) {
    if (submission?.queue_code) {
      delete submission?.queue_code;
    }
    if (submission?.decision) {
      delete submission?.decision;
    }
    return submission;
  }

  private validatePayloadKeys(payload: AnySubmission) {
    const missingGeneralKeys =
      !payload?.title ||
      !payload?.description ||
      !payload?.file ||
      !payload?.thumbnail ||
      !payload?.file_mime;
    if (missingGeneralKeys) {
      return false;
    }
    return true;
  }

  private async processVotes(
    id: number,
    votes: staffVoteList,
    isUpdate?: boolean
  ) {
    // count the number of votes
    const accepts = votes.filter((vote) => vote.decision >= 1).length;
    const declines = votes.filter((vote) => vote.decision === 0).length;
    // Process new submission
    if (!isUpdate) {
      if (accepts >= CF.QC_VOTES_NEW) {
        const payload: AnySubmission = { queue_code: 0, decision: [] };
        return await this.query.updateSubmissionLazy(id, payload);
      } else if (declines >= CF.QC_VOTES_NEW) {
        this.declineSubmission(id);
        return noContentResponse();
      } else {
        const payload: AnySubmission = { decision: votes };
        return await this.query.updateSubmissionLazy(id, payload);
      }
    }
    // Process update submission
  }

  private declineSubmission(id: number) {
    // Set to delete submission in one month
    const job = schedule.scheduleJob('* * * * 1 *', async () => {
      const data = await this.query.getSubmissionById(id);
      if (isError(data)) {
        return;
      }
      const validSubmission = data as AnySubmissionResponse;
      if (validSubmission.queue_code === queue_code.declined) {
        this.query.deleteSubmission(id);
      }
    });
  }
}
