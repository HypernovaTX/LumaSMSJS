import { errorObj } from '../lib/error';
import { User, UserList } from './userResponse';

export type allPossibleResponses = User | UserList | errorObj;
