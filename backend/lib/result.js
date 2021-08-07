// ================================================================================
// All of the output codes (acts as enum)
// ================================================================================

export class Result {
  constructor(message) {
    super(...arguments);
    this.message = message;
  }
}

export class ErrorResult extends Error {
  constructor(message) {
    super(...arguments);
    this.message = message;
  }
}

export const ok = new Result('OK');
export const same = new Result('SAME');
export const exists = new Result('EXISTS');
export const done = new Result('DONE');

export const fail = new ErrorResult('FAIL');
export const badparam = new ErrorResult('BADPARAM');
export const denied = new ErrorResult('DENIED');
export const notfound = new ErrorResult('404');
export const invalid = new ErrorResult('INVALID');
export const genericerror = new ErrorResult('ERROR');

/**
 * Custom error handler to convert a Result or ErrorResult into an HTTP response
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export function httpResultHandler (err, req, res, next) {
  if (err instanceof ErrorResult) {
    switch (err) {
      case fail:
        res.status(401);
        break;
      case badparam:
        res.status(400);
        break;
      case notfound:
        res.status(404);
        break;
      default:
        res.status(400);
        break;
    }
    // Send the error message as the payload
    res.send(err.message);
  } else {
    next(err);
  }
}

export default {
  ok, same, exists, done, fail, badparam, denied, notfound, invalid, genericerror
};