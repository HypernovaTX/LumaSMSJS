// ================================================================================
// Misc user functions
// ================================================================================
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import CF from '../../config.js';
import SQL from '../../lib/sql.js';
import { handleError, clientIP, sanitizeInput } from '../../lib/globallib.js';
import RESULT from '../../lib/result.js';

const DB = new SQL();
const userTable = `${CF.DB_PREFIX}users`;
const groupTable = `${CF.DB_PREFIX}groups`;

// ---- CHECKS ----
/** @returns JSON, RESULT [fail] */
export async function checkLogin(_request) {
  if (!_request.cookies?.Login) { throw RESULT.fail; } // No cookie found

  //Use the JWT to verify the cookie with secret code
  return new Promise((resolve, reject) => {
    jwt.verify(_request.cookies.Login, CF.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(RESULT.fail);
      }

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
        } else {
          reject(RESULT.fail);
        }
      });
    });
  });
}

/** @returns JSON, RESULT [fail] */
export async function checkPermission(_request) {
  try {
    await checkLogin(_request);
  } catch (e) {
    handleError('us5');
    return { id: 0, staff_mod: 0, staff_user: 0, staff_qc: 0, staff_admin: 0, staff_root: 0, can_msg: 0, can_submit: 0, can_comment: 0 };
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

  return await DB.runQuery().then((queryData) => {
    queryData[0].id = loginStatus.uid;
    return queryData[0];
  });
}

/** @returns RESULT [badparam | ok | exists] */
export async function checkExistingUser(username, email) {
  if (!username && !email) {
    handleError('us0');
    throw RESULT.badparam;
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

  return DB.runQuery().then((queryData) => {
    if (queryData.length === 0) {
      return RESULT.ok;// Nothing matches
    } else {
      return RESULT.exists;
    } // When something matches
  });
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
  const hashedPassword = await bcrypt.hash(password, CF.PASSWORD_SALT);
  const columnNames = ['username', 'email', 'password', 'join_date', 'items_per_page', 'gid', 'registered_ip'];
  const timestamp = Math.ceil(Date.now() / 1000);
  const columnValues = [
    username, email, hashedPassword, timestamp, CF.ROWS, CF.DEFAULT_GROUP, clientIP(_request)
  ];

  DB.buildInsert(userTable, columnNames, columnValues);
  return await DB.runQuery(true);
}