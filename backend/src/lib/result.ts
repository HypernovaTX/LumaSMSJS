// ================================================================================
// All of the output codes (acts as enum)
// ================================================================================
import { Response } from 'express';
import { errors, errorObj, isError } from './error';

const resultCodes = {
  pass: 200,
  fail: 400,
  denied: 401,
  notfound: 404,
};

type resultCodeType = keyof typeof resultCodes;

export function httpStatus(res: Response, data: any) {
  if (!isError(data)) {
    res.status(resultCodes.pass);
    return;
  }
  const errorData = data as errorObj;
  let status: resultCodeType = 'fail';
  switch (errorData.error) {
    default:
      status = 'fail';
      break;
    case errors.userNotFound:
      status = 'notfound';
      break;
  }
  res.status(resultCodes[status]);
}
