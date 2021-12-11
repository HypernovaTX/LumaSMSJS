import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar, Box, Button, CircularProgress, Grid } from '@mui/material';
import { Login, PersonAdd } from '@mui/icons-material';
import Hamburger from 'hamburger-react';

import { A, SlideMenu } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import logo from 'image/logo.svg';
import theme from 'MUIConfig';
import { UserContext } from 'user/UserContext';
import NavMenuMobile from 'global/navigation/MenuMobile';

export default function NavMobile() {
  // Custom hooks
  const { t } = useTranslation();

  // States
  const [open, setOpen] = useState(false);

  // Context
  const { avatar, user, loading, login } = useContext(UserContext);
  const { navigate } = useContext(GlobalContext);

  return (
    <>
      <Grid container flexDirection="row" sx={{ height: '80px' }}>
        {/* hamburger */}
        <Grid item container xs="auto" alignContent="center">
          <Box mr={3} zIndex={999}>
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
        {/* Nav */}
        {/* User profile/login section */}
        <Grid item container alignContent="center" xs="auto">
          {!loading ? (
            login && user ? (
              // logged in
              <Grid container item>
                <Grid container item alignContent="center" xs="auto">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: theme.palette.primary.main,
                      border: `1px solid ${theme.palette.primary.main}`,
                    }}
                    variant="rounded"
                    alt={user?.username || t('main.unknown')}
                    src={avatar}
                  />
                </Grid>
              </Grid>
            ) : (
              // guest
              <>
                <Button
                  color="secondary"
                  variant="contained"
                  startIcon={<Login />}
                  sx={{ mr: 1, height: '2rem' }}
                  onClick={() => navigate('/login')}
                >
                  {t('user.login')}
                </Button>
                <Button
                  color="secondary"
                  variant="outlined"
                  startIcon={<PersonAdd />}
                  sx={{ ml: 1, height: '2rem' }}
                  onClick={() => navigate('/register')}
                >
                  {t('user.register')}
                </Button>
              </>
            )
          ) : (
            // loading
            <CircularProgress size={32} />
          )}
        </Grid>
      </Grid>
      <SlideMenu show={open} direction="right" gap={80}>
        <Box>
          <NavMenuMobile close={() => setOpen(false)} />
        </Box>
      </SlideMenu>
    </>
  );
}
