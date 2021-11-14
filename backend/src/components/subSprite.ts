// ================================================================================
// MAIN SPRITE OBJECT
// Extends from submissions.js
// (primarily called by /routes/submissions/sprites.js)
// ================================================================================

import { archiveFileMIME } from '../lib/filemanager';
// import { placeholderPromise, handleError } from '../lib/globallib.js';
import Submission from './lib/submission';
// import CF from '../config';
import { Sprite } from '../schema/subSpritesType';
import { ErrorObj } from '../lib/error';
import { SubmissionUpdateResponse } from '../schema/submissionType';

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

export const getSubmissionHistory = async (id: number) =>
  (await submission.getSubmissionHistory(id)) as
    | SubmissionUpdateResponse[]
    | ErrorObj;
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
