import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCode,
  faComments,
  faCube,
  faGamepad,
  faHeadphones,
  faImage,
  faMoon,
  faQuestionCircle,
  faTrophy,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';

import CF from 'config';
import theme from 'MUIConfig';

// Types
export type Menus = typeof menu[number]['id'];
export type SubMenus = typeof menu[number]['items'][number]['id'];

// Menu Template
const iconColor = theme.palette.primary.contrastText;
const menu = [
  {
    id: 'games',
    items: [
      {
        id: 'games',
        icon: <FontAwesomeIcon icon={faGamepad} color={iconColor} />,
        external: '',
        divider: false,
      },
      {
        id: 'hacks',
        icon: <FontAwesomeIcon icon={faMoon} color={iconColor} />,
        external: '',
        divider: false,
      },
      {
        id: 'hallOfFame',
        icon: <FontAwesomeIcon icon={faTrophy} color={iconColor} />,
        external: '',
        divider: false,
      },
    ],
  },
  {
    id: 'resources',
    items: [
      {
        id: 'graphics',
        icon: <FontAwesomeIcon icon={faImage} color={iconColor} />,
        external: '',
        divider: false,
      },
      {
        id: 'models',
        icon: <FontAwesomeIcon icon={faCube} color={iconColor} />,
        external: '',
        divider: false,
      },
      {
        id: 'sounds',
        icon: <FontAwesomeIcon icon={faHeadphones} color={iconColor} />,
        external: '',
        divider: false,
      },
      {
        id: 'tutorials',
        icon: <FontAwesomeIcon icon={faCode} color={iconColor} />,
        external: '',
        divider: false,
      },
      {
        id: 'misc',
        icon: <FontAwesomeIcon icon={faQuestionCircle} color={iconColor} />,
        external: '',
        divider: false,
      },
    ],
  },
  {
    id: 'community',
    items: [
      {
        id: 'forums',
        icon: <FontAwesomeIcon icon={faComments} color={iconColor} />,
        external: '',
        divider: false,
      },
      {
        id: 'users',
        icon: <FontAwesomeIcon icon={faUsers} color={iconColor} />,
        external: '',
        divider: true,
      },
      {
        id: 'discord',
        icon: <FontAwesomeIcon icon={faDiscord} color={iconColor} />,
        external: CF.SOCIAL_DISCORD,
        divider: false,
      },
      {
        id: 'twitter',
        icon: <FontAwesomeIcon icon={faTwitter} color={iconColor} />,
        external: CF.SOCIAL_TWITTER,
        divider: false,
      },
    ],
  },
] as const;
export default menu;
