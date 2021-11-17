// ================================================================================
// COMMONLY USED USER FUNCTIONS
// ================================================================================
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { VerifyErrors } from 'jsonwebtoken';

import CF from '../../config';
import ERR, { ErrorObj, isError } from '../../lib/error';
import { clientIP, objIntoArrays } from '../../lib/globallib';
import UserQuery from '../../queries/userquery';
import {
  User,
  UserPermissions,
  PermissionArray,
  invalidPermissionKeys,
  PermissionKind,
} from '../../schema/userTypes';

// CHECKS
export async function checkLogin(_request: Request) {
  // No cookie found
  if (!_request.cookies?.Login) {
    return ERR('userCookie');
  }
  return await new Promise<ErrorObj | User>((resolve) => {
    //Use the JWT to verify the cookie with secret code
    jwt.verify(
      _request.cookies.Login,
      CF.JWT_SECRET,
      async (err: VerifyErrors, decoded: { uid: string; username: string }) => {
        if (err) {
          resolve(ERR('userJwt', err?.message));
        }
        const query = new UserQuery();
        const result = await query.getUserByIdLazy(parseInt(decoded?.uid));
        const ip = clientIP(_request);
        if (isError(result)) {
          resolve(result);
        }
        const userHelper = result as User;
        // Ensure cookie info match the DB
        if (
          userHelper?.uid === parseInt(decoded?.uid) &&
          userHelper?.username === decoded?.username
        ) {
          //If matches - confirm
          updateLastActivity(userHelper.uid, ip);
          if (userHelper?.password) {
            delete userHelper.password;
          }
          resolve(userHelper);
        } else {
          resolve(ERR('userCookieInvalid'));
        }
      }
    );
  });
}

export async function verifyPassword(uid: number, password: string) {
  const query = new UserQuery();
  const queryResult = await query.getUserByIdLazy(uid);
  if (isError(queryResult)) {
    return false;
  }
  const userHelper = queryResult as User;
  // Ensure password is a string
  if (typeof userHelper?.password !== 'string') {
    userHelper.password = '';
  }
  const result = await bcrypt.compare(password, userHelper.password);
  return result;
}

export async function getPermission(
  _request: Request
): Promise<PermissionArray> {
  const loginStatus = await checkLogin(_request);
  if (isError(loginStatus)) {
    return [];
  }
  const userHelper = loginStatus as User;
  const groupID = userHelper.gid;
  const query = new UserQuery();
  const result = await query.getRole(groupID);
  if (isError(result)) {
    return [];
  }
  const groupHelper = result as UserPermissions;
  const permissions = Object.entries(groupHelper).map((each) => {
    const [name, value] = each;
    if (!invalidPermissionKeys.find((f) => f === name) && value) {
      return name;
    }
  });
  const output = (permissions as PermissionArray).filter(
    (findNull) => !!findNull
  );
  return output;
}

export async function checkExistingUserAndEmail(
  username: string,
  email: string
) {
  const query = new UserQuery();
  const result = await query.getUserByUsernameAndEmail(username, email);
  if (isError(result)) {
    return false;
  }
  return true;
}

export async function checkExistingUser(username: string) {
  const query = new UserQuery();
  const result = await query.getUserByUsername(username);
  if (isError(result)) {
    return false;
  }
  return true;
}

export async function checkExistingEmail(email: string) {
  const query = new UserQuery();
  const result = await query.getUserByEmail(email);
  if (isError(result)) {
    return false;
  }
  return true;
}

// UPDATES / CREATE
export async function updateLastActivity(uid: number, ip: string) {
  const timestamp = Math.ceil(Date.now() / 1000);
  const query = new UserQuery();
  query.updateLastActivity(uid, timestamp.toString(), ip);
}

export async function updateLoginCookie(
  uid: number,
  username: string,
  _response: Response,
  remember?: boolean
) {
  const token = jwt.sign(
    {
      uid: uid.toString(),
      username,
    },
    CF.JWT_SECRET,
    { expiresIn: remember ? CF.JWT_EXPIRES_IN : '24h' }
  );
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (remember
          ? CF.JWT_COOKIE_EXPIRES * 365 * 24 * 60 * 60 * 1000
          : 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
  };
  _response.cookie('Login', token, cookieOptions);
}

export async function updateUser(uid: number, inputs: User) {
  const { columns, values } = objIntoArrays(inputs);
  const query = new UserQuery();
  return await query.updateUser(uid, columns, values);
}

// CONSTANTS / UTIL
export async function validatePermission(
  _request: Request,
  permissions: PermissionKind | PermissionArray
) {
  const permissionResult = await getPermission(_request);
  if (!permissionResult.length) {
    return false;
  }
  if (Array.isArray(permissions)) {
    const intersection = permissionResult.filter((permit) =>
      permissions.includes(permit)
    );
    return !!(intersection.length === permissions.length);
  }
  return permissionResult.includes(permissions);
}
