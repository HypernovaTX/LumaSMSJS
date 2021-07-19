import express from 'express';
import User from '../components/userhandler.js';

export const router = express.Router();
const user = new User();

// ROOT - list users detailed
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

// /:id - Specific user by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id || 0;
  console.log(req.params);
  const getData = await user.showUserByID(id);
  res.send(getData);
});