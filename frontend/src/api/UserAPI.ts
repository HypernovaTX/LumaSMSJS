import useFetch, { mainAPICall } from 'api/apiCore';
import { ErrorObj, NoResponse } from 'schema';
import { User } from 'schema/userSchema';

// List users
export function useAPI_userList(body: GetUserListBody) {
  const url = 'user';
  return useFetch('put', url, body) as GetUserListResponse;
}

// Show a specific user by ID
export function useAPI_user(body: GetUserBody) {
  const url = `user/${body.id}`;
  return useFetch('get', url) as GetUserResponse;
}

// Get current user login
export function useAPI_verify() {
  const url = `user/verify`;
  return useFetch('get', url) as GetUserResponse;
}

// Login
export async function useAPI_userLogin(body: GetUserLoginBody) {
  const url = `user/login`;
  return (await mainAPICall('put', url, body)) as NoResponse;
}

// Log out
export async function useAPI_userLogout() {
  const url = `user/logout`;
  return (await mainAPICall('get', url)) as NoResponse;
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

// Reponse types
type GetUserResponse = {
  data: User | null | ErrorObj;
  loaded: boolean;
};
type GetUserListResponse = {
  data: User[] | null | ErrorObj;
  loaded: boolean;
};
