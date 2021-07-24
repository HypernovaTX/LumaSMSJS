// ================================================================================
// Misc user functions
// ================================================================================
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import CF from '../../config.js';
import SQL from '../../lib/sql.js';
import { handleError, placeholderPromise, clientIP, sanitizeInput } from '../../lib/globallib.js';

const DB = new SQL();
const userTable = `${CF.DB_PREFIX}users`;
const groupTable = `${CF.DB_PREFIX}groups`;

// ---- CHECKS ----
export async function checkLogin(_request) {
  let output = 'LOGGED OUT';
  if (!_request.cookies?.Login) { return output; }

  output = await new Promise((resolve, reject) => {
    //Use the JWT to verify the cookie with secret code
    jwt.verify(_request.cookies.Login, CF.JWT_SECRET, (err, decoded) => {
      if (err) { reject(err); }

      //Prepare data
      DB.buildSelect(userTable);
      const cleanDecode = (typeof decoded.uid === 'string') ? sanitizeInput(decoded.uid) : decoded.uid;
      const ip = clientIP(_request);

      //Do the query to check if the ID matches
      DB.buildWhere(`uid = ${cleanDecode}`);
      DB.runQuery().then((data) => {
        if (data.length > 0) { //If matches - confirm
          updateLastActivity(cleanDecode, ip);
          const hasPassword = Object.prototype.hasOwnProperty.call(data[0], 'password');
          if (hasPassword) { delete data[0].password; }
          resolve(data[0]);
        } else { resolve('LOGGED OUT'); }
      });
    });
  });

  return output;
}

export async function checkPermission(_request) {
  const loginStatus = await checkLogin(_request);
  if (loginStatus === 'LOGGED OUT') {
    handleError('us5');
    const loggedOut = { id: 0, staff_mod: 0, staff_user: 0, staff_qc: 0, staff_admin: 0, staff_root: 0, can_msg: 0, can_submit: 0, can_comment: 0 };
    return placeholderPromise(loggedOut);
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
      data[0].id = loginStatus.uid;
      resolve(data[0]);
    });
  });
}

export async function checkExistingUser(username, email) {
  if (!username && !email) {
    handleError('us0'); return placeholderPromise('EMPTY');
  }
  username = username ?? '';
  email = email ?? '';
  const cleanUser = sanitizeInput(username);
  const cleanEmail = sanitizeInput(email);
  let whereQuery = `username = '${cleanUser}' || email = '${cleanEmail}'`
  DB.buildSelect(userTable);
  if (!username) { whereQuery = `email = '${cleanEmail}'` }
  if (!email) { whereQuery = `username = '${cleanUser}'` }
  DB.buildWhere(whereQuery);

  return await new Promise((resolve, reject) => {
    DB.runQuery().then((dbResult, err) => {
      if (err) { reject(err); }
      if (dbResult.length === 0) { resolve('PASS'); } // Nothing matches
      else { // When something matches
        if (dbResult[0].email.toUpperCase() === email.toUpperCase() && dbResult[0].username.toUpperCase() === username.toUpperCase()) {
          resolve('FAIL, BOTH');
        } else if (dbResult[0].email.toUpperCase() === email.toUpperCase()) {
          resolve('FAIL, EMAIL');
        } else if (dbResult[0].username.toUpperCase() === username.toUpperCase()) {
          resolve('FAIL, USER');
        } else { resolve('FAIL, UNKNOWN'); }
      }
    });
  })
}

// ---- UPDATES / CREATE ----
export async function updateLastActivity(uid = '0', ip = '') {
  const timestamp = Math.ceil(Date.now() / 1000);
  DB.buildUpdate(userTable, [`last_activity`, `last_ip`], [timestamp, ip]);
  DB.buildWhere(`uid = ${uid}`);
  return await DB.runQuery(true);
}

export async function updateLoginCookie(uid, _response) {
  const token = jwt.sign({ uid }, CF.JWT_SECRET, { expiresIn: CF.JWT_EXPIRES_IN, });
  const cookieOptions = {
    expires: new Date(Date.now() + CF.JWT_COOKIE_EXPIRES * 365 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  _response.cookie('Login', token, cookieOptions);
}

export async function createUser(_request, username, email, password) {
  // Hash the password
  return await new Promise((resolve, reject) => {
    bcrypt.hash(password, 8, (err_bcrypt, hash) => {
      if (err_bcrypt) { handleError('us4'); reject(err_bcrypt); }

      const columnNames = ['username', 'email', 'password', 'join_date', 'items_per_page', 'gid', 'registered_ip'];
      const timestamp = Math.ceil(Date.now() / 1000);
      const columnValues = [username, email, hash, timestamp, CF.DEFAULT_ROWS, 5, clientIP(_request)];

      // Build and run
      DB.buildInsert(userTable, columnNames, columnValues);
      DB.runQuery(true).then((queryResult) => {
        resolve(queryResult);
      });
    });
  });
}