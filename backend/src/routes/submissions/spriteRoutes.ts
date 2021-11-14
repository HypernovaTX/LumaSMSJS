// ================================================================================
// Sprite Router
// Quick note: Request param with ? is optional
// ================================================================================
import express from 'express';
import {
  invalidJsonResponse,
  invalidParamResponse,
  isStringJSON,
} from '../../lib/globallib';
import {
  getPublicSprites,
  getSpriteDetails,
  getSubmissionHistory,
} from '../../components/subSprite';
// import { isStringJSON } from '../../lib/globallib.js';
// import multer from 'multer';
import CF from '../../config';
import { httpStatus } from '../../lib/result';

export const spriteRouter = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// GET -------------------------------------------------------------------------------------------------------
// GET "/" - list sprites (default)
spriteRouter.get('/', async (_, res) => {
  const result = await getPublicSprites(0, CF.ROWS, '', false, []);
  httpStatus(res, result);
  res.send(result);
});

// GET "/history" - ERROR
spriteRouter.get('/history', async (_, res) => {
  invalidParamResponse(res);
});

// GET "/history/:id" - list of sprite updates
spriteRouter.get('/history/:id', async (req, res) => {
  const id = parseInt(req.params.id) || 0;
  const result = await getSubmissionHistory(id);
  httpStatus(res, result);
  res.send(result);
});

// GET "/:id" - Show specific sprite by ID
// PARAM: id
spriteRouter.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id) || 0;
  const result = await getSpriteDetails(id);
  httpStatus(res, result);
  res.send(result);
});

// PUT -------------------------------------------------------------------------------------------------------
// PUT "/" - list sprites (with param for sort/filter)
// BODY: ?page, ?count, ?row, ?dsc, ?filter
spriteRouter.put('/', async (req, res) => {
  const page = parseInt(req.body?.page) || 0;
  const count = parseInt(req.body?.count) || 25;
  const colSort = `${req.body?.column ?? ''}`;
  const asc = req.body?.dsc ? false : true; // dsc - string (true if undefined)
  let filter: [string, string][] = []; // filter - { columnName: value }[]

  if (isStringJSON(req.body?.filter)) {
    filter = JSON.parse(req.body?.filter);
  } else if (req.body?.filter) {
    invalidJsonResponse(res);
    return;
  }
  const result = await getPublicSprites(page, count, colSort, asc, filter);

  httpStatus(res, result);
  res.send(result);
});

// POST -------------------------------------------------------------------------------------------------------
// // "/create" - register | BODY: data, thumb, file
// const uploadFields = [
//   { name: 'thumb', maxCount: 1 },
//   { name: 'file', maxCount: 1 },
// ];
// spriteRouter.post('/create', upload.fields(uploadFields), async (req, res) => {
//   let _data = []; // string of { columnName: value }[]
//   if (isStringJSON(req.body?.data)) {
//     _data = JSON.parse(req.body?.data);
//   }
//   const files = {
//     thumb: req.files.thumb[0] ?? {},
//     file: req.files.file[0] ?? {},
//   };
//   const getData = await sprite.createSubmission(req, _data, files);
//   if (getData === 'DONE') {
//     res.status(201);
//   }
//   res.send(getData);
// });

// PUT -------------------------------------------------------------------------------------------------------
// // "/update" - register | BODY: data
// spriteRouter.put('/update', async (req, res) => {
//   let _data = []; // string of { columnName: value }[]
//   if (isStringJSON(req.body?.data)) {
//     _data = JSON.parse(req.body?.data);
//   }
//   const _id = req.body?.id ?? '0';
//   const getData = await sprite.updateSubmission(req, _id, _data);
//   if (getData === 'DONE') {
//     res.status(201);
//   }
//   res.send(getData);
// });

// (MUST BE LAST TO THESE TO OVERRIDE ROUTES ABOVE) ------------------------------------
// // "/:id" - Show specific submission by ID | PARAM: id
// spriteRouter.get('/:id', async (req, res) => {
//   const id = req.params.id ?? 0;
//   const getData = await sprite.showSubmissionDetails(id);
//   res.send(getData);
// });

// // "/:id/history" - Show submission's update history | PARAM: id
// spriteRouter.get('/:id/history', async (req, res) => {
//   const id = req.params.id ?? 0;
//   const getData = await sprite.showSubmissionHistory(id);
//   res.send(getData);
// });

// // "/:id/history" - Show submission's user comments | PARAM: id
// spriteRouter.get('/:id/comment', async (req, res) => {
//   const id = req.params.id ?? 0;
//   const getData = await sprite.showSubmissionComments(id);
//   res.send(getData);
// });
