import multer from 'multer';
import fs from 'fs';
import ERR from './error';

export const imageMIME = /image\/(gif|jpeg|png)$/i;
export const isGif = /image\/gif$/i;
export const fileExtension = /\.[0-9a-z]+$/;

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

export function attachFileExtension(file: Express.Multer.File) {
  console.log(file);
  return file.filename + fileExtension.exec(file.originalname);
}

export function verifyImageFile(file: Express.Multer.File) {
  return file.mimetype.match(imageMIME);
}

export function unlinkFile(file: string, directory: string) {
  fs.unlink(directory + file, (err) => {
    if (err) {
      ERR('fileUnlink', err.message);
    }
  });
}
