// ================================================================================
// Misc user functions
// ================================================================================
import { Request, Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import CF from '../../config';

import { clientIP } from '../../lib/globallib';
import ERR, { ErrorObj, isError } from '../../lib/error';
import UserQuery from '../../queries/userquery';
import {
  User,
  UserPermissions,
  PermissionArray,
  invalidPermissionKeys,
} from '../../schema/userResponse';

// ---- CHECKS ----
export async function checkLogin(_request: Request) {
  // No cookie found
  if (!_request.cookies?.Login) {
    return ERR('userCookie');
  }
  const output = await new Promise<ErrorObj | User>((resolve) => {
    //Use the JWT to verify the cookie with secret code
    jwt.verify(
      _request.cookies.Login,
      CF.JWT_SECRET,
      async (err: VerifyErrors, decoded: { uid: string }) => {
        if (err) {
          resolve(ERR('userJwt', err.message));
        }
        const query = new UserQuery();
        const result = await query.getUserByIdLazy(parseInt(decoded.uid));
        const ip = clientIP(_request);
        if (isError(result)) {
          resolve(ERR('userLogin', err.message));
        }
        const userHelper = result as User;
        //Do the query to check if the ID matches
        if (userHelper.uid) {
          //If matches - confirm
          updateLastActivity(userHelper.uid, ip);
          if (userHelper?.password) {
            delete userHelper.password;
          }
          resolve(userHelper);
        }
      }
    );
  });
  return output;
}

export async function checkPermission(
  _request: Request
): Promise<PermissionArray> {
  const loginStatus = await checkLogin(_request);
  if (isError(loginStatus)) {
    return [];
  }
  const userHelper = loginStatus as User;
  const groupID = userHelper.gid;
  const query = new UserQuery();
  const result = await query.getPermissions(groupID);
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

// ---- UPDATES / CREATE ----
export async function updateLastActivity(uid: number, ip: string) {
  const timestamp = Math.ceil(Date.now() / 1000);
  const query = new UserQuery();
  query.updateLastActivity(uid, timestamp.toString(), ip);
}

export async function updateLoginCookie(
  uid: number,
  _response: Response,
  remember?: boolean
) {
  const token = jwt.sign({ uid: uid.toString() }, CF.JWT_SECRET, {
    expiresIn: remember ? CF.JWT_EXPIRES_IN : '24h',
  });
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
