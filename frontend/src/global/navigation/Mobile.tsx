import React, { useState } from 'react';

import { Box, Grid } from '@mui/material';
import Hamburger from 'hamburger-react';

import { A, SlideMenu } from 'components';
import NavMenuMobile from 'global/navigation/MobileMenu';
import NavUserMobile from 'global/navigation/MobileUser';
import logo from 'image/logo.svg';
import { styles } from 'theme/styles';
import SearchBar from './SearchBar';

export default function NavMobile() {
  // States
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Grid
        container
        flexWrap="nowrap"
        flexDirection="row"
        sx={{ height: '80px' }}
      >
        {/* hamburger */}
        <Grid item container xs="auto" alignContent="center">
          <Box zIndex={999}>
            <Box
              style={styles.hamburgerBG}
              display={open ? 'initial' : 'none'}
            />
            <Hamburger toggled={open} toggle={setOpen} />
          </Box>
        </Grid>
        {/* Logo */}
        <Grid
          item
          container
          alignContent="center"
          xs={true}
          justifyContent="center"
        >
          <A url="/" disabled={open}>
            <Box
              sx={{
                width: 100,
                height: 48,
                backgroundImage: `url(${logo})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'pointer',
              }}
            />
          </A>
        </Grid>
        {/* User profile/login section */}
        <Grid item container alignContent="center" xs="auto">
          <NavUserMobile />
        </Grid>
      </Grid>
      <SlideMenu
        show={open}
        direction="right"
        gap={80}
        gapChildren={
          <Grid container>
            <Grid item xs="auto">
              <Box width={80} height={80} />
            </Grid>
            <Grid item container flexDirection="row" xs={true}>
              <SearchBar disabled={!open} />
            </Grid>
          </Grid>
        }
      >
        <Box>
          <NavMenuMobile close={() => setOpen(false)} />
        </Box>
      </SlideMenu>
    </Box>
  );
}
