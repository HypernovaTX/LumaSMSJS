// ================================================================================
// User Router
// ================================================================================
import express from 'express';
import User from '../components/user.js';
import { isStringJSON } from '../lib/globallib.js';
import { checkLogin, checkPermission } from '../lib/userlib.js';
export const router = express.Router();
const user = new User();

// GET -------------------------------------------------------------------------------------------------------

// "/" - list users detailed
router.get('/', async (req, res) => {
  // Request parameters
  const page = req.headers?.page || 0;                        // page - number
  const count = req.headers?.count || 25;                     // count - number
  const colSort = req.headers?.column || '';                  // row - string
  const asc = req.headers?.asc || true;                       // asc - boolean
  let filter = [];                                            // filter - { column: string, value: string }[]
  if (isStringJSON(req.headers?.filter)) {
    filter = JSON.parse(req.headers?.filter);     
  } 
  const getData = await user.listUsers(page, count, colSort, asc, filter);
  res.send(getData);
});

// "/login"
router.get('/login', async (req, res) => {
  const username = req.headers?.username || '0';
  const password = req.headers?.password || '0';
  const result = await user.doLogin(username, password, res);
  res.send(result);
});

// "/verifylogin" - check if login is valid
router.get('/verifylogin', async (req, res) => {
  const result = await checkLogin(req);
  res.send(result);
});

// "/checkpermission" - check if login is valid
router.get('/checkpermission', async (req, res) => {
  const result = await checkPermission(req);
  res.send(result);
});

// "/logout" 
router.get('/logout', (req, res) => {
  res.send(user.doLogout(res)); 
});

// POST -------------------------------------------------------------------------------------------------------

// "/register" 
router.post('/register', async (req, res) => {
  const _usr = req.headers?.username || '';
  const _pas = req.headers?.password || '';
  const _ema = req.headers?.email || '';
  const getData = await user.doRegister(req, _usr, _pas, _ema);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});

// PUT -------------------------------------------------------------------------------------------------------

// "/update" 
router.put('/update', async (req, res) => {
  const _uid = req.headers?.id || '';
  let _dat = []; // { columnName(see DB): string, value: any }[]
  if (isStringJSON(req.headers?.data)) {
    _dat = JSON.parse(req.headers?.data);     
  }
  const getData = await user.updateUserProfile(req, _uid, _dat);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});

// "/password" - Used to update password
router.put('/password', async (req, res) => {
  const _user = req.headers?.username ?? '';
  const _oPass = req.headers?.oldpassword ?? '';
  const _nPass = req.headers?.newpassword ?? '';
  const getData = await user.updatePassword(req, _user, _oPass, _nPass);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});

// "/email" - Used to update email
router.put('/email', async (req, res) => {
  const _user = req.headers?.username ?? '';
  const _pass = req.headers?.password ?? '';
  const _emai = req.headers?.email ?? '';
  const getData = await user.updateEmail(req, _user, _pass, _emai);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});

// Routes that have param (MUST BE LAST TO THESE TO OVERRIDE ROUTES ABOVE) ------------------------------------

// "/:id" - Show specific user by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id ?? 0;
  console.log(req.params);
  const getData = await user.showUserByID(id);
  res.send(getData);
});