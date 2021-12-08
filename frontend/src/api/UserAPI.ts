import useFetch, {
  FetchResponse,
  SendNoResponse,
  SendResponse,
  useSend,
} from 'API/apiCore';
import { User } from 'schema/userSchema';

// List users
export function useAPI_userList(skip: boolean, body: GetUserListBody) {
  const url = 'user';
  return useFetch(skip, 'put', url, body) as FetchResponse<User[]>;
}

// Show a specific user by ID
export function useAPI_user(skip: boolean, body: GetUserBody) {
  const url = `user/${body.id}`;
  return useFetch(skip, 'get', url) as FetchResponse<User>;
}

// Get current user login
export function useAPI_verify(skip: boolean) {
  const url = `user/verify`;
  return useFetch(skip, 'get', url) as FetchResponse<User>;
}

// Login
export function useAPI_userLogin(
  body: GetUserLoginBody,
  onComplete: (data: User) => void
) {
  const url = `user/login`;
  return useSend(onComplete, 'put', url, body) as SendResponse<User>;
}

// Log out
export function useAPI_userLogout(onComplete: () => void) {
  const url = `user/logout`;
  return useSend(onComplete, 'get', url) as SendNoResponse;
}

// Body Types
type GetUserBody = {
  id: number;
};
type GetUserListBody = {
  page?: number;
  count?: number;
  filter?: [string, string][];
};
type GetUserLoginBody = {
  username: string;
  password: string;
  remember?: boolean;
};
