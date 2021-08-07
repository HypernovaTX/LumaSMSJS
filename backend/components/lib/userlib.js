// ================================================================================
// Misc user functions
// ================================================================================
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import CF from '../../config.js';
import SQL from '../../lib/sql.js';
import { handleError, placeholderPromise, clientIP, sanitizeInput } from '../../lib/globallib.js';
import RESULT from '../../lib/result.js';

const DB = new SQL();
const userTable = `${CF.DB_PREFIX}users`;
const groupTable = `${CF.DB_PREFIX}groups`;

// ---- CHECKS ----
/** @returns JSON, RESULT [fail] */
export async function checkLogin(_request) {
  if (!_request.cookies?.Login) { return RESULT.fail; } // No cookie found

  return new Promise((resolve) => {
    //Use the JWT to verify the cookie with secret code
    jwt.verify(_request.cookies.Login, CF.JWT_SECRET, (err, decoded) => {
      if (err) { resolve(RESULT.fail); }

      //Prepare data
      DB.buildSelect(userTable);
      const cleanDecode = (typeof decoded.uid === 'string') ? sanitizeInput(decoded.uid) : decoded.uid;
      const ip = clientIP(_request);

      //Do the query to check if the ID matches
      DB.buildWhere(`uid = ${cleanDecode}`);
      DB.runQuery().then((queryData) => {
        if (queryData.length > 0) { //If matches - confirm
          updateLastActivity(cleanDecode, ip);
          const hasPassword = Object.prototype.hasOwnProperty.call(queryData[0], 'password');
          if (hasPassword) { delete queryData[0].password; }
          resolve(queryData[0]);
        } else { resolve(RESULT.fail); }
      });
    });
  });
}

/** @returns JSON, RESULT [fail] */
export async function checkPermission(_request) {
  const loginStatus = await checkLogin(_request);
  if (loginStatus === RESULT.fail) {
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
    DB.runQuery().then((queryData) => {
      queryData[0].id = loginStatus.uid;
      resolve(queryData[0]);
    });
  });
}

/** @returns RESULT [badparam | ok | exists] */
export async function checkExistingUser(username, email) {
  if (!username && !email) {
    handleError('us0'); return placeholderPromise(RESULT.badparam);
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

  return await new Promise((resolve) => {
    DB.runQuery().then((queryData) => {
      if (queryData.length === 0) { resolve(RESULT.ok); } // Nothing matches
      else { resolve(RESULT.exists); } // When something matches
    });
  })
}

// ---- UPDATES / CREATE ----
/** @returns RESULT [done] */
export async function updateLastActivity(uid = '0', ip = '') {
  const timestamp = Math.ceil(Date.now() / 1000);
  DB.buildUpdate(userTable, [`last_activity`, `last_ip`], [timestamp, ip]);
  DB.buildWhere(`uid = ${uid}`);
  return await DB.runQuery(true);
}

/** @returns void */
export async function updateLoginCookie(uid, _response) {
  const token = jwt.sign({ uid }, CF.JWT_SECRET, { expiresIn: CF.JWT_EXPIRES_IN, });
  const cookieOptions = {
    expires: new Date(Date.now() + CF.JWT_COOKIE_EXPIRES * 365 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  _response.cookie('Login', token, cookieOptions);
}

/** @returns RESULT [fail | done] */
export async function createUser(_request, username, email, password) {
  // Hash the password
  return await new Promise((resolve) => {
    bcrypt.hash(password, 8, (err_bcrypt, hash) => {
      if (err_bcrypt) {
        handleError('us4');
        console.log(err_bcrypt);
        resolve(RESULT.fail);
      }

      const columnNames = ['username', 'email', 'password', 'join_date', 'items_per_page', 'gid', 'registered_ip'];
      const timestamp = Math.ceil(Date.now() / 1000);
      const columnValues = [username, email, hash, timestamp, CF.DEFAULT_ROWS, 5, clientIP(_request)];

      // Build and run
      DB.buildInsert(userTable, columnNames, columnValues);
      DB.runQuery(true).then((queryResult) => { resolve(queryResult); });
    });
  });
}