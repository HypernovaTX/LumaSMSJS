// ==================== MAIN SQL OBJ ====================
import mysql from 'mysql';
import SqlString from 'sqlstring';
import dotenv from 'dotenv';
import { handleError } from './globallib.js';
dotenv.config({ path: './.env' });

// ==================== Database Class ====================
export default class SQL {
  // SQL Class based variables
  constructor() {
    this.query = '';
    this.pool = null;
    this.DBCONFIG = {
      host: process.env.DB_HOST, 
      user: process.env.DB_USER, 
      password: process.env.DB_PASS, 
      database: process.env.DB_NAME, 
      connectionLimit: 10, 
    };
    this.clearQuery = () => { this.query = ''; }
  }


  // ---------- Section A: Connection ---------
  connect() {
    this.pool = mysql.createPool(this.DBCONFIG);
  }
  release() {
    this.pool.release((error) => { if (error) { handleError('db1', error.message); } });
  }
  checkPool() {
    if (!this.pool) { return false; }
    return true;
  }

  /** runQuery(callback, noReturn) - Run the query
   * @param { boolean } noReturn - (Optional) - whether to return the rows or just a string of "DONE"
   */
  async runQuery(noReturn = false) {
    // Start the connection
    if (!this.checkPool()) {
      this.connect();
    }
    // Set a promise to run the query
    const getData = await new Promise((resolve) => {
      this.pool.getConnection((conErr, connection) => {
        if (conErr) { handleError('db0', conErr.message); }
        console.log(`\x1b[36m[SQL QUERY] ${this.query}\x1b[0m`);

        connection.query(this.query, (error, rows) => {
          if (error) { handleError('db2', error.message); }
          else if (noReturn) { resolve('DONE'); }
          else { resolve(rows); }

          connection.release();
        });
      });
    });
    //this.connection.release();
    return getData;
  }



  // ---------- Section B: Query Builder ----------
  // ** !!! DO NOT USE SqlString.escape as thes methods already did the job !!!
  
  // SELECT query
  buildSelect(table, column = '*') {
    let output = '';
    if (typeof column !== 'string') {
      if (Array.isArray(column)) {
        if (typeof column[0] !== 'string') {
          handleError('db3'); return;
        }
        output = column.join(', ');
      } else {
        handleError('db3'); return;
      }
    } else { output = column; }

    // Apply this to the query
    this.query = `SELECT ${output} FROM ${table} `;
    return this.query;
  }

  // WHERE query
  // Note: param 'input' can be single string or multiple strings as array
  buildWhere(input) {
    let output = '';

    if (Array.isArray(input)) {
      if (typeof input[0] !== 'string') {
        handleError('db4'); return;
      }
      output = input.join(' && ');
    } else if (typeof input === 'string') {
      output = input;
    } else {
      handleError('db4'); return;
    }

    this.query += `WHERE (${output}) `;
    return this.query;
  }

  // ORDER BY query **
  // Note: both param must have the same number of arrays
  buildOrder(column = [''], ascending = [true]) {
    // Error Handling
    if (Array.isArray(column) && Array.isArray(ascending)) {
      if (typeof column !== 'string' || typeof ascending !== 'boolean') {
        handleError('db5'); return;
      }
    } else {
      handleError('db5'); return;
    }
    if (column === ['']) {
      handleError('db5'); return;
    }
    if (column.length !== ascending.length) {
      handleError('db6'); return;
    }

    let list = [];
    ascending.forEach((value, index) => {
      const cleanColumn = SqlString.escape(column[index]);
      const orderDirection = (value === true) ? 'ASC' : 'DESC';
      list.push(`${cleanColumn} ${orderDirection}`);
    });

    this.query += `ORDER BY ${list.join(', ')} `;
    return this.query;
  }

  // INSERT INTO query **
  // Note: both 'columns' and 'values' param must have the same number of arrays
  buildInsert(table, columns = [''], values = ['']) {
    if (table === null || columns === [''] || values === ['']) {
      handleError('db7'); return;
    }

    let outputColumns = columns.join(', ');
    let outputValues = '';
    for (let i = 0; i < values.length; i ++) {
      const comma = (i < values.length - 1) ? ', ' : '';
      const currentValue = (typeof values[i] === 'string') ? SqlString.escape(values[i]) : values[i];
      outputValues += currentValue + comma;
    }

    this.query = `INSERT INTO ${table} (${outputColumns}) VALUES (${outputValues}) `;
    return this.query;
  }

  // UPDATE query **
  buildUpdate(table, columns = [''], values = ['']) {
    if (table === null || columns === [''] || values === ['']) {
      handleError('db8'); return;
    }

    let updateArray = [];
    columns.forEach((data, index) => {
      if (typeof data === 'string') {
        const cleanValue = SqlString.escape(values[index]);
        updateArray.push(`${'`' + data + '`'} = ${cleanValue}`);
      }
    });

    this.query = `UPDATE ${table} SET ${updateArray.join(', ')} `;
    return this.query;
  }
 
  // DELETE FROM query ** 
  // FOR @param {string | string[]} input - Where statement, you can include multiple with arrays
  buildDelete(table, input) {
    if (table === null) {
      handleError('db9'); return;
    }

    table = SqlString.escape(table);
    this.query = `DELETE FROM ${table} `;
    this.buildWhere(input);
    return this.query;
  }

  // Custom SQL queries, MUST BE STRING!
  buildCustomQuery(input) {
    if (typeof input !== 'string') {
      handleError('db10'); return;
    }
    this.query += input + ' ';
    return this.query;
  }
}