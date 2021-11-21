import SQL from '../lib/sql';

import CF from '../config';
import ERR, { ErrorObj, isError } from '../lib/error';
import { isStringJSON, objIntoArrays, sanitizeInput } from '../lib/globallib';
import { NoResponse } from '../lib/result';
import {
  AnySubmission,
  AnySubmissionResponse,
  submissionKinds,
  submissionList,
  SubmissionVersionResponse,
} from '../schema/submissionType';

const queue = {
  all: 'queue_code BETWEEN 1 AND 2',
  accepted: 'queue_code = 0',
  queued: 'queue_code BETWEEN 0 AND 2',
};
type QueueCode = keyof typeof queue;

export default class SubmissionQuery {
  DB: SQL;
  submissionNumber: number;
  subTable: string;
  updateTable: string;
  usernameUpdateTable: string;
  submissionKind: submissionKinds;

  constructor(submissionKind: submissionKinds) {
    this.DB = new SQL();
    this.subTable = `${CF.DB_PREFIX}submission_${submissionKind}`;
    this.updateTable = `${CF.DB_PREFIX}version`;
    this.usernameUpdateTable = `${CF.DB_PREFIX}username_change`;
    this.submissionNumber = submissionList[submissionKind];
    this.submissionKind = submissionKind;
  }

  async getSubmissionList(
    queueCode: QueueCode,
    page: number,
    count: number,
    column: string,
    asc: boolean,
    filter: [string, string][] = []
  ) {
    const commentColumn = `(SELECT COUNT(*) FROM ${CF.DB_PREFIX}comments WHERE rid = z.id) AS comments`;
    const selects = ['z.*', 'u.username', 'u.gid', commentColumn];
    this.DB.buildSelect(`${this.subTable} z`, selects);
    this.DB.buildCustomQuery(
      `LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = z.uid`
    );
    const basicWhere = [`z.${queue[queueCode]}`, 'z.ghost = 0'];
    // Used for filter
    if (filter.length) {
      const statements = filter.map((item) => {
        let [name, value] = item;
        name = sanitizeInput(name);
        value = sanitizeInput(value);
        return `${name} = ${value}`;
      });
      this.DB.buildWhere([...basicWhere, ...statements]);
    } else {
      this.DB.buildWhere(basicWhere);
    }
    // Sorting
    if (column) {
      this.DB.buildOrder([column], [asc]);
    }
    if (count) {
      this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`);
    }
    return (await this.DB.runQuery()) as ErrorObj | AnySubmissionResponse[];
  }

  async getSubmissionById(id: number) {
    const selects = ['z.*', 'u.username', 'u.gid'];
    this.DB.buildSelect(`${this.subTable} z`, selects);
    this.DB.buildCustomQuery(
      `LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = z.uid`
    );
    // Get by submission ID
    this.DB.buildWhere([`z.id = ${id}`]);
    const queryResult = await this.DB.runQuery();
    if (isError(queryResult)) {
      return queryResult as ErrorObj;
    }
    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('submissionNotFound');
    }
    const [submission] = queryResult as AnySubmissionResponse[];
    return submission;
  }

  async getSubmissionUpdatesByRid(rid: number, sortVersion?: boolean) {
    this.DB.buildSelect(this.updateTable);
    this.DB.buildWhere([`rid = ${rid}`, `type = ${this.submissionNumber}`]);
    if (sortVersion) {
      this.DB.buildOrder(['version'], [false]);
    }
    const queryResult = await this.DB.runQuery();
    return queryResult as ErrorObj | SubmissionVersionResponse[];
  }

  // ------------ AFFECTS DB ----------------
  async createSubmission(uid: number, payload: AnySubmission) {
    // Apply changes to the sub table first and get eid
    const timestamp = Math.ceil(Date.now() / 1000);
    let [finalColumn, finalValue] = [
      ['views', 'uid', 'created', 'queue_code'],
      ['0', `${uid}`, `${timestamp}`, '1'],
    ];
    const { columns, values } = objIntoArrays(payload);
    finalColumn.push(...columns);
    finalValue.push(...(values as string[]));
    // Object.entries(payload).forEach((entry) => {
    //   const [key, value] = entry;
    //   finalColumn.push(key);
    //   finalValue.push(value.toString());
    // });
    this.DB.buildInsert(this.subTable, finalColumn, finalValue);
    return (await this.DB.runQuery(true)) as ErrorObj | NoResponse;
  }

  async updateSubmissionLazy(id: number, payload: AnySubmission) {
    // prepare and update the submission table
    const updateColumn: string[] = [];
    const updateValue: string[] = [];
    const { columns, values } = objIntoArrays(payload);
    const processedValue = values.map((val) => {
      if (typeof val === 'string') {
        return val;
      }
      if (typeof val === 'object') {
        return JSON.stringify(val);
      }
      return `${val}`;
    });
    updateColumn.push(...columns);
    updateValue.push(...processedValue);
    // Query
    this.DB.buildUpdate(this.subTable, updateColumn, updateValue);
    this.DB.buildWhere(`id = ${id}`);
    // Execute
    const result = await this.DB.runQuery(true);
    if (isError(result)) {
      return result as ErrorObj;
    }
    return result as NoResponse;
  }

  async updateSubmission(
    id: number,
    payload: AnySubmission,
    message: string,
    version: string
  ) {
    // First prepare and update the submission table
    const timestamp = Math.ceil(Date.now() / 1000);
    let [updateColumn, updateValue] = [
      ['updated', 'queue_code'],
      [`${timestamp}`, '2'],
    ];
    const { columns, values } = objIntoArrays(payload);
    updateColumn.push(...columns);
    updateValue.push(...(values as string[]));
    this.DB.buildUpdate(this.subTable, updateColumn, updateValue);
    this.DB.buildWhere(`id = ${id}`);
    const resultUpdate = await this.DB.runQuery(true);
    if (isError(resultUpdate)) {
      return resultUpdate as ErrorObj;
    }
    // Second, prepare and push the update to the `version` database
    const [versionColumn, versionValue] = [
      [`message`, `rid`, `type`, `version`, `date`],
      [
        message,
        `${id}`,
        `${submissionList[this.submissionKind]}`,
        version,
        `${timestamp}`,
      ],
    ];
    this.DB.buildInsert(this.updateTable, versionColumn, versionValue);
    const result = await this.DB.runQuery(true);
    if (isError(result)) {
      return result as ErrorObj;
    }
    return result as NoResponse;
  }

  async updateSubmissionQueue(
    id: number,
    payload: AnySubmission,
    message: string,
    version: string
  ) {
    // First prepare and update the submission table
    const timestamp = Math.ceil(Date.now() / 1000);
    // Second, prepare and push the update to the `version` database
    const [versionColumn, versionValue] = [
      [`date`, `message`, `rid`, `type`, `version`, `data`, `in_queue`],
      [
        `${timestamp}`,
        message,
        `${id}`,
        `${submissionList[this.submissionKind]}`,
        version,
        JSON.stringify(payload),
        '1',
      ],
    ];
    this.DB.buildInsert(this.updateTable, versionColumn, versionValue);
    const result = await this.DB.runQuery(true);
    if (isError(result)) {
      return result as ErrorObj;
    }
    return result as NoResponse;
  }

  async deleteSubmission(id: number) {
    this.DB.buildDelete(this.submissionKind, `id = ${id}`);
    return (await this.DB.runQuery(true)) as NoResponse | ErrorObj;
  }
}
