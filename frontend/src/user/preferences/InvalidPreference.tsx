import React from 'react';

import { Warning } from '@mui/icons-material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';

import { LumaText } from 'components';
import theme from 'theme/styles';

export default function InvalidPreference() {
  const { t } = useTranslation();
  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      color={theme.palette.primary.main}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="row"
      >
        <LumaText variant="h4">{t('error.error')}</LumaText>
        <Warning sx={{ ml: 1, fontSize: 36 }} />
      </Box>
      <LumaText variant="h6">{t('error.invalidPreferences')}</LumaText>
    </Box>
  );
}
