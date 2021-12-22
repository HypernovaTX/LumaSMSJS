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

import theme from 'theme/styles';
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
        divider: false,
        newWindow: false,
        url: routes.subGame,
      },
      {
        id: 'hacks',
        icon: <FontAwesomeIcon icon={faMoon} color={iconColor} />,
        divider: false,
        newWindow: false,
        url: routes.subHack,
      },
      {
        id: 'hallOfFame',
        icon: <FontAwesomeIcon icon={faTrophy} color={iconColor} />,
        divider: false,
        newWindow: false,
        url: routes.commonBestof,
      },
    ],
  },
  {
    id: 'resources',
    items: [
      {
        id: 'graphics',
        icon: <FontAwesomeIcon icon={faImage} color={iconColor} />,
        divider: false,
        newWindow: false,
        url: routes.subGfx,
      },
      {
        id: 'models',
        icon: <FontAwesomeIcon icon={faCube} color={iconColor} />,
        divider: false,
        newWindow: false,
        url: routes.subModel,
      },
      {
        id: 'sounds',
        icon: <FontAwesomeIcon icon={faHeadphones} color={iconColor} />,
        divider: false,
        newWindow: false,
        url: routes.subSfx,
      },
      {
        id: 'tutorials',
        icon: <FontAwesomeIcon icon={faCode} color={iconColor} />,
        divider: false,
        newWindow: false,
        url: routes.subHowto,
      },
      {
        id: 'misc',
        icon: <FontAwesomeIcon icon={faQuestionCircle} color={iconColor} />,
        divider: false,
        newWindow: false,
        url: routes.subMisc,
      },
    ],
  },
  {
    id: 'community',
    items: [
      {
        id: 'discussions',
        icon: <FontAwesomeIcon icon={faComments} color={iconColor} />,
        divider: false,
        newWindow: false,
        url: routes.forum,
      },
      {
        id: 'users',
        icon: <FontAwesomeIcon icon={faUsers} color={iconColor} />,
        divider: true,
        newWindow: false,
        url: routes.user,
      },
      {
        id: 'discord',
        icon: <FontAwesomeIcon icon={faDiscord} color={iconColor} />,
        divider: false,
        newWindow: true,
        url: routes.urlDiscord,
      },
      {
        id: 'twitter',
        icon: <FontAwesomeIcon icon={faTwitter} color={iconColor} />,
        divider: false,
        newWindow: true,
        url: routes.urlTwitter,
      },
    ],
  },
] as const;
export default menu;
