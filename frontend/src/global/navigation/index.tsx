import React, { useContext } from 'react';
import { AppBar, Box, Container } from '@mui/material';

import { GlobalContext } from 'global/GlobalContext';
import NavDesktop from 'global/navigation/DesktopNav';
import NavMobile from 'global/navigation/MobileNav';
import theme from 'MUIConfig';

export default function Navigation() {
  // Context
  const { isMobile } = useContext(GlobalContext);

  // Output
  return (
    <AppBar position="sticky" color="transparent">
      <Box sx={{ backgroundColor: theme.palette.primary.dark, zIndex: 999 }}>
        <Container maxWidth="xl">
          {isMobile ? <NavMobile /> : <NavDesktop />}
        </Container>
      </Box>
    </AppBar>
  );
}
