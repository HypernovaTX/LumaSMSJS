// ================================================================================
// MAIN SPRITE OBJECT
// Extends from submissions.js
// (primarily called by /routes/submissions/sprites.js)
// ================================================================================
import { Request } from 'express';

import Submission from './lib/submission';
import CF from '../config';
import ERR, { ErrorObj, isError } from '../lib/error';
import {
  archiveFileMIME,
  isAnimatedGif,
  unlinkFile,
  verifyImageFile,
} from '../lib/filemanager';
import { NoResponse } from '../lib/result';
import {
  AnySubmission,
  SubmissionVersionResponse,
} from '../schema/submissionType';
import { Sprite, SpriteResponse } from '../schema/subSpritesType';

const spriteImageMIME = /image\/(gif|png)$/i;
const submission = new Submission('sprites');
const directory = `${CF.UPLOAD_DIRECTORY}/${CF.UPLOAD_SUB_SPRITE}`;

// Easily passable functions
// READ ONLY
export function checkSpriteFile(files: Express.Multer.File[]) {
  const results = files.map(
    (file) =>
      spriteImageMIME.test(file.mimetype) && archiveFileMIME.test(file.mimetype)
  );
  return results.includes(false);
}

export const getPublicSprites = async (...args: ListPublicSpriteFunction) =>
  (await submission.getPublicList(...args)) as Sprite[] | ErrorObj;

export const getSpriteDetails = async (id: number) =>
  (await submission.getSubmissionDetails(id)) as Sprite | ErrorObj;

export const getSpriteHistory = async (id: number) =>
  (await submission.getSubmissionHistory(id)) as
    | SubmissionVersionResponse[]
    | ErrorObj;

// WRITE
export const updateSprite = async (...args: SpriteUpdateFunction) =>
  (await submission.updateSubmission(...args)) as NoResponse | ErrorObj;

// Complex functions
// WRITE
export const createSprite = async (
  _request: Request,
  payload: Sprite,
  file: Express.Multer.File,
  thumb: Express.Multer.File
) => {
  const processedPayload = processPayloadAndFiles(payload, file, thumb);
  if (isError(processedPayload)) {
    deleteFile(file, thumb);
    return processedPayload as ErrorObj;
  }
  payload = processedPayload as Sprite;
  const result = (await submission.createSubmission(_request, payload)) as
    | NoResponse
    | ErrorObj;
  if (isError(result)) {
    deleteFile(file, thumb);
  }
  return result;
};

export const updateSpriteFile = async (
  _request: Request,
  id: number,
  payload: Sprite,
  message: string,
  version: string,
  file: Express.Multer.File,
  thumb: Express.Multer.File
) => {
  const processedPayload = processPayloadAndFiles(payload, file, thumb);
  if (isError(processedPayload)) {
    deleteFile(file, thumb);
    return processedPayload as ErrorObj;
  }
  payload = processedPayload as Sprite;
  const result = (await submission.updateSubmission(
    _request,
    id,
    payload,
    message,
    version,
    true
  )) as NoResponse | ErrorObj;
  if (isError(result)) {
    deleteFile(file, thumb);
  }
  return result;
};

// TO DO
// 1 - get file upload for createSubmission and updateSubmission working
// 2 - npm install node-scheduler and make cron job to delete submission file and DB after 30 days
// 3 - download submission and update view/downloads
// 4 - Staff vote
// 5 - Move on to Reviews, then games, then hacks, then howtos/sounds/misc
// 6 - Comment section

// Sprite specific lib

function processPayloadAndFiles(
  payload: Sprite,
  file: Express.Multer.File,
  thumb: Express.Multer.File
) {
  payload.file = file.filename;
  payload.thumbnail = thumb.filename;
  payload.file_mime = file.mimetype;
  // Ensure file/thumb is an image
  if (!verifyImageFile(file) || !verifyImageFile(thumb)) {
    return ERR('fileImageInvalid');
  }
  // Detect if thumb is an animated GIF or not
  if (isAnimatedGif(directory, thumb)) {
    return ERR('submissionAnimatedThumb');
  }
  return payload;
}

function deleteFile(file: Express.Multer.File, thumb: Express.Multer.File) {
  unlinkFile(directory, file.filename);
  unlinkFile(directory, thumb.filename);
}

type ListPublicSpriteFunction = Parameters<
  (
    page: number,
    count: number,
    column: string,
    asc: boolean,
    filter: [string, string][]
  ) => Promise<Sprite | ErrorObj>
>;
type SpriteUpdateFunction = Parameters<
  (
    _request: Request,
    id: number,
    payload: AnySubmission,
    message: string,
    version: string
  ) => Promise<NoResponse | ErrorObj>
>;
