import { Box } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { BrowserRouter } from 'react-router-dom';

import 'index.css';
import 'languages';
import theme, { styles } from 'MUIConfig';

import ErrorProvider from 'Error/ErrorContext';
import Footer from 'Global/Footer';
import Navigation from 'Global/Navigation';
import Routes from 'Routes';
import UserProvider from 'User/UserContext';
import GlobalProvider from 'Global/GlobalContext';

// Root APP
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <GlobalProvider>
          <ErrorProvider>
            <UserProvider>
              <Navigation />
              <Box
                display="flex"
                flexDirection="column"
                alignItems="stretch"
                minHeight="calc(100vh - 80px)"
              >
                <Box flex="1 0 auto" position="relative" sx={styles.zigzagBG}>
                  <Routes />
                </Box>
                <Box>
                  <Footer />
                </Box>
              </Box>
            </UserProvider>
          </ErrorProvider>
        </GlobalProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
