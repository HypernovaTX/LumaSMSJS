import { ErrorObj } from '../lib/error';
import { AnySubmission } from './submissionType';
import { User } from './userTypes';

export type AllPossibleResponses = User | User[] | ErrorObj | AnySubmission;
export type MulterFileFields = { [fieldname: string]: Express.Multer.File[] };
