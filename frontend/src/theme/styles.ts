import { createTheme } from '@mui/material/styles';
import mixColor from 'mix-color';
import image from 'psyw_screen_mfgg.png';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#1EB7F3',
      main: '#044BF0',
      dark: '#0230A8',
      contrastText: '#fff',
    },
    secondary: {
      light: '#FFF266',
      main: '#FCDC3F',
      contrastText: '#000',
    },
    error: {
      main: '#F04254',
      light: '#F04254',
      dark: '#F04254',
      contrastText: '#fff',
    },
    warning: {
      main: '#ffb74d',
      light: '#ffa726',
      dark: '#f57c00',
      contrastText: '#000',
    },
    background: {
      default: '#0E0A33',
    },
    info: {
      main: '#fff266',
    },
    divider: 'rgba(255, 255, 255, 0.25)',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Lato", "Nunito", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 300,
    fontWeightLight: 100,
  },
});
export default theme;

export const slightlyDark = mixColor(
  theme.palette.primary.main,
  theme.palette.primary.dark,
  0.5
);
export const quiteDark = mixColor('#000', theme.palette.primary.dark, 0.8);
export const veryDark = mixColor('#000', theme.palette.primary.dark, 0.5);
export const veryDarkBG = mixColor('#000', theme.palette.primary.dark, 0.4);
export const veryError = mixColor('#000', theme.palette.error.main, 0.5);
export const veryErrorBG = mixColor('#000', theme.palette.error.main, 0.4);
export const styles: { [key: string]: React.CSSProperties } = {
  avatarLarge: {
    width: 128,
    height: 128,
    backgroundColor: theme.palette.primary.main,
    border: `2px solid ${theme.palette.primary.main}`,
  },
  avatarMedium: {
    width: 80,
    height: 80,
    backgroundColor: theme.palette.primary.main,
    border: `2px solid ${theme.palette.primary.main}`,
  },
  bigText: {
    fontWeight: 600,
    textShadow: '2px 2px 10px #000',
    marginBottom: 16,
  },
  hamburgerBG: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    transition: '200ms linear all',
    background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 80%, rgba(0,185,255,0) 100%)`,
  },
  navAvatar: {
    width: 48,
    height: 48,
    backgroundColor: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
  },
  navAvatarMenu: {
    width: 112,
    height: 112,
    backgroundColor: theme.palette.primary.dark,
    border: `2px solid ${theme.palette.primary.dark}`,
  },
  navAvatarMobile: {
    width: 36,
    height: 36,
    backgroundColor: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
  },
  navAvatarMenuMobile: {
    width: 96,
    height: 96,
    backgroundColor: theme.palette.primary.main,
    border: `2px solid ${theme.palette.primary.main}`,
  },
  passwordStrengthBar: {
    height: 4,
  },
  placeholderContainer: {
    background: `linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.75) 100%), url(${image})`,
    backgroundSize: 'cover',
    imageRendering: 'pixelated',
    height: '200vh',
  },
  textbox: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.light,
    borderColor: theme.palette.primary.light,
  },
  textIcon: {
    fontSize: '1.2rem',
    marginRight: 8,
  },
  transition: {
    transition: '200ms linear all',
  },
  zigzagBG: {
    backgroundColor: veryDarkBG,
    backgroundImage: `linear-gradient(135deg, ${veryDark} 25%, transparent 25%), linear-gradient(225deg, ${veryDark} 25%, transparent 25%), linear-gradient(45deg, ${veryDark} 25%, transparent 25%), linear-gradient(315deg, ${veryDark} 25%, ${veryDarkBG} 25%)`,
    backgroundPosition: '40px 0, 40px 0, 0 0, 0 0',
    backgroundSize: '80px 80px',
    backgroundRepeat: 'repeat',
  },
  zigzagBGError: {
    backgroundColor: veryErrorBG,
    backgroundImage: `linear-gradient(135deg, ${veryError} 25%, transparent 25%), linear-gradient(225deg, ${veryError} 25%, transparent 25%), linear-gradient(45deg, ${veryError} 25%, transparent 25%), linear-gradient(315deg, ${veryError} 25%, ${veryErrorBG} 25%)`,
    backgroundPosition: '40px 0, 40px 0, 0 0, 0 0',
    backgroundSize: '80px 80px',
    backgroundRepeat: 'repeat',
  },
};
