// ==================== GLOBAL ERROR OBJ ====================
/**
 *  err - error code from keys of "const errors"
 *  message - (optional) shows "[Reason] - <message goes here>", really useful if you pass errors generated by things like requests, etc.
 */
export type ErrorCodes = keyof typeof errors;
export interface ErrorObj {
  error: ErrorCodes;
  message: string;
  reason?: string;
}
export const errors = {
  // default errors
  default: 'An unknown error has occured.',
  invalidJson: 'Invalid JSON format used within the request!',
  invalidParam: 'Invalid parameters used in the request!',

  // database
  dbConnect: 'SQL Connection fail!',
  dbDisconnect: 'SQL Disconnection fail!',
  dbInsertNumber: 'SQL INSERT "column" "value" array counts does not match!',
  dbOrderNumber: 'SQL ORDER "column" "value" array counts does not match!',
  dbQuery: 'SQL Query fail!',
  dbUpdateNumber: 'SQL UPDATE "column" "value" array counts does not match!',

  // user
  userCookie: 'User cookie not found!',
  userEmailExists: 'Email is already taken!',
  userExists: 'Username and / or email are already taken!',
  userJwt: 'User token related error!',
  userLogin: 'Username and password are incorrect!',
  userNameExists: 'Username is already taken!',
  userNotFound: 'User not found!',
  userRoleNotFound: 'User role not found!',
  // userListNumber: 'listUser "order" "asc" array counts does not match!',
};

export function isError(x: any) {
  return (x as ErrorObj)?.error && (x as ErrorObj).message;
}

export default function ERR(error: ErrorCodes, reason?: string): ErrorObj {
  const message = errors[error];
  // Only calls if it's not blank
  console.log(`\x1b[41m[LUMASMS API ERROR] ${message}\x1b[0m`);
  if (reason) {
    console.log(`\x1b[33m[Reason] - ${reason}\x1b[0m`);
  }
  return { error, message, reason };

  // switch (this.error) {
  //   // gr# - general errors

  //   // us# - related to user
  //   case "us0":
  //     output += `US0 - Please check the parameters in "checkExistingUser()"!`;
  //     break;
  //   case "us1":
  //     output += `US1 - Please check the parameters in "loginRequest()"!`;
  //     break;
  //   case "us2":
  //     output += `US2 - Error while processing bcrypt.match in login!`;
  //     break;
  //   case "us3":
  //     output += `US3 - Please check the parameters in "doRegister()"!`;
  //     break;
  //   case "us4":
  //     output += `US4 - Error while processing bcrypt.hash in register!`;
  //     break;
  //   case "us5":
  //     output += `US5 - User is not logged in to perform the action!`;
  //     break;
  //   case "us6":
  //     output += `US6 - User does not have the right permission to perform the action!`;
  //     break;
  //   case "us7":
  //     output += `US7 - Param 'inputs' is blank or invalid for "updateUserProfile()"!`;
  //     break;
  //   case "us8":
  //     output += `US8 - Wrong password for verification"!`;
  //     break;
  //   case "us9":
  //     output += `US9 - Old and new passwords are the same!`;
  //     break;
  //   case "us10":
  //     output += `US10 - Email is already taken!`;
  //     break;
  //   case "us11":
  //     output += `US11 - Only root admins can delete users!`;
  //     break;

  //   // re# - related to submission
  //   case "re0":
  //     output += `RE0 - User does not have the right permission to perform the action!`;
  //     break;
  //   case "re1":
  //     output += `RE1 - One or more input data is empty!`;
  //     break;
  //   case "re2":
  //     output += `RE2 - The selected submission does not exist for updates!`;
  //     break;
  //   case "re3":
  //     output += `RE3 - One of more required file is empty!`;
  //     break;

  //   // fi# - related to files
  //   case "fi1":
  //     output += `FI1 - Incorrect directory to write file.`;
  //     break;
  // }
}
