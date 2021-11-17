import rateLimiter from 'express-rate-limit';
import { ErrorObj, errors } from '../lib/error';

// time
const sec = (n: number) => n * 1000;
const min = (n: number) => n * sec(60);

// configs
const errorJSON: ErrorObj = {
  error: 'tooManyRequests',
  message: errors.tooManyRequests,
};
const msg = {
  message: JSON.stringify(errorJSON),
};
const general = { windowMs: sec(10), max: 100 };
const login = { windowMs: min(60), max: 10 };
const creation = { windowMs: min(2), max: 10 };
const update = { windowMs: min(1), max: 20 };

// set up rate limits
const rateLimits = {
  general: rateLimiter({ ...general, ...msg }),
  login: rateLimiter({ ...login, ...msg }),
  creation: rateLimiter({ ...creation, ...msg }),
  update: rateLimiter({ ...update, ...msg }),
};
export default rateLimits;
