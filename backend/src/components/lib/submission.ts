// ================================================================================
// SUBMISSION CLASS TEMPLATE
// ================================================================================
import {
  AnySubmissionResponse,
  submissionKinds,
  SubmissionUpdateResponse,
} from '../../schema/submissionType';
import SubmissionQuery from '../../queries/submissionQuery';
import CF from '../../config';
import { sanitizeInput, placeholderPromise } from '../../lib/globallib.js';
import { checkLogin } from './userlib';
import ERR, { ErrorObj, isError } from '../../lib/error';

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

  removeSensitiveSubProp(submission: AnySubmissionResponse) {
    if (submission?.queue_code) {
      delete submission?.queue_code;
    }
    if (submission?.decision) {
      delete submission?.decision;
    }
    return submission;
  }

  // PUBLIC METHODS ------------------------------------------------------------------------------------------------------------
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

  // Update submission view
  // Download submission
  // USER-LEVEL METHODS ------------------------------------------------------------------------------------------------------------
  // async createSubmission(_request, payload, files) {
  //   const login = await checkLogin(_request);
  //   const permission = await checkPermission(_request);
  //   console.log(files);
  //   if (!permission.can_submit || login === 'LOGGED OUT') {
  //     handleError('re0');
  //     return placeholderPromise('DENIED');
  //   }
  //   if (payload.length === 0) {
  //     handleError('re1');
  //     return placeholderPromise('EMPTY');
  //   }

  //   // Apply changes to the sub table first and get eid
  //   const timestamp = Math.ceil(Date.now() / 1000);
  //   let [finalColumn, finalValue] = [
  //     ['views', 'uid', 'created', 'queue_code'],
  //     [0, login.uid, timestamp, 1],
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
}
