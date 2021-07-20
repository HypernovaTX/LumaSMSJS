// ================================================================================
// MAIN USER OBJECT
// (primarily called by /routes/user.js)
// ================================================================================
import SQL from '../lib/sql.js';
import { placeholderPromise, handleError } from '../lib/globallib.js';
import { checkPermission, checkLogin, checkExistingUser, updateLoginCookie, createUser } from '../lib/userlib.js';
import bcrypt from 'bcryptjs';
import SqlString from 'sqlstring';

export default class User {
  constructor() {
    this.dummyPromise = placeholderPromise('ERROR');
    this.SALT = process.env.PASSWORD_SALT;
    this.DB = new SQL();
    this.userTable = `${process.env.DB_PREFIX}users`;
  }
  
  // PUBLIC METHODS ------------------------------------------------------------------------------------------------------------
  // No login required

  // List of users
  // Param 'column' is used for which column to sort by
  // Filter must be in { column: string, value: string }[]
  async listUsers(page = 0, count = 25, column = '', asc = true, filter = []) {
    this.DB.buildSelect(this.userTable);

    if (column) { this.DB.buildOrder([column], [asc]); }
    if (filter.length > 0) {
      let statements = [];
      filter.forEach((filterData) => {
        statements.push(`${filterData.column} = ${filterData.value}`);
      });
      this.DB.buildWhere(statements);
    }
    if (count) { this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`); }
    const listOfUsers = await this.DB.runQuery();
    
    for (let user of listOfUsers) {
      // Remove passwords on all of the user list
      if (user.hasOwnProperty('password')) { delete user.password; }
    }
    return listOfUsers;
  }

  // Show details of a specific user
  async showUserByID(id = 0) {
    this.DB.buildSelect(`${this.userTable} u`, [
      'u.*',
      '(SELECT COUNT(*) FROM tsms_comments WHERE uid = u.uid) as comments', // Count comments
      '(SELECT COUNT(*) FROM tsms_resources WHERE uid = u.uid AND queue_code = 0) as submissions', // Count submissions
    ]);
    this.DB.buildWhere(`u.uid = ${id}`);
    const data = await this.DB.runQuery();
    return data[0];
  }

  // LOGIN METHODS ------------------------------------------------------------------------------------------------------------
  
  // Main login function
  // When param '_response' is null, the function will NOT run "updateLoginCookie()"
  async doLogin(username, password, _response = null) {
    if (!username || !password) {
        handleError('us1');
        return this.dummyPromise;
    }

    this.DB.buildSelect(this.userTable);
    const cleanName = SqlString.escape(username);
    this.DB.buildWhere(`username = ${cleanName}`);

    const result = await new Promise((resolve, reject) => {
      this.DB.runQuery().then((data, err) => {
        if (err) { reject(err); }

        // Login verification procedures
        if (data.length === 0) { resolve('FAIL'); }
        else {
          if (data[0].password === undefined) { data[0].password = ''; }
          bcrypt.compare(password, data[0].password, (errB, res) => {
            if (errB) { handleError('us2', errB); }
            if (res) {
              if (_response) { updateLoginCookie(data[0].uid, _response); }
              resolve('SUCCESS');
            }
            else { resolve('FAIL'); }
          });
        }
      });
    });
    return result;
  }

  // Main logout function
  doLogout(_response) {
    _response.cookie('Login', 'logout', { expires: new Date(Date.now() + 2 * 1000), httpOnly: true, });
    return 'LOGGED OUT';
  }

  // Main register function
  async doRegister(_request, username, password, email) {
    if ((!username || !email || !password) || (username === '' || email === '' || password === '')) {
      handleError('us3');
      return this.dummyPromise;
    }

    // Need to ensure no other username/email were used
    const userCheckResult = await checkExistingUser(username, email); 
    if (userCheckResult === 'PASS') {
      return await createUser(_request, username, email, password);
    }
    return userCheckResult;
  }

  // PROFILE EDITING METHODS ------------------------------------------------------------------------------------------------------------

  // Main function to update settings for updating user profile settings
  // Param "inputs" must be in { columnName: value }[]
  // Param "insensitive" can be only called by methods like updatePassword, updateEmail, updateUsername
  async updateUserProfile(_request, uid = 0, inputs = [], insensitive = false) {
    const getPermPermission = await checkPermission(_request);
    if (getPermPermission === 'LOGGED OUT') { // Not logged in
      handleError('us5'); return placeholderPromise(getPermPermission);
    }
    if ((parseInt(uid) !== parseInt(getPermPermission.id) && !getPermPermission.staff_user) // A non-staff user
    || (!getPermPermission.can_msg || !getPermPermission.can_submit || !getPermPermission.can_comment)) { // banned user
      handleError('us6'); return placeholderPromise('BAD PERMISSION'); 
    }
    if (inputs.length === 0) { // Nothing for "inputs"
      handleError('us7'); return placeholderPromise('NOTHING');
    }

    // A standalone function specified for this method
    // To verify the column (of the user table) is not restricted
    const checkSpecialPermission = (column = '', value = '') => {
      const readOnlyKey = ['registered_ip', 'join_date', 'last_visit', 'last_active', 'last_ip']
      const staffKey = ['gid', 'username'];
      const sensitiveKey = ['password', 'email'];
      if (readOnlyKey.find(eachRO => eachRO === column)) { return 'READ ONLY'; }
      if (sensitiveKey.find(eachSS => eachSS === column) && !insensitive && !getPermPermission.staff_user) { return 'SENSITIVE'; }
      if (staffKey.find(eachST => eachST === column) && !getPermPermission.staff_user) { return 'STAFF ONLY'; }
      if (column === 'gid' && value === '1' && !getPermPermission.staff_root) { return 'ROOT ONLY'; }
      return 'PASS';
    }

    // Assemble each option then run the query
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

  // Update current (logged in) user's password
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

    // Encrypt the password
    const hashedNewPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(newPassword, 8, (err_bcrypt, hash) => {
        if (err_bcrypt) { handleError('us4'); reject(err_bcrypt); }
        resolve(hash);
      });
    });
    return await this.updateUserProfile(_request, uid, [{ password: hashedNewPassword }], true);
  }

  // Update current (logged in) user's email
  async updateEmail(_request, username, password, newEmail) {
    const loginVerify = await checkLogin(_request);
    if (loginVerify === 'LOGGED OUT') {
      handleError('us5'); return placeholderPromise(loginVerify);
    }
    const uid = loginVerify.uid;
    const passwordVerify = await this.doLogin(username, password, null);
    if (passwordVerify !== 'SUCCESS') { // Verify password
      handleError('us8'); return placeholderPromise(passwordVerify);
    }

    return await this.updateUserProfile(_request, uid, [{ email: newEmail }], true);
  }
  
}