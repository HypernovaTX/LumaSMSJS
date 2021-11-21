import multer from 'multer';
import fs from 'fs';
import path from 'path';
//@ts-ignore
import animated from 'animated-gif-detector';

import ERR from './error';
import CF from '../config';

export const imageMIME = /image\/(gif|jpeg|png)$/i;
export const isGif = /image\/gif$/i;
export const fileExtension = /\.[0-9a-z]+$/;
export const archiveFileMIME =
  /application\/(x-7z-compressed|x-apple-diskimage|x-rar-compressed|zip)$/i;

export function diskStorage(destination: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
  });
}

export function directorySetup() {
  const rootUpload = `${CF.UPLOAD_DIRECTORY}`;
  [
    `${CF.UPLOAD_AVATAR}`,
    `${CF.UPLOAD_BANNER}`,
    `${CF.UPLOAD_SUB_SPRITE}`,
  ].forEach((dir) => {
    const definedDir = path.resolve(`./${rootUpload}/${dir}`);
    if (!fs.existsSync(definedDir)) {
      fs.mkdirSync(definedDir);
    }
  });
}

export function attachFileExtension(file: Express.Multer.File) {
  return file.filename + fileExtension.exec(file.originalname);
}

export function verifyImageFile(file: Express.Multer.File) {
  return imageMIME.test(file.mimetype);
}

export function isAnimatedGif(directory: string, file: Express.Multer.File) {
  if (isGif.test(file.mimetype)) {
    directory = path.resolve(`./${directory}/`);
    const readFile = fs.readFileSync(`${directory}/${file.filename}`);
    return !!animated(readFile);
  }
  return false;
}

export async function hasFile(path: string) {
  return await new Promise<boolean>((resolve) => {
    fs.access(path, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(err);
        resolve(false);
      }
      resolve(true);
    });
  });
}

export async function unlinkFile(directory: string, file: string) {
  const fileExists = await hasFile(`${directory}/${file}`);
  if (!fileExists) {
    return;
  }
  fs.unlink(`${directory}/${file}`, (err) => {
    if (err) {
      ERR('fileUnlink', err.message);
    }
  });
}
