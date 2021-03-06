// ================================================================================
// MAIN Submission Router
// Quick note: Request param with ? is optional
// ================================================================================
import express from 'express';
export const submissionRouter = express.Router();
//const app = express();

// ==================== Sprites ====================
import { spriteRouter } from './submissions/spriteRoutes';
submissionRouter.use('/sprite', spriteRouter);
