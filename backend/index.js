// ================================================================================
// LumaSMS Backend REST API
// Written by - Hypernova
// MFGG - 2021
// ================================================================================

// NOTE: ALL POST REQUESTS (besides file uploads) MUST BE application/x-www-form-urlencoded!

// ==================== Core Components ====================
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cors());
app.use(cookieParser());

// ==================== Server ====================
let server = app.listen(12026, () => {
  const getAddress = server.address();
  let host = getAddress.address;
  let port = getAddress.port;    
  console.log(`Application is running at "${host}:${port}".`);
});