import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, CircularProgress, Grid } from '@mui/material';

import { useAPI_passwordUpdate } from 'api';
import { LumaButton, LumaDiaglog, LumaInput, LumaText } from 'components';
import CF from 'config';
import { GlobalContext } from 'global/GlobalContext';
import { universalUnixTime } from 'lib';
import routes from 'route.config';
import { TextInputEvent } from 'schema';
import { UserContext } from 'user/UserContext';
import theme from 'theme/styles';
import { PasswordStrength } from 'user/preferences/PasswordStrength';

interface PasswordChangeInput {
  oldpassword: string;
  newpassword: string;
  verify: string;
}

const defaultPasswordInput: PasswordChangeInput = {
  oldpassword: '',
  newpassword: '',
  verify: '',
};

export default function UserPasswordSettings() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { loading: userLoading, user } = useContext(UserContext);
  const { isMobile, isSmallMobile, navigate, toast } =
    useContext(GlobalContext);

  // State
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(defaultPasswordInput);
  const [criteria, setCriteria] = useState(false);

  // Data
  const { execute: updatePassword, loading: loadingU } = useAPI_passwordUpdate({
    body: defaultPasswordInput,
    onComplete: completedData,
    onError: (err) => toast(err.message, 'error'),
  });

  // Memo
  const loading = useMemo(loadingMemo, [userLoading, loadingU]);
  const verifyMatch = useMemo(verifyMatchMemo, [
    input.newpassword,
    input.verify,
  ]);
  const cantSubmit = useMemo(cantSubmitMemo, [
    input.oldpassword,
    input.newpassword,
    input.verify,
    verifyMatch,
    criteria,
  ]);
  const daysSinceLastChange = useMemo(daysSinceLastChangeMemo, [user]);

  // Output
  return (
    <Box mx={4} my={2} width="100%">
      <form onSubmit={handleFormSubmit}>
        <Grid container direction="column" alignContent="stretch">
          {/* -------------------- Last change date -------------------- */}
          <Grid container item direction="column">
            <Box mb={3}>
              <LumaText>
                <b>{t('user.lastPasswordChange')}</b>
              </LumaText>
              <LumaText>
                {daysSinceLastChange !== undefined
                  ? `${daysSinceLastChange} ${t('main.daysAgo')}`
                  : t('main.NA')}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Old password -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.oldPassword')}</b>
            </LumaText>
            <LumaInput
              name="oldpassword"
              fullWidth
              placeholder=""
              size="small"
              type="password"
              disabled={loading}
              value={input.oldpassword}
              onChange={handleInput}
              inputProps={{ maxLength: CF.MAX_032 }}
            />
            <Box width="100%" height={1} mb={3} />
          </Grid>
          {/* -------------------- New Password -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.newPassword')}</b>
            </LumaText>
            {/* New password input */}
            <PasswordStrength
              name="newpassword"
              loading={loading}
              value={input.newpassword}
              onChange={handleInput}
              setCriteria={setCriteria}
              setStrength={() => {}}
            />
            <Box width="100%" height={1} mb={3} />
          </Grid>
          {/* -------------------- Verify Password -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.verifyPassword')}</b>
            </LumaText>
            <LumaInput
              name="verify"
              type="password"
              fullWidth
              size="small"
              error={!verifyMatch}
              autoComplete="new-password"
              disabled={loading}
              value={input.verify}
              onChange={handleInput}
            />
            <Box width="100%" height={1} mb={3} />
          </Grid>
          {/* -------------------- NOTICE -------------------- */}
          <Grid container item direction="column">
            <Box mb={3}>
              <LumaText color={theme.palette.warning.main}>
                {t('user.passwordChangeNotice')}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Submit/reset buttons -------------------- */}
          <Box mt={1} mb={2} width="100%">
            <LumaButton
              type="submit"
              disabled={loading || cantSubmit}
              color="secondary"
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
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
            title={t('user.updateYourPassword')}
            message={t('user.diaglogPasswordUpdate')}
            open={open}
            onConfirm={() => updatePassword(input)}
            onClose={() => setOpen(false)}
          />
        </Grid>
      </form>
    </Box>
  );
  // Handles
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cantSubmit || loading) return;
    setOpen(true);
  }
  function handleInput(e: TextInputEvent) {
    const name = e.target.name;
    const data = input;
    const { value } = e.target;
    switch (name) {
      case 'oldpassword':
        data.oldpassword = value;
        break;
      case 'newpassword':
        data.newpassword = value;
        break;
      case 'verify':
        data.verify = value;
        break;
    }
    setInput({ ...data });
  }

  // Data hoists
  function completedData() {
    toast(t('user.updatePasswordDone'), 'success');
    navigate(routes.userLogout);
  }

  // Memo hoists
  function cantSubmitMemo() {
    console.log(`good: ${criteria}`);
    return (
      input.oldpassword === input.newpassword ||
      !verifyMatch ||
      !criteria ||
      !input.oldpassword ||
      !input.newpassword ||
      !input.verify
    );
  }
  function loadingMemo() {
    return userLoading || loadingU;
  }
  function daysSinceLastChangeMemo() {
    if (!user || !user?.last_password) return;
    const currentTime = universalUnixTime(Date.now());
    const oneDay = 60 * 60 * 24;
    return Math.floor((currentTime - user.last_password) / oneDay);
  }
  function verifyMatchMemo() {
    return input.verify === input.newpassword;
  }
}
