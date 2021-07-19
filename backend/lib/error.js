// ==================== GLOBAL ERROR OBJ ====================
/**
 *  err - error code (see the switch statement for refernece, and add if you need one.)
 *  message - (optional) shows "[Reason] - <message goes here>", really useful if you pass errors generated by things like requests, etc.
 */

export default class ERR {
  constructor(err, message = '') {
    this.error = err;
    this.message = message;
  }
  show_error() {
    let output = '[LUMASMS API ERROR] ';
    const reason = (this.message === '') ? `` : `[Reason] - ${this.message}`;

    switch (this.error) {
      default: output += `??? - An unknown error (code: ${this.error}) has occured.`; break;
      

      // gr# - general errors
        

      // db# - related to SQL database
      case('db0'): output += `DB0 - Failed to connect to the database!`; break;
      case('db1'): output += `DB1 - Failed to disconnect from the database!`; break;
      case('db2'): output += `DB2 - Failed to perform the SQL query!`; break;
      case('db3'): output += `DB3 - "column" in "buildSelect()" is not a string nor string array!`; break;
      case('db4'): output += `DB4 - "input" in "buildWhere()" is not a string nor string array!`; break;
      case('db5'): output += `DB5 - One or more param have incorrect type for "buildOrder()"!`; break;
      case('db6'): output += `DB6 - Arrays for both param are not matching for "buildOrder()"!`; break;
      case('db7'): output += `DB7 - One or more param is null for "buildInsert()"!`; break;
      case('db8'): output += `DB8 - One or more param is null for "buildUpdate()"!`; break;
      case('db9'): output += `DB9 - One or more param is null for "buildDelete()"!`; break;
      case('db10'): output += `DB10 - "input" for "buildCustomQuery()" is NOT string!`; break;

      // us# - related to user
      case('us0'): output += `US0 - Please check the parameters in "checkExistingUser()"!`; break;
      case('us1'): output += `US1 - Please check the parameters in "loginRequest()"!`; break;
      case('us2'): output += `US2 - Error while processing bcrypt.match in login!`; break;
      case('us3'): output += `US3 - Please check the parameters in "doRegister()"!`; break;
      case('us4'): output += `US4 - Error while processing bcrypt.hash in register!`; break;
      
      
      
      case('us7'): output += `US7 - Please check the parameters in "passwordChangeRequest()"!`; break;
      case('us8'): output += `US8 - Please check the parameters in "changeUser()"!`; break;
      case('us9'): output += `US9 - Please check the parameters in "uploadAvatarBanner()"!`; break;
      case('us10'): output += `US10 - Please check the parameters in "updateUserProfile()"!`; break;

      // lv# - related to submission
      case('lv0'): output += `US0 - Please check the parameters in "listLevels()"!`; break;
      case('lv1'): output += `US1 - Please check the parameters in "showLevel()"!`; break;
      case('lv2'): output += `US1 - Please check the parameters in "showLevelComments()"!`; break;
      case('lv3'): output += `US1 - Please check the parameters in "showLevelRatings()"!`; break;

      // fi# - related to files
      case('fi1'): output += `FI1 - Incorrect directory to write file.`; break;
    }

    console.log(`\x1b[41m${output}\x1b[0m`);
    if (reason !== '') { console.log(`\x1b[33m${reason}\x1b[0m`); } //Only calls if it's not blank
  }
}