import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Grid } from '@mui/material';

import { LumaInput, LumaText } from 'components';
import { User } from 'schema/userSchema';

interface ProfileSettingsProps {
  user?: User;
  update: (p: User) => void;
}

export default function UserProfileSettings(props: ProfileSettingsProps) {
  // Custom hooks
  const { t } = useTranslation();

  // State

  // Output
  return (
    <Box>
      <Grid container>
        <Grid container item xs={4}>
          <LumaText>{t('user.username')}</LumaText>
        </Grid>
        <Grid container item xs={8}>
          <LumaInput />
        </Grid>
      </Grid>
    </Box>
  );
}
