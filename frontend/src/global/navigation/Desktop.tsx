import React from 'react';
import { Box, Grid } from '@mui/material';

import { A } from 'components';
import logo from 'image/logo.svg';
import NavMenuDesktop from 'global/navigation/DesktopMenu';
import NavUserDesktop from 'global/navigation/DesktopUser';
import SearchBar from 'global/navigation/SearchBar';

export default function NavDesktop() {
  return (
    <Grid container flexDirection="row" sx={{ height: '80px' }}>
      {/* Logo */}
      <Grid item container alignContent="center" xs="auto">
        <A url="/">
          <Box
            mr={2}
            my={1}
            sx={{
              width: 160,
              height: 64,
              backgroundImage: `url(${logo})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: 'pointer',
            }}
          />
        </A>
      </Grid>
      {/* Menu */}
      <NavMenuDesktop />
      {/* Search */}
      <Grid item container flexDirection="row" xs={true}>
        <SearchBar />
      </Grid>
      <NavUserDesktop />
    </Grid>
  );
}
