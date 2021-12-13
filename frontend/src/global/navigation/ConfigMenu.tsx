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
import routes from 'route.config';

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
        navigate: routes.subGame,
      },
      {
        id: 'hacks',
        icon: <FontAwesomeIcon icon={faMoon} color={iconColor} />,
        external: '',
        divider: false,
        navigate: routes.subHack,
      },
      {
        id: 'hallOfFame',
        icon: <FontAwesomeIcon icon={faTrophy} color={iconColor} />,
        external: '',
        divider: false,
        navigate: routes.commonBestof,
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
        navigate: routes.subGfx,
      },
      {
        id: 'models',
        icon: <FontAwesomeIcon icon={faCube} color={iconColor} />,
        external: '',
        divider: false,
        navigate: routes.subModel,
      },
      {
        id: 'sounds',
        icon: <FontAwesomeIcon icon={faHeadphones} color={iconColor} />,
        external: '',
        divider: false,
        navigate: routes.subSfx,
      },
      {
        id: 'tutorials',
        icon: <FontAwesomeIcon icon={faCode} color={iconColor} />,
        external: '',
        divider: false,
        navigate: routes.subHowto,
      },
      {
        id: 'misc',
        icon: <FontAwesomeIcon icon={faQuestionCircle} color={iconColor} />,
        external: '',
        divider: false,
        navigate: routes.subMisc,
      },
    ],
  },
  {
    id: 'community',
    items: [
      {
        id: 'discussions',
        icon: <FontAwesomeIcon icon={faComments} color={iconColor} />,
        external: '',
        divider: false,
        navigate: routes.forum,
      },
      {
        id: 'users',
        icon: <FontAwesomeIcon icon={faUsers} color={iconColor} />,
        external: '',
        divider: true,
        navigate: routes.user,
      },
      {
        id: 'discord',
        icon: <FontAwesomeIcon icon={faDiscord} color={iconColor} />,
        external: CF.SOCIAL_DISCORD,
        divider: false,
        navigate: '#',
      },
      {
        id: 'twitter',
        icon: <FontAwesomeIcon icon={faTwitter} color={iconColor} />,
        external: CF.SOCIAL_TWITTER,
        divider: false,
        navigate: '#',
      },
    ],
  },
] as const;
export default menu;
