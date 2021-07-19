// ==================== MAIN USER OBJ ====================
import SQL from '../lib/sql.js';
import { placeholderPromise } from '../lib/globallib.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

const app = express();

/*import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
const { v4: uuidv4 } = require('uuid');
const { MemoryStorage } = require('multer');*/

app.use(cookieParser());

dotenv.config({ path: './.env' });

export default class User {
  constructor() {
    this.falsePromise = placeholderPromise('ERROR');
    this.SALT = process.env.PASSWORD_SALT;
    this.imageMIME = /image\/(apng|gif|jpeg|png|svg|webp)$/i;
    this.fileExtension = /\.[0-9a-z]+$/;
    this.DB = new SQL();
  }

  async listUsers(position = 0, limit = 25, column = '', asc = true, filter = []) {
    this.DB.buildSelect(`${process.env.DB_PREFIX}users`);

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
    this.DB.buildSelect(`${process.env.DB_PREFIX}users`);
    this.DB.buildWhere(`uid = ${id}`);
    const data = await this.DB.runQuery();
    return data;
  }
}