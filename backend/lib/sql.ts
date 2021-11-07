// ==================== MAIN SQL OBJ ====================
import mysql from "mysql";
import CF from "../config.js";
import { handleError, sanitizeInput } from "./globallib";
import ERR from "./error";
import RESULT from "./result.js";

// ==================== SQL resolve ====================
enum SQLResult {
  pass,
  fail,
}
export { SQLResult };

// ==================== Database Class ====================
export default class SQL {
  query: string;
  DBCONFIG: mysql.PoolConfig;
  pool: mysql.Pool;

  // SQL Class based variables
  constructor() {
    this.DBCONFIG = {
      host: CF.DB_HOST,
      user: CF.DB_USER,
      password: CF.DB_PASS,
      database: CF.DB_NAME,
      connectionLimit: 10,
    };
  }

  // ---------- Section A: Connection ---------
  connect() {
    this.pool = mysql.createPool(this.DBCONFIG);
  }
  release() {
    this.pool.end((error) => {
      error && ERR('dbConnect', error.message);
    });
  }
  checkPool() {
    return this.pool ? true : false;
  }

  /** runQuery(callback, noReturn) - Run the query
   * @param { boolean } noReturn - (Optional) - whether to return the rows or just a string of RESULT<done, fail>
   */
  async runQuery(noReturn: boolean | undefined = false) {
    // Start the connection
    if (!this.checkPool()) {
      this.connect();
    }
    // run the query
    const getData = await new Promise((resolve) => {
      this.pool.getConnection((poolError, connection) => {
        poolError && ERR('dbDisconnect', poolError.message);
        console.log(`\x1b[36m[SQL QUERY] ${this.query}\x1b[0m`);

        try {
          connection.query(this.query, (error, result) => {
            connection.release();
            if (error) {
              ERR('dbQuery', error.message);
              resolve(RESULT.fail);
            } else {
              resolve(noReturn ? RESULT.done : result);
            }
          });
        } catch (error) {
          // MySQL errors
          console.log(error);
          resolve(RESULT.fail);
        }
      });
    });

    return getData;
  }

  // ---------- Section B: Query Builder ----------

  // Reset all query of the SQL instance
  clearQuery() {
    this.query = "";
  }

  // SELECT query
  buildSelect(table: string, column: string | string[] = "*") {
    if (Array.isArray(column)) {
      column = column.map((each) => sanitizeInput(each)).join(", ");
    } else {
      column = sanitizeInput(column);
    }
    table = sanitizeInput(table);

    // Apply this to the query
    this.query = `SELECT ${column} FROM ${table} `;
    return this.query;
  }

  // WHERE query
  // Note: all data must be sanitized manually
  buildWhere(input: string | string[]) {
    input = Array.isArray(input) ? input.join(" && ") : input;
    this.query += `WHERE (${input}) `;
    return this.query;
  }

  // ORDER BY query
  // Note: both param must have the same number of arrays
  buildOrder(column: string[] = [""], ascending: boolean[] = [true]) {
    if (column.length !== ascending.length) {
      return ERR('dbOrderNumber');
    }
    const list = ascending.map((value, index) => {
      const cleanColumn = sanitizeInput(column[index]);
      const orderDirection = value ? "ASC" : "DESC";
      return `${cleanColumn} ${orderDirection}`;
    });

    this.query += `ORDER BY ${list.join(", ")} `;
    return this.query;
  }

  // INSERT INTO query
  // Note: both 'columns' and 'values' param must have the same number of arrays
  buildInsert(
    table: string,
    columns: string[] = [''],
    values: string[] = ['']
  ) {
    if (column.length !== ascending.length) {
      return ERR('dbOrderNumber');
    }
    let outputColumns = columns.join(', ');
    let outputValues = '';
    for (let i = 0; i < values.length; i++) {
      const comma = i < values.length - 1 ? ", " : "";
      const currentValue =
        typeof values[i] === "string"
          ? `'${sanitizeInput(values[i])}'`
          : values[i];
      outputValues += currentValue + comma;
    }

    table = sanitizeInput(table);
    outputColumns = sanitizeInput(outputColumns);
    this.query = `INSERT INTO ${table} (${outputColumns}) VALUES (${outputValues}) `;
    return this.query;
  }

  // UPDATE query
  buildUpdate(table, columns = [""], values = [""]) {
    if (table === null || columns === [""] || values === [""]) {
      handleError("db8");
      return;
    }

    let updateArray = [];
    columns.forEach((data, index) => {
      if (typeof data === "string") {
        const value =
          typeof values[index] === "string"
            ? `'${sanitizeInput(values[index])}'`
            : values[index];
        data = sanitizeInput(data);
        updateArray.push(`${"`" + data + "`"} = ${value}`);
      }
    });

    table = sanitizeInput(table);
    this.query = `UPDATE ${table} SET ${updateArray.join(", ")} `;
    return this.query;
  }

  // DELETE FROM query
  // FOR @param {string | string[]} input - Where statement, you can include multiple with arrays
  buildDelete(table, input) {
    if (table === null) {
      handleError("db9");
      return;
    }
    table = sanitizeInput(table);
    this.query = `DELETE FROM ${table} `;
    this.buildWhere(input);
    return this.query;
  }

  // Custom SQL queries, MUST BE STRING!
  buildCustomQuery(input) {
    if (typeof input !== "string") {
      handleError("db10");
      return;
    }
    input = sanitizeInput(input);
    this.query += input + " ";
    return this.query;
  }
}
