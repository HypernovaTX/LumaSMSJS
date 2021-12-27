import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, CircularProgress, Grid } from '@mui/material';

import { useAPI_usernameHistory, useAPI_usernameUpdate } from 'api';
import { LumaButton, LumaDiaglog, LumaInput, LumaText } from 'components';
import CF from 'config';
import { GlobalContext } from 'global/GlobalContext';
import { universalUnixTime } from 'lib';
import routes from 'route.config';
import { TextInputEvent } from 'schema';
import { UserContext } from 'user/UserContext';
import { UsernameChange } from 'schema/userSchema';
import theme from 'theme/styles';

interface UsernameChangeInput {
  username: string;
  password: string;
}

const defaultUsernameInput: UsernameChangeInput = {
  username: '',
  password: '',
};

export default function UsernameSettings() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { loading: userLoading, user } = useContext(UserContext);
  const { isMobile, isSmallMobile, navigate, toast } =
    useContext(GlobalContext);

  // State
  const [lastUsername, setLastUsername] = useState<UsernameChange | null>(null);
  const [open, setOpen] = useState(false);
  const [reloadHistory, setReloadHistory] = useState(false);
  const [input, setInput] = useState(defaultUsernameInput);

  // Data
  const { execute: reloadUH, loading: loadingUH } = useAPI_usernameHistory({
    skip: !user,
    body: { id: user?.uid ?? 0 },
    onComplete: saveLastUsernameChange,
  });
  const { execute: updateUname, loading: loadingU } = useAPI_usernameUpdate({
    body: defaultUsernameInput,
    onComplete: completedData,
    onError: (err) => toast(err.message, 'error'),
  });

  // Memo
  const loading = useMemo(loadingMemo, [userLoading, loadingUH, loadingU]);
  const noChange = useMemo(noChangeMemo, [
    input.password,
    input.username,
    user?.username,
  ]);
  const daysSinceLastChange = useMemo(daysSinceLastChangeMemo, [lastUsername]);
  const pastXDays = useMemo(pastXDaysMemo, [daysSinceLastChange, lastUsername]);

  // Effect
  useEffect(reloadUsernameHistoryEffect, [
    lastUsername,
    loading,
    reloadHistory,
    reloadUH,
    user,
  ]);

  // Output
  return (
    <Box mx={4} my={2} width="100%">
      <form onSubmit={handleFormSubmit}>
        <Grid container direction="column" alignContent="stretch">
          {/* -------------------- Current username -------------------- */}
          <Grid container item direction="column">
            <Box mb={3}>
              <LumaText>
                <b>{t('user.currentUsername')}</b>
              </LumaText>
              <LumaText>{user?.username ?? t('main.NA')}</LumaText>
            </Box>
          </Grid>
          {/* -------------------- Last username -------------------- */}
          <Grid container item direction="column">
            <Box mb={3}>
              <LumaText>
                <b>{t('user.lastUsername')}</b>
              </LumaText>
              <LumaText>{lastUsername?.old_username ?? t('main.NA')}</LumaText>
            </Box>
          </Grid>
          {/* -------------------- Last change date -------------------- */}
          <Grid container item direction="column">
            <Box mb={3}>
              <LumaText>
                <b>{t('user.lastUsernameChange')}</b>
              </LumaText>
              <LumaText>
                {daysSinceLastChange !== undefined
                  ? `${daysSinceLastChange} ${t('main.daysAgo')}`
                  : t('main.NA')}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Username -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.newUsername')}</b>
            </LumaText>
            <LumaInput
              name="username"
              fullWidth
              placeholder=""
              size="small"
              disabled={loading || !pastXDays}
              value={input.username}
              onChange={handleInput}
              inputProps={{ maxLength: CF.MAX_032 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${input.username.length ?? user?.username?.length ?? 0}/${
                  CF.MAX_032
                }`}
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
              disabled={loading || !pastXDays}
              value={input.password}
              onChange={handleInput}
            />
            <Box width="100%" height={1} mb={3} />
          </Grid>
          {/* -------------------- NOTICE -------------------- */}
          <Grid container item direction="column">
            <Box mb={3}>
              <LumaText
                color={
                  pastXDays
                    ? theme.palette.warning.main
                    : theme.palette.error.main
                }
              >
                {t(
                  pastXDays
                    ? 'user.usernameChangeNotice'
                    : 'user.usernameChangeDayCap',
                  {
                    days: CF.USERNAME_CHANGE_DAYS,
                  }
                )}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Submit/reset buttons -------------------- */}
          <Box mt={1} mb={2} width="100%">
            <LumaButton
              disabled={loading || noChange || !pastXDays}
              color="secondary"
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              type="submit"
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
            title={t('user.updateYourUsername')}
            message={`${t('user.diaglogUsernameUpdate')}"${input.username}"?`}
            open={open}
            onConfirm={() => updateUname(input)}
            onClose={() => setOpen(false)}
          />
        </Grid>
      </form>
    </Box>
  );
  // Handles
  function handleInput(e: TextInputEvent) {
    const name = e.target.name;
    const data = input;
    switch (name) {
      case 'username':
        data.username = e.target.value;
        break;
      case 'password':
        data.password = e.target.value;
        break;
    }
    setInput({ ...data });
  }
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Do not make changes under certain circumstances
    if (noChange) {
      toast(t('error.noChangesMade'), 'error');
      return;
    }
    if (loading || !pastXDays) {
      return;
    }
    setOpen(true);
  }

  // Data hoists
  function saveLastUsernameChange(data: UsernameChange[]) {
    const [latestChange] = data.sort((item) => item.date);
    setLastUsername(latestChange);
  }
  function completedData() {
    toast(t('user.updateUsernameDone'), 'success');
    navigate(routes.userLogout);
  }

  // Memo hoists
  function noChangeMemo() {
    return (
      input.username === user?.username || !input.username || !input.password
    );
  }
  function loadingMemo() {
    return userLoading || loadingU || loadingUH;
  }
  function daysSinceLastChangeMemo() {
    if (!lastUsername) return;
    const currentTime = universalUnixTime(Date.now());
    const oneDay = 60 * 60 * 24;
    return Math.floor((currentTime - lastUsername.date) / oneDay);
  }
  function pastXDaysMemo() {
    if (!lastUsername) return true;
    if (daysSinceLastChange === undefined) return false;
    return daysSinceLastChange >= CF.USERNAME_CHANGE_DAYS;
  }

  //effect hoists
  function reloadUsernameHistoryEffect() {
    if (!loading && !lastUsername && user && !reloadHistory) {
      setReloadHistory(true);
      reloadUH();
    }
  }
}
