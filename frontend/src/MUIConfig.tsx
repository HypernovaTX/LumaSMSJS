import { createTheme } from '@mui/material/styles';

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
  transition: {
    transition: '200ms linear all',
  },
};
