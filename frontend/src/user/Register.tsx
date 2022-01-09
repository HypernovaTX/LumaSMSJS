import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

import { useAPI_userLogin, useAPI_userRegister } from 'api';
import {
  A,
  ErrorLabel,
  LumaButton,
  LumaCheckbox,
  LumaInput,
  LumaText,
} from 'components';
import { GlobalContext } from 'global/GlobalContext';
import { emailRegex, useSetTitle } from 'lib';
import { TextInputEvent } from 'schema';
import { styles } from 'theme/styles';
import { PasswordStrength } from 'user/preferences/PasswordStrength';
import { UserContext } from 'user/UserContext';
import routes from 'route.config';

interface UserRegister {
  username: string;
  email: string;
  password: string;
  verify: string;
  remember?: boolean;
}

interface RegisterError {
  username: boolean;
  email: boolean;
  password: boolean;
  verify: boolean;
}

const defaultForm: UserRegister = {
  username: '',
  email: '',
  password: '',
  verify: '',
};

const defaultError: RegisterError = {
  username: false,
  email: false,
  password: false,
  verify: false,
};

export default function Register() {
  // Custom hooks
  const { t } = useTranslation();
  useSetTitle(t('title.register'));

  // Context
  const { loadUser: reloadUser, user } = useContext(UserContext);
  const { isMobile, navigate, toast } = useContext(GlobalContext);

  // States
  const [registerForm, setRegisterForm] = useState<UserRegister>(defaultForm);
  const [error, setError] = useState<RegisterError>(defaultError);
  const [passwordOk, setPasswordOk] = useState(false);

  // Data
  const { execute: register, loading: registerLoading } = useAPI_userRegister({
    body: registerForm,
    onComplete: () => {},
    onError: (err) => {
      toast(err.message, 'error');
    },
  });

  // Memo
  const verified = useMemo(verifiedMemo, [
    error.email,
    error.password,
    error.username,
    error.verify,
    registerForm.email,
    registerForm.password,
    registerForm.username,
    registerForm.verify,
  ]);

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
        <LumaText isTitle>{t('user.register')}</LumaText>
        {/* Username input */}
        <Box my={1} width="100%">
          <LumaInput
            disabled={registerLoading}
            fullWidth
            error={error.username}
            label={t('user.username')}
            name="username"
            onChange={handleInputChange}
            onBlur={handleUsernameVerify}
            value={registerForm.username}
            size={isMobile ? 'small' : 'medium'}
          />
          <Box width="100%" mr={2}>
            <ErrorLabel in={error.username} message={t('error.blankInput')} />
          </Box>
        </Box>
        {/* Email input */}
        <Box my={1} width="100%">
          <LumaInput
            disabled={registerLoading}
            fullWidth
            error={error.email}
            label={t('user.email')}
            name="email"
            onChange={handleInputChange}
            onBlur={handleEmailVerify}
            value={registerForm.email}
            size={isMobile ? 'small' : 'medium'}
          />
          <Box width="100%" mr={2}>
            <ErrorLabel in={error.email} message={t('error.invalidEmail')} />
          </Box>
        </Box>
        {/* Password input */}
        <Box my={1} width="100%">
          <PasswordStrength
            name="password"
            error={error.password}
            loading={registerLoading}
            value={registerForm.password}
            onChange={handleInputChange}
            onBlur={handlePasswordVerify}
            setCriteria={handleCriteria}
            register
          />
        </Box>
        {/* Password Verify input */}
        <Box my={1} width="100%">
          <LumaInput
            disabled={registerLoading}
            fullWidth
            label={t('user.verifyPassword')}
            name="verify"
            error={error.verify}
            type="password"
            onChange={handleInputChange}
            onBlur={handleMatchVerify}
            value={registerForm.verify}
            size={isMobile ? 'small' : 'medium'}
          />
          <Box width="100%" mr={2}>
            <ErrorLabel in={error.verify} message={t('error.passwordMatch')} />
          </Box>
        </Box>
        {/* Remember Me */}
        <Box my={0} width="100%">
          <FormGroup>
            <FormControlLabel
              control={
                <LumaCheckbox
                  disabled={registerLoading}
                  name="remember"
                  onChange={handleCheckbox}
                  value={!!registerForm.remember}
                  size={isMobile ? 'small' : 'medium'}
                />
              }
              label={`${t('user.remember')}`}
            />
          </FormGroup>
        </Box>
        {/* Register button */}
        <Box my={2} width="100%">
          <LumaButton
            disabled={registerLoading || !verified}
            color="secondary"
            variant="contained"
            fullWidth
            size={isMobile ? 'medium' : 'large'}
            startIcon={registerLoading ? undefined : <PersonAdd />}
            onClick={handleRegisterButton}
          >
            {registerLoading ? (
              <CircularProgress size={26} color="secondary" />
            ) : (
              t('user.register')
            )}
          </LumaButton>
        </Box>
        {/* Bottom texts */}
        <Box my={isMobile ? 0 : 1} width="100%">
          <Box>
            {t('user.dontHaveAccount')}{' '}
            <A disabled={registerLoading} url="#">
              {t('user.signup')}
            </A>
          </Box>
          <Box>
            <A disabled={registerLoading} url="#">
              {t('user.forget')}
            </A>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // Handles
  function handleInputChange(e: TextInputEvent) {
    let form = registerForm;
    const { name, value } = e.target;
    switch (name) {
      case 'username':
        form.username = value;
        if (error.username) handleUsernameVerify(e);
        break;
      case 'email':
        form.email = value;
        if (error.email) handleEmailVerify(e);
        break;
      case 'password':
        form.password = value;
        break;
      case 'verify':
        form.verify = value;
        if (error.verify) handleMatchVerify(e);
        break;
    }
    setRegisterForm({ ...form });
  }
  function handleCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    let form = registerForm;
    if (e.target.name === 'remember') {
      form = { ...registerForm, remember: e.target.checked };
    }
    setRegisterForm(form);
  }
  function handleRegisterButton() {
    if (registerLoading) return;
    register();
  }
  function handleUsernameVerify(e: TextInputEvent) {
    setError({ ...error, username: !e.target.value });
  }
  function handleEmailVerify(e: TextInputEvent) {
    const inputEmail = e.target.value;
    const result = emailRegex.test(inputEmail);
    setError({ ...error, email: !result });
  }
  function handlePasswordVerify() {
    setError({ ...error, password: !passwordOk });
  }
  function handleCriteria(v: boolean) {
    if (error.password) {
      setError({ ...error, password: !v });
    }
    setPasswordOk(v);
  }
  function handleMatchVerify(e: TextInputEvent) {
    const match = e.target.value;
    const result = match === registerForm.password;
    setError({ ...error, verify: !result });
  }

  // Memo hoists
  function verifiedMemo() {
    return (
      !error.username &&
      !error.email &&
      !error.password &&
      !error.verify &&
      !!registerForm.username &&
      !!registerForm.email &&
      !!registerForm.password &&
      !!registerForm.verify
    );
  }

  // Effect hoists
  function returnToHomeEffect() {
    if (user) {
      navigate(routes._index);
    }
  }
}
