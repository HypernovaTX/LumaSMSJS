import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
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
      },
      {
        id: 'hacks',
        icon: <FontAwesomeIcon icon={faMoon} color={iconColor} />,
        external: '',
      },
      {
        id: 'hallOfFame',
        icon: <FontAwesomeIcon icon={faTrophy} color={iconColor} />,
        external: '',
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
      },
      {
        id: 'models',
        icon: <FontAwesomeIcon icon={faCube} color={iconColor} />,
        external: '',
      },
      {
        id: 'sounds',
        icon: <FontAwesomeIcon icon={faHeadphones} color={iconColor} />,
        external: '',
      },
      {
        id: 'tutorials',
        icon: <FontAwesomeIcon icon={faCode} color={iconColor} />,
        external: '',
      },
      {
        id: 'misc',
        icon: <FontAwesomeIcon icon={faQuestionCircle} color={iconColor} />,
        external: '',
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
      },
      {
        id: 'users',
        icon: <FontAwesomeIcon icon={faUsers} color={iconColor} />,
        external: '',
      },
      {
        id: 'rules',
        icon: <FontAwesomeIcon icon={faBook} color={iconColor} />,
        external: '',
      },
      {
        id: 'discord',
        icon: <FontAwesomeIcon icon={faDiscord} color={iconColor} />,
        external: CF.SOCIAL_DISCORD,
      },
      {
        id: 'twitter',
        icon: <FontAwesomeIcon icon={faTwitter} color={iconColor} />,
        external: CF.SOCIAL_TWITTER,
      },
    ],
  },
] as const;
export default menu;
