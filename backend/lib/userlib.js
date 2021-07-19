// Commonly used user functions for multiple purposes
import SQL from './sql.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import SqlString from 'sqlstring';

const app = express();
const DB = new SQL();
const userTable = `${process.env.DB_PREFIX}users`;
app.use(cookieParser());
dotenv.config({ path: './.env' });

export async function updateLastActivity(uid = '0', ip = '') {
  const timestamp = Math.ceil(Date.now() / 1000);
  DB.buildUpdate(userTable, [`last_activity`, `last_ip`], [timestamp, ip]);
  DB.buildWhere(`uid = ${uid}`);
  return await DB.runQuery(true);
}

export async function checkLogin(_request) {
  let output = 'No cookie';

  //If cookie exists
  if (_request.cookies?.Login) {
    output = await new Promise((resolve, reject) => {
      //Use the JWT to verify the cookie with secret code
      jwt.verify(_request.cookies.Login, process.env.JWT_SECRET, (err, decoded) => {
        if (err) { reject(err); }

        //Prepare data
        DB.buildSelect(userTable);
        const cleanDecode = SqlString.escape(decoded.uid);
        const ip = _request.headers['x-forwarded-for'] || _request.connection.remoteAddress;

        //Do the query to check if the ID matches
        DB.buildWhere(`uid = ${cleanDecode}`);
        DB.runQuery().then((data) => {
          if (data.length > 0) { //If matches - confirm
            updateLastActivity(cleanDecode, ip);
            if (data[0].hasOwnProperty('password')) { delete data[0].password; } //Remove password
            resolve(data[0]);
          } else { resolve('Not logged in'); }
        });
      });
    });
  }
  return output; 
}

