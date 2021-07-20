// ==================== MAIN USER OBJ ====================
import SQL from '../lib/sql.js';
import { placeholderPromise, handleError, clientIP } from '../lib/globallib.js';
import { checkPermission, checkLogin } from '../lib/userlib.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SqlString from 'sqlstring';

const app = express();
app.use(cookieParser());
dotenv.config({ path: './.env' });

/*
import fs from 'fs';
const { v4: uuidv4 } = require('uuid');
const { MemoryStorage } = require('multer');*/

export default class User {
  constructor() {
    this.dummyPromise = placeholderPromise('ERROR');
    this.SALT = process.env.PASSWORD_SALT;
    this.DB = new SQL();
    this.userTable = `${process.env.DB_PREFIX}users`;
  }
  
  /**
   ********************************** PUBLIC *************************************
   */
  async listUsers(position = 0, limit = 25, column = '', asc = true, filter = []) {
    this.DB.buildSelect(this.userTable);

    if (column) { this.DB.buildOrder([column], [asc]); }
    if (filter.length > 0) {
      let statements = [];
      filter.forEach((data) => {
        statements.push(`${data.column} = ${data.value}`);
      });
      this.DB.buildWhere(statements);
    }
    if (limit) { this.DB.buildCustomQuery(`LIMIT ${position}, ${limit}`); }

    const data = await this.DB.runQuery();
    // Remove passwords for each of the object in the array
    for (let i = 0; i < data.length; i ++) {
      if (data[i].hasOwnProperty('password')) { delete data[i].password; }
    }
    return data;
  }

  async showUserByID(id = 0) {
    this.DB.buildSelect(`${this.userTable} u`, [
      'u.*',
      '(SELECT COUNT(*) FROM tsms_comments WHERE uid = u.uid) as comments',
      '(SELECT COUNT(*) FROM tsms_resources WHERE uid = u.uid AND queue_code = 0) as submissions'
    ]);
    this.DB.buildWhere(`u.uid = ${id}`);
    const data = await this.DB.runQuery();
    return data[0];
  }

  /*
  ********************************** LOGIN *************************************
  */
  // ---- CHECKS ----
  async checkExistingUser(username, email) {
    if (!username || !email) {
      handleError('us0');
      return this.dummyPromise;
    }
    
    const cleanUser = SqlString.escape(username);
    const cleanEmail = SqlString.escape(email);
    this.DB.buildSelect(this.userTable);
    this.DB.buildWhere(`username = ${cleanUser} || email = ${cleanEmail}`);

    return await new Promise((resolve, reject) => {
      this.DB.runQuery().then((data, err) => {
        if (err) { reject(err); }
        if (data.length === 0) { resolve('PASS'); } // Nothing matches
        else { // When something matches
          if (data[0].email.toUpperCase() === email.toUpperCase() && data[0].username.toUpperCase() === username.toUpperCase()) { resolve('FAIL, BOTH'); }
          else if (data[0].email.toUpperCase() === email.toUpperCase()) { resolve('FAIL, EMAIL'); }
          else if (data[0].username.toUpperCase() === username.toUpperCase()) { resolve('FAIL, USER'); }
          else { resolve('FAIL, UNKNOWN'); }
        }
      });
    })
  }

  // ---- USE THESE FOR CALLS ----
  // When param '_response' is null, the function will NOT run "updateLoginCookie()"
  async doLogin(username, password, _response = null) {
    // Ensure param username and password are valid
    if (!username || !password) {
        handleError('us1');
        return this.dummyPromise;
    }

    this.DB.buildSelect(this.userTable);
    const cleanName = SqlString.escape(username);

    // Run the query to get the username first, then it pulls the data and compare to password with the data
    this.DB.buildWhere(`username = ${cleanName}`);

    const result = await new Promise((resolve, reject) => {
      this.DB.runQuery().then((data, err) => {
        if (err) { reject(err); }

        // Invalid user (happens if the SQL database found 0 rows based on the username)
        if (data.length === 0) { resolve('FAIL'); }

        // Correct username, then check the password
        else {
          if (data[0].password === undefined) { data[0].password = ''; }
          bcrypt.compare(password, data[0].password, (errB, res) => {
            if (errB) { handleError('us2', errB); }
            if (res) {
              if (_response) { this.updateLoginCookie(data[0].uid, _response); }
              resolve('SUCCESS');
            }
            else { resolve('FAIL'); }
          });
        }
      });
    });
    return result;
  }

  doLogout(_response) {
    _response.cookie('Login', 'logout', { expires: new Date(Date.now() + 2 * 1000), httpOnly: true, });
    return 'LOGGED OUT';
  }

  async doRegister(_request, username, password, email) {
    // In case if both param are invalid
    if ((!username || !email || !password) || (username === '' || email === '' || password === '')) {
      handleError('us3');
      return this.dummyPromise;
    }

    const userCheckResult = await this.checkExistingUser(username, email);
    if (userCheckResult === 'PASS') {
      return await this.newUserToDatabase(_request, username, email, password);
    }
    return userCheckResult;
  }

  // ---- LOGIN UPDATES ----
  updateLoginCookie(uid, _response) {
    const token = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN, });
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 365 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    _response.cookie('Login', token, cookieOptions);
  }

  async newUserToDatabase(_request, username, email, password) {
    // Hash the password
    return await new Promise((resolve, reject) => {
      bcrypt.hash(password, 8, (err_bcrypt, hash) => {
        if (err_bcrypt) { handleError('us4'); reject(err_bcrypt); }

        const columnNames = ['username', 'email', 'password', 'join_date', 'items_per_page', 'gid', 'registered_ip'];
        const timestamp = Math.ceil(Date.now() / 1000);
        const columnValues = [username, email, hash, timestamp, process.env.DEFAULT_ROWS, 5, clientIP(_request)];

        // Build and run
        this.DB.buildInsert(this.userTable, columnNames, columnValues);
        this.DB.runQuery(true).then((queryResult) => {
          resolve(queryResult);
        });
      });
    });
  }

  /*
  ********************************** EDITING *************************************
  */

  async updateUserProfile(_request, uid = 0, inputs = [], sensitive = false) {
    const getPermPermission = await checkPermission(_request);
    if (getPermPermission === 'LOGGED OUT') { 
      handleError('us5'); return placeholderPromise(getPermPermission);
    }
    if ((parseInt(uid) !== parseInt(getPermPermission.id) && !getPermPermission.staff_user)
    || (!getPermPermission.can_msg || !getPermPermission.can_submit || !getPermPermission.can_comment)) { 
      handleError('us6'); return placeholderPromise('BAD PERMISSION'); 
    }
    if (inputs.length === 0) {
      handleError('us7'); return placeholderPromise('NOTHING');
    }

    const checkSpecialPermission = (column = '', value = '') => {
      const readOnlyKey = ['registered_ip', 'join_date', 'last_visit', 'last_active', 'last_ip']
      const staffKey = ['gid', 'username'];
      const sensitiveKey = ['password', 'email'];
      if (readOnlyKey.find(eachRO => eachRO === column)) { return 'READ ONLY'; }
      if (sensitiveKey.find(eachSS => eachSS === column) && !sensitive && !getPermPermission.staff_user) { return 'SENSITIVE'; }
      if (staffKey.find(eachST => eachST === column) && !getPermPermission.staff_user) { return 'STAFF ONLY'; }
      if (column === 'gid' && value === '1' && !getPermPermission.staff_root) { return 'ROOT ONLY'; }
      return 'PASS';
    }

    let [updateColumns, updateValues] = [[], []];
    for (let eachObj of inputs) {
      const [entry] = Object.entries(eachObj);
      const specialPermissionResult = checkSpecialPermission(entry[0], entry[1]);
      if (specialPermissionResult !== 'PASS') {
        handleError('us6');
        return placeholderPromise(specialPermissionResult); 
      }
      updateColumns.push(entry[0]);
      updateValues.push(entry[1]);
    }
    this.DB.buildUpdate(this.userTable, updateColumns, updateValues);
    this.DB.buildWhere(`uid = ${uid}`);
    let output = await this.DB.runQuery(true);
    return output;
  }

  async updatePassword(_request, username, oldPassword, newPassword) {
    const loginVerify = await checkLogin(_request);
    if (loginVerify === 'LOGGED OUT') {
      handleError('us5'); return placeholderPromise(loginVerify);
    }
    const uid = loginVerify.uid;
    const passwordVerify = await this.doLogin(username, oldPassword, null);
    if (passwordVerify !== 'SUCCESS') {
      handleError('us8'); return placeholderPromise(passwordVerify);
    }

    const hashedNewPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(newPassword, 8, (err_bcrypt, hash) => {
        if (err_bcrypt) { handleError('us4'); reject(err_bcrypt); }
        resolve(hash);
      });
    });
    return await this.updateUserProfile(_request, uid, [{ password: hashedNewPassword }], true);
  }

  async updateEmail(_request, username, password, newEmail) {
    const loginVerify = await checkLogin(_request);
    if (loginVerify === 'LOGGED OUT') {
      handleError('us5'); return placeholderPromise(loginVerify);
    }
    const uid = loginVerify.uid;
    const passwordVerify = await this.doLogin(username, password, null);
    if (passwordVerify !== 'SUCCESS') {
      handleError('us8'); return placeholderPromise(passwordVerify);
    }

    return await this.updateUserProfile(_request, uid, [{ email: newEmail }], true);
  }
  
}