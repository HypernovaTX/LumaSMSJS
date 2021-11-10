import { ErrorObj } from '../lib/error';
import { User, UserList } from './userTypes';

export type allPossibleResponses = User | UserList | ErrorObj;
