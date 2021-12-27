export interface User {
  uid?: number;
  gid?: number;
  username?: string;
  email?: string;
  website?: string;
  weburl?: string;
  icon?: string;
  discord?: string;
  twitter?: string;
  steam?: string;
  reddit?: string;
  youtube?: string;
  twitch?: string;
  def_order_by?: string;
  def_order?: string;
  skin?: number;
  registered_ip?: string;
  items_per_page?: number;
  show_email?: number;
  first_submit?: number;
  cookie?: string;
  comments?: number;
  new_msgs?: number;
  join_date?: number;
  timezone?: number;
  dst?: number;
  disp_msg?: number;
  icon_dims?: string;
  cur_msgs?: number;
  show_thumbs?: number;
  use_comment_msg?: number;
  use_comment_digest?: number;
  last_visit?: number;
  last_activity?: number;
  last_password?: number;
  last_ip?: string;
  new_password?: number;
  password?: string;
  avatar_file?: string;
  banner?: string;
  banner_file?: string;
  birthday?: string;
  birthday_privacy?: number;
  location?: string;
  country?: string;
  pronoun?: string;
  title?: string;
  bio?: string;
  signature?: string;
  favorite_game?: string;
  switch_code?: string;
}
export type UserKeys = keyof User;
export interface UserPermissions {
  moderator: number;
  acp_access: number;
  acp_modq: number;
  acp_users: number;
  acp_news: number;
  can_msg_users: number;
  acp_super: number;
  can_submit: number;
  can_comment: number;
  can_report: number;
  can_modify: number;
  can_msg: number;
  use_bbcode: number;
  edit_comment: number;
  delete_comment: number;
}
export interface UserPermissionFull extends UserPermissions {
  gid: number;
  group_name: string;
  group_title: string;
  msg_capacity: number;
  name_prefix: string;
  name_suffix: string;
}
export type PermissionKind = keyof UserPermissions;
export type PermissionArray = PermissionKind[];
export const invalidPermissionKeys = [
  'gid',
  'group_name',
  'group_title',
  'msg_capacity',
  'name_prefix',
  'name_suffix',
];
export interface UsernameChange {
  unrid: number;
  uid: number;
  old_username: string;
  new_username: string;
  date: number;
}
export const invalidStaffUserUpdateKeys = [
  'uid',
  'gid',
  'join_date',
  'last_active',
  'last_password',
  'last_ip',
  'last_visit',
  'registered_ip',
  'avatar_file',
  'banner_file',
];
export const invalidUserUpdateKeys = [
  ...invalidStaffUserUpdateKeys,
  'email',
  'password',
  'username',
];
