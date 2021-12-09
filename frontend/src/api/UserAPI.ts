import { useFetch, useSend } from 'API/apiCore';
import { User } from 'schema/userSchema';
import {
  APINoResponse,
  APIProp,
  APIPropTemplate,
  APIResponse,
  OnComplete,
} from 'schema/apiSchema';
import { AnyObject } from 'schema';

// List users
export function useAPI_userList(p: GetUserListProps) {
  const payload = { ...p, kind: 'put', url: 'user' } as APIProp;
  return useFetch(payload) as APIResponse<User[], GetUserListBody>;
}

// Show a specific user by ID
export function useAPI_user(p: GetUserProps) {
  const url = `user/${p.body.id}`;
  const cleanedProps: AnyObject = p;
  delete cleanedProps.body;
  const payload = { ...cleanedProps, kind: 'get', url } as APIProp;
  return useFetch(payload) as APIResponse<User, GetUserBody>;
}

// Get current user login
export function useAPI_verify(p: GetUserVerifyProps) {
  const payload = { ...p, kind: 'get', url: 'user/verify' } as APIProp;
  return useFetch(payload) as APIResponse<User, undefined>;
}

// Login
export function useAPI_userLogin(p: GetUserLoginProps) {
  const payload = { ...p, kind: 'put', url: 'user/login' } as APIProp;
  return useSend(payload) as APIResponse<User, GetUserLoginBody>;
}

// Log out
export function useAPI_userLogout(p: GetUserLogoutProps) {
  const payload = { ...p, kind: 'get', url: 'user/logout' } as APIProp;
  return useSend(payload) as APINoResponse<{}>;
}

// Body Types
type GetUserBody = { id: number };
interface GetUserProps extends APIPropTemplate {
  body: GetUserBody;
  onComplete?: OnComplete<User>;
}

type GetUserListBody = {
  page?: number;
  count?: number;
  filter?: [string, string][];
};
interface GetUserListProps extends APIPropTemplate {
  body: GetUserListBody;
  onComplete?: OnComplete<User>;
}
interface GetUserVerifyProps extends Omit<APIPropTemplate, 'body'> {
  onComplete?: OnComplete<User>;
}

type GetUserLoginBody = {
  username: string;
  password: string;
  remember?: boolean;
};
interface GetUserLoginProps extends APIPropTemplate {
  body: GetUserLoginBody;
  onComplete?: OnComplete<User>;
}

interface GetUserLogoutProps extends Omit<APIPropTemplate, 'body'> {
  onComplete?: OnComplete<null>;
}
