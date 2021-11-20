// ================================================================================
// SUBMISSION CLASS TEMPLATE
// ================================================================================
import { Request } from 'express';

import { checkLogin, validatePermission } from './userlib';
import ERR, { ErrorObj, isError } from '../../lib/error';
import { NoResponse } from '../../lib/result';
import SubmissionQuery from '../../queries/submissionQuery';
import {
  AnySubmission,
  AnySubmissionResponse,
  submissionKinds,
  SubmissionVersionResponse,
} from '../../schema/submissionType';

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
    const result = await (queue
      ? this.query.updateSubmissionQueue(id, payload, message, version)
      : this.query.updateSubmission(id, payload, message, version));
    if (isError(result)) {
      return result as ErrorObj;
    }
    return result as NoResponse;
  }

  // async deleteSubmission(_request, id) {
  //   const getPermission = await checkPermission(_request);
  //   if (getPermission === 'LOGGED OUT') {
  //     // Not logged in
  //     handleError('re0');
  //     return placeholderPromise('DENIED');
  //   }
  //   if (!id) {
  //     handleError('re1');
  //     return placeholderPromise('ERROR');
  //   }
  //   const getExistingSubmission = await this.showSubmissionDetails(id);
  //   if (
  //     !getPermission.staff_qc &&
  //     getExistingSubmission.uid !== getPermission.uid
  //   ) {
  //     // Only root admin can delete other user
  //     handleError('re2');
  //     return placeholderPromise('QC ONLY');
  //   }

  //   id = typeof id === 'string' ? `'${sanitizeInput(id)}'` : id;
  //   this.DB.buildDelete(this.specificTable, `id = ${id}`);
  //   const getResult = await this.DB.runQuery();
  //   if (!getResult?.affectedRows) {
  //     return placeholderPromise('FAIL');
  //   }
  //   return placeholderPromise('DONE');

  // THIS IS A TEMPORARY PLACEHOLDER, IT WOULD BE BETTER IF THE SUBMISSION IS PLACED IN A PENDIng DELETION STATE
  // npm install node-schedule
  //}

  // STAFF METHODS ------------------------------------------------------------------------------------------------------------

  // async voteSubmission(_request) {
  //   const getPermission = await checkPermission(_request);
  //   if (getPermission === 'LOGGED OUT') {
  //     handleError('re0');
  //     return placeholderPromise('DENIED');
  //   }
  //   if (getPermission?.staff_qc) {
  //     handleError('re2');
  //     return placeholderPromise('QC ONLY');
  //   }

  //   // READ TABLE
  //   // TURN RESULT INTO ARRAY
  //   // PUSH ARRAY
  //   // CHECK ARRAY FOR SUBMISSION STAT
  //   // UPDATE TABLE
  //   // RETURN
  // }

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
}
