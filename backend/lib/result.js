// ================================================================================
// All of the output codes (acts as enum)
// ================================================================================
const RESULT = {
  done: 'DONE',
  ok: 'OK',
  fail: 'FAIL',
  wrong: 'INCORRECT',
  badparam: 'BADPARAM',
  denied: 'DENIED',
  same: 'SAME',
  exists: 'EXISTS',
  notfound: '404',
}

export function httpStatus(res, status = '') {
  if (!res?.status || !status) { return; }
  switch (status) {
    default: res?.status(200); break;
    case(RESULT.done): res?.status(200); break;
    case(RESULT.ok): res?.status(200); break;
    case(RESULT.fail): res?.status(400); break;
    case(RESULT.badparam): res?.status(400); break;
    case(RESULT.denied): res?.status(401); break;
    case(RESULT.same): res?.status(400); break;
    case(RESULT.exists): res?.status(200); break;
    case(RESULT.notfound): res?.status(404); break;
  }
}

export default RESULT;