// ================================================================================
// User Router
// Quick note: Request param with ? is optional
// ================================================================================
import express from 'express';
// import multer from 'multer';

import CF from '../config';
import {
  listUsers,
  showUserByID,
  userLogin,
  userLogout,
  userRegistration,
} from '../components/user';
import { checkLogin, checkPermission } from '../components/lib/userlib';
import {
  invalidJsonResponse,
  invalidParamResponse,
  isStringJSON,
  stringToBoolean,
  validateRequiredParam,
} from '../lib/globallib';
import { httpStatus } from '../lib/result';

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
// PATCH "/:id" - update user profile settings | PARAM: id, BODY: data
// userRouter.patch('/:id', async (req, res) => {
//   const _uid = req.params.id || ''; // id - string
//   let _dat = []; // data - { columnName: string }[]
//   if (isStringJSON(req.body?.data)) {
//     _dat = JSON.parse(req.body?.data);
//   }
//   const result = await user.updateUserProfile(req, _uid, _dat);
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

// POST "/password" - Update password for current user | BODY: oldpassword, newpassword
// userRouter.post('/password', async (req, res) => {
//   const _oPass = req.body?.oldpassword ?? '';
//   const _nPass = req.body?.newpassword ?? '';
//   const result = await user.updatePassword(req, _oPass, _nPass);
//   httpStatus(res, result);
//   res.send(result);
// });

// POST "/email" - Update email for current user | BODY: password, email
// userRouter.post('/email', async (req, res) => {
//   const _pass = req.body?.password ?? '';
//   const _emai = req.body?.email ?? '';
//   const result = await user.updateEmail(req, _pass, _emai);
//   httpStatus(res, result);
//   res.send(result);
// });

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
// DELETE "/:id" - Delete a user (root admin only) | PARAM: id
// userRouter.delete('/:id', async (req, res) => {
//   const uid = req.params?.id || 0; // user ID
//   const result = await user.deleteUser(req, uid);
//   httpStatus(res, result);
//   res.send(result);
// });