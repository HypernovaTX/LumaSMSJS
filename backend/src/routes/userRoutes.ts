// ================================================================================
// User Router
// Quick note: Request param with ? is optional
// ================================================================================
import express from 'express';
// import multer from 'multer';

import CF from '../config';
import { checkLogin, checkPermission } from '../components/lib/userlib';
import { deleteUser } from '../components/staff/userStaff';
import {
  listUsers,
  showUserByID,
  updateEmail,
  updatePassword,
  updateUserProfile,
  userLogin,
  userLogout,
  userRegistration,
} from '../components/user';
import {
  invalidJsonResponse,
  invalidParamResponse,
  isStringJSON,
  stringToBoolean,
  validateRequiredParam,
} from '../lib/globallib';
import { httpStatus } from '../lib/result';
import { User } from '../schema/userTypes';

export const userRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

// GET -------------------------------------------------------------------------------------------------------
// GET "/" - list users (default)
userRouter.get('/', async (_, res) => {
  const result = await listUsers(0, CF.ROWS, '', false, []);
  httpStatus(res, result);
  res.send(result);
});

// GET "/verify" - verify login
userRouter.get('/verify', async (req, res) => {
  const result = await checkLogin(req);
  httpStatus(res, result);
  res.send(result);
});

// GET "/permission" - return current user's permissions
userRouter.get('/permission', async (req, res) => {
  const result = await checkPermission(req);
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

// GET "/:id" - Show specific user by ID | PARAM: id
userRouter.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id) ?? 0;
  const result = await showUserByID(id);
  httpStatus(res, result);
  res.send(result);
});

// PUT -------------------------------------------------------------------------------------------------------
// PUT "/" - list users (with param for sort/filter)
// BODY: ?page, ?count, ?row, ?dsc, ?filter
userRouter.put('/', async (req, res) => {
  const page = parseInt(req.body?.page) ?? 0;
  const count = parseInt(req.body?.count) || 25;
  const colSort = `${req.body?.column} ?? ''`;
  const asc = req.body?.dsc ? false : true; // dsc - string (true if undefined)
  let filter = []; // filter - { columnName: value }[]

  if (isStringJSON(req.body?.filter)) {
    filter = JSON.parse(req.body?.filter);
  } else if (req.body?.filter) {
    invalidJsonResponse(res);
    return;
  }
  const result = await listUsers(page, count, colSort, asc, filter);

  httpStatus(res, result);
  res.send(result);
});

// PUT "/login" - login
// BODY: username, password, "remember
userRouter.put('/login', async (req, res) => {
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
// PATCH "/:id" - update any user profile settings [STAFF]
// PARAM: id, BODY: data
userRouter.patch('/', async (req, res) => {
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

// PATCH "/:id" - update any user profile settings [STAFF]
// PARAM: id, BODY: data
// userRouter.patch('/:id', async (req, res) => {
//   if (!validateRequiredParam(req, ['data'])) {
//     invalidParamResponse(res);
//     return;
//   }
//   const uid = parseInt(req.params.id) ?? 0;
//   let data = {} as User;
//   if (isStringJSON(req.body?.data)) {
//     data = JSON.parse(req.body?.data);
//   } else if (req.body?.data) {
//     invalidJsonResponse(res);
//     return;
//   }
//   const result = await updateUserProfile(req, uid, data);
//   httpStatus(res, result);
//   res.send(result);
// });

// POST ------------------------------------------------------------------------------------------------------
// POST "/" - create user | BODY: username, password, email
userRouter.post('/', async (req, res) => {
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

// POST "/password" - Update password for current user
// BODY: oldpassword, newpassword
userRouter.post('/password', async (req, res) => {
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

// POST "/email" - Update email for current user
// BODY: password, email
userRouter.post('/email', async (req, res) => {
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

// POST "/avatar" - Upload avatar for a user
// const uploadFields = [{ name: 'avatar', maxCount: 1 }];
// userRouter.post('/avatar', upload.fields(uploadFields), async (req, res) => {
//   const _uid = req.body?.password ?? '';
//   const [_avatar] = req.files.avatar;
//   const files = {
//     thumb: _avatar ?? {},
//   };
//   const result = await user.updateUserAvatar(req, _uid, files);
//   httpStatus(res, result);
//   res.send(result);
// });

// DELETE -------------------------------------------------------------------------------------------------------
// DELETE "/:id" - Delete a user [ROOT]
// PARAM: id
userRouter.delete('/:id', async (req, res) => {
  const uid = parseInt(req.params.id) ?? 0; // user ID
  const result = await deleteUser(req, uid);
  httpStatus(res, result);
  res.send(result);
});
