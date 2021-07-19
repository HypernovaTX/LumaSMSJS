// ==================== MAIN USER OBJ ====================
import SQL from '../lib/sql.js';
import { placeholderPromise } from '../lib/globallib.js';
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
    this.falsePromise = placeholderPromise('ERROR');
    this.SALT = process.env.PASSWORD_SALT;
    this.imageMIME = /image\/(apng|gif|jpeg|png|svg|webp)$/i;
    this.fileExtension = /\.[0-9a-z]+$/;
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
    this.DB.buildSelect(this.userTable);
    this.DB.buildWhere(`uid = ${id}`);
    const data = await this.DB.runQuery();
    return data;
  }

  /**
   ********************************** LOGIN *************************************
   */
  async checkLogin(_request) {
    let output = 'No cookie';
    //If cookie exists
    if (_request.cookies?.Login) {
      output = await new Promise((resolve, reject) => {
        //Use the JWT to verify the cookie with secret code
        jwt.verify(_request.cookies.Login, process.env.JWT_SECRET, (err, decoded) => {
          if (err) { reject(err); }

          //Prepare data
          const DB = new SQL();
          DB.buildSelect(this.userTable);
          const cleanDecode = SqlString.escape(decoded.uid);
          const ip = _request.headers['x-forwarded-for'] || _request.connection.remoteAddress;
          console.log(decoded);

          //Do the query to check if the ID matches
          DB.buildWhere(`uid = ${cleanDecode}`);
          DB.runQuery().then((data) => {
            if (data.length > 0) { //If matches - confirm
              this.updateLastActivity(cleanDecode, ip);
              console.log(data[0]);
              if (data[0].hasOwnProperty('password')) { delete data[0].password; } //Remove password
              resolve(data[0]);
            } else { resolve('Not logged in'); }
          });
        });
      });
    }
    return output; 
  }

  async updateLastActivity(uid = '0', ip = '') {
    const DB = new SQL();
    DB.buildUpdate(`users`, [`last_activity`, `last_ip`], [`${Date.now()}`, ip]);
    DB.buildWhere(`id = ${uid}`);
    return await DB.runQuery(true);
  }

  async checkExistingUser(username, email) {
    if (!username || !email) {
      this.handleError('us4');
      return this.falsePromise;
    }
    
    const DB = new SQL();
    const cleanUser = SqlString.escape(username);
    const cleanEmail = SqlString.escape(email);
    DB.buildSelect(`users`);
    DB.buildWhere(`username = ${cleanUser} || email = ${cleanEmail}`);

    return await new Promise((resolve, reject) => {
      DB.runQuery().then((data, err) => {
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

  updateLoginCookie(uid, _response) {
    const token = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN, });
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 365 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    _response.cookie('Login', token, cookieOptions);
  }

  doLogout(_response) {
    _response.cookie('Login', 'logout', { expires: new Date(Date.now() + 2 * 1000), httpOnly: true, });
    return 'LOGGED OUT';
  }

  async loginRequest(username, password, _response = null) {
    // Ensure param username and password are valid
    if (!username || !password) {
        this.handleError('us2');
        return this.falsePromise;
    }

    const DB = new SQL();
    DB.buildSelect(this.userTable);
    const cleanName = SqlString.escape(username);

    // Run the query to get the username first, then it pulls the data and compare to password with the data
    DB.buildWhere(`username = ${cleanName}`);

    const result = await new Promise((resolve, reject) => {
      DB.runQuery().then((data, err) => {
        if (err) { reject(err); }

        // Invalid user (happens if the SQL database found 0 rows based on the username)
        if (data.length === 0) { resolve('FAIL'); }

        // Correct username, then check the password
        else {
          if (data[0].password === undefined) { data[0].password = ''; }
          bcrypt.compare(password, data[0].password, (errB, res) => {
            if (errB) { this.handleError('us3', errB); reject(errB); }
            if (res) {
              if (_response) { this.updateLoginCookie(data[0].uid, _response); }
              resolve('SUCCESS!');
            }
            else { resolve('FAIL'); }
          });
        }
      });
    });
    return result;
  }


  
}