// ================================================================================
// MAIN USER FUNCTIONS
// ================================================================================
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import CF from '../config';
import ERR, { ErrorObj, isError } from '../lib/error';
import { clientIP, sanitizeInput } from '../lib/globallib';
import { NoResponse } from '../lib/result';
import {
  checkExistingUserAndEmail,
  checkLogin,
  checkPermission,
  invalidUserUpdateKeys,
  updateLoginCookie,
  updateUser,
  validatePermission,
  verifyPassword,
} from './lib/userlib';
import UserQuery from '../queries/userquery';
import { User } from '../schema/userTypes';

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
  const queryResult = await query.getUserByUsername(username);
  if (isError(queryResult)) {
    return queryResult;
  }
  const userHelper = queryResult as User;
  // Ensure password is a string
  if (typeof userHelper?.password !== 'string') {
    userHelper.password = '';
  }
  const result = await bcrypt.compare(password, userHelper.password);
  if (result) {
    updateLoginCookie(userHelper.uid, userHelper.username, _response, remember);
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

export async function updateUserProfile(_request: Request, inputs: User) {
  // Ensure user is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) {
    return getLogin as ErrorObj;
  }
  // Ensure user is not banned
  const currentUser = getLogin as User;
  const getPermission = await checkPermission(_request);
  const permitted = validatePermission(getPermission, [
    'can_msg',
    'can_submit',
    'can_comment',
  ]);
  if (!permitted) {
    return ERR('userPermission');
  }
  // Ensure `inputs` does not have keys that are not allowed to update to the DB
  const invalidKeys = Object.keys(inputs).filter((key) =>
    invalidUserUpdateKeys.includes(key)
  );
  if (invalidKeys.length) {
    return ERR('userUpdateInvalid');
  }
  return await updateUser(currentUser.uid, inputs);
}

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

export async function updatePassword(
  _request: Request,
  oldPassword: string,
  newPassword: string
) {
  // Passwords are the same
  if (oldPassword === newPassword) {
    return ERR('userPasswordSame');
  }
  // Ensure user is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) {
    return getLogin as ErrorObj;
  }
  // Verify old password
  const currentUser = getLogin as User;
  const uid = currentUser?.uid ?? 0;
  const correctPassword = await verifyPassword(uid, sanitizeInput(oldPassword));
  if (!correctPassword) {
    return ERR('userPasswordOldWrong');
  }
  // Encrypt the password
  const hashedNewPassword = await bcrypt.hash(newPassword, CF.PASSWORD_SALT);
  return await updateUser(uid, { password: hashedNewPassword });
}

export async function updateEmail(
  _request: Request,
  password: string,
  email: string
) {
  // Ensure user is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) {
    return getLogin as ErrorObj;
  }
  // Emails are the same
  const currentUser = getLogin as User;
  if (currentUser?.email === email) {
    return ERR('userEmailSame');
  }
  // Verify password
  const uid = currentUser?.uid ?? 0;
  const correctPassword = await verifyPassword(uid, sanitizeInput(password));
  if (!correctPassword) {
    return ERR('userPasswordWrong');
  }
  return await updateUser(uid, { email: sanitizeInput(email) });
}

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
