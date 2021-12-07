import { Box } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import theme, { styles } from 'MUIConfig';

import ErrorProvider from 'Error/ErrorContext';
import Footer from 'Global/Footer';
import Navigation from 'Global/Navigation';
import MainRoutes from 'Routes';
import UserProvider from 'User/UserContext';

// Root APP
export default function App() {
  return (
    <ThemeProvider theme={theme}>
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
              <MainRoutes />
            </Box>
            <Box>
              <Footer />
            </Box>
          </Box>
        </UserProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
}
