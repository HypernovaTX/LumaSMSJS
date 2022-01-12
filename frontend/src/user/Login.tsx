import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

import { useAPI_userLogin } from 'api';
import {
  A,
  ErrorLabel,
  LumaButton,
  LumaCheckbox,
  LumaInput,
  LumaText,
} from 'components';
import { GlobalContext } from 'global/GlobalContext';
import { useSetTitle } from 'lib';
import routes from 'route.config';
import { TextInputEvent } from 'schema';
import { styles } from 'theme/styles';
import { UserContext } from 'user/UserContext';

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
  useSetTitle(t('title.login'));

  // Context
  const { loadUser: reloadUser, user } = useContext(UserContext);
  const { isMobile, nativateToPrevious, navigate, toast } =
    useContext(GlobalContext);

  // States
  const [loginForm, setLoginForm] = useState<UserLogin>(defaultForm);
  const [emptyUser, setEmptyUser] = useState(false);
  const [emptyPassword, setEmptyPassword] = useState(false);

  // Data
  const { execute: login, loading: loginLoading } = useAPI_userLogin({
    body: loginForm,
    onComplete: (data) => {
      if (reloadUser) reloadUser();
      if (data?.username) {
        toast(t('main.welcomeBack', { username: data.username }), 'info');
      }
      nativateToPrevious();
    },
    onError: (err) => {
      toast(err.message, 'error');
    },
  });

  // Effect
  useEffect(returnToHomeEffect, [navigate, user]);

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
        my={isMobile ? 4 : 8}
        mx={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minWidth="25vw"
      >
        {/* Title */}
        <LumaText isTitle>{t('user.login')}</LumaText>
        {/* Username/password input */}
        <Box my={1} width="100%">
          <LumaInput
            disabled={loginLoading}
            fullWidth
            label={t('user.username')}
            name="username"
            error={emptyUser}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            value={loginForm.username}
            size={isMobile ? 'small' : 'medium'}
          />
          <Box width="100%" mr={2}>
            <ErrorLabel in={emptyUser} message={t('error.blankInput')} />
          </Box>
        </Box>
        <Box my={1} width="100%">
          <LumaInput
            disabled={loginLoading}
            fullWidth
            label={t('user.password')}
            name="password"
            type="password"
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            value={loginForm.password}
            error={emptyPassword}
            size={isMobile ? 'small' : 'medium'}
          />
          <Box width="100%" mr={2}>
            <ErrorLabel in={emptyPassword} message={t('error.blankInput')} />
          </Box>
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
                  size={isMobile ? 'small' : 'medium'}
                />
              }
              label={`${t('user.remember')}`}
            />
          </FormGroup>
        </Box>
        {/* Sign In button */}
        <Box my={2} width="100%">
          <LumaButton
            disabled={loginLoading || emptyUser || emptyPassword}
            color="secondary"
            variant="contained"
            fullWidth
            size={isMobile ? 'medium' : 'large'}
            startIcon={loginLoading ? undefined : <LoginIcon />}
            onClick={handleLoginButton}
          >
            {loginLoading ? (
              <CircularProgress size={26} color="secondary" />
            ) : (
              t('user.login')
            )}
          </LumaButton>
        </Box>
        {/* Bottom texts */}
        <Box my={isMobile ? 0 : 1} width="100%">
          <Box>
            {t('user.dontHaveAccount')}{' '}
            <A disabled={loginLoading} url={routes.userRegister}>
              {t('user.signup')}
            </A>
          </Box>
          <Box>
            <A disabled={loginLoading} url="#">
              {t('user.forget')}
            </A>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // Handles
  function handleInputChange(e: TextInputEvent) {
    let form = loginForm;
    if (e.target.name === 'username') {
      if (emptyUser && e.target.value) {
        setEmptyUser(false);
      }
      form = { ...loginForm, username: e.target.value };
    }
    if (e.target.name === 'password') {
      if (emptyPassword && e.target.value) {
        setEmptyPassword(false);
      }
      form = { ...loginForm, password: e.target.value };
    }
    setLoginForm(form);
  }
  function handleInputBlur(e: TextInputEvent) {
    let form = loginForm;
    if (e.target.name === 'username') {
      if (!e.target.value) {
        setEmptyUser(true);
      }
      form = { ...loginForm, username: e.target.value };
    }
    if (e.target.name === 'password') {
      if (!e.target.value) {
        setEmptyPassword(true);
      }
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

  function handleLoginButton() {
    if (loginLoading) return;
    if (!loginForm.username) {
      setEmptyUser(true);
      return;
    }
    if (!loginForm.password) {
      setEmptyPassword(true);
      return;
    }
    login();
  }

  // Effect hoists
  function returnToHomeEffect() {
    if (user) {
      navigate(routes._index);
    }
  }
}
