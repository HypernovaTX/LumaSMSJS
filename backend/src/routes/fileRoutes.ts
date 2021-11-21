import express from 'express';
import path from 'path';

import rateLimits from './rateLimiter';
import ERR from '../lib/error';
import { hasFile } from '../lib/filemanager';
import { invalidParamResponse, validateRequiredParam } from '../lib/globallib';
import { httpStatus } from '../lib/result';

export const fileRouter = express.Router();

// PUT '/' - Get file from 'upload'
// BODY: path (do not put '/' at the front!)
fileRouter.put('/', rateLimits.general, async (req, res) => {
  if (!validateRequiredParam(req, ['path'])) {
    invalidParamResponse(res);
    return;
  }
  const filepath = path.resolve(`./upload/${req.body?.path ?? ''}`);
  const fileExists = await hasFile(filepath);
  if (!fileExists) {
    const error = ERR('fileNotFound');
    httpStatus(res, error);
    res.send(error);
  }
  res.sendFile(path.resolve(filepath));
});
