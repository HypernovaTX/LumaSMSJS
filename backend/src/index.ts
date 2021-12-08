// ================================================================================
// LumaSMS Backend REST API
// Written by - Hypernova
// MFGG - 2021
// ================================================================================
import express, { Application } from 'express';

import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import Cron from './lib/cron';
import { directorySetup } from './lib/filemanager';
import { fileRouter } from './routes/fileRoutes';
import { submissionRouter } from './routes/submissionRoutes';
import { userRouter } from './routes/userRoutes';
import ERR from './lib/error';

const whitelist = ['http://localhost:3000', 'http://localhost:3001'];

// ==================== Init ====================
const app: Application = express();
const morganEntity = morgan('combined', {
  skip: (_, res) => res.statusCode < 400,
});
const csrfProtection = csurf({ cookie: true });
const parseForm = express.urlencoded({ extended: false });
const cron = new Cron();
cron.job.start();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: (o, call) => {
      if (whitelist.indexOf(o) !== -1) {
        call(null, true);
      } else {
        call(new Error(ERR('notAllowedCors').message));
      }
    },
    credentials: true,
  })
);
app.options('*', cors());
app.use(helmet());
app.use(morganEntity);
directorySetup();

// ==================== Routes ====================
// NOTE: ALL REQUESTS (besides file uploads) MUST BE application/x-www-form-urlencoded!
app.use('/file', fileRouter);
app.use('/user', userRouter);
app.use('/submission', submissionRouter);

// ==================== Cookie Security ====================
app.get('/form', csrfProtection, (req, res) => {
  res.render('send', { csrfToken: req.csrfToken() });
});
app.post('/process', parseForm, csrfProtection, (_, res) => {
  res.send('data is being processed');
});

// ==================== Server ====================
const server = app.listen(12026, () => {
  const getAddress = server.address();
  const connection =
    typeof getAddress === 'string'
      ? getAddress
      : `${getAddress?.address}:${getAddress.port}`;
  console.log(`Application is running at "${connection}".`);
});

export default app;
