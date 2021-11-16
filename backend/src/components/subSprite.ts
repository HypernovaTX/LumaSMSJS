// ================================================================================
// MAIN SPRITE OBJECT
// Extends from submissions.js
// (primarily called by /routes/submissions/sprites.js)
// ================================================================================
import { Request } from 'express';

import Submission from './lib/submission';
import CF from '../config';
import ERR, { ErrorObj } from '../lib/error';
import {
  archiveFileMIME,
  unlinkFile,
  verifyImageFile,
} from '../lib/filemanager';
import { NoResponse } from '../lib/result';
import { SubmissionUpdateResponse } from '../schema/submissionType';
import { Sprite } from '../schema/subSpritesType';

const spriteImageMIME = /image\/(gif|png)$/i;
const submission = new Submission('sprites');

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
    | SubmissionUpdateResponse[]
    | ErrorObj;

export async function createSprite(
  _request: Request,
  payload: Sprite,
  file: Express.Multer.File,
  thumb: Express.Multer.File
) {
  payload.file = file.filename;
  payload.thumbnail = thumb.filename;
  // Ensure file/thumb is an image
  const directory = `${CF.UPLOAD_DIRECTORY}/${CF.UPLOAD_SUB_SPRITE}/`;
  if (!verifyImageFile(file) || !verifyImageFile(thumb)) {
    unlinkFile(file.filename, directory);
    unlinkFile(thumb.filename, directory);
    return ERR('fileImageInvalid');
  }
  payload.file_mime = file.mimetype;
  return (await submission.createSubmission(_request, payload)) as
    | NoResponse
    | ErrorObj;
}
// TO DO
// 1 - get file upload for createSubmission and updateSubmission working
// 2 - npm install node-scheduler and make cron job to delete submission file and DB after 30 days
// 3 - download submission and update view/downloads
// 4 - Staff vote
// 5 - Move on to Reviews, then games, then hacks, then howtos/sounds/misc
// 6 - Comment section

type ListPublicSpriteFunction = Parameters<
  (
    page: number,
    count: number,
    column: string,
    asc: boolean,
    filter: [string, string][]
  ) => Promise<Sprite | ErrorObj>
>;
type SpriteDataFunction = Parameters<() => Promise<NoResponse | ErrorObj>>;
