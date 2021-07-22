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
  const colSort = req.headers?.column || '';                  // row - string
  const asc = req.headers?.asc || true;                       // asc - boolean
  let filter = [];                                            // filter - { columnName: value }[]
  if (isStringJSON(req.headers?.filter)) {
    filter = JSON.parse(req.headers?.filter);     
  } 
  const getData = await sprite.listPublic(page, count, colSort, asc, filter);
  res.send(getData);
});



// (MUST BE LAST TO THESE TO OVERRIDE ROUTES ABOVE) ------------------------------------
// "/:id" - Show specific submission by ID | PARAM: id
spriteRouter.get('/:id', async (req, res) => {
  const id = req.params.id ?? 0;
  const getData = await sprite.showSubmissionDetails(id);
  res.send(getData);
});