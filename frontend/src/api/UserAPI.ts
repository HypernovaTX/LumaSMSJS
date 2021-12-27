import { useFetch, useSend } from 'api/apiCore';
import { AnyObject } from 'schema';
import {
  APINoResponse,
  APIProp,
  APIPropsNoBody,
  APIResponse,
  GetUserListBody,
  GetUserListProps,
  GetUserLoginBody,
  GetUserLoginProps,
  GetUsernameHistoryProps,
  GetUserPermitProps,
  GetUserProps,
  GetUserVerifyProps,
  UpdateEmailProps,
  UpdatePasswordProps,
  UpdateUserAvatarProps,
  UpdateUserBannerProps,
  UpdateUsernameProps,
  UpdateUserProps,
} from 'schema/api';
import { PermissionKind, User, UsernameChange } from 'schema/userSchema';

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
  return useFetch(payload) as APIResponse<User, undefined>;
}

// Get current user login
export function useAPI_verify(p: GetUserVerifyProps) {
  const payload = { ...p, kind: 'get', url: 'user/verify' } as APIProp;
  return useFetch(payload) as APIResponse<User, undefined>;
}

// Get current user permissions
export function useAPI_permissions(p: GetUserPermitProps) {
  const payload = { ...p, kind: 'get', url: 'user/permission' } as APIProp;
  return useFetch(payload) as APIResponse<PermissionKind[], undefined>;
}

// Login
export function useAPI_userLogin(p: GetUserLoginProps) {
  const payload = { ...p, kind: 'put', url: 'user/login' } as APIProp;
  return useSend(payload) as APIResponse<User, GetUserLoginBody>;
}

// Log out
export function useAPI_userLogout(p: APIPropsNoBody) {
  const payload = { ...p, kind: 'get', url: 'user/logout' } as APIProp;
  return useSend(payload) as APINoResponse<{}>;
}

// Update user settings
export function useAPI_userUpdate(p: UpdateUserProps) {
  const payload = { ...p, kind: 'patch', url: 'user' } as APIProp;
  return useSend(payload) as APINoResponse<{}>;
}

// Update user avatar
export function useAPI_userAvatar(p: UpdateUserAvatarProps) {
  const payload = {
    ...p,
    kind: 'patch',
    url: 'user/avatar',
    file: true,
  } as APIProp;
  return useSend(payload) as APINoResponse<{}>;
}

// Delete avatar
export function useAPI_userDeleteAvatar(p: APIPropsNoBody) {
  const payload = { ...p, kind: 'delete', url: 'user/avatar' } as APIProp;
  return useSend(payload) as APINoResponse<{}>;
}

// Update user banner
export function useAPI_userBanner(p: UpdateUserBannerProps) {
  const payload = {
    ...p,
    kind: 'patch',
    url: 'user/banner',
    file: true,
  } as APIProp;
  return useSend(payload) as APINoResponse<{}>;
}

// Delete avatar
export function useAPI_userDeleteBanner(p: APIPropsNoBody) {
  const payload = { ...p, kind: 'delete', url: 'user/banner' } as APIProp;
  return useSend(payload) as APINoResponse<{}>;
}

// Get username change history
export function useAPI_usernameHistory(p: GetUsernameHistoryProps) {
  const url = `user/${p.body.id}/usernames`;
  const cleanedProps: AnyObject = p;
  delete cleanedProps.body;
  const payload = { ...cleanedProps, kind: 'get', url } as APIProp;
  return useFetch(payload) as APIResponse<UsernameChange[], undefined>;
}

// Username change
export function useAPI_usernameUpdate(p: UpdateUsernameProps) {
  const payload = { ...p, kind: 'patch', url: 'use+r/username' } as APIProp;
  return useSend(payload) as APINoResponse<{}>;
}

// Email change
export function useAPI_emailUpdate(p: UpdateEmailProps) {
  const payload = { ...p, kind: 'patch', url: 'user/email' } as APIProp;
  return useSend(payload) as APINoResponse<{}>;
}

// Password change
export function useAPI_passwordUpdate(p: UpdatePasswordProps) {
  const payload = { ...p, kind: 'patch', url: 'user/password' } as APIProp;
  return useSend(payload) as APINoResponse<{}>;
}
