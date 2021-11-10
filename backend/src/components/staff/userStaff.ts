// ================================================================================
// USER FUNCTIONS WITH STAFF PERMITS
// ================================================================================
import { Request } from 'express';

import {
  checkLogin,
  checkPermission,
  validatePermission,
} from '../lib/userlib';
import ERR, { ErrorObj, isError } from '../../lib/error';
import UserQuery from '../../queries/userquery';
import { User } from '../../schema/userTypes';

export async function updateOtherUser() {}

export async function updateUserRole() {}

export async function deleteUser(_request: Request, uid: number) {
  // Ensure staff is logged in
  const getLogin = await checkLogin(_request);
  if (isError(getLogin)) {
    return getLogin as ErrorObj;
  }
  // Ensure staff is not deleting their own account
  const currentUser = getLogin as User;
  if (uid === currentUser.uid) {
    return ERR('userDeleteOwn');
  }
  // Verify permission
  const getPermission = await checkPermission(_request);
  if (!validatePermission(getPermission, 'acp_super')) {
    return ERR('userRootPermit');
  }
  const query = new UserQuery();
  return await query.deleteUser(uid);
}

export async function createRole() {}

export async function updateRole() {}

export async function deleteRole() {}
