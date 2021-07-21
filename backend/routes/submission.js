// ================================================================================
// MAIN Submission Router
// Quick note: Request param with ? is optional
// ================================================================================
import express from 'express';
export const submissionRouter = express.Router();
//const app = express();

// ==================== Sprites ====================
import { spriteRouter } from './submissions/sprite.js';
submissionRouter.use('/sprite', spriteRouter);