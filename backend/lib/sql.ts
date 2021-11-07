// ==================== MAIN SQL OBJ ====================
import mysql from 'mysql';
import CF from '../config';
import { sanitizeInput } from './globallib';
import ERR from './error';
import { allPossibleResponses } from '../schema';

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
    //DEBUG PURPOSE
    console.log(this.query);
    if (this.query) {
      return { test: 'test' };
    }

    // Start the connection
    if (!this.checkPool()) {
      this.connect();
    }
    // run the query
    const getData = await new Promise<any>((resolve) => {
      this.pool.getConnection((poolError, connection) => {
        poolError && ERR('dbDisconnect', poolError.message);
        CF.DEBUG_MODE &&
          console.log(`\x1b[36m[SQL QUERY] ${this.query}\x1b[0m`);

        try {
          connection.query(this.query, (error, result) => {
            connection.release();
            if (error) {
              resolve(ERR('dbQuery', error.message));
            } else {
              resolve(noReturn ? {} : result);
            }
          });
        } catch (error) {
          // MySQL errors
          CF.DEBUG_MODE && console.log(error);
          resolve(ERR('dbQuery', error.message));
        }
      });
    });

    return getData;
  }

  // ---------- Section B: Query Builder ----------

  // Reset all query of the SQL instance
  clearQuery() {
    this.query = '';
  }

  // SELECT query
  buildSelect(table: string, column: string | string[] = '*') {
    if (Array.isArray(column)) {
      column = column.map((each) => sanitizeInput(each)).join(', ');
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
    input = Array.isArray(input) ? input.join(' && ') : input;
    this.query += `WHERE (${input}) `;
    return this.query;
  }

  // ORDER BY query
  // Note: both param must have the same number of arrays
  buildOrder(column: string[], ascending: boolean[]) {
    if (column.length !== ascending.length) {
      return ERR('dbOrderNumber');
    }
    const list = ascending.map((value, index) => {
      const cleanColumn = sanitizeInput(column[index]);
      const orderDirection = value ? 'ASC' : 'DESC';
      return `${cleanColumn} ${orderDirection}`;
    });

    this.query += `ORDER BY ${list.join(', ')} `;
    return this.query;
  }

  // INSERT INTO query
  // Note: both 'columns' and 'values' param must have the same number of arrays
  buildInsert(table: string, columns: string[], values: string[]) {
    if (columns.length !== values.length) {
      return ERR('dbInsertNumber');
    }
    table = sanitizeInput(table);
    const outputColumns = sanitizeInput(columns.join(', '));
    const outputValues = values
      .map((eachValue) => sanitizeInput(eachValue))
      .join(', ');
    this.query = `INSERT INTO ${table} (${outputColumns}) VALUES (${outputValues}) `;
    return this.query;
  }

  // UPDATE query
  // Note: both 'columns' and 'values' param must have the same number of arrays
  buildUpdate(table: string, columns: string[], values: string[]) {
    if (columns.length !== values.length) {
      return ERR('dbUpdateNumber');
    }
    const updateArray = columns.map((column, index) => {
      const value = `'${sanitizeInput(values[index])}'`;
      column = sanitizeInput(column);
      return `${'`' + column + '`'} = ${value}`;
    });
    table = sanitizeInput(table);
    this.query = `UPDATE ${table} SET ${updateArray.join(', ')} `;
    return this.query;
  }

  // DELETE FROM query
  // FOR @param {string | string[]} input - Where statement, you can include multiple with arrays
  buildDelete(table: string, input: string | string[]) {
    table = sanitizeInput(table);
    this.query = `DELETE FROM ${table} `;
    this.buildWhere(input);
    return this.query;
  }

  // Custom SQL queries, MUST BE STRING!
  buildCustomQuery(input: string) {
    input = sanitizeInput(input);
    this.query += `${input} `;
    return this.query;
  }
}
