import React, { useContext } from 'react';

import { Box, Container, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { styles } from 'MUIConfig';
import { ErrorContext } from 'Error/ErrorContext';
import { GlobalContext } from 'Global/GlobalContext';
import { LumaButton } from 'Lib';

export default function Error() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { error } = useContext(ErrorContext);
  const { navigate } = useContext(GlobalContext);

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
      <Container>
        <Grid container flexDirection="column">
          <Box mx={2} my={1}>
            <Typography variant="h2">
              {error
                ? `${t('error.error')} ${error?.code ?? ''}`
                : t('test.title')}
            </Typography>
          </Box>
          <Box mx={2} my={1}>
            <Typography variant="h5">
              {error?.message ?? t('test.sub')}
            </Typography>
          </Box>
          <Box mx={2} my={1}>
            <LumaButton
              onClick={() => navigate('/')}
              variant="contained"
              size="large"
            >
              {error ? t('main.goHome') : t('main.unknown')}
            </LumaButton>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
