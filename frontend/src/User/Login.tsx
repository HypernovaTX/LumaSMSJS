import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import LoginIcon from '@mui/icons-material/Login';
import { styles } from 'MUIConfig';
import { LumaCheckbox, LumaInput } from 'lib/LumaComponents';

export default function Login() {
  // Custom hooks
  const { t } = useTranslation();

  // Output
  return (
    <Box
      width="100%"
      height="100%"
      position="absolute"
      style={styles.zigzagBG}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        my={2}
        mx={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minWidth="25vw"
      >
        <Typography variant="h2" style={styles.bigText}>
          {t('user.login')}
        </Typography>
        <Box my={1} width="100%">
          <LumaInput fullWidth label={t('user.username')} />
        </Box>
        <Box my={1} width="100%">
          <LumaInput fullWidth label={t('user.password')} type="password" />
        </Box>
        <Box my={0} width="100%">
          <FormGroup>
            <FormControlLabel
              control={<LumaCheckbox />}
              label={`${t('user.remember')}`}
            />
          </FormGroup>
        </Box>
        <Box my={2} width="100%">
          <Button
            color="secondary"
            variant="contained"
            fullWidth
            size="large"
            startIcon={<LoginIcon />}
          >
            {t('user.login')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
