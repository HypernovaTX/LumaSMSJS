// ================================================================================
// User Router
// Quick note: Request param with ? is optional
// ================================================================================
import express from 'express';
import User from '../components/user.js';
import { isStringJSON } from '../lib/globallib.js';
import { checkLogin, checkPermission } from '../components/lib/userlib.js';
export const userRouter = express.Router();
const user = new User();

// GET -------------------------------------------------------------------------------------------------------
// "/" - list users | HEADER: ?page, ?count, ?row, ?asc, ?filter
userRouter.get('/', async (req, res) => {
  // Request parameters
  const page = req.headers?.page || 0;                        // page - number
  const count = req.headers?.count || 25;                     // count - number
  const colSort = req.headers?.column || '';                  // row - string
  const asc = req.headers?.asc || true;                       // asc - boolean
  let filter = [];                                            // filter - { columnName: value }[]
  if (isStringJSON(req.headers?.filter)) {
    filter = JSON.parse(req.headers?.filter);     
  } 
  const getData = await user.listUsers(page, count, colSort, asc, filter);
  res.send(getData);
});

// "/login" - login | HEADER: username, password
userRouter.get('/login', async (req, res) => {
  const username = req.headers?.username || '0';
  const password = req.headers?.password || '0';
  const result = await user.doLogin(username, password, res);
  res.send(result);
});

// "/verifylogin" - validate login | HEADER: -NONE-
userRouter.get('/verifylogin', async (req, res) => {
  const result = await checkLogin(req);
  res.send(result);
});

// "/checkpermission" - check if login is valid | HEADER: -NONE-
userRouter.get('/checkpermission', async (req, res) => {
  const result = await checkPermission(req);
  res.send(result);
});

// "/logout" - logout | HEADER: -NONE-
userRouter.get('/logout', (req, res) => {
  res.send(user.doLogout(res)); 
});

// POST -------------------------------------------------------------------------------------------------------
// "/register" - register | BODY: username, password, email
userRouter.post('/register', async (req, res) => {
  const _usr = req.body?.username || '';
  const _pas = req.body?.password || '';
  const _ema = req.body?.email || '';
  const getData = await user.doRegister(req, _usr, _pas, _ema);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});

// PUT -------------------------------------------------------------------------------------------------------
// "/update" - update user profile settings | BODY: id, data
userRouter.put('/update', async (req, res) => {
  const _uid = req.body?.id || '';        // id - string
  let _dat = [];                          // data - { columnName: string }[]
  if (isStringJSON(req.body?.data)) {
    _dat = JSON.parse(req.body?.data);     
  }
  console.log(req.body);
  const getData = await user.updateUserProfile(req, _uid, _dat);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});

// "/password" - Update password for current user | BODY: oldpassword, newpassword
userRouter.put('/password', async (req, res) => {
  const _oPass = req.body?.oldpassword ?? '';
  const _nPass = req.body?.newpassword ?? '';
  const getData = await user.updatePassword(req, _oPass, _nPass);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});

// "/email" - Update email for current user | BODY: password, email
userRouter.put('/email', async (req, res) => {
  const _pass = req.body?.password ?? '';
  const _emai = req.body?.email ?? '';
  const getData = await user.updateEmail(req, _pass, _emai);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});

// DELETE -------------------------------------------------------------------------------------------------------
// "/delete" - Delete a user (root admin only) | BODY: id
userRouter.delete('/delete', async (req, res) => {
  const uid = req.body?.id || 0; // user ID
  const getData = await user.deleteUser(req, uid);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});

// (MUST BE LAST TO THESE TO OVERRIDE ROUTES ABOVE) ------------------------------------
// "/:id" - Show specific user by ID | PARAM: id
userRouter.get('/:id', async (req, res) => {
  const id = req.params.id ?? 0;
  const getData = await user.showUserByID(id);
  res.send(getData);
});