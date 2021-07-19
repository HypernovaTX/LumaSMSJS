import express from 'express';
import User from '../components/user.js';
import { checkLogin, checkPermission } from '../lib/userlib.js';


export const router = express.Router();
const user = new User();

// "/" - list users detailed
router.get('/', async (req, res) => {
  // Request parameters
  const page = req.headers?.page || 0;                        // page - number
  const count = req.headers?.count || 25;                     // count - number
  const colSort = req.headers?.column || '';                  // row - string
  const asc = req.headers?.asc || true;                       // asc - boolean
  const filter = JSON.parse(req.headers?.filter || '[]');     // filter - { column: string, value: string }[]
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

// "/register" 
router.post('/register', async (req, res) => {
  const _usr = req.headers?.username || '';
  const _pas = req.headers?.password || '';
  const _ema = req.headers?.email || '';
  const getData = await user.doRegister(_usr, _pas, _ema);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});

// "/:id" - Show specific user by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id || 0;
  console.log(req.params);
  const getData = await user.showUserByID(id);
  res.send(getData);
});