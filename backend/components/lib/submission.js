// ================================================================================
// SUBMISSION CLASS TEMPLATE
// ================================================================================
import CF from '../../config.js';
import SQL from '../../lib/sql.js';
import { sanitizeInput, placeholderPromise, handleError } from '../../lib/globallib.js'; 
import { checkPermission } from './userlib.js';

export default class Submission {
  constructor() {
    this.DB = new SQL();
    this.specificTable = `${CF.DB_PREFIX}res_REPLACE_ME`;
    this.resourceType = 0;
    this.additionalQueries = {
      listSelect: ['z.views', 'z.downloads'],
    };
  }

  // PUBLIC METHODS ------------------------------------------------------------------------------------------------------------
  // Filter must be in { columnName: string }[]
  async listPublic(page = 0, count = 25, column = '', asc = false, filter = []) {
    const selects = [
      'z.id', 'z.uid', 'z.title', 'z.description', 'z.author_override', 'z.created', 'z.updated',
      'z.accept_date', 'z.catwords', 'u.username', 'g.name_prefix', 'g.name_suffix', 
      `(SELECT COUNT(*) FROM ${CF.DB_PREFIX}comments WHERE rid = z.id) AS comments`,
      ...this.additionalQueries.listSelect
    ];
    this.DB.buildSelect(`${this.specificTable} z`, selects);
    this.DB.buildCustomQuery(`LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = z.uid`);
    this.DB.buildCustomQuery(`LEFT JOIN ${CF.DB_PREFIX}groups g ON g.gid = u.gid`);
    this.DB.buildWhere(['z.queue_code = 0', 'z.ghost = 0']);

    // Used for filter/sorting
    if (filter.length > 0) {
      let statements = [];
      for (let eachObj of filter) {
        let [entry] = Object.entries(eachObj);
        entry[0] = (typeof entry[0] === 'string') ? sanitizeInput(entry[0]) : entry[0];
        entry[1] = (typeof entry[1] === 'string') ? `'${sanitizeInput(entry[1])}'` : entry[1];
        statements.push(`${entry[0]} = ${entry[1]}`);
      }
      this.DB.buildWhere(statements);
    }
    
    if (column) { this.DB.buildOrder([column], [asc]); }
    if (count) { this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`); }  
    return await this.DB.runQuery();
  }

  async showSubmissionDetails(id = 0) {
    const selects = ['z.*', 'u.username', 'g.name_prefix', 'g.name_suffix',];
    this.DB.buildSelect(`${this.specificTable} z`, selects);
    this.DB.buildCustomQuery(`LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = z.uid`);
    this.DB.buildCustomQuery(`LEFT JOIN ${CF.DB_PREFIX}groups g ON g.gid = u.gid`);
    this.DB.buildWhere([`z.id = ${sanitizeInput(id)}`]);

    const result = await this.DB.runQuery();
    return result[0];
  }

  async showSubmissionHistory(id = 0) {
    this.DB.buildSelect(`${CF.DB_PREFIX}version`);
    this.DB.buildWhere([`rid = ${sanitizeInput(id)}`]);

    let result = await this.DB.runQuery();
    return result;
  }

  // USER-LEVEL METHODS ------------------------------------------------------------------------------------------------------------
  async showSubmissionComments(id = 0) {
    const selects = ['c.*', 'u.*', 'g.name_prefix', 'g.name_suffix',];
    this.DB.buildSelect(`${CF.DB_PREFIX}comments c`, selects);
    this.DB.buildCustomQuery(`LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = c.uid`);
    this.DB.buildCustomQuery(`LEFT JOIN ${CF.DB_PREFIX}groups g ON g.gid = u.gid`);
    this.DB.buildWhere([`c.rid = ${sanitizeInput(id)}`, `c.type = 1`]);

    let result = await this.DB.runQuery();
    result.forEach((comment) => {
      const hasPassword = Object.prototype.hasOwnProperty.call(comment, 'password');
      if (hasPassword) { delete comment.password; }
    });
    return result;
  }

  async createSubmission(_request, payload) {
    const permission = await checkPermission(_request);
    if (!permission.can_submit) {
      handleError('re0'); return placeholderPromise('DENIED');
    }
    if (payload.length === 0) {
      handleError('re1'); return placeholderPromise('EMPTY');
    }

    // Apply changes to the sub table first and get eid
    let [columnSub, valueSub] = [['views'], [0]];
    payload.forEach((entrySub) => {
      const [column, value] = Object.entries(entrySub);
      columnSub.push(column);
      valueSub.push(value)
    });
    this.DB.buildInsert(this.specificTable, columnSub, valueSub);
    const firstResult = await this.DB.runQuery();
    console.log(firstResult);

    //const columnNames = [...columns, 'items_per_page', 'gid', 'registered_ip'];
    ///const timestamp = Math.ceil(Date.now() / 1000);
    //const columnValues = [...values, timestamp, CF.DEFAULT_ROWS, 5, clientIP(_request)];

  }

  // STAFF METHODS ------------------------------------------------------------------------------------------------------------
}