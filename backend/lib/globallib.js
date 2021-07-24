// ================================================================================
// Reuseable utility functions that can be used anywhere
// ================================================================================
import SqlString from 'sqlstring';
import ERR from './error.js';

// Common server specific use ----------------------------------------------------

// ERROR CALL FUNCTION
export function handleError(code, message) {
  const errorClass = new ERR(code, message);
  errorClass.show_error();
}

// Get client IP
export function clientIP(_request) {
  return _request.headers['x-forwarded-for'] || _request.connection.remoteAddress;
}

// Misc ----------------------------------------------------

// Placeholder Promise
export function placeholderPromise(input = '') {
  const output = new Promise((resolve) => {
    resolve(input);
  })
  return output;
}

// Verify if it's JSON
export function isStringJSON(toCheck = '') {
  if (typeof toCheck !== 'string') { return false; }
  try { JSON.parse(toCheck); }
  catch(e) { console.log(e); return false; }
  return true;
}

// Proper Escape String without '
export function sanitizeInput(input = '') {
  let output = SqlString.escape(input);
  output = output.substring(1, output.length-1);
  return output;
}

// Regular expressions
export const imageMIME = /image\/(apng|gif|jpeg|png|svg|webp)$/i;
export const fileExtension = /\.[0-9a-z]+$/;


