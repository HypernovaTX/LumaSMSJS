// ================================================================================
// LumaSMS Backend REST API
// Written by - Hypernova
// MFGG - 2021
// ================================================================================

// NOTE: ALL POST / PUT / PATCH / DELETE REQUESTS (besides file uploads) MUST BE application/x-www-form-urlencoded!

import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { submissionRouter } from './routes/submissionRoutes';
import { userRouter } from './routes/userRoutes';
import { invalidParamResponse, validateRequiredParam } from './lib/globallib';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(
  morgan('combined', {
    skip: (_, res) => res.statusCode < 400,
  })
);

// ==================== Routes ====================
app.use('/user', userRouter);
app.use('/submission', submissionRouter);

// ==================== File ====================
// GET '/' - Get file from 'upload'
// BODY: path (do not put '/' at the front!)
app.get('/file', (req, res) => {
  if (!validateRequiredParam(req, ['path'])) {
    invalidParamResponse(res);
    return;
  }
  const filepath = `${req.body?.path ?? ''}`;
  res.sendFile(path.resolve(`upload/${filepath}`));
});

// ==================== Server ====================
const server = app.listen(12026, () => {
  const getAddress = server.address() ?? '(null)';
  const connection =
    typeof getAddress === 'string'
      ? getAddress
      : `${getAddress?.address}:${getAddress.port}`;
  console.log(`Application is running at "${connection}".`);
});

export default app;
