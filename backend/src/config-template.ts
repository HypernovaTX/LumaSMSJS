const CF = {
  DB_HOST: '', // database host
  DB_PORT: 3306, // database port
  DB_USER: '', // database user name
  DB_NAME: '', // database name
  DB_PASS: '', // database user password
  DB_PREFIX: 'tsms_', // database table prefix
  DEBUG_MODE: false, // debug mode (for console log stuff)
  DEFAULT_GROUP: 5, // default user role number when creating a new user
  FILENAME_LIMIT: 256, // limit for the length of file names
  JWT_SECRET: '', // JWT secret phrase
  JWT_EXPIRES_IN: '1y', // JWT expiration date
  JWT_COOKIE_EXPIRES: 10, // JWT cookie expiration
  PASSWORD_SALT: 4, // layers of password salts
  QC_VOTES_NEW: 2, // number of QC votes to accept new submission
  QC_VOTES_UPDATE: 1, // number of QC votes to accept submission update
  ROWS: 25, // default numbers of rows for list responses
  UPLOAD_DIRECTORY: 'upload', // upload directory name
  UPLOAD_AVATAR: 'avatar', // upload directory for user's avatar files
  UPLOAD_BANNER: 'banner', // upload directory for user's banner files
  UPLOAD_SUB_SPRITE: 'submission/sprite', // upload directory for sprite submission
  WHITELIST: ['*'], // list of allowed requests addresses
};
export default CF;
