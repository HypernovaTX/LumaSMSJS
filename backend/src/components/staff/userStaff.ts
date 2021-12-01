// ================================================================================
// USER FUNCTIONS WITH STAFF PERMITS
// ================================================================================
import { Request } from 'express';

import { checkLogin, updateUser, validatePermission } from '../lib/userlib';
import CF from '../../config';
import ERR, { ErrorObj, isError } from '../../lib/error';
import { unlinkFile, verifyImageFile } from '../../lib/filemanager';
import { objIntoArrays } from '../../lib/globallib';
import UserQuery from '../../queries/userquery';
import {
  invalidStaffUserUpdateKeys,
  User,
  UserPermissionFull,
} from '../../schema/userTypes';

export async function updateOtherUser(
  _request: Request,
  uid: number,
  inputs: User
) {
  // Verify permission
  const permitted = await validatePermission(_request, 'acp_users');
  if (!permitted) return ERR('userStaffPermit');

  // Verify user exists
  const query = new UserQuery();
  const getUser = await query.getUserById(uid);
  if (isError(getUser)) return getUser as ErrorObj;

  // Ensure `inputs` does not have keys that are not allowed to update to the DB
  const invalidKeys = Object.keys(inputs).filter((key) =>
    invalidStaffUserUpdateKeys.includes(key)
  );
  if (invalidKeys.length) return ERR('userUpdateInvalid');

  // Resolve
  return await updateUser(uid, inputs);
}

export async function updateOtherUserAvatar(
  _request: Request,
  uid: number,
  file: Express.Multer.File
) {
  const directory = `${CF.UPLOAD_DIRECTORY}/${CF.UPLOAD_AVATAR}`;

  // File name too long
  if (file.filename.length > CF.FILENAME_LIMIT) {
    unlinkFile(directory, file.filename);
    return ERR('fileNameTooLong');
  }

  // Verify permission
  const permitted = await validatePermission(_request, 'acp_users');
  if (!permitted) return ERR('userStaffPermit');

  // Ensure it is an image, otherwise
  if (!verifyImageFile(file)) {
    unlinkFile(directory, file.filename);
    return ERR('fileImageInvalid');
  }

  // Verify user exists
  const query = new UserQuery();
  const getUser = await query.getUserById(uid);
  if (isError(getUser)) return getUser as ErrorObj;

  // Remove user's old avatar file
  const selectedUser = getUser as User;
  if (selectedUser?.avatar_file) {
    unlinkFile(directory, selectedUser.avatar_file);
  }

  // Apply
  return await updateUser(selectedUser?.uid, { avatar_file: file.filename });
}

export async function updateOtherUserBanner(
  _request: Request,
  uid: number,
  file: Express.Multer.File
) {
  const directory = `${CF.UPLOAD_DIRECTORY}/${CF.UPLOAD_BANNER}`;

  // File name too long
  if (file.filename.length > CF.FILENAME_LIMIT) {
    unlinkFile(directory, file.filename);
    return ERR('fileNameTooLong');
  }

  // Verify permission
  const permitted = await validatePermission(_request, 'acp_users');
  if (!permitted) return ERR('userStaffPermit');

  // Ensure it is an image, otherwise
  if (!verifyImageFile(file)) {
    unlinkFile(directory, file.filename);
    return ERR('fileImageInvalid');
  }

  // Verify user exists
  const query = new UserQuery();
  const getUser = await query.getUserById(uid);
  if (isError(getUser)) return getUser as ErrorObj;

  // Remove user's old banner file
  const currentUser = getUser as User;
  if (currentUser?.banner_file) {
    unlinkFile(directory, currentUser.banner_file);
  }

  // Apply
  return await updateUser(currentUser?.uid, { banner_file: file.filename });
}

export async function updateUserRole(
  _request: Request,
  uid: number,
  gid: number
) {
  // Verify permission
  const permitted = await validatePermission(_request, 'acp_users');
  if (!permitted) return ERR('userStaffPermit');

  // Verify role exists
  const query = new UserQuery();
  const getRole = await query.getRole(gid);
  if (isError(getRole)) return getRole as ErrorObj;

  // Verify user exists
  const getUser = await query.getUserById(uid);
  if (isError(getUser)) return getUser as ErrorObj;

  // Only root admins can promote other users to root admin
  const newRole = getRole as UserPermissionFull;
  if (newRole?.acp_super) {
    const rootPermit = await validatePermission(_request, 'acp_super');
    if (!rootPermit) return ERR('userRootPermit');
  }

  // Resolve
  return await updateUser(uid, { gid });
}

export async function deleteUser(_request: Request, uid: number) {
  // Ensure staff is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) return ERR('userRootPermit');

  // Ensure staff is not deleting their own account
  const currentUser = getLogin as User;
  if (uid === currentUser.uid) return ERR('userDeleteOwn');

  // Verify permission
  const permitted = await validatePermission(_request, 'acp_super');
  if (!permitted) return ERR('userRootPermit');

  // Verify user exists
  const query = new UserQuery();
  const getRole = await query.getUserByIdLazy(uid);
  if (isError(getRole)) return getRole as ErrorObj;

  // Resolve
  return await query.deleteUser(uid);
}

export async function createRole(
  _request: Request,
  inputs: UserPermissionFull
) {
  // Verify permission
  const permitted = await validatePermission(_request, 'acp_users');
  if (!permitted) return ERR('userStaffPermit');

  // Ensure `inputs` does not have keys that are not allowed to update to the DB
  const invalidKeys = Object.keys(inputs).filter((key) => key === 'gid');
  if (invalidKeys.length) return ERR('userRoleGid');

  // Prep Data and resolve
  const { columns, values } = objIntoArrays(inputs);
  const query = new UserQuery();
  return await query.createRole(columns, values);
}

export async function updateRole(
  _request: Request,
  gid: number,
  inputs: UserPermissionFull
) {
  // Verify permission
  const permitted = await validatePermission(_request, 'acp_users');
  if (!permitted) return ERR('userStaffPermit');

  // Ensure `inputs` does not have keys that are not allowed to update to the DB
  const invalidKeys = Object.keys(inputs).filter((key) => key === 'gid');
  if (invalidKeys.length) return ERR('userRoleGid');

  // Verify role exists
  const query = new UserQuery();
  const getRole = await query.getRole(gid);
  if (isError(getRole)) return getRole as ErrorObj;

  // Prep Data
  const { columns, values } = objIntoArrays(inputs);
  return await query.updateRole(gid, columns, values);
}

export async function deleteRole(_request: Request, gid: number) {
  // Ensure staff is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) return ERR('userRootPermit');

  // Verify permission
  const permitted = await validatePermission(_request, 'acp_super');
  if (!permitted) return ERR('userRootPermit');

  // Ensure no user is using this role
  const query = new UserQuery();
  const getUserUsingRole = await query.getUserByGid(gid);
  if (!isError(getUserUsingRole)) return ERR('userRoleInUse');

  // Verify role exists
  const getRole = await query.getRole(gid);
  if (isError(getRole)) return getRole as ErrorObj;

  return await query.deleteRole(gid);
}
