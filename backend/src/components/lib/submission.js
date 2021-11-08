// ================================================================================
// SUBMISSION CLASS TEMPLATE
// ================================================================================
import CF from "../../config.js";
import SQL from "../../lib/sql.js";
import {
  sanitizeInput,
  placeholderPromise,
  handleError,
} from "../../lib/globallib.js";
import { checkLogin, checkPermission } from "./userlib.js";

export default class Submission {
  constructor() {
    this.DB = new SQL();
    this.specificTable = `${CF.DB_PREFIX}res_REPLACE_ME`;
    this.resourceType = 0;
    this.additionalQueries = {
      listSelect: ["z.views", "z.downloads"],
    };
  }

  // PUBLIC METHODS ------------------------------------------------------------------------------------------------------------
  // Filter must be in { columnName: string }[]
  async listPublic(
    page = 0,
    count = 25,
    column = "",
    asc = false,
    filter = []
  ) {
    const selects = [
      "z.id",
      "z.uid",
      "z.title",
      "z.description",
      "z.author_override",
      "z.created",
      "z.updated",
      "z.accept_date",
      "z.catwords",
      "u.username",
      "g.name_prefix",
      "g.name_suffix",
      `(SELECT COUNT(*) FROM ${CF.DB_PREFIX}comments WHERE rid = z.id) AS comments`,
      ...this.additionalQueries.listSelect,
    ];
    this.DB.buildSelect(`${this.specificTable} z`, selects);
    this.DB.buildCustomQuery(
      `LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = z.uid`
    );
    this.DB.buildCustomQuery(
      `LEFT JOIN ${CF.DB_PREFIX}groups g ON g.gid = u.gid`
    );
    this.DB.buildWhere(["z.queue_code = 0", "z.ghost = 0"]);

    // Used for filter/sorting
    if (filter.length > 0) {
      let statements = [];
      for (let eachObj of filter) {
        let [entry] = Object.entries(eachObj);
        entry[0] =
          typeof entry[0] === "string" ? sanitizeInput(entry[0]) : entry[0];
        entry[1] =
          typeof entry[1] === "string"
            ? `'${sanitizeInput(entry[1])}'`
            : entry[1];
        statements.push(`${entry[0]} = ${entry[1]}`);
      }
      this.DB.buildWhere(statements);
    }

    if (column) {
      this.DB.buildOrder([column], [asc]);
    }
    if (count) {
      this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`);
    }
    return await this.DB.runQuery();
  }

  async showSubmissionDetails(id = 0) {
    const selects = ["z.*", "u.username", "g.name_prefix", "g.name_suffix"];
    this.DB.buildSelect(`${this.specificTable} z`, selects);
    this.DB.buildCustomQuery(
      `LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = z.uid`
    );
    this.DB.buildCustomQuery(
      `LEFT JOIN ${CF.DB_PREFIX}groups g ON g.gid = u.gid`
    );
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

  // Update submission view
  // Download submission

  // USER-LEVEL METHODS ------------------------------------------------------------------------------------------------------------
  async showSubmissionComments(id = 0) {
    const selects = ["c.*", "u.*", "g.name_prefix", "g.name_suffix"];
    this.DB.buildSelect(`${CF.DB_PREFIX}comments c`, selects);
    this.DB.buildCustomQuery(
      `LEFT JOIN ${CF.DB_PREFIX}users u ON u.uid = c.uid`
    );
    this.DB.buildCustomQuery(
      `LEFT JOIN ${CF.DB_PREFIX}groups g ON g.gid = u.gid`
    );
    this.DB.buildWhere([`c.rid = ${sanitizeInput(id)}`, `c.type = 1`]);

    let result = await this.DB.runQuery();
    result.forEach((comment) => {
      const hasPassword = Object.prototype.hasOwnProperty.call(
        comment,
        "password"
      );
      if (hasPassword) {
        delete comment.password;
      }
    });
    return result;
  }

  async createSubmission(_request, payload, files) {
    const login = await checkLogin(_request);
    const permission = await checkPermission(_request);
    console.log(files);
    if (!permission.can_submit || login === "LOGGED OUT") {
      handleError("re0");
      return placeholderPromise("DENIED");
    }
    if (payload.length === 0) {
      handleError("re1");
      return placeholderPromise("EMPTY");
    }

    // Apply changes to the sub table first and get eid
    const timestamp = Math.ceil(Date.now() / 1000);
    let [finalColumn, finalValue] = [
      ["views", "uid", "created", "queue_code"],
      [0, login.uid, timestamp, 1],
    ];
    payload.forEach((entrySub) => {
      const [data] = Object.entries(entrySub);
      finalColumn.push(data[0]);
      finalValue.push(data[1]);
    });
    this.DB.buildInsert(this.specificTable, finalColumn, finalValue);
    const firstResult = await this.DB.runQuery();
    return firstResult;
  }

  async updateSubmission(_request, id, payload) {
    const login = await checkLogin(_request);
    const getPermission = await checkPermission(_request);
    if (!getPermission.can_submit || login === "LOGGED OUT") {
      handleError("re0");
      return placeholderPromise("DENIED");
    }
    if (!id || payload.length === 0) {
      handleError("re1");
      return placeholderPromise("ERROR");
    }
    const getExistingSubmission = await this.showSubmissionDetails(id);
    if (!getExistingSubmission) {
      handleError("re2");
      return placeholderPromise("INVALID");
    }

    // Apply changes to the sub table first and get eid
    const timestamp = Math.ceil(Date.now() / 1000);
    let [finalColumn, finalValue] = [
      ["views", "uid", "created", "queue_code", "ghost"],
      [0, login.uid, timestamp, 2, id],
    ];
    payload.forEach((entrySub) => {
      const [data] = Object.entries(entrySub);
      finalColumn.push(data[0]);
      finalValue.push(data[1]);
    });
    this.DB.buildInsert(this.specificTable, finalColumn, finalValue);
    const firstResult = await this.DB.runQuery();
    return firstResult;
  }

  async deleteSubmission(_request, id) {
    const getPermission = await checkPermission(_request);
    if (getPermission === "LOGGED OUT") {
      // Not logged in
      handleError("re0");
      return placeholderPromise("DENIED");
    }
    if (!id) {
      handleError("re1");
      return placeholderPromise("ERROR");
    }
    const getExistingSubmission = await this.showSubmissionDetails(id);
    if (
      !getPermission.staff_qc &&
      getExistingSubmission.uid !== getPermission.uid
    ) {
      // Only root admin can delete other user
      handleError("re2");
      return placeholderPromise("QC ONLY");
    }

    id = typeof id === "string" ? `'${sanitizeInput(id)}'` : id;
    this.DB.buildDelete(this.specificTable, `id = ${id}`);
    const getResult = await this.DB.runQuery();
    if (!getResult?.affectedRows) {
      return placeholderPromise("FAIL");
    }
    return placeholderPromise("DONE");

    // THIS IS A TEMPORARY PLACEHOLDER, IT WOULD BE BETTER IF THE SUBMISSION IS PLACED IN A PENDIng DELETION STATE
    // npm install node-schedule
  }

  // STAFF METHODS ------------------------------------------------------------------------------------------------------------

  async voteSubmission(_request) {
    const getPermission = await checkPermission(_request);
    if (getPermission === "LOGGED OUT") {
      handleError("re0");
      return placeholderPromise("DENIED");
    }
    if (getPermission?.staff_qc) {
      handleError("re2");
      return placeholderPromise("QC ONLY");
    }

    // READ TABLE
    // TURN RESULT INTO ARRAY
    // PUSH ARRAY
    // CHECK ARRAY FOR SUBMISSION STAT
    // UPDATE TABLE
    // RETURN
  }
}
