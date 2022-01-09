import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTranslation } from 'react-i18next';

import { useAPI_userLogin, useAPI_userRegister } from 'api';
import {
  A,
  ErrorLabel,
  LumaButton,
  LumaCheckbox,
  LumaInput,
  LumaText,
} from 'components';
import CF from 'config';
import { GlobalContext } from 'global/GlobalContext';
import { emailRegex, useSetTitle } from 'lib';
import { TextInputEvent } from 'schema';
import { styles } from 'theme/styles';
import { PasswordStrength } from 'user/preferences/PasswordStrength';
import { UserContext } from 'user/UserContext';
import routes from 'route.config';
import { User } from 'schema/userSchema';

interface UserRegister {
  username: string;
  email: string;
  password: string;
  verify: string;
}

interface RegisterError {
  username: boolean;
  email: boolean;
  password: boolean;
  verify: boolean;
  agree: boolean;
  captcha: boolean;
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
  agree: false,
  captcha: false,
};

export default function Register() {
  // Custom hooks
  const { t } = useTranslation();
  useSetTitle(t('title.register'));

  // Ref
  const captchaEl = useRef<ReCAPTCHA>() as React.LegacyRef<ReCAPTCHA>;

  // Context
  const { loadUser: reloadUser, user } = useContext(UserContext);
  const { isMobile, navigate, nativateToPrevious, toast } =
    useContext(GlobalContext);

  // States
  const [registerForm, setRegisterForm] = useState<UserRegister>(defaultForm);
  const [error, setError] = useState<RegisterError>(defaultError);
  const [passwordOk, setPasswordOk] = useState(false);
  const [agree, setAgree] = useState(false);
  const [captcha, setCaptcha] = useState(false);

  // Data
  const { execute: register, loading: registerLoading } = useAPI_userRegister({
    body: registerForm,
    onComplete: () => {
      login({
        username: registerForm.username,
        password: registerForm.password,
      });
    },
    onError: (err) => {
      handleCaptchaReset();
      toast(err.message, 'error');
    },
  });
  const { execute: login, loading: loginLoading } = useAPI_userLogin({
    skip: true,
    body: { username: registerForm.username, password: registerForm.password },
    onComplete: loginComplete,
    onError: (err) => {
      handleCaptchaReset();
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
  const loading = useMemo(
    () => registerLoading || loginLoading,
    [registerLoading, loginLoading]
  );

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
            disabled={loading}
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
            disabled={loading}
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
            loading={loading}
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
            disabled={loading}
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
        {/* Recaptcha */}
        <Box my={1} width="100%">
          <ReCAPTCHA
            theme="dark"
            sitekey={CF.RECAPTCHA_KEY}
            onChange={handleCaptchaComplete}
            onExpired={() => setCaptcha(false)}
            ref={captchaEl}
          />
          <Box width="100%" mr={2}>
            <ErrorLabel in={error.captcha} message={t('error.recaptcha')} />
          </Box>
        </Box>
        {/* Agree */}
        <Box my={0} width="100%">
          <FormGroup>
            <FormControlLabel
              control={
                <LumaCheckbox
                  disabled={loading}
                  name="remember"
                  onChange={handleCheckbox}
                  value={agree}
                  size={isMobile ? 'small' : 'medium'}
                />
              }
              label={`${t('user.agree')}`}
            />
          </FormGroup>
          <Box width="100%" mr={2}>
            <ErrorLabel
              in={error.agree}
              message={t('error.agreeRegistration')}
            />
          </Box>
        </Box>
        {/* Register button */}
        <Box my={2} width="100%">
          <LumaButton
            disabled={loading || !verified}
            color="secondary"
            variant="contained"
            fullWidth
            size={isMobile ? 'medium' : 'large'}
            startIcon={loading ? undefined : <PersonAdd />}
            onClick={handleRegisterButton}
          >
            {loading ? (
              <CircularProgress size={26} color="secondary" />
            ) : (
              t('user.register')
            )}
          </LumaButton>
        </Box>
        {/* Bottom texts */}
        <Box my={isMobile ? 0 : 1} width="100%">
          <Box>
            {t('user.alreadyHaveAccount')}{' '}
            <A disabled={loading} url={routes.userLogin}>
              {t('user.login')}
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
    if (e.target.checked) {
      setError({ ...error, agree: !e.target.checked });
    }
    setAgree(e.target.checked);
  }
  function handleRegisterButton() {
    if (registerLoading) return;
    if (!registerForm.username) {
      setError({ ...error, username: true });
      handleCaptchaReset();
      return;
    }
    if (!emailRegex.test(registerForm.email)) {
      setError({ ...error, email: true });
      handleCaptchaReset();
      return;
    }
    if (!passwordOk || !registerForm.password) {
      setError({ ...error, password: false });
      handleCaptchaReset();
      return;
    }
    if (registerForm.password !== registerForm.verify) {
      setError({ ...error, verify: false });
      handleCaptchaReset();
      return;
    }
    if (!agree) {
      setError({ ...error, agree: true });
      handleCaptchaReset();
      return;
    }
    if (!captcha) {
      setError({ ...error, captcha: true });
      return;
    }
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
  function handleCaptchaComplete() {
    setCaptcha(true);
    setError({ ...error, captcha: false });
  }
  function handleCaptchaReset() {
    setCaptcha(false);
    // @ts-ignore
    captchaEl?.current?.reset && captchaEl?.current?.reset();
  }

  // Data hoists
  function loginComplete(data: User) {
    if (reloadUser) reloadUser();
    if (data?.username) {
      toast(t('main.welcome', { username: data.username }), 'info');
    }
    nativateToPrevious();
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
