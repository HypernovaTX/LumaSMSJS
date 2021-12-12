import { useContext } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCogs,
  faEnvelope,
  faFileUpload,
  faHeart,
  faLock,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Logout } from '@mui/icons-material';

import theme from 'MUIConfig';
import routes from 'route.config';
import { UserContext } from 'user/UserContext';

// This is a React hook
export default function useUserOptions() {
  // Const
  const { contrastText } = theme.palette.primary;

  // Context
  const { user } = useContext(UserContext);

  // Component
  const FA = (props: { icon: IconProp }) => (
    <FontAwesomeIcon icon={props.icon} color={contrastText} />
  );

  // MAIN USER OPTIONS
  const userOptions = [
    {
      id: 'profile',
      divider: false,
      icon: <FA icon={faUser} />,
      staff: false,
      translation: 'nav.profile',
      url: `${routes.user}/${user?.uid ?? 0}`,
    },
    {
      id: 'DM',
      divider: true,
      icon: <FA icon={faEnvelope} />,
      staff: false,
      translation: 'nav.DM',
      url: routes.profileDM,
    },
    {
      id: 'staff',
      divider: true,
      icon: <FA icon={faLock} />,
      staff: true,
      translation: 'nav.staff',
      url: routes.staff,
    },
    {
      id: 'favorites',
      divider: false,
      icon: <FA icon={faHeart} />,
      staff: false,
      translation: 'nav.favorites',
      url: routes.profileFavorites,
    },
    {
      id: 'submissions',
      divider: false,
      icon: <FA icon={faFileUpload} />,
      staff: false,
      translation: 'nav.mySubmissions',
      url: routes.profileSubmissions,
    },
    {
      id: 'preferences',
      divider: true,
      icon: <FA icon={faCogs} />,
      staff: false,
      translation: 'nav.preferences',
      url: routes.profileSettings,
    },
    {
      id: 'logout',
      divider: false,
      icon: <Logout fontSize="small" sx={{ color: contrastText }} />,
      staff: false,
      translation: 'nav.logout',
      url: routes.userLogout,
    },
  ] as const;

  return userOptions;
}
