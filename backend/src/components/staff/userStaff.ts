// ================================================================================
// USER FUNCTIONS WITH STAFF PERMITS
// ================================================================================
import { Request } from 'express';

import { checkLogin, updateUser, validatePermission } from '../lib/userlib';
import ERR, { ErrorObj, isError } from '../../lib/error';
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
  if (!permitted) {
    return ERR('userStaffPermit');
  }
  // Ensure `inputs` does not have keys that are not allowed to update to the DB
  const invalidKeys = Object.keys(inputs).filter((key) =>
    invalidStaffUserUpdateKeys.includes(key)
  );
  if (invalidKeys.length) {
    return ERR('userUpdateInvalid');
  }
  return await updateUser(uid, inputs);
}

export async function updateUserRole(
  _request: Request,
  uid: number,
  gid: number
) {
  // Verify permission
  const permitted = await validatePermission(_request, 'acp_users');
  if (!permitted) {
    return ERR('userStaffPermit');
  }
  console.log('1');
  // Verify role exists
  const query = new UserQuery();
  const getRole = await query.getRole(gid);
  if (isError(getRole)) {
    return getRole as ErrorObj;
  }
  console.log('2');
  // Verify user exists
  const getUser = await query.getUserById(uid);
  if (isError(getUser)) {
    return getUser as ErrorObj;
  }
  console.log('3');
  // Only root admins can promote other users to root admin
  const newRole = getRole as UserPermissionFull;
  console.log(newRole?.acp_super);
  if (newRole?.acp_super) {
    const rootPermit = await validatePermission(_request, 'acp_super');
    if (!rootPermit) {
      return ERR('userRootPermit');
    }
  }
  return await updateUser(uid, { gid });
}

export async function deleteUser(_request: Request, uid: number) {
  // Ensure staff is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) {
    return ERR('userRootPermit');
  }
  const currentUser = getLogin as User;
  // Ensure staff is not deleting their own account
  if (uid === currentUser.uid) {
    return ERR('userDeleteOwn');
  }
  // Verify permission
  const permitted = await validatePermission(_request, 'acp_super');
  if (!permitted) {
    return ERR('userRootPermit');
  }
  // Verify user exists
  const query = new UserQuery();
  const getRole = await query.getUserByIdLazy(uid);
  if (isError(getRole)) {
    return getRole as ErrorObj;
  }
  return await query.deleteUser(uid);
}

export async function createRole(
  _request: Request,
  inputs: UserPermissionFull
) {
  // Verify permission
  const permitted = await validatePermission(_request, 'acp_users');
  if (!permitted) {
    return ERR('userStaffPermit');
  }
  // Ensure `inputs` does not have keys that are not allowed to update to the DB
  const invalidKeys = Object.keys(inputs).filter((key) => key === 'gid');
  if (invalidKeys.length) {
    return ERR('userRoleGid');
  }
  // Prep Data
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
  if (!permitted) {
    return ERR('userStaffPermit');
  }
  // Ensure `inputs` does not have keys that are not allowed to update to the DB
  const invalidKeys = Object.keys(inputs).filter((key) => key === 'gid');
  if (invalidKeys.length) {
    return ERR('userRoleGid');
  }
  // Verify role exists
  const query = new UserQuery();
  const getRole = await query.getRole(gid);
  if (isError(getRole)) {
    return getRole as ErrorObj;
  }
  // Prep Data
  const { columns, values } = objIntoArrays(inputs);
  return await query.updateRole(gid, columns, values);
}

export async function deleteRole(_request: Request, gid: number) {
  // Ensure staff is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) {
    return ERR('userRootPermit');
  }
  // Verify permission
  const permitted = await validatePermission(_request, 'acp_super');
  if (!permitted) {
    return ERR('userRootPermit');
  }
  // Ensure no user is using this role
  const query = new UserQuery();
  const getUserUsingRole = await query.getUserByGid(gid);
  if (!isError(getUserUsingRole)) {
    return ERR('userRoleInUse');
  }
  // Verify role exists
  const getRole = await query.getRole(gid);
  if (isError(getRole)) {
    return getRole as ErrorObj;
  }
  return await query.deleteRole(gid);
}
