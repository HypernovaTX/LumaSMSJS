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
  checkAnimatedGif,
  unlinkFile,
  verifyImageFile,
} from '../lib/filemanager';
import { NoResponse } from '../lib/result';
import { AnySubmission, SubmissionVersion } from '../schema/submissionType';
import { Sprite } from '../schema/submissionType';

const spriteImageMIME = /image\/(gif|png)$/i;
const submission = new Submission('sprites');
const directory = `${CF.UPLOAD_DIRECTORY}/${CF.UPLOAD_SUB_SPRITE}`;

// Easily passable functions
// READ ONLY
export async function getPublicSprites(...args: ListPublicSpriteParam) {
  return (await submission.getPublicList(...args)) as Sprite[] | ErrorObj;
}

export async function getSpriteDetails(id: number) {
  return (await submission.getSubmissionDetails(id)) as Sprite | ErrorObj;
}

export async function getSpriteHistory(id: number) {
  return (await submission.getSubmissionHistory(id)) as
    | SubmissionVersion[]
    | ErrorObj;
}

// WRITE
export async function updateSprite(...args: SpriteUpdateParam) {
  return (await submission.updateSubmission(...args)) as NoResponse | ErrorObj;
}

// Complex functions
// WRITE
export async function createSprite(
  _request: Request,
  payload: Sprite,
  file: Express.Multer.File,
  thumb: Express.Multer.File,
  uid?: number
) {
  // Check and process files
  const processedPayload = processPayloadAndFiles(payload, file, thumb);
  if (isError(processedPayload)) {
    deleteFile(file.filename, thumb.filename);
    return processedPayload as ErrorObj;
  }

  // Prepare, execute, and resolve
  payload = processedPayload as Sprite;
  const result = (await submission.createSubmission(_request, payload, uid)) as
    | NoResponse
    | ErrorObj;
  if (isError(result)) deleteFile(file.filename, thumb.filename);
  return result;
}

export async function updateSpriteFile(
  _request: Request,
  id: number,
  payload: Sprite,
  message: string,
  version: string,
  file: Express.Multer.File,
  thumb: Express.Multer.File
) {
  // Check and process files
  const processedPayload = processPayloadAndFiles(payload, file, thumb);
  if (isError(processedPayload)) {
    deleteFile(file.filename, thumb.filename);
    return processedPayload as ErrorObj;
  }

  // Prepare, execute, and resolve
  payload = processedPayload as Sprite;
  const result = (await submission.updateSubmission(
    _request,
    id,
    payload,
    message,
    version,
    true
  )) as NoResponse | ErrorObj;
  if (isError(result)) deleteFile(file.filename, thumb.filename);
  return result;
}

// Staff functions
export async function getSpriteQueue(
  _request: Request,
  page: number,
  count: number
) {
  return await submission.getQueueList(_request, page, count);
}

export async function voteNewSprite(...args: StaffVoteParam) {
  return await submission.voteSubmission(...args);
}

export async function voteSpriteUpdate(...args: StaffVoteParam) {
  return await submission.voteSubmissionUpdate(...args);
}

export async function updateSpriteStaff(
  _request: Request,
  id: number,
  payload: Sprite,
  message: string,
  version: string,
  file?: Express.Multer.File,
  thumb?: Express.Multer.File
) {
  // Check and process files
  const processedPayload = processPayloadAndFiles(payload, file, thumb);
  if (isError(processedPayload)) {
    deleteFile(file?.filename, thumb?.filename);
    return processedPayload as ErrorObj;
  }

  // Prepare, execute, and resolve
  payload = processedPayload as Sprite;
  const result = (await submission.updateSubmissionStaff(
    _request,
    id,
    payload,
    message,
    version
  )) as NoResponse | ErrorObj;
  if (isError(result)) deleteFile(file?.filename, thumb?.filename);
  return result;
}

export async function deleteSprite(_request: Request, id: number) {
  return await submission.deleteSubmission(_request, id);
}

// Sprite specific lib
export function deleteFile(file?: string, thumb?: string) {
  if (file) unlinkFile(directory, file);
  if (thumb) unlinkFile(directory, thumb);
}

export function checkSpriteFile(file: Express.Multer.File) {
  return (
    spriteImageMIME.test(file.mimetype) || archiveFileMIME.test(file.mimetype)
  );
}

function processPayloadAndFiles(
  payload: Sprite,
  file?: Express.Multer.File,
  thumb?: Express.Multer.File
) {
  // Prepare
  if (file) {
    payload.file = file.filename;
    payload.file_mime = file.mimetype;
  }
  if (thumb) payload.thumbnail = thumb.filename;

  // File name too long
  if (
    (file && file.filename.length > CF.FILENAME_LIMIT) ||
    (thumb && thumb.filename.length > CF.FILENAME_LIMIT)
  ) {
    return ERR('fileNameTooLong');
  }

  // Check file MIME types
  if (file && !checkSpriteFile(file)) {
    return ERR('fileSpriteInvalid');
  }
  if (thumb && !verifyImageFile(thumb)) {
    return ERR('fileImageInvalid');
  }

  // Detect if thumb is an animated GIF or not
  if (thumb && checkAnimatedGif(directory, thumb)) {
    return ERR('submissionAnimatedThumb');
  }

  return payload;
}

type ListPublicSpriteParam = Parameters<
  (
    page: number,
    count: number,
    column: string,
    asc: boolean,
    filter: [string, string][]
  ) => Promise<Sprite | ErrorObj>
>;
type SpriteUpdateParam = Parameters<
  (
    _request: Request,
    id: number,
    payload: AnySubmission,
    message: string,
    version: string
  ) => Promise<NoResponse | ErrorObj>
>;
type StaffVoteParam = Parameters<
  (
    _request: Request,
    id: number,
    decision: number,
    message: string,
    override?: boolean
  ) => Promise<NoResponse | ErrorObj>
>;
