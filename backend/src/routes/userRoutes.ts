// ================================================================================
// User Router
// Quick note: Request param with ? is optional
// ================================================================================
import express from 'express';
import multer from 'multer';

import rateLimits from './rateLimiter';
import CF from '../config';
import { checkLogin, getPermission } from '../components/lib/userlib';
import {
  createRole,
  deleteRole,
  deleteUser,
  updateOtherUser,
  updateOtherUserAvatar,
  updateOtherUserBanner,
  updateRole,
  updateUserRole,
} from '../components/staff/userStaff';
import {
  deleteUserAvatar,
  deleteUserBanner,
  findUsersByName,
  listUsers,
  showUserByID,
  updateEmail,
  updatePassword,
  updateUserAvatar,
  updateUserBanner,
  updateUsername,
  updateUserProfile,
  userLogin,
  userLogout,
  usernameChangeHistory,
  userRegistration,
} from '../components/user';
import { diskStorage } from '../lib/filemanager';
import {
  invalidFileResponse,
  invalidJsonResponse,
  invalidParamResponse,
  isStringJSON,
  stringToBoolean,
  validateRequiredParam,
} from '../lib/globallib';
import { httpStatus } from '../lib/result';
import { User, UserPermissionFull } from '../schema/userTypes';
import { isError } from '../lib/error';

// Prepare route and file handling
export const userRouter = express.Router();
const uploadDir = CF.UPLOAD_DIRECTORY;
const avatarStorage = diskStorage(`${uploadDir}/${CF.UPLOAD_AVATAR}/`);
const bannerStorage = diskStorage(`${uploadDir}/${CF.UPLOAD_BANNER}/`);
const avatarUpload = multer({ storage: avatarStorage });
const bannerUpload = multer({ storage: bannerStorage });
const avatarProp = avatarUpload.single('avatar');
const bannerProp = bannerUpload.single('banner');

// GET -------------------------------------------------------------------------------------------------------
// GET "/" - list users (default)
userRouter.get('/', rateLimits.general, async (_, res) => {
  const result = await listUsers(0, CF.ROWS, '', false, []);
  httpStatus(res, result);
  res.send(result);
});

// GET "/verify" - verify login
userRouter.get('/verify', rateLimits.general, async (req, res) => {
  const result = await checkLogin(req);
  httpStatus(res, result);
  res.send(result);
});

// GET "/permission" - return current user's permissions
userRouter.get('/permission', rateLimits.general, async (req, res) => {
  const result = await getPermission(req);
  httpStatus(res, result);
  res.send(result);
});

// GET "/logout" - logout
userRouter.get('/logout', (_, res) => {
  userLogout(res);
  const result = { noContent: true };
  httpStatus(res, result);
  res.send(result);
});

// GET "/:id" - Show specific user by ID
// PARAM: id
userRouter.get('/:id', rateLimits.general, async (req, res) => {
  const id = parseInt(req.params.id) || 0;
  const result = await showUserByID(id);
  httpStatus(res, result);
  res.send(result);
});

// GET "/:id/usernames" - Show list of username changes
// PARAM: id
userRouter.get('/:id/usernames', rateLimits.general, async (req, res) => {
  const id = parseInt(req.params.id) || 0;
  const result = await usernameChangeHistory(id);
  httpStatus(res, result);
  res.send(result);
});

// PUT -------------------------------------------------------------------------------------------------------
// PUT "/" - list users (with param for sort/filter)
// BODY: ?page, ?count, ?row, ?dsc, ?filter
userRouter.put('/', rateLimits.general, async (req, res) => {
  const page = parseInt(req.body?.page) || 0;
  const count = parseInt(req.body?.count) || 25;
  const colSort = `${req.body?.column ?? ''}`;
  const asc = req.body?.dsc ? false : true; // dsc - string (true if undefined)
  const getFilter = req.body?.filter || '{}';
  let filter = []; // filter - { columnName: value }[]

  if (isStringJSON(getFilter)) {
    filter = JSON.parse(getFilter);
  } else if (req.body?.filter) {
    invalidJsonResponse(res);
    return;
  }
  const result = await listUsers(page, count, colSort, asc, filter);

  httpStatus(res, result);
  res.send(result);
});

// PUT "/count" - number of users (with param for filter)
// BODY: ?filter
userRouter.put('/count', rateLimits.general, async (req, res) => {
  const page = 0;
  const count = 0;
  const colSort = '';
  const asc = true;
  const getFilter = req.body?.filter || '{}';
  let filter = []; // filter - { columnName: value }[]

  if (isStringJSON(getFilter)) {
    filter = JSON.parse(getFilter);
  } else if (req.body?.filter) {
    invalidJsonResponse(res);
    return;
  }
  const result = await listUsers(page, count, colSort, asc, filter);

  httpStatus(res, result);
  if (isError(result)) res.send(result);
  else {
    res.send({
      count: (result as User[]).length,
    });
  }
});

// PUT "/find" - Find user by username query
// BODY: query, ?page, ?count, ?row, ?dsc, ?filter
userRouter.put('/find', rateLimits.general, async (req, res) => {
  if (!validateRequiredParam(req, ['query'])) {
    invalidParamResponse(res);
    return;
  }
  const query = `${req.body?.query ?? ''}`;
  const page = parseInt(req.body?.page) || 0;
  const count = parseInt(req.body?.count) || 25;
  const colSort = `${req.body?.column ?? ''}`;
  const asc = req.body?.dsc ? false : true; // dsc - string (true if undefined)
  const result = await findUsersByName(query, page, count, colSort, asc);
  httpStatus(res, result);
  res.send(result);
});

// PUT "/login" - login
// BODY: username, password, "remember
userRouter.put('/login', rateLimits.login, async (req, res) => {
  if (!validateRequiredParam(req, ['username', 'password'])) {
    invalidParamResponse(res);
    return;
  }
  const username = `${req.body?.username ?? ''}`;
  const password = `${req.body?.password ?? ''}`;
  const remember = stringToBoolean(`${req.body?.remember}`);
  const result = await userLogin(username, password, remember, res);
  httpStatus(res, result);
  res.send(result);
});

// PATCH ------------------------------------------------------------------------------------------------------
// PATCH "/" - update current user profile settings
// BODY: data
userRouter.patch('/', rateLimits.update, async (req, res) => {
  if (!validateRequiredParam(req, ['data'])) {
    invalidParamResponse(res);
    return;
  }
  let data = {} as User;
  if (isStringJSON(req.body?.data)) {
    data = JSON.parse(req.body?.data);
  } else if (req.body?.data) {
    invalidJsonResponse(res);
    return;
  }
  const result = await updateUserProfile(req, data);
  httpStatus(res, result);
  res.send(result);
});

// PATCH "/username" - Update username for current user
// BODY: username, password
userRouter.patch('/username', rateLimits.update, async (req, res) => {
  if (!validateRequiredParam(req, ['username', 'password'])) {
    invalidParamResponse(res);
    return;
  }
  const username = `${req.body?.username ?? ''}`;
  const password = `${req.body?.password ?? ''}`;
  const result = await updateUsername(req, username, password);
  httpStatus(res, result);
  res.send(result);
});

// PATCH "/password" - Update password for current user
// BODY: oldpassword, newpassword
userRouter.patch('/password', rateLimits.update, async (req, res) => {
  if (!validateRequiredParam(req, ['oldpassword', 'newpassword'])) {
    invalidParamResponse(res);
    return;
  }
  const oldPassword = `${req.body?.oldpassword ?? ''}`;
  const newPassword = `${req.body?.newpassword ?? ''}`;
  const result = await updatePassword(req, oldPassword, newPassword);
  httpStatus(res, result);
  res.send(result);
});

// PATCH "/email" - Update email for current user
// BODY: password, email
userRouter.patch('/email', rateLimits.update, async (req, res) => {
  if (!validateRequiredParam(req, ['password', 'email'])) {
    invalidParamResponse(res);
    return;
  }
  const password = `${req.body?.password ?? ''}`;
  const newEmail = `${req.body?.email ?? ''}`;
  const result = await updateEmail(req, password, newEmail);
  httpStatus(res, result);
  res.send(result);
});

// PATCH "/avatar" - Upload avatar for current user
// FILE: avatar
userRouter.patch('/avatar', rateLimits.update, avatarProp, async (req, res) => {
  if (!req?.file) {
    invalidFileResponse(res);
    return;
  }
  const avatar = req.file;
  const result = await updateUserAvatar(req, avatar);
  httpStatus(res, result);
  res.send(result);
});

// PATCH "/banner" - Upload banner for current user
// FILE: banner
userRouter.patch('/banner', rateLimits.update, bannerProp, async (req, res) => {
  if (!req?.file) {
    invalidFileResponse(res);
    return;
  }
  const banner = req.file;
  const result = await updateUserBanner(req, banner);
  httpStatus(res, result);
  res.send(result);
});

// PATCH "/role/:id" - update role [STAFF]
// PARAM: id, BODY: data
userRouter.patch('/role/:id', rateLimits.update, async (req, res) => {
  if (!validateRequiredParam(req, ['data'])) {
    invalidParamResponse(res);
    return;
  }
  const gid = parseInt(req.params.id) || 0;
  let data = {} as UserPermissionFull;
  if (isStringJSON(req.body?.data)) {
    data = JSON.parse(req.body?.data);
  } else if (req.body?.data) {
    invalidJsonResponse(res);
    return;
  }
  const result = await updateRole(req, gid, data);
  httpStatus(res, result);
  res.send(result);
});

// PATCH "/:id" - update any user profile settings [STAFF]
// PARAM: id, BODY: data
userRouter.patch('/:id', rateLimits.update, async (req, res) => {
  if (!validateRequiredParam(req, ['data'])) {
    invalidParamResponse(res);
    return;
  }
  const uid = parseInt(req.params.id) || 0;
  let data = {} as User;
  if (isStringJSON(req.body?.data)) {
    data = JSON.parse(req.body?.data);
  } else if (req.body?.data) {
    invalidJsonResponse(res);
    return;
  }
  const result = await updateOtherUser(req, uid, data);
  httpStatus(res, result);
  res.send(result);
});

// PATCH "/:id/avatar" - Upload avatar for a user [STAFF]
// PARAM: id, FILE: avatar
userRouter.patch(
  '/:id/avatar',
  rateLimits.update,
  avatarProp,
  async (req, res) => {
    if (!req?.file) {
      invalidFileResponse(res);
      return;
    }
    const uid = parseInt(req.params.id) || 0;
    const avatar = req.file;
    const result = await updateOtherUserAvatar(req, uid, avatar);
    httpStatus(res, result);
    res.send(result);
  }
);

// PATCH "/:id/banner" - Upload banner for a user [STAFF]
// PARAM: id, FILE: banner
userRouter.patch(
  '/:id/banner',
  rateLimits.update,
  bannerProp,
  async (req, res) => {
    if (!req?.file) {
      invalidFileResponse(res);
      return;
    }
    const uid = parseInt(req.params.id) || 0;
    const banner = req.file;
    const result = await updateOtherUserBanner(req, uid, banner);
    httpStatus(res, result);
    res.send(result);
  }
);

// PATCH "/:id/role" - Update user's role [STAFF, ROOT FOR UPDATING OTHER USER TO ROOT]
// PARAM: id, BODY: gid
userRouter.patch('/:id/role', rateLimits.update, async (req, res) => {
  if (!validateRequiredParam(req, ['gid'])) {
    invalidParamResponse(res);
    return;
  }
  const uid = parseInt(req.params?.id) || 0;
  const gid = parseInt(req.body?.gid) || 0;
  const result = await updateUserRole(req, uid, gid);
  httpStatus(res, result);
  res.send(result);
});

// POST ------------------------------------------------------------------------------------------------------
// POST "/" - create user
// BODY: username, password, email
userRouter.post('/', rateLimits.creation, async (req, res) => {
  if (!validateRequiredParam(req, ['username', 'password', 'email'])) {
    invalidParamResponse(res);
    return;
  }
  const username = `${req.body?.username ?? ''}`;
  const password = `${req.body?.password ?? ''}`;
  const email = `${req.body?.email ?? ''}`;
  const result = await userRegistration(req, username, password, email);
  httpStatus(res, result);
  res.send(result);
});

// POST "/role" - create role [STAFF]
// BODY: data
userRouter.post('/role', rateLimits.update, async (req, res) => {
  if (!validateRequiredParam(req, ['data'])) {
    invalidParamResponse(res);
    return;
  }
  let data = {} as UserPermissionFull;
  if (isStringJSON(req.body?.data)) {
    data = JSON.parse(req.body?.data);
  } else if (req.body?.data) {
    invalidJsonResponse(res);
    return;
  }
  const result = await createRole(req, data);
  httpStatus(res, result);
  res.send(result);
});

// DELETE -------------------------------------------------------------------------------------------------------

// DELETE "/avatar" - Delete user's avatar
userRouter.delete('/avatar', rateLimits.update, async (req, res) => {
  const result = await deleteUserAvatar(req);
  httpStatus(res, result);
  res.send(result);
});

// DELETE "/banner" - Delete user's banner
userRouter.delete('/banner', rateLimits.update, async (req, res) => {
  const result = await deleteUserBanner(req);
  httpStatus(res, result);
  res.send(result);
});

// DELETE "/role/:id" - Delete a role [ROOT]
// PARAM: id
userRouter.delete('/role/:id', rateLimits.update, async (req, res) => {
  const gid = parseInt(req.params.id) || 0; // user ID
  const result = await deleteRole(req, gid);
  httpStatus(res, result);
  res.send(result);
});

// DELETE "/:id" - Delete a user [ROOT]
// PARAM: id
userRouter.delete('/:id', rateLimits.update, async (req, res) => {
  const uid = parseInt(req.params.id) || 0; // user ID
  const result = await deleteUser(req, uid);
  httpStatus(res, result);
  res.send(result);
});
