import { useMediaQuery } from '@mui/material';
import { createTheme, Theme, ThemeProvider } from '@mui/material/styles';
import { createContext, useContext } from 'react';
import { ContextProps } from 'schema';

type ThemeContextType = {
  theme?: Theme;
};

export const ThemeContext = createContext<ThemeContextType>({});

export default function LumaThemeProvider(props: ContextProps) {
  // Custom hooks
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // THEME
  const theme = createTheme({
    palette: {
      // No dark theme set by browser
      mode: prefersDarkMode ? 'light' : 'light',
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

  // Output
  return (
    <ThemeProvider theme={theme}>
      <ThemeContext.Provider
        value={{
          theme,
        }}
      >
        {props.children}
      </ThemeContext.Provider>
    </ThemeProvider>
  );
}

export function useLumaTheme() {
  return useContext(ThemeContext);
}
