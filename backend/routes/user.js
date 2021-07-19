import express from 'express';
import User from '../components/userhandler.js';

export const router = express.Router();
const user = new User();

// ROOT
router.get('/', (req, res) => {
  res.send(user.listUsers());
});
