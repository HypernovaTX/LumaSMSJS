// ================================================================================
// All of the output codes (acts as enum)
// ================================================================================
import { Response } from 'express';

const resultCodes = {
  pass: 200,
  fail: 400,
  denied: 401,
  notfound: 404,
};

type resultCodeType = keyof typeof resultCodes;

export function httpStatus(res: Response, status: resultCodeType) {
  if (!res?.status || !status) {
    return;
  }
  res.status(resultCodes[status]);
}
