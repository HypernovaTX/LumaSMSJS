import { errorObj } from '../lib/error';
import { user, userList } from './userResponse';

export type allPossibleResponses = user | userList | errorObj;
