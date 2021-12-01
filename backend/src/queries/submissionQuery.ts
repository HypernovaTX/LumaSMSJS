import SQL from '../lib/sql';

import CF from '../config';
import ERR, { ErrorObj, isError } from '../lib/error';
import { isStringJSON, objIntoArrays, sanitizeInput } from '../lib/globallib';
import { NoResponse } from '../lib/result';
import {
  AnySubmission,
  QueueCode,
  StaffVote,
  SubmissionKinds,
  submissionList,
  SubmissionVersion,
} from '../schema/submissionType';

const queue = {
  all: 'queue_code BETWEEN 0 AND 2',
  accepted: 'queue_code = 0',
  new: 'queue_code = 1',
  updated: 'queue_code = 2',
  declined: 'queue_code = 3',
};

export default class SubmissionQuery {
  DB: SQL;
  subType: number;
  subTable: string;
  updateTable: string;
  voteTable: string;
  submissionKind: SubmissionKinds;

  constructor(submissionKind: SubmissionKinds = 'sprites') {
    this.DB = new SQL();
    this.subTable = `${CF.DB_PREFIX}submission_${submissionKind}`;
    this.updateTable = `${CF.DB_PREFIX}version`;
    this.subType = submissionList[submissionKind];
    this.submissionKind = submissionKind;
  }

  async getSubmissionList(
    queueCode: QueueCode | 'all',
    page: number,
    count: number,
    column: string,
    asc: boolean,
    filter: [string, string][] = []
  ) {
    // Prepare basic query
    const commentColumn = `(SELECT COUNT(*) FROM ${CF.DB_PREFIX}comments WHERE rid = z.id) AS comments`;
    const selects = ['z.*', 'u.username', 'u.gid', commentColumn];
    this.DB.buildSelect(`${this.subTable} z`, selects);
    this.DB.buildCustomQuery(
      `LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = z.uid`
    );
    const basicWhere = [`z.${queue[queueCode]}`, 'z.ghost = 0'];

    // Applying filters
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

    // Sorting/limit
    if (column && asc) {
      this.DB.buildOrder([column], [asc]);
    }
    if (count) {
      this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`);
    }

    // Execute
    return (await this.DB.runQuery()) as ErrorObj | AnySubmission[];
  }

  async getSubmissionById(id: number) {
    // Prepare tables
    const selects = ['z.*', 'u.username', 'u.gid'];
    this.DB.buildSelect(`${this.subTable} z`, selects);
    this.DB.buildCustomQuery(
      `LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = z.uid`
    );

    // Get by submission ID
    this.DB.buildWhere([`z.id = ${id}`]);
    const queryResult = await this.DB.runQuery();

    // Error handling
    if (isError(queryResult)) return queryResult as ErrorObj;
    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('submissionNotFound');
    }

    // Resolve
    const [submission] = queryResult as AnySubmission[];
    return submission;
  }

  async getSubmissionUpdatesByRid(rid: number, sortVersion?: boolean) {
    this.DB.buildSelect(this.updateTable);
    this.DB.buildWhere([`rid = ${rid}`, `type = ${this.subType}`]);
    if (sortVersion) this.DB.buildOrder(['version'], [false]);

    const queryResult = await this.DB.runQuery();
    return queryResult as ErrorObj | SubmissionVersion[];
  }

  async getAllVotes(
    count?: number,
    page?: number,
    column?: string,
    asc?: boolean
  ) {
    this.DB.buildSelect(`${this.voteTable}`);
    if (column && asc) this.DB.buildOrder([column], [asc]);
    if (count) {
      this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`);
    }
    return (await this.DB.runQuery()) as ErrorObj | StaffVote[];
  }

  async getVotesById(id: number) {
    this.DB.buildSelect(`${this.voteTable}`);
    this.DB.buildWhere([`id = ${id}`, `type = ${this.subType}`]);
    return (await this.DB.runQuery()) as ErrorObj | StaffVote[];
  }

  // ------------ AFFECTS DB ----------------
  async createSubmission(uid: number, payload: AnySubmission) {
    // Prepare data
    const timestamp = Math.ceil(Date.now() / 1000);
    let [finalColumn, finalValue] = [
      ['views', 'uid', 'created', 'queue_code'],
      ['0', `${uid}`, `${timestamp}`, '1'],
    ];

    // Process data for insert
    const { columns, values } = objIntoArrays(payload);
    finalColumn.push(...columns);
    finalValue.push(...(values as string[]));

    // Apply and resolve
    this.DB.buildInsert(this.subTable, finalColumn, finalValue);
    return (await this.DB.runQuery(true)) as ErrorObj | NoResponse;
  }

  async addVote(
    uid: number,
    decision: number,
    message: string,
    update?: boolean
  ) {
    // Prepare data
    const timestamp = Math.ceil(Date.now() / 1000);
    const updateValue = update ? '1' : '0';
    const [voteColumn, voteValue] = [
      ['type', 'uid', 'date', 'decision', 'update', 'message'],
      [
        `${this.subType}`,
        `${uid}`,
        `${timestamp}`,
        `${decision}`,
        updateValue,
        message,
      ],
    ];

    // Resolve
    this.DB.buildInsert(this.subTable, voteColumn, voteValue);
    return (await this.DB.runQuery(true)) as ErrorObj | NoResponse;
  }

  async updateSubmissionLazy(id: number, payload: AnySubmission) {
    // prepare and update the submission table
    const updateColumn: string[] = [];
    const updateValue: string[] = [];
    const { columns, values } = objIntoArrays(payload);
    const processedValue = values.map((val) => {
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return JSON.stringify(val);
      return `${val}`;
    });
    updateColumn.push(...columns);
    updateValue.push(...processedValue);

    // Query
    this.DB.buildUpdate(this.subTable, updateColumn, updateValue);
    this.DB.buildWhere(`id = ${id}`);

    // Execute
    return (await this.DB.runQuery(true)) as ErrorObj | NoResponse;
  }

  async updateSubmission(
    id: number,
    payload: AnySubmission,
    message: string,
    version: string
  ) {
    // Prepare and update the submission table
    const timestamp = Math.ceil(Date.now() / 1000);
    let [updateColumn, updateValue] = [
      ['updated', 'queue_code'],
      [`${timestamp}`, '2'],
    ];

    // Update the submission table
    const { columns, values } = objIntoArrays(payload);
    updateColumn.push(...columns);
    updateValue.push(...(values as string[]));
    this.DB.buildUpdate(this.subTable, updateColumn, updateValue);
    this.DB.buildWhere(`id = ${id}`);
    const resultUpdate = await this.DB.runQuery(true);
    if (isError(resultUpdate)) {
      return resultUpdate as ErrorObj;
    }

    // Prepare and push the update to the `version` table
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

    // Execute
    return (await this.DB.runQuery(true)) as ErrorObj | NoResponse;
  }

  async updateVote(
    id: number,
    decision: number,
    message: string,
    update?: boolean
  ) {
    // Prepare data
    const timestamp = Math.ceil(Date.now() / 1000);
    const checkUpdate = update ? '1' : '0';
    const [voteColumn, voteValue] = [
      ['date', 'decision', 'message'],
      [`${timestamp}`, `${decision}`, message],
    ];

    // Prepare query
    this.DB.buildUpdate(this.subTable, voteColumn, voteValue);
    this.DB.buildWhere([
      `id = ${id}`,
      `type = ${this.subType}`,
      `update = ${checkUpdate}`,
    ]);

    // Update
    return (await this.DB.runQuery(true)) as ErrorObj | NoResponse;
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
    // Execute
    return (await this.DB.runQuery(true)) as ErrorObj | NoResponse;
  }

  async deleteSubmission(id: number) {
    this.DB.buildDelete(this.subTable, `id = ${id}`);
    return (await this.DB.runQuery(true)) as NoResponse | ErrorObj;
  }
}
