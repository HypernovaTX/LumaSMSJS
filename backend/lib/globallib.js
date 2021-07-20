// Reuseable utility functions that can be used anywhere
import ERR from './error.js';

// ERROR CALL FUNCTION
export function handleError(code, message) {
  const errorClass = new ERR(code, message);
  errorClass.show_error();
}

// Placeholder Promise
export function placeholderPromise(input = '') {
  const output = new Promise((resolve) => {
    resolve(input);
  })
  return output;
}

// Get client IP
export function clientIP(_request) {
  return _request.headers['x-forwarded-for'] || _request.connection.remoteAddress;
}

// Regular expressions
export const imageMIME = /image\/(apng|gif|jpeg|png|svg|webp)$/i;
export const fileExtension = /\.[0-9a-z]+$/;