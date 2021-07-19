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