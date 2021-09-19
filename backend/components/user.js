// ================================================================================
// MAIN USER OBJECT
// (primarily called by /routes/user.js)
// ================================================================================
import bcrypt from "bcryptjs";
import SQL from "../lib/sql.js";
import { handleError, sanitizeInput } from "../lib/globallib.js";
import {
  checkPermission,
  checkLogin,
  checkExistingUser,
  updateLoginCookie,
  createUser,
} from "./lib/userlib.js";
import CF from "../config.js";
import RESULT from "../lib/result.js";

export default class User {
  constructor() {
    this.DB = new SQL();
    this.userTable = `${CF.DB_PREFIX}users`;
  }

  // PUBLIC METHODS (no login required) ------------------------------------------------------------------------------------------------------------

  /** List of users
   @param column - is used for which column to sort by
   @param filter - must be in { columnName: string }[]
   @returns JSON, RESULT[fail] */
  async listUsers(page = 0, count = 25, column = "", asc = true, filter = []) {
    this.DB.buildSelect(this.userTable);

    // Apply filter
    if (filter.length > 0) {
      let statements = [];
      for (let eachObj of filter) {
        let [entry] = Object.entries(eachObj);
        entry[0] =
          typeof entry[0] === "string" ? sanitizeInput(entry[0]) : entry[0];
        entry[1] =
          typeof entry[1] === "string"
            ? `'${sanitizeInput(entry[1])}'`
            : entry[1];
        statements.push(`${entry[0]} = ${entry[1]}`);
      }
      this.DB.buildWhere(statements);
    }

    // Order and limit
    if (column) {
      this.DB.buildOrder([column], [asc]);
    }
    if (count) {
      this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`);
    }
    const listOfUsers = await this.DB.runQuery();

    // Remove password key
    for (let user of listOfUsers) {
      const hasPassword = Object.prototype.hasOwnProperty.call(
        user,
        "password"
      );
      if (hasPassword) {
        delete user.password;
      }
    }
    return listOfUsers;
  }

  /** Show details of a specific user
   @returns JSON, RESULT [fail | notfound] */
  async showUserByID(id = 0) {
    const uidWhere = "WHERE uid = u.uid";
    const subWhere = `${uidWhere} AND queue_code = 0`;
    const countQuery = (table, where, as = "") => {
      return `(SELECT COUNT(*) FROM ${table} ${where}) ${as ? `AS ${as}` : ``}`;
    };
    this.DB.buildSelect(`${this.userTable} u`, [
      `u.*`,
      countQuery(`${CF.DB_PREFIX}comments`, uidWhere, `comments`), // Number of comments made by the user
      `(SELECT ` + // Count all of the active submissions by this user
        countQuery(`${CF.DB_PREFIX}submission_games`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_hacks`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_howtos`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_misc`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_reviews`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_sounds`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_sprites`, subWhere) +
        `) AS submissions`,
    ]);
    this.DB.buildWhere(`u.uid = ${sanitizeInput(id)}`);
    const queryResult = await this.DB.runQuery(); // Only return the 1st result if there's more

    if (!queryResult.length) {
      return RESULT.notfound;
    }

    // Delete password
    const hasPassword = Object.prototype.hasOwnProperty.call(
      queryResult[0],
      "password"
    );
    if (hasPassword) {
      delete queryResult[0].password;
    }

    return queryResult[0];
  }

  // LOGIN METHODS ------------------------------------------------------------------------------------------------------------
  /** Main login function
   @param _response - when it is null, the function will NOT run "updateLoginCookie()"
   @returns RESULT [badparam | fail | denied | done]
   */
  async doLogin(username, password, _response = null) {
    // Invalid param
    if (!username || !password) {
      handleError("us1");
      return RESULT.badparam;
    }

    this.DB.buildSelect(this.userTable);
    this.DB.buildWhere(`username = '${sanitizeInput(username)}'`);
    const queryData = await this.DB.runQuery();

    // Username not found
    if (queryData.length === 0) {
      return RESULT.fail;
    }
    // Ensure password is a string
    if (typeof queryData[0].password !== "string") {
      queryData[0].password = "";
    }

    const result = await bcrypt.compare(password, queryData[0].password);
    if (result) {
      if (_response) {
        updateLoginCookie(queryData[0].uid, _response);
      }
      return RESULT.done;
    }
    return RESULT.denied;
  }

  /** Main logout function 
   @returns - RESULT [done]
  */
  async doLogout(_response) {
    _response.cookie("Login", "logout", {
      expires: new Date(Date.now() + 2 * 1000),
      httpOnly: true,
    });
    return await new Promise((resolve) => {
      setTimeout(() => resolve(RESULT.done), 1000);
    });
  }

  /** Main register function
   @returns RESULT [badparam | done | fail | exists]
  */
  async doRegister(_request, username, password, email) {
    // Invalid param
    if (!username || !password || !email) {
      handleError("us3");
      return RESULT.badparam;
    }

    // Need to ensure no other username/email were used
    const userCheckResult = await checkExistingUser(username, email);
    if (userCheckResult === RESULT.ok) {
      return await createUser(_request, username, email, password);
    }
    return userCheckResult;
  }

  // PROFILE EDITING METHODS ------------------------------------------------------------------------------------------------------------
  /** Main function to update settings for updating user profile settings
   @param inputs - must be in `{ columnName: value }[]`
   @param insensitive - can be only set as `true` by methods like `updatePassword()`, `updateEmail()`, `updateUsername()`
   @returns RESULT [badparam | denied | fail | done]
  */
  async updateUserProfile(_request, uid = 0, inputs = [], insensitive = false) {
    // Not logged in
    const getPermission = await checkPermission(_request);
    if (getPermission === RESULT.fail) {
      handleError("us5");
      return RESULT.fail;
    }
    // Non-staff user cannot modify other user -or- banned user cannot modify their profile
    if (
      (parseInt(uid) !== parseInt(getPermission.id) &&
        !getPermission.staff_user) ||
      !getPermission.can_msg ||
      !getPermission.can_submit ||
      !getPermission.can_comment
    ) {
      // banned user
      handleError("us6");
      return RESULT.denied;
    }
    if (inputs.length === 0) {
      handleError("us7");
      return RESULT.badparam;
    } // Nothing for "inputs"

    // A standalone function specified for this method
    // To verify the column (of the user table) is not restricted
    const checkSpecialPermission = (column = "", value = "") => {
      const readOnlyKey = [
        "registered_ip",
        "join_date",
        "last_visit",
        "last_active",
        "last_ip",
      ];
      const staffKey = ["gid", "username"];
      const sensitiveKey = ["password", "email"];
      // Read only
      if (readOnlyKey.find((eachRO) => eachRO === column)) {
        return RESULT.badparam;
      }
      // Can be called by functions that changes password/email
      if (
        sensitiveKey.find((eachSS) => eachSS === column) &&
        !insensitive &&
        !getPermission.staff_user
      ) {
        return RESULT.badparam;
      }
      // Only staff with "staff_user" permission can modify gid and username
      if (
        staffKey.find((eachST) => eachST === column) &&
        !getPermission.staff_user
      ) {
        return RESULT.denied;
      }
      // Only root admin can promote other user
      if (column === "gid" && value === "1" && !getPermission.staff_root) {
        return RESULT.denied;
      }

      return RESULT.ok;
    };

    // Assemble each option then run the query
    let [updateColumns, updateValues] = [[], []];
    for (let eachObj of inputs) {
      const [entry] = Object.entries(eachObj);
      const specialPermissionResult = checkSpecialPermission(
        entry[0],
        entry[1]
      );
      if (specialPermissionResult !== RESULT.ok) {
        handleError("us6");
        return specialPermissionResult;
      }
      updateColumns.push(entry[0]);
      updateValues.push(entry[1]);
    }
    this.DB.buildUpdate(this.userTable, updateColumns, updateValues);
    this.DB.buildWhere(`uid = ${uid}`);
    let output = await this.DB.runQuery(true);
    return output;
  }

  /** Update current (logged in) user's password
   @returns RESULT [badparam | denied | fail | done | same]
  */
  async updatePassword(_request, oldPassword, newPassword) {
    // Invalid param
    if (!oldPassword || !newPassword) {
      return RESULT.badparam;
    }

    // Passwords are the same
    if (oldPassword === newPassword) {
      handleError("us9");
      return RESULT.same;
    }

    // Verify if the current user is logged in
    const loginVerify = await checkLogin(_request);
    if (loginVerify === RESULT.denied) {
      handleError("us5");
      return RESULT.denied;
    }

    // Verify old password with the logged in user
    const uid =
      typeof loginVerify.uid === "string"
        ? sanitizeInput(loginVerify.uid)
        : loginVerify.uid;
    const passwordVerify = await this.doLogin(
      loginVerify.username,
      oldPassword,
      null
    );
    if (passwordVerify !== RESULT.done) {
      handleError("us8");
      return RESULT.denied;
    }

    // Encrypt the password
    const hashedNewPassword = await bcrypt.hash(newPassword, CF.PASSWORD_SALT);
    return await this.updateUserProfile(
      _request,
      uid,
      [{ password: hashedNewPassword }],
      true
    );
  }

  /** Update current (logged in) user's email
   @returns RESULT [badparam | denied | fail | done | same]
  */
  async updateEmail(_request, password, newEmail) {
    // Invalid param
    if (!password || !newEmail) {
      return RESULT.badparam;
    }

    // Verify if the current user is logged in
    const loginVerify = await checkLogin(_request);
    if (loginVerify === RESULT.fail) {
      handleError("us5");
      return RESULT.denied;
    }

    // Verify password with the logged in user
    const uid =
      typeof loginVerify.uid === "string"
        ? sanitizeInput(loginVerify.uid)
        : loginVerify.uid;
    const passwordVerify = await this.doLogin(
      loginVerify.username,
      password,
      null
    );
    if (passwordVerify !== RESULT.done) {
      handleError("us8");
      return RESULT.denied;
    }

    // Verify if email is taken
    const checkEmailResult = await checkExistingUser(null, newEmail);
    if (checkEmailResult !== RESULT.ok) {
      handleError("us10");
      return RESULT.exists;
    }

    return await this.updateUserProfile(
      _request,
      uid,
      [{ email: newEmail }],
      true
    );
  }

  /** Delete user
   @returns RESULT [denied | fail | done]
  */
  async deleteUser(_request, uid = 0) {
    // CHECK LOGIN
    const getPermission = await checkPermission(_request);
    if (getPermission === RESULT.fail) {
      handleError("us5");
      RESULT.denied;
    }
    // Only root admin can delete user
    if (!getPermission.staff_root) {
      handleError("us11");
      RESULT.denied;
    }

    uid = typeof uid === "string" ? `'${sanitizeInput(uid)}'` : uid;
    this.DB.buildDelete(this.userTable, `uid = ${uid}`);
    const getResult = await this.DB.runQuery();

    // Nothing deleted
    if (!getResult?.affectedRows) {
      return RESULT.fail;
    }

    // Done
    return RESULT.done;
  }
}
