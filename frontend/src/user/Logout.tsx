import React, { useContext, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAPI_userLogout } from 'api';
import { styles } from 'theme/styles';
import { GlobalContext } from 'global/GlobalContext';
import { UserContext } from 'user/UserContext';
import { useSetTitle } from 'lib';
import routes from 'route.config';

export default function Logout() {
  // Custom hooks
  const { t } = useTranslation();
  useSetTitle(t('title.logoff'));

  // Context
  const { clearUser, user } = useContext(UserContext);
  const { isMobile, navigate, toast } = useContext(GlobalContext);

  // Data
  // - User log out
  const { execute: logout } = useAPI_userLogout({
    skip: true,
    onComplete: () => {
      clearUser();
      setTimeout(() => {
        navigate(routes._index);
      }, 2000);
    },
    onError: (err) => {
      toast(err.message, 'error');
      navigate(routes._index);
    },
  });

  // Effects
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(initEffect, []);

  // Output
  return (
    <Box
      flex="1 0 auto"
      width="100%"
      style={styles.zigzagBG}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        my={8}
        mx={4}
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        minWidth="25vw"
      >
        <Box mr={isMobile ? 1 : 2}>
          <CircularProgress size={isMobile ? 16 : 32} color="secondary" />
        </Box>
        <Typography variant={isMobile ? 'h5' : 'h3'} style={styles.bigText}>
          {t('user.logoutMessage')}
        </Typography>
      </Box>
    </Box>
  );

  // Effect hoists
  function initEffect() {
    if (!user) navigate(routes._index);
    else logout();
  }
}
