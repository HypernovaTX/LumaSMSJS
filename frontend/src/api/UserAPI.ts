import useFetch, {
  OnComplete,
  APINoResponse,
  APIResponse,
  useSend,
} from 'API/apiCore';
import { User } from 'schema/userSchema';

// List users
export function useAPI_userList(
  skip: boolean,
  body: GetUserListBody,
  done?: OnComplete<User[]>
) {
  const url = 'user';
  const completeFunction = done ? done : () => {};
  return useFetch(completeFunction, skip, 'put', url, body) as APIResponse<
    User[],
    GetUserListBody
  >;
}

// Show a specific user by ID
export function useAPI_user(
  skip: boolean,
  body: GetUserBody,
  done?: OnComplete<User>
) {
  const url = `user/${body.id}`;
  const completeFunction = done ? done : () => {};
  return useFetch(completeFunction, skip, 'get', url) as APIResponse<
    User,
    GetUserBody
  >;
}

// Get current user login
export function useAPI_verify(skip: boolean, done?: OnComplete<User>) {
  const url = `user/verify`;
  const completeFunction = done ? done : () => {};
  return useFetch(completeFunction, skip, 'get', url) as APIResponse<
    User,
    undefined
  >;
}

// Login
export function useAPI_userLogin(
  body: GetUserLoginBody,
  done?: OnComplete<User>
) {
  const url = `user/login`;
  const completeFunction = done ? done : () => {};
  return useSend(completeFunction, 'put', url, body) as APIResponse<
    User,
    GetUserLoginBody
  >;
}

// Log out
export function useAPI_userLogout(done?: OnComplete<null>) {
  const url = `user/logout`;
  const completeFunction = done ? done : () => {};
  return useSend(completeFunction, 'get', url) as APINoResponse<undefined>;
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
