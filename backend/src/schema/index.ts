import { ErrorObj } from '../lib/error';
import { AnySubmissionResponse } from './submissionType';
import { User, UserList } from './userTypes';

export type allPossibleResponses =
  | User
  | UserList
  | ErrorObj
  | AnySubmissionResponse;
export type MulterFileFields = { [fieldname: string]: Express.Multer.File[] };
