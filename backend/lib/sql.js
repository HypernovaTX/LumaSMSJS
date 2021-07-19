// ==================== MAIN SQL OBJ ====================
import { handleError, placeholderPromise } from './globallib.js';
import mysql from 'mysql';
import SqlString from 'sqlstring';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// ==================== Database Class ====================
export default class SQL {
  // SQL Class based variables
  constructor() {
    this.query = '';
    this.connection = null;
    this.DBCONFIG = {
      host: process.env.DB_HOST, 
      user: process.env.DB_USER, 
      password: process.env.DB_PASS, 
      database: process.env.DB_NAME, 
    };
    this.clearQuery = () => { this.query = ''; }
  }


  // ---------- Section A: Connection ---------
  connect() {
    this.connection = mysql.createConnection(this.DBCONFIG);
    this.connection.connect((error) => {
      if (error) {
        handleError('db0', error.message);
        return false;
      }
    });
    return true;
  }
  disconnect() {
    this.connection.end((error) => { if (error) { handleError('db1', error.message); } });
  }

  /** runQuery(callback, noReturn) - Run the query
   * @param { boolean } noReturn - (Optional) - whether to return the rows or just a string of "DONE"
   */
  runQuery(noReturn = false) {
    // Start the connection
    if (!this.connection || this.connection?.state === 'disconnected') {
      if (!this.connect()) { return placeholderPromise(); }
    }
    console.log(this.query);
    // Set a promise to run the query
    const getData = new Promise(
      (resolve) => {
        this.connection.query(this.query, (error, rows) => {
          if (error) { handleError('db2', error.message); }
          else if (noReturn) { resolve('DONE'); }
          else { resolve(rows); }
        });
      }
    );

    // End
    this.disconnect();

    return getData;
  }



  // ---------- Section B: Query Builder ----------
  // !!! DO NOT USE SqlString.escape as thes methods already did the job !!!
  
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

  // ORDER BY query
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

  // INSERT INTO query
  // Note: both 'columns' and 'values' param must have the same number of arrays
  buildInsert(table, columns = [''], values = ['']) {
    if (table === null || columns === [''] || values === ['']) {
      handleError('db7'); return;
    }

    table = SqlString.escape(table);
    const outputColumns = SqlString.escape(columns.join(', '));
    const outputValues = SqlString.escape(values.join(', '));

    this.query = `INSERT INTO ${table} (${outputColumns}) VALUES (${outputValues}) `;
    return this.query;
  }

  // UPDATE query
  buildUpdate(table, columns = [''], values = ['']) {
    if (table === null || columns === [''] || values === ['']) {
      handleError('db8'); return;
    }

    let updateArray = [];
    columns.forEach((data, index) => {
      if (typeof data === 'string') {
        const cleanValue = SqlString.escape(values[index]);
        const cleanColumn = SqlString.escape(data);
        updateArray.push(`${'`' + cleanColumn + '`'} = ${cleanValue}`);
      }
    });

    table = SqlString.escape(table);
    this.query = `UPDATE ${table} SET ${updateArray.join(', ')} `;
    return this.query;
  }

  // DELETE FROM query
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