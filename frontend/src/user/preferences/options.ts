export const menuOptions = [
  {
    id: 'main',
    text: 'user.profile',
  },
  {
    id: 'avatar',
    text: 'user.avatar',
  },
  {
    id: 'banner',
    text: 'user.banner',
  },
  {
    id: 'username',
    text: 'user.username',
  },
  {
    id: 'email',
    text: 'user.email',
  },
  {
    id: 'password',
    text: 'user.password',
  },
  {
    id: 'social',
    text: 'user.social',
  },
  {
    id: 'site',
    text: 'user.siteSettings',
  },
] as const;
export type SettingMenuItems = typeof menuOptions[number]['id'];
