// ================================================================================
// Reuseable utility functions that can be used anywhere
// ================================================================================
import { Request, Response } from 'express';
import SqlString from 'sqlstring';

import CF from '../config';
import ERR from './error';
import { httpStatus } from './result';

// Common server specific use ----------------------------------------------------
export function validateRequiredParam(_request: Request, parameters: string[]) {
  const validParams = parameters.filter((param) => !!_request.body[param]);
  return validParams.length === parameters.length;
}

export function invalidParamResponse(_response: Response) {
  const error = ERR('invalidParam');
  httpStatus(_response, error);
  _response.send(error);
}

export function invalidFileResponse(_response: Response) {
  const error = ERR('noFile');
  httpStatus(_response, error);
  _response.send(error);
}

export function invalidJsonResponse(_response: Response) {
  const error = ERR('invalidJson');
  httpStatus(_response, error);
  _response.send(error);
}

// Get IP address
export function clientIP(_request: Request) {
  const getIp =
    _request.headers['x-forwarded-for'] || _request.socket.remoteAddress;
  if (Array.isArray(getIp)) {
    const [firstIp] = getIp;
    return firstIp;
  }
  return getIp;
}

// Tools ----------------------------------------------------
export function currentTime() {
  return Math.ceil(Date.now() / 1000);
}

export function isStringJSON(toCheck: string) {
  try {
    JSON.parse(toCheck);
  } catch (e) {
    CF.DEBUG_MODE && console.log(e);
    return false;
  }
  return true;
}

export function objIntoArrays(input: { [key: string]: any }) {
  const entries = Object.entries(input);
  const columns = entries.map((item) => {
    const [column] = item;
    return column;
  });
  const values = entries.map((item) => {
    const [_, value] = item;
    return value;
  });
  return { columns, values };
}

export function placeholderPromise(input: string) {
  const output = new Promise((resolve) => {
    resolve(input);
  });
  return output;
}

export function sanitizeInput(input: string) {
  // Proper Escape String without '
  let output = SqlString.escape(input);
  output = output.substring(1, output.length - 1);
  return output;
}

export function stringToBoolean(input: string) {
  return input.toLowerCase() === 'true';
}

// Regular expressions
