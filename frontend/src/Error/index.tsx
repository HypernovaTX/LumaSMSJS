import React, { useContext } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { styles } from 'MUIConfig';
import { ErrorContext } from './ErrorContext';

export default function Error() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { message } = useContext(ErrorContext);

  // States

  return (
    <Box width="100%" height="100%" style={styles}>
      <Grid container>
        <Grid item md={4} xs={8}>
          <Typography variant="h2">{t('error.error')}</Typography>
          <Typography variant="h5">{message}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
