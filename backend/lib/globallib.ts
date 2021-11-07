// ================================================================================
// Reuseable utility functions that can be used anywhere
// ================================================================================
import SqlString from "sqlstring";
import { Request } from "express";

// Common server specific use ----------------------------------------------------

// Get client IP
export function clientIP(_request: Request) {
  return (
    _request.headers["x-forwarded-for"] || _request.socket.remoteAddress
  );
}

// Misc ----------------------------------------------------

// Placeholder Promise
export function placeholderPromise(input: string) {
  const output = new Promise((resolve) => {
    resolve(input);
  });
  return output;
}

// Verify if it's JSON
export function isStringJSON(toCheck: string) {
  try {
    JSON.parse(toCheck);
  } catch (e) {
    console.log(e);
    return false;
  }
  return true;
}

// Proper Escape String without '
export function sanitizeInput(input: string) {
  let output = SqlString.escape(input);
  output = output.substring(1, output.length - 1);
  return output;
}

// Regular expressions
export const imageMIME = /image\/(apng|gif|jpeg|png|svg|webp)$/i;
export const fileExtension = /\.[0-9a-z]+$/;
