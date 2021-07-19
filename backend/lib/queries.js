const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
export const q = {
  getUserList: `SELECT * FROM ${process.env.DBPREFIX}`
};