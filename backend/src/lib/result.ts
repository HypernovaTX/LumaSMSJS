// ================================================================================
// All of the output codes (acts as enum)
// ================================================================================
import { Response } from 'express';
import { errors, ErrorObj, isError } from './error';

const resultCodes = {
  pass: 200,
  noContent: 204,
  fail: 400,
  denied: 401,
  notfound: 404,
};

export type ResultCodeType = keyof typeof resultCodes;
export type NoResponse = { noContent: true };

export function httpStatus(res: Response, data: any) {
  if (!isError(data)) {
    if (data?.noContent) {
      res.status(resultCodes.noContent);
    } else {
      res.status(resultCodes.pass);
    }
    return;
  }
  const errorData = data as ErrorObj;
  let status: ResultCodeType = 'fail';
  switch (errorData.error) {
    default:
      status = 'fail';
      break;
    case errors.userNotFound:
    case errors.userRoleNotFound:
      status = 'notfound';
      break;
    case errors.userPermission:
    case errors.userStaffPermit:
    case errors.userRootPermit:
      status = 'denied';
      break;
  }
  res.status(resultCodes[status]);
}

export function noContentResponse() {
  return { noContent: true } as NoResponse;
}
