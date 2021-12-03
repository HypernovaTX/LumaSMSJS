// ================================================================================
// Sprite Router
// Quick note: Request param with ? is optional
// ================================================================================
import express from 'express';
import multer from 'multer';

import rateLimits from '../rateLimiter';
import { diskStorage } from '../../lib/filemanager';
import {
  invalidFileResponse,
  invalidJsonResponse,
  invalidParamResponse,
  isStringJSON,
  validateRequiredParam,
} from '../../lib/globallib';
import {
  createSprite,
  deleteSprite,
  getPublicSprites,
  getSpriteDetails,
  getSpriteHistory,
  updateSprite,
  updateSpriteFile,
  updateSpriteStaff,
  voteNewSprite,
  voteSpriteUpdate,
} from '../../components/subSprite';
// import { isStringJSON } from '../../lib/globallib.js';
import CF from '../../config';
import { httpStatus } from '../../lib/result';
import { MulterFileFields } from '../../schema';
import { Sprite } from '../../schema/submissionType';

export const spriteRouter = express.Router();
// Prepare route and file handling
export const userRouter = express.Router();
const mainUploadDir = `${CF.UPLOAD_DIRECTORY}/${CF.UPLOAD_SUB_SPRITE}/`;
const spriteStorage = diskStorage(mainUploadDir);
const spriteUpload = multer({ storage: spriteStorage });
const uploadFields = [
  { name: 'file', maxCount: 1 },
  { name: 'thumb', maxCount: 1 },
];

// GET -------------------------------------------------------------------------------------------------------
// GET "/" - list sprites (default)
spriteRouter.get('/', rateLimits.general, async (_, res) => {
  const result = await getPublicSprites(0, CF.ROWS, '', false, []);
  httpStatus(res, result);
  res.send(result);
});

// GET "/:id" - Show specific sprite by ID
// PARAM: id
spriteRouter.get('/:id', rateLimits.general, async (req, res) => {
  const id = parseInt(req.params.id) || 0;
  const result = await getSpriteDetails(id);
  httpStatus(res, result);
  res.send(result);
});

// GET "/:id/history/" - list of sprite updates
spriteRouter.get('/:id/history/', rateLimits.general, async (req, res) => {
  const id = parseInt(req.params.id) || 0;
  const result = await getSpriteHistory(id);
  httpStatus(res, result);
  res.send(result);
});

// PUT -------------------------------------------------------------------------------------------------------
// PUT "/" - list sprites (with param for sort/filter)
// BODY: ?page, ?count, ?row, ?dsc, ?filter
spriteRouter.put('/', rateLimits.general, async (req, res) => {
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

// PATCH ------------------------------------------------------------------------------------------------------
// PATCH "/:id" - update submission (no files, user end)
// PARAM: id, BODY: payload, message, version
spriteRouter.patch('/:id', rateLimits.update, async (req, res) => {
  if (!validateRequiredParam(req, ['data', 'message', 'version'])) {
    invalidParamResponse(res);
    return;
  }
  const id = parseInt(req.params?.id) || 0;
  const message = `${req.body?.message ?? ''}`;
  const version = `${req.body?.version ?? ''}`;
  let data = {} as Sprite;
  if (isStringJSON(req.body?.data)) {
    data = JSON.parse(req.body?.data);
  } else if (req.body?.data) {
    invalidJsonResponse(res);
    return;
  }
  const result = await updateSprite(req, id, data, message, version);
  httpStatus(res, result);
  res.send(result);
});

// PATCH "/:id/file" - update submission (has files, user end)
// PARAM: id, BODY: payload, message, version
spriteRouter.patch(
  '/:id/file',
  rateLimits.update,
  spriteUpload.fields(uploadFields),
  async (req, res) => {
    const getFiles = req.files as MulterFileFields;
    if (!getFiles?.file?.length || !getFiles?.thumb?.length) {
      invalidFileResponse(res);
      return;
    }
    if (!validateRequiredParam(req, ['data', 'message', 'version'])) {
      invalidParamResponse(res);
      return;
    }
    const id = parseInt(req.params?.id) || 0;
    const message = `${req.body?.message ?? ''}`;
    const version = `${req.body?.version ?? ''}`;
    let data = {} as Sprite;
    if (isStringJSON(req.body?.data)) {
      data = JSON.parse(req.body?.data);
    } else if (req.body?.data) {
      invalidJsonResponse(res);
      return;
    }
    const [[file], [thumb]] = [getFiles.file, getFiles.thumb];
    const result = await updateSpriteFile(
      req,
      id,
      data,
      message,
      version,
      file,
      thumb
    );
    httpStatus(res, result);
    res.send(result);
  }
);

// PATCH "/:id/staff" - update submission (has files, staff)
// PARAM: id, BODY: payload, message, version
spriteRouter.patch(
  '/:id/staff',
  rateLimits.update,
  spriteUpload.fields(uploadFields),
  async (req, res) => {
    const getFiles = req.files as MulterFileFields;
    if (!validateRequiredParam(req, ['data', 'message', 'version'])) {
      invalidParamResponse(res);
      return;
    }
    const id = parseInt(req.params?.id) || 0;
    const message = `${req.body?.message ?? ''}`;
    const version = `${req.body?.version ?? ''}`;
    let data = {} as Sprite;
    if (isStringJSON(req.body?.data)) {
      data = JSON.parse(req.body?.data);
    } else if (req.body?.data) {
      invalidJsonResponse(res);
      return;
    }
    const file = getFiles?.file?.length ? getFiles.file[0] : undefined;
    const thumb = getFiles?.thumb?.length ? getFiles.thumb[0] : undefined;
    const result = await updateSpriteStaff(
      req,
      id,
      data,
      message,
      version,
      file,
      thumb
    );
    httpStatus(res, result);
    res.send(result);
  }
);

// POST -------------------------------------------------------------------------------------------------------
// "/" - Create Sprite submission
// BODY: data, FILE: thumb, file
spriteRouter.post(
  '/',
  rateLimits.creation,
  spriteUpload.fields(uploadFields),
  async (req, res) => {
    const getFiles = req.files as MulterFileFields;
    if (!getFiles?.file?.length || !getFiles?.thumb?.length) {
      invalidFileResponse(res);
      return;
    }
    if (!validateRequiredParam(req, ['data'])) {
      invalidParamResponse(res);
      return;
    }
    let data = [];
    if (isStringJSON(req.body?.data)) {
      data = JSON.parse(req.body?.data);
    } else if (req.body?.data) {
      invalidJsonResponse(res);
      return;
    }
    const [[file], [thumb]] = [getFiles.file, getFiles.thumb];
    const getData = await createSprite(req, data, file, thumb);
    httpStatus(res, getData);
    res.send(getData);
  }
);

// POST "history/:id/vote" - vote on submission update (Staff only)
// PARAM: id, BODY: message, decision (id is the update's ID - vid in the DB)
spriteRouter.post(
  '/history/:id/vote',
  rateLimits.creation,
  async (req, res) => {
    if (!validateRequiredParam(req, ['message', 'decision'])) {
      invalidParamResponse(res);
      return;
    }
    const id = parseInt(req.params?.id) || 0;
    const message = `${req.body?.message ?? ''}`;
    const decision = parseInt(req.body?.decision) || 0;
    const result = await voteSpriteUpdate(req, id, decision, message);
    httpStatus(res, result);
    res.send(result);
  }
);

// "/:uid" - Create Sprite submission for a different user (Staff only)
// PARAM: uid, BODY: data, FILE: thumb, file
spriteRouter.post(
  '/:uid',
  rateLimits.creation,
  spriteUpload.fields(uploadFields),
  async (req, res) => {
    const getFiles = req.files as MulterFileFields;
    if (!getFiles?.file?.length || !getFiles?.thumb?.length) {
      invalidFileResponse(res);
      return;
    }
    if (!validateRequiredParam(req, ['data'])) {
      invalidParamResponse(res);
      return;
    }
    let data = [];
    const uid = parseInt(req.params?.uid) || 0;
    if (isStringJSON(req.body?.data)) {
      data = JSON.parse(req.body?.data);
    } else if (req.body?.data) {
      invalidJsonResponse(res);
      return;
    }
    const [[file], [thumb]] = [getFiles.file, getFiles.thumb];
    const getData = await createSprite(req, data, file, thumb, uid);
    httpStatus(res, getData);
    res.send(getData);
  }
);

// POST "/:id/vote" - vote on new submission (Staff only)
// PARAM: id, BODY: message, decision
spriteRouter.post('/:id/vote', rateLimits.creation, async (req, res) => {
  if (!validateRequiredParam(req, ['message', 'decision'])) {
    invalidParamResponse(res);
    return;
  }
  const id = parseInt(req.params?.id) || 0;
  const message = `${req.body?.message ?? ''}`;
  const decision = parseInt(req.body?.decision) || 0;
  const result = await voteNewSprite(req, id, decision, message);
  httpStatus(res, result);
  res.send(result);
});

// DELETE -------------------------------------------------------------------------------------------------------
// DELETE "/:id" - Delete a sprite [ROOT]
// PARAM: id
spriteRouter.delete('/:id', rateLimits.update, async (req, res) => {
  const id = parseInt(req.params.id) || 0; // sprite ID
  const result = await deleteSprite(req, id);
  httpStatus(res, result);
  res.send(result);
});
