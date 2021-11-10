// ================================================================================
// MAIN USER OBJECT
// (primarily called by /routes/user.js)
// ================================================================================
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import UserQuery from '../queries/userquery';
import ERR, { ErrorObj, isError } from '../lib/error';
import {
  checkExistingUserAndEmail,
  //checkPermission,
  //checkLogin,
  updateLoginCookie,
  //createUser,
} from './lib/userlib';
import CF from '../config';
import { User, UserList } from '../schema/userResponse';
import { clientIP, sanitizeInput } from '../lib/globallib';
import { NoResponse } from '../lib/result';

// SAFE FUNCTIONS
export async function listUsers(
  page: number = 0,
  count: number = CF.ROWS,
  column: string = '',
  asc: boolean = true,
  filter: [string, string][] = []
) {
  const query = new UserQuery();
  const result = await query.listUsers(page, count, column, asc, filter);
  if (isError(result)) {
    return result;
  }
  let output = result;
  if (Array.isArray(result)) {
    output = result.map((user) => {
      if (user.password) {
        delete user.password;
      }
      return user;
    });
  }
  return output;
}

export async function showUserByID(id: number) {
  const query = new UserQuery();
  const result = await query.getUserById(id);
  if (isError(result)) {
    return result;
  }
  // Delete password
  if ((result as User).password) {
    delete (result as User).password;
  }
  return result;
}

export async function userLogin(
  username: string,
  password: string,
  remember: boolean,
  _response: Response
) {
  const query = new UserQuery();
  let queryResult = await query.getUserByUsername(username);

  if (isError(queryResult)) {
    return queryResult;
  }

  const userHelper = queryResult as User;

  // Ensure password is a string
  if (typeof userHelper.password !== 'string') {
    userHelper.password = '';
  }

  const result = await bcrypt.compare(password, userHelper.password);
  if (result) {
    updateLoginCookie(userHelper.uid, _response, remember);
    // Delete password
    if (userHelper.password) {
      delete userHelper.password;
    }
    return userHelper;
  }
  return ERR('userLogin');
}

export function userLogout(_response: Response) {
  _response.cookie('Login', 'logout', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
}

// RISKY FUNCTIONS
export async function userRegistration(
  _request: Request,
  username: string,
  password: string,
  email: string
) {
  // Need to ensure no other username/email were used
  const userExists = await checkExistingUserAndEmail(username, email);
  if (!userExists) {
    const hashedPassword = await bcrypt.hash(password, CF.PASSWORD_SALT);
    const ip = clientIP(_request);
    const query = new UserQuery();
    const result = await query.createUser(username, email, hashedPassword, ip);
    if (isError(result)) {
      return result as ErrorObj;
    }
    return result as NoResponse;
  }
  return ERR('userExists');
}

// // PROFILE EDITING METHODS ------------------------------------------------------------------------------------------------------------
// /** Main function to update settings for updating user profile settings
//  @param inputs - must be in `{ columnName: value }[]`
//  @param insensitive - can be only set as `true` by methods like `updatePassword()`, `updateEmail()`, `updateUsername()`
//  @returns RESULT [badparam | denied | fail | done]
// */
// async updateUserProfile(_request, uid = 0, inputs = [], insensitive = false) {
//   // Not logged in
//   const getPermission = await checkPermission(_request);
//   if (getPermission === RESULT.fail) {
//     handleError("us5");
//     return RESULT.fail;
//   }
//   // Non-staff user cannot modify other user -or- banned user cannot modify their profile
//   if (
//     (parseInt(uid) !== parseInt(getPermission.id) &&
//       !getPermission.staff_user) ||
//     !getPermission.can_msg ||
//     !getPermission.can_submit ||
//     !getPermission.can_comment
//   ) {
//     handleError("us6");
//     return RESULT.denied;
//   }
//   if (inputs.length === 0) {
//     handleError("us7");
//     return RESULT.badparam;
//   } // Nothing for "inputs"

//   // A standalone function specified for this method
//   // To verify the column (of the user table) is not restricted
//   const checkSpecialPermission = (column = "", value = "") => {
//     const readOnlyKey = [
//       "registered_ip",
//       "join_date",
//       "last_visit",
//       "last_active",
//       "last_ip",
//     ];
//     const staffKey = ["gid", "username"];
//     const sensitiveKey = ["password", "email"];
//     // Read only
//     if (readOnlyKey.find((eachRO) => eachRO === column)) {
//       return RESULT.badparam;
//     }
//     // Can be called by functions that changes password/email
//     if (
//       sensitiveKey.find((eachSS) => eachSS === column) &&
//       !insensitive &&
//       !getPermission.staff_user
//     ) {
//       return RESULT.badparam;
//     }
//     // Only staff with "staff_user" permission can modify gid and username
//     if (
//       staffKey.find((eachST) => eachST === column) &&
//       !getPermission.staff_user
//     ) {
//       return RESULT.denied;
//     }
//     // Only root admin can promote other user
//     if (column === "gid" && value === "1" && !getPermission.staff_root) {
//       return RESULT.denied;
//     }

//     return RESULT.ok;
//   };

//   // Assemble each option then run the query
//   let [updateColumns, updateValues] = [[], []];
//   for (let eachObj of inputs) {
//     const [entry] = Object.entries(eachObj);
//     const [column, value] = entry;
//     const specialPermissionResult = checkSpecialPermission(column, value);
//     if (specialPermissionResult !== RESULT.ok) {
//       handleError("us6");
//       return specialPermissionResult;
//     }
//     updateColumns.push(entry[0]);
//     updateValues.push(entry[1]);
//   }
//   this.DB.buildUpdate(this.userTable, updateColumns, updateValues);
//   this.DB.buildWhere(`uid = ${uid}`);
//   let output = await this.DB.runQuery(true);
//   return output;
// }

// async updateUserAvatar(_request, uid = 0, file) {
//   // Not logged in
//   const getPermission = await checkPermission(_request);
//   if (getPermission === RESULT.fail) {
//     handleError("us5");
//     return RESULT.fail;
//   }

//   // Non-staff user cannot modify other user -or- banned user cannot modify their profile
//   if (
//     (parseInt(uid) !== parseInt(getPermission.id) &&
//       !getPermission.staff_user) ||
//     !getPermission.can_msg ||
//     !getPermission.can_submit ||
//     !getPermission.can_comment
//   ) {
//     handleError("us6");
//     return RESULT.denied;
//   }
//   console.log('avatar upload ')

//   console.log(uid);
//   console.log(file);
// }

// /** Update current (logged in) user's password
//  @returns RESULT [badparam | denied | fail | done | same]
// */
// async updatePassword(_request, oldPassword, newPassword) {
//   // Invalid param
//   if (!oldPassword || !newPassword) {
//     return RESULT.badparam;
//   }

//   // Passwords are the same
//   if (oldPassword === newPassword) {
//     handleError("us9");
//     return RESULT.same;
//   }

//   // Verify if the current user is logged in
//   const loginVerify = await checkLogin(_request);
//   if (loginVerify === RESULT.denied) {
//     handleError("us5");
//     return RESULT.denied;
//   }

//   // Verify old password with the logged in user
//   const uid =
//     typeof loginVerify.uid === "string"
//       ? sanitizeInput(loginVerify.uid)
//       : loginVerify.uid;
//   const passwordVerify = await this.doLogin(
//     loginVerify.username,
//     oldPassword,
//     null
//   );
//   if (passwordVerify !== RESULT.done) {
//     handleError("us8");
//     return RESULT.denied;
//   }

//   // Encrypt the password
//   const hashedNewPassword = await bcrypt.hash(newPassword, CF.PASSWORD_SALT);
//   return await this.updateUserProfile(
//     _request,
//     uid,
//     [{ password: hashedNewPassword }],
//     true
//   );
// }

// /** Update current (logged in) user's email
//  @returns RESULT [badparam | denied | fail | done | same]
// */
// async updateEmail(_request, password, newEmail) {
//   // Invalid param
//   if (!password || !newEmail) {
//     return RESULT.badparam;
//   }

//   // Verify if the current user is logged in
//   const loginVerify = await checkLogin(_request);
//   if (loginVerify === RESULT.fail) {
//     handleError("us5");
//     return RESULT.denied;
//   }

//   // Verify password with the logged in user
//   const uid =
//     typeof loginVerify.uid === "string"
//       ? sanitizeInput(loginVerify.uid)
//       : loginVerify.uid;
//   const passwordVerify = await this.doLogin(
//     loginVerify.username,
//     password,
//     null
//   );
//   if (passwordVerify !== RESULT.done) {
//     handleError("us8");
//     return RESULT.denied;
//   }

//   // Verify if email is taken
//   const checkEmailResult = await checkExistingUser(null, newEmail);
//   if (checkEmailResult !== RESULT.ok) {
//     handleError("us10");
//     return RESULT.exists;
//   }

//   return await this.updateUserProfile(
//     _request,
//     uid,
//     [{ email: newEmail }],
//     true
//   );
// }

// /** Delete user
//  @returns RESULT [denied | fail | done]
// */
// async deleteUser(_request, uid = 0) {
//   // CHECK LOGIN
//   const getPermission = await checkPermission(_request);
//   if (getPermission === RESULT.fail) {
//     handleError("us5");
//     RESULT.denied;
//   }
//   // Only root admin can delete user
//   if (!getPermission.staff_root) {
//     handleError("us11");
//     RESULT.denied;
//   }

//   uid = typeof uid === "string" ? `'${sanitizeInput(uid)}'` : uid;
//   this.DB.buildDelete(this.userTable, `uid = ${uid}`);
//   const getResult = await this.DB.runQuery();

//   // Nothing deleted
//   if (!getResult?.affectedRows) {
//     return RESULT.fail;
//   }

//   // Done
//   return RESULT.done;
// }
