import express from 'express';
import User from '../components/user.js';

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
  const result = await user.loginRequest(username, password, res);
  res.send(result);
});

// "/verifylogin" - check if login is valid
router.get('/verifylogin', async (req, res) => {
  const result = await user.checkLogin(req);
  res.send(result);
});

// "/logout" 
router.get('/logout', (req, res) => {
  res.send(user.doLogout(res)); 
});

// "/:id" - Show specific user by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id || 0;
  console.log(req.params);
  const getData = await user.showUserByID(id);
  res.send(getData);
});