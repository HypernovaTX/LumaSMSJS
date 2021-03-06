import { Box } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

import 'index.css';
import 'languages';

import ErrorProvider from 'error/ErrorContext';
import Footer from 'global/Footer';
import GlobalProvider from 'global/GlobalContext';
import LumaThemeProvider from 'theme/ThemeContext';
import Navigation from 'global/navigation';
import Routes from 'Routes';
import UserProvider from 'user/UserContext';

// Root APP
export default function App() {
  return (
    <BrowserRouter>
      <LumaThemeProvider>
        <GlobalProvider>
          <ErrorProvider>
            <UserProvider>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="stretch"
                minHeight="100vh"
              >
                <Navigation />
                <Box display="flex" flexDirection="column" flex="1 0 auto">
                  <Routes />
                </Box>
                <Footer />
              </Box>
            </UserProvider>
          </ErrorProvider>
        </GlobalProvider>
      </LumaThemeProvider>
    </BrowserRouter>
  );
}
