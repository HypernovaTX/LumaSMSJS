// ================================================================================
// MAIN SPRITE OBJECT
// Extends from submissions.js
// (primarily called by /routes/submissions/sprites.js)
// ================================================================================

//import SQL from '../lib/sql.js';
//import { placeholderPromise, handleError, sanitizeInput } from '../lib/globallib.js';
import Submission from './lib/submission.js';
import CF from '../config.js';
//import { checkPermission, checkLogin, checkExistingUser, updateLoginCookie, createUser } from './lib/userlib.js';

export default class Sprite extends Submission {
  constructor() {
    super();
    this.specificTable = `${CF.DB_PREFIX}submission_sprites`;
    this.resourceType = 1;
    this.additionalQueries = {
      listSelect: ['z.views', 'z.downloads', 'z.thumbnail']
    };
  }

  async listPublic(page = 0, count = 25, column = '', asc = false, filter = []) {
    return await super.listPublic(page, count, column, asc, filter);
  }

  async showSubmissionDetails(rid = 0) { return await super.showSubmissionDetails(rid); }
  async showSubmissionHistory(rid = 0) { return await super.showSubmissionHistory(rid); }
  async showSubmissionComments(rid = 0) { return await super.showSubmissionComments(rid); }
  //async updateSubmissionViews(_request, id) {}
  //async downloadSubmission(_request, id) {}

  async createSubmission(_request, payload) { return await super.createSubmission(_request, payload); }
  async updateSubmission(_request, id, payload) { return await super.updateSubmission(_request, id, payload); }
  async deleteSubmission(_request, id) { return await super.deleteSubmission(_request, id); }

  // TO DO 
  // 1 - get file upload for createSubmission and updateSubmission working
  // 2 - npm install node-scheduler and make cron job to delete submission file and DB after 30 days
  // 3 - download submission and update view/downloads
  // 4 - Staff vote
  // 5 - Move on to Reviews, then games, then hacks, then howtos/sounds/misc
  // 6 - Comment section
}