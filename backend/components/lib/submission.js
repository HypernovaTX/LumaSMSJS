// ================================================================================
// SUBMISSION CLASS TEMPLATE
// ================================================================================
import CF from '../../config.js';
import SQL from '../../lib/sql.js';
import { sanitizeInput } from '../../lib/globallib.js'; //placeholderPromise, handleError

const submissionTable = `${CF.DB_PREFIX}resources`;

export default class Submission {
  constructor() {
    this.DB = new SQL();
    this.specificTable = `${CF.DB_PREFIX}res_REPLACE_ME`;
    this.resourceType = 0;
    this.additionalSelectQueries = {
      list: ['z.views', 'z.downloads']
    };
  }

  async listPublic(page = 0, count = 25, column = '', asc = true, filter = []) {
    const selects = [
      'r.rid', 'r.uid', 'r.title', 'r.description', 'r.author_override', 'r.created', 'r.updated',
      'r.accept_date', 'r.catwords', 'u.username', 'g.name_prefix', 'g.name_suffix', 
      `(SELECT COUNT(*) FROM ${CF.DB_PREFIX}comments WHERE rid = r.rid && type = 1) AS comments`,
      ...this.additionalSelectQueries.list
    ];
    this.DB.buildSelect(`${submissionTable} r`, selects);
    this.DB.buildCustomQuery(`RIGHT JOIN ${this.specificTable} z ON z.eid = r.eid`);
    this.DB.buildCustomQuery(`LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = r.uid`);
    this.DB.buildCustomQuery(`LEFT JOIN ${CF.DB_PREFIX}groups g ON g.gid = u.gid`);
    this.DB.buildWhere([`r.type = ${this.resourceType}`, 'r.queue_code = 0', 'r.ghost = 0']);

    if (column) { this.DB.buildOrder([column], [asc]); }
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
    if (count) { this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`); }
    
    return await this.DB.runQuery();
  }
}