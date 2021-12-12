import React, { useContext, useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { styles } from 'MUIConfig';
import { GlobalContext } from 'global/GlobalContext';
import { UserContext } from 'user/UserContext';
import { useSetTitle } from 'lib';

export default function Logout() {
  // Custom hooks
  const { t } = useTranslation();
  useSetTitle(t('title.logout'));

  // State
  const [started, setStarted] = useState(false);

  // Context
  const { logout, user, clearUser } = useContext(UserContext);
  const { isMobile, nativateToPrevious } = useContext(GlobalContext);

  // Effects
  useEffect(initEffect, [logout, started]);
  useEffect(signOffEffect, [clearUser, nativateToPrevious, user]);

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
    if (started) return;
    setStarted(true);
    logout();
  }

  function signOffEffect() {
    if (user) return;
    clearUser();
    nativateToPrevious();
  }
}
