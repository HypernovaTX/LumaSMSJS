import { createTheme } from '@mui/material/styles';
import image from 'psyw_screen_mfgg.png';

const theme = createTheme({
  palette: {
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
      contrastText: '#fff',
    },
    background: {
      default: '#0E0A33',
    },
    info: {
      main: '#fff266',
    },
    divider: 'rgba(255,255,255,0.25)',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Nunito", "Helvetica", "Arial", sans-serif',
  },
});
export default theme;

export const styles: { [key: string]: React.CSSProperties } = {
  bigText: {
    fontWeight: 600,
    textShadow: '2px 2px 10px #000',
    marginBottom: 8,
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
  transition: {
    transition: '200ms linear all',
  },
  zigzagBG: {
    backgroundColor: '#000043',
    backgroundImage:
      'linear-gradient(135deg, #000356 25%, transparent 25%), linear-gradient(225deg, #000356 25%, transparent 25%), linear-gradient(45deg, #000356 25%, transparent 25%), linear-gradient(315deg, #000356 25%, #000043 25%)',
    backgroundPosition: '40px 0, 40px 0, 0 0, 0 0',
    backgroundSize: '80px 80px',
    backgroundRepeat: 'repeat',
  },
};
