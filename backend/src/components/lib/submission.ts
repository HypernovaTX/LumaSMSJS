// ================================================================================
// SUBMISSION CLASS TEMPLATE
// ================================================================================
import { Request } from 'express';

import { checkLogin, validatePermission } from './userlib';
import CF from '../../config';
import ERR, { ErrorObj, isError } from '../../lib/error';
import { sanitizeInput, placeholderPromise } from '../../lib/globallib.js';
import SubmissionQuery from '../../queries/submissionQuery';
import {
  AnySubmission,
  AnySubmissionResponse,
  submissionKinds,
  SubmissionUpdateResponse,
} from '../../schema/submissionType';

type ListPublicFunction = Parameters<
  (
    page: number,
    count: number,
    column: string,
    asc: boolean,
    filter: [string, string][]
  ) => Promise<ErrorObj | SubmissionUpdateResponse[]>
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
    return getData as SubmissionUpdateResponse[];
  }

  // WRITE METHODS
  async createSubmission(_request: Request, payload: AnySubmission) {
    // Ensure user is logged in
    const getLogin = await checkLogin(_request);
    if (isError(getLogin)) {
      return getLogin as ErrorObj;
    }
    // Verify permission
    const permitted = await validatePermission(_request, 'acp_users');
    if (!permitted) {
      return ERR('userStaffPermit');
    }
    // Validate payload
    if (!this.validatePayloadKeys(payload)) {
      return ERR('submissionMissingParam');
    }
    const { uid } = getLogin as AnySubmissionResponse;
    const firstResult = await this.query.createSubmission(uid, payload);
    return firstResult;
  }

  // async updateSubmission(_request, id, payload) {
  //   const login = await checkLogin(_request);
  //   const getPermission = await checkPermission(_request);
  //   if (!getPermission.can_submit || login === 'LOGGED OUT') {
  //     handleError('re0');
  //     return placeholderPromise('DENIED');
  //   }
  //   if (!id || payload.length === 0) {
  //     handleError('re1');
  //     return placeholderPromise('ERROR');
  //   }
  //   const getExistingSubmission = await this.showSubmissionDetails(id);
  //   if (!getExistingSubmission) {
  //     handleError('re2');
  //     return placeholderPromise('INVALID');
  //   }

  //   // Apply changes to the sub table first and get eid
  //   const timestamp = Math.ceil(Date.now() / 1000);
  //   let [finalColumn, finalValue] = [
  //     ['views', 'uid', 'created', 'queue_code', 'ghost'],
  //     [0, login.uid, timestamp, 2, id],
  //   ];
  //   payload.forEach((entrySub) => {
  //     const [data] = Object.entries(entrySub);
  //     finalColumn.push(data[0]);
  //     finalValue.push(data[1]);
  //   });
  //   this.DB.buildInsert(this.specificTable, finalColumn, finalValue);
  //   const firstResult = await this.DB.runQuery();
  //   return firstResult;
  // }

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
