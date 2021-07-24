// ================================================================================
// Sprite Router
// Quick note: Request param with ? is optional
// ================================================================================
import express from 'express';
import Sprite from '../../components/sub_sprite.js';
import { isStringJSON } from '../../lib/globallib.js';
export const spriteRouter = express.Router();
const sprite = new Sprite();

// GET -------------------------------------------------------------------------------------------------------
// "/" - list users | HEADER: ?page, ?count, ?row, ?asc, ?filter
spriteRouter.get('/', async (req, res) => {
  // Request parameters
  const page = req.headers?.page || 0;                        // page - number
  const count = req.headers?.count || 25;                     // count - number
  const colSort = req.headers?.column || 'z.id';              // column - string
  const asc = (req.headers?.asc) ? true : false;              // asc - string (true if not undefined)
  let filter = [];                                            // filter - { columnName: value }[]
  if (isStringJSON(req.headers?.filter)) {
    filter = JSON.parse(req.headers?.filter);     
  } 
  const getData = await sprite.listPublic(page, count, colSort, asc, filter);
  res.send(getData);
});

// POST -------------------------------------------------------------------------------------------------------
// "/create" - register | BODY: data
spriteRouter.post('/create', async (req, res) => {
  let _data = [];       // string of { columnName: value }[] 
  if (isStringJSON(req.body?.data)) {
    _data = JSON.parse(req.body?.data);     
  } 
  const getData = await sprite.createSubmission(req, _data);
  if (getData === 'DONE') {
    res.status(201);
  }
  res.send(getData);
});



// (MUST BE LAST TO THESE TO OVERRIDE ROUTES ABOVE) ------------------------------------
// "/:id" - Show specific submission by ID | PARAM: id
spriteRouter.get('/:id', async (req, res) => {
  const id = req.params.id ?? 0;
  const getData = await sprite.showSubmissionDetails(id);
  res.send(getData);
});

// "/:id/history" - Show submission's update history | PARAM: id
spriteRouter.get('/:id/history', async (req, res) => {
  const id = req.params.id ?? 0;
  const getData = await sprite.showSubmissionHistory(id);
  res.send(getData);
});

// "/:id/history" - Show submission's user comments | PARAM: id
spriteRouter.get('/:id/comment', async (req, res) => {
  const id = req.params.id ?? 0;
  const getData = await sprite.showSubmissionComments(id);
  res.send(getData);
});