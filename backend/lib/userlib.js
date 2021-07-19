// Commonly used user functions for multiple purposes
import SQL from './sql.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import SqlString from 'sqlstring';
import { handleError, placeholderPromise } from '../lib/globallib.js';

const app = express();
const DB = new SQL();
const userTable = `${process.env.DB_PREFIX}users`;
const groupTable = `${process.env.DB_PREFIX}groups`;
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
          } else { resolve('LOGGED OUT'); }
        });
      });
    });
  }
  return output; 
}

export async function checkPermission(_request) {
  const loginStatus = await checkLogin(_request);
  if (loginStatus === 'LOGGED OUT') {
    handleError('us5');
    return placeholderPromise(loginStatus);
  }

  const groupID = loginStatus.gid;

  DB.buildSelect(groupTable, [
    'moderator AS staff_mod',
    'acp_users AS staff_user',
    'acp_modq AS staff_qc',
    'acp_access AS staff_admin',
    'acp_super AS staff_root',
    'can_msg_users AS can_msg',
    'can_submit', 'can_comment'
  ]);
  DB.buildWhere(`gid = ${groupID}`);

  return await new Promise((resolve) => {
    DB.runQuery().then((data) => {
      resolve(data[0]);
    });
  });
}
