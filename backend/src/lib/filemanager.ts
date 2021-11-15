import multer from 'multer';
import fs from 'fs';
import ERR from './error';

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

export function attachFileExtension(file: Express.Multer.File) {
  return file.filename + fileExtension.exec(file.originalname);
}

export function verifyImageFile(file: Express.Multer.File) {
  return imageMIME.test(file.mimetype);
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

export async function unlinkFile(file: string, directory: string) {
  const fileExists = await hasFile(directory + file);
  if (!fileExists) {
    return;
  }
  fs.unlink(directory + file, (err) => {
    if (err) {
      ERR('fileUnlink', err.message);
    }
  });
}
