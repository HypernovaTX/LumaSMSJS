import React, { useContext, useState } from 'react';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import LoginIcon from '@mui/icons-material/Login';
import { styles } from 'MUIConfig';
import { LumaButton, LumaCheckbox, LumaInput, Url } from 'lib/LumaComponents';
import { useAPI_userLogin } from 'API';
import { UserContext } from 'User/UserContext';
import { GlobalContext } from 'Global/GlobalContext';

type UserLogin = {
  username: string;
  password: string;
  remember?: boolean;
};

const defaultForm = {
  username: '',
  password: '',
};

export default function Login() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { loadUser: reloadUser } = useContext(UserContext);
  const { toast, prevPath, navigate } = useContext(GlobalContext);

  // States
  const [loginForm, setLoginForm] = useState<UserLogin>(defaultForm);

  // Data
  const { execute: login, loading: loginLoading } = useAPI_userLogin({
    body: loginForm,
    onComplete: (data) => {
      if (reloadUser) reloadUser();
      if (data?.username) {
        toast(t('main.welcomeBack', { username: data.username }), 'info');
      }
      navigate(prevPath || '/');
    },
    onError: (err) => {
      toast(err.message, 'error');
    },
  });

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
        {/* Title */}
        <Typography variant="h2" style={styles.bigText}>
          {t('user.login')}
        </Typography>
        {/* Username/password input */}
        <Box my={1} width="100%">
          <LumaInput
            disabled={loginLoading}
            fullWidth
            label={t('user.username')}
            name="username"
            onChange={handleInputChange}
            value={loginForm.username}
          />
        </Box>
        <Box my={1} width="100%">
          <LumaInput
            disabled={loginLoading}
            fullWidth
            label={t('user.password')}
            name="password"
            type="password"
            onChange={handleInputChange}
            value={loginForm.password}
          />
        </Box>
        {/* Remember Me */}
        <Box my={0} width="100%">
          <FormGroup>
            <FormControlLabel
              control={
                <LumaCheckbox
                  disabled={loginLoading}
                  name="remember"
                  onChange={handleCheckbox}
                  value={!!loginForm.remember}
                />
              }
              label={`${t('user.remember')}`}
            />
          </FormGroup>
        </Box>
        {/* Sign In button */}
        <Box my={2} width="100%">
          <LumaButton
            disabled={loginLoading}
            color="secondary"
            variant="contained"
            fullWidth
            size="large"
            startIcon={loginLoading ? undefined : <LoginIcon />}
            onClick={loginButtionClick}
          >
            {loginLoading ? (
              <CircularProgress size={26} color="secondary" />
            ) : (
              t('user.login')
            )}
          </LumaButton>
        </Box>
        {/* Bottom texts */}
        <Box my={1} width="100%">
          <Typography>
            {t('user.dontHaveAccount')}{' '}
            <Url disabled={loginLoading} click={() => {}}>
              {t('user.signup')}
            </Url>
          </Typography>
          <Typography>
            <Url disabled={loginLoading} click={() => {}}>
              {t('user.forget')}
            </Url>
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // Callbacks
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let form = loginForm;
    if (e.target.name === 'username') {
      form = { ...loginForm, username: e.target.value };
    }
    if (e.target.name === 'password') {
      form = { ...loginForm, password: e.target.value };
    }
    setLoginForm(form);
  }

  function handleCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    let form = loginForm;
    if (e.target.name === 'remember') {
      form = { ...loginForm, remember: e.target.checked };
    }
    setLoginForm(form);
  }

  function loginButtionClick() {
    if (loginLoading) return;
    login();
  }
}
