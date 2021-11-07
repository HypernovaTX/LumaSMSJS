export interface user {
  uid: number;
  gid: number;
  username: string;
  email: string;
  website: string;
  weburl: string;
  icon: string;
  discord: string;
  twitter: string;
  steam: string;
  reddit: string;
  youtube: string;
  twitch: string;
  def_order_by: string;
  def_order: string;
  skin: number;
  registered_ip: string;
  items_per_page: number;
  show_email: number;
  first_submit: number;
  cookie: string;
  comments: number;
  new_msgs: number;
  join_date: number;
  timezone: number;
  dst: number;
  disp_msg: number;
  icon_dims: string;
  cur_msgs: number;
  show_thumbs: number;
  use_comment_msg: number;
  use_comment_digest: number;
  last_visit: string;
  last_activity: string;
  last_ip: string;
  new_password: number;
  password?: string;
}

export type userList = user[];
