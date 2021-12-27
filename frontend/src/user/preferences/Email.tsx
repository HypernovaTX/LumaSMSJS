import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, CircularProgress, Grid } from '@mui/material';

import { useAPI_emailUpdate } from 'api';
import {
  ErrorLabel,
  LumaButton,
  LumaDiaglog,
  LumaInput,
  LumaText,
} from 'components';
import CF from 'config';
import { GlobalContext } from 'global/GlobalContext';
import { emailRegex } from 'lib';
import { ErrorObj, TextInputEvent } from 'schema';
import { UserContext } from 'user/UserContext';

interface EmailChangeInput {
  email: string;
  password: string;
}

const defaultUsernameInput: EmailChangeInput = {
  email: '',
  password: '',
};

export default function UserEmailSettings() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { loading: userLoading, user } = useContext(UserContext);
  const { isMobile, isSmallMobile, toast } = useContext(GlobalContext);

  // State
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(defaultUsernameInput);
  const [emailError, setEmailError] = useState(false);

  // Data
  const { execute: updateEmail, loading: loadingUpdate } = useAPI_emailUpdate({
    body: defaultUsernameInput,
    onComplete: completedData,
    onError: errorData,
  });

  // Memo
  const loading = useMemo(loadingMemo, [userLoading, loadingUpdate]);
  const noChange = useMemo(noChangeMemo, [
    input.password,
    input.email,
    user?.email,
  ]);

  // Output
  return (
    <Box mx={4} my={2} width="100%">
      <Grid container direction="column" alignContent="stretch">
        {/* -------------------- Current email -------------------- */}
        <Grid container item direction="column">
          <Box mb={3}>
            <LumaText>
              <b>{t('user.currentEmail')}</b>
            </LumaText>
            <LumaText>{user?.email ?? t('main.NA')}</LumaText>
          </Box>
        </Grid>
        {/* -------------------- Email -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.newEmail')}</b>
          </LumaText>
          <LumaInput
            name="email"
            fullWidth
            size="small"
            type="email"
            placeholder=""
            disabled={loading}
            value={input.email}
            onChange={handleInput}
            onBlur={handleEmailVerify}
            error={emailError}
            inputProps={{ maxLength: CF.MAX_128 }}
          />
          <Box width="100%" mr={2}>
            <ErrorLabel in={emailError} message={t('error.invalidEmail')} />
          </Box>
          <Box width="100%" textAlign="right" mr={2} mb={1}>
            <LumaText variant="body2">
              {`${input.email.length ?? 0}/${CF.MAX_128}`}
            </LumaText>
          </Box>
        </Grid>
        {/* -------------------- Password -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.password')}</b>
          </LumaText>
          <LumaInput
            name="password"
            type="password"
            fullWidth
            size="small"
            disabled={loading}
            value={input.password}
            onChange={handleInput}
          />
          <Box width="100%" height={1} mb={3} />
        </Grid>
        {/* -------------------- Submit/reset buttons -------------------- */}
        <Box mt={1} mb={2} width="100%">
          <LumaButton
            disabled={loading || noChange || emailError}
            color="secondary"
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            onClick={() => setOpen(true)}
            fullWidth={isSmallMobile}
            sx={isSmallMobile ? undefined : { px: loading ? 4 : undefined }}
          >
            {loading ? (
              <CircularProgress size={26} color="secondary" />
            ) : (
              t('main.applyChanges')
            )}
          </LumaButton>
        </Box>

        {/* -------------------- Diaglog -------------------- */}
        <LumaDiaglog
          title={t('user.updateYourEmail')}
          message={`${t('user.diaglogEmailUpdate')}"${input.email}"?`}
          open={open}
          onConfirm={handleSubmit}
          onClose={() => setOpen(false)}
        />
      </Grid>
    </Box>
  );
  // Handles
  function handleInput(e: TextInputEvent) {
    const name = e.target.name;
    const data = input;
    switch (name) {
      case 'email':
        data.email = e.target.value;
        if (emailError) handleEmailVerify(e);
        break;
      case 'password':
        data.password = e.target.value;
        break;
    }
    setInput({ ...data });
  }
  function handleSubmit() {
    console.log(input);
    updateEmail(input);
  }
  function handleEmailVerify(e: TextInputEvent) {
    const inputEmail = e.target.value;
    const result = emailRegex.test(inputEmail);
    setEmailError(!result);
  }

  // Data hoists
  function completedData() {
    toast(t('user.updateEmailDone'), 'success');
  }
  function errorData(err: ErrorObj) {
    toast(err.message, 'error');
  }

  // Memo hoists
  function noChangeMemo() {
    return input.email === user?.email || !input.email || !input.password;
  }
  function loadingMemo() {
    return userLoading || loadingUpdate;
  }
}
