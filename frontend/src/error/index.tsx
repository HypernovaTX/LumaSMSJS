import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Container, Grid, Typography } from '@mui/material';

import { LumaButton } from 'components';
import { ErrorContext } from 'error/ErrorContext';
import { GlobalContext } from 'global/GlobalContext';
import { useSetTitle } from 'lib';
import { styles } from 'theme/styles';
import routes from 'route.config';
import { ErrorObj } from 'schema';

interface ErrorProps {
  error?: ErrorObj;
}

export default function Error(props: ErrorProps) {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { error, setError } = useContext(ErrorContext);
  const { isMobile, navigate } = useContext(GlobalContext);

  // Special custom hook
  useSetTitle(t(props.error || error ? 'title.error' : 'title.testPage'));

  // Output
  return (
    <Box
      flex="1 0 auto"
      width="100%"
      style={props.error || error ? styles.zigzagBGError : styles.zigzagBG}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Container>
        <Grid container flexDirection="column">
          <Box mx={2} my={1}>
            <Typography variant={isMobile ? 'h4' : 'h2'}>
              {props.error || error
                ? `${t('error.error')} ${
                    props.error?.code ?? error?.code ?? ''
                  }`
                : t('test.title')}
            </Typography>
          </Box>
          <Box mx={2} my={1}>
            <Typography variant={isMobile ? 'h6' : 'h5'}>
              {props.error?.message ?? error?.message ?? t('test.sub')}
            </Typography>
          </Box>
          <Box mx={2} my={4}>
            <LumaButton
              onClick={handleGoHome}
              variant="contained"
              size="large"
              color={props.error || error ? 'error' : undefined}
            >
              {error || props.error ? t('main.goHome') : t('main.unknown')}
            </LumaButton>
          </Box>
        </Grid>
      </Container>
    </Box>
  );

  // Handles
  function handleGoHome() {
    setError(undefined);
    navigate(routes._index);
  }
}
