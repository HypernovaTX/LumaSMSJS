// ================================================================================
// LumaSMS Backend API
// Written by - Hypernova
// MFGG - 2021
// ================================================================================

// NOTE: ALL POST REQUESTS (besides file uploads) MUST BE application/x-www-form-urlencoded!

// ==================== Core Components ====================
import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

// ==================== User ====================
import { router as userRouter } from './routes/user.js';
app.use('/user', userRouter);

// ==================== Server ====================
let server = app.listen(12026, () => {
  const getAddress = server.address();
  let host = getAddress.address;
  let port = getAddress.port;    
  console.log(`Application is running at "${host}:${port}".`);
});