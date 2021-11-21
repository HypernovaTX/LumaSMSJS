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
  checkExistingUser,
  checkExistingUserAndEmail,
  checkLogin,
  updateLoginCookie,
  updateUser,
  validatePermission,
  verifyPassword,
} from './lib/userlib';
import UserQuery from '../queries/userquery';
import { invalidUserUpdateKeys, User } from '../schema/userTypes';
import { unlinkFile, verifyImageFile } from '../lib/filemanager';

/**
 * Future to-dos for users
 * - Reset password*
 * - Account verification*
 * - Social media authentication*
 * - badge system
 * *Needs email system
 */

// READ ONLY
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

export async function findUsersByName(
  find: string,
  page: number = 0,
  count: number = CF.ROWS,
  column: string = '',
  asc: boolean = true
) {
  const query = new UserQuery();
  const result = await query.findUserByUsername(find, page, count, column, asc);
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

// WRITE
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
  const currentUser = getLogin as User;
  // Ensure user is not banned
  const permitted = await validatePermission(_request, [
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

export async function updateUsername(
  _request: Request,
  username: string,
  password: string
) {
  // Ensure user is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) {
    return getLogin as ErrorObj;
  }
  // Username is the same as before
  const currentUser = getLogin as User;
  if (currentUser?.username === username) {
    return ERR('userNameSame');
  }
  // Verify password
  const uid = currentUser?.uid ?? 0;
  const correctPassword = await verifyPassword(uid, sanitizeInput(password));
  if (!correctPassword) {
    return ERR('userPasswordWrong');
  }
  // Check if username exists
  const checkExistingUsername = await checkExistingUser(username);
  if (checkExistingUsername) {
    return ERR('userNameExists');
  }
  const query = new UserQuery();
  query.usernameUpdate(uid, currentUser?.username, username);
  return await updateUser(uid, { username });
}

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
  const currentUser = getLogin as User;
  // Verify old password
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
  const currentUser = getLogin as User;
  // Emails are the same
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

export async function updateUserAvatar(
  _request: Request,
  file: Express.Multer.File
) {
  const directory = `${CF.UPLOAD_DIRECTORY}/${CF.UPLOAD_AVATAR}`;
  // File name too long
  if (file.filename.length > CF.FILENAME_LIMIT) {
    unlinkFile(directory, file.filename);
    return ERR('fileNameTooLong');
  }
  // Ensure user is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) {
    unlinkFile(directory, file.filename);
    return getLogin as ErrorObj;
  }
  // Ensure it is an image, otherwise
  if (!verifyImageFile(file)) {
    unlinkFile(directory, file.filename);
    return ERR('fileImageInvalid');
  }
  // Remove user's old file
  const currentUser = getLogin as User;
  if (currentUser?.avatar_file) {
    unlinkFile(directory, currentUser.avatar_file);
  }
  // Apply
  return await updateUser(currentUser?.uid, { avatar_file: file.filename });
}

export async function updateUserBanner(
  _request: Request,
  file: Express.Multer.File
) {
  const directory = `${CF.UPLOAD_DIRECTORY}/${CF.UPLOAD_BANNER}`;
  // File name too long
  if (file.filename.length > CF.FILENAME_LIMIT) {
    unlinkFile(directory, file.filename);
    return ERR('fileNameTooLong');
  }
  // Ensure user is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) {
    unlinkFile(directory, file.filename);
    return getLogin as ErrorObj;
  }
  // Ensure it is an image, otherwise
  if (!verifyImageFile(file)) {
    unlinkFile(directory, file.filename);
    return ERR('fileImageInvalid');
  }
  // Remove user's old file
  const currentUser = getLogin as User;
  if (currentUser?.banner_file) {
    unlinkFile(directory, currentUser.banner_file);
  }
  // Apply
  return await updateUser(currentUser?.uid, { banner_file: file.filename });
}
