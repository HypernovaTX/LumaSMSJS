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

  listUsers(position = 0, limit = 25) {
    this.DB.buildSelect(`users`);
    if (limit) {
      this.DB.buildCustomQuery(`LIMIT ${position}, ${limit}`);
    }

    return new Promise((resolve, reject) => {
      this.DB.runQuery().then((data, err) => {
        if (err) { reject(err); }

        // Remove passwords for each of the object in the array
        for (let i = 0; i < data.length; i ++) {
          if (data[i].hasOwnProperty('password')) { delete data[i].password; }
        }
        
        resolve(data); // Output
      });
    });
  }
}