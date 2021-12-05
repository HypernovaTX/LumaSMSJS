import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#1EB7F3',
      main: '#085BC7',
      dark: '#00388E',
    },
    secondary: {
      light: '#FFF266',
      main: '#FCDC3F',
    },
    error: {
      main: '#F04254',
    },
    background: {
      default: '#0E0A33',
    },
  },
});
export default theme;
