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
    if (data?.noContent) res.status(resultCodes.noContent);
    else res.status(resultCodes.pass);
    return;
  }
  const errorData = data as ErrorObj;
  let status: ResultCodeType = 'fail';
  switch (errorData.error) {
    case 'userNotFound':
    case 'userRoleNotFound':
    case 'submissionNotFound':
    case 'fileNotFound':
      status = 'notfound';
      break;
    case 'userPermission':
    case 'userStaffPermit':
    case 'userRootPermit':
      status = 'denied';
      break;
    default:
      status = 'fail';
      break;
  }
  res.status(resultCodes[status]);
}

export function noContentResponse() {
  return { noContent: true } as NoResponse;
}
