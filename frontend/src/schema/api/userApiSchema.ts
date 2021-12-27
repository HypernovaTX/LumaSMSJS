import { APIPropTemplate, OnComplete } from 'schema/api';
import { PermissionKind, User, UsernameChange } from 'schema/userSchema';

// Get user
export type GetUserBody = { id: number };
export interface GetUserProps extends APIPropTemplate {
  body: GetUserBody;
  onComplete?: OnComplete<User>;
}

// User list
export interface GetUserListBody {
  page?: number;
  count?: number;
  filter?: [string, string][];
}
export interface GetUserListProps extends APIPropTemplate {
  body: GetUserListBody;
  onComplete?: OnComplete<User>;
}

// Verify user login
export interface GetUserVerifyProps extends Omit<APIPropTemplate, 'body'> {
  onComplete?: OnComplete<User>;
}

// Get user's permits
export interface GetUserPermitProps extends Omit<APIPropTemplate, 'body'> {
  onComplete?: OnComplete<PermissionKind[]>;
}

// Login
export interface GetUserLoginBody {
  username: string;
  password: string;
  remember?: boolean;
}
export interface GetUserLoginProps extends APIPropTemplate {
  body: GetUserLoginBody;
  onComplete?: OnComplete<User>;
}

// Update user
export interface UpdateUserBody {
  data: string;
}
export interface UpdateUserProps extends APIPropTemplate {
  body: UpdateUserBody;
  onComplete?: OnComplete<null>;
}

// Update user avatar
export interface UpdateUserAvatarBody {
  avatar: File | null;
}
export interface UpdateUserAvatarProps extends APIPropTemplate {
  body: UpdateUserAvatarBody;
  onComplete?: OnComplete<null>;
}

// Update user banner
export interface UpdateUserBannerBody {
  banner: File | null;
}
export interface UpdateUserBannerProps extends APIPropTemplate {
  body: UpdateUserBannerBody;
  onComplete?: OnComplete<null>;
}

// Username change history
export interface GetUsernameHistoryProps extends APIPropTemplate {
  body: GetUserBody;
  onComplete?: OnComplete<UsernameChange[]>;
}
export interface UpdateUsernameBody {
  username: string;
  password: string;
}

// Update username
export interface UpdateUsernameProps extends APIPropTemplate {
  body: UpdateUsernameBody;
  onComplete?: OnComplete<null>;
}

// Update email
export interface UpdateEmailBody {
  email: string;
  password: string;
}
export interface UpdateEmailProps extends APIPropTemplate {
  body: UpdateEmailBody;
  onComplete?: OnComplete<null>;
}

// Update password
export interface UpdatePasswordBody {
  oldpassword: string;
  newpassword: string;
}
export interface UpdatePasswordProps extends APIPropTemplate {
  body: UpdatePasswordBody;
  onComplete?: OnComplete<null>;
}
