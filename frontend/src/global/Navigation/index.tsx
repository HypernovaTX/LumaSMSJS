import React, { useContext } from 'react';
import { AppBar, Box, Container } from '@mui/material';

import { GlobalContext } from 'Global/GlobalContext';
import NavDesktop from 'Global/Navigation/Desktop';
import NavMobile from 'Global/Navigation/Mobile';
import theme from 'MUIConfig';

export default function Navigation() {
  // Context
  const { isMobile } = useContext(GlobalContext);

  // Output
  return (
    <AppBar position="sticky" color="transparent">
      <Box sx={{ backgroundColor: theme.palette.primary.dark }}>
        <Container maxWidth="xl">
          {isMobile ? <NavMobile /> : <NavDesktop />}
        </Container>
      </Box>
    </AppBar>
  );
}
