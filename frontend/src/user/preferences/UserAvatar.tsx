import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar, Box, CircularProgress, Grid } from '@mui/material';

import { FileUploader, LumaButton, LumaDiaglog, LumaText } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import { UserContext } from 'user/UserContext';
import { styles } from 'MUIConfig';
import { useAPI_userAvatar, useAPI_userDeleteAvatar } from 'api';
import { ErrorObj } from 'schema';

export default function UserAvatarSettings() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { avatar, loading: userLoading, loadUser } = useContext(UserContext);
  const { isMobile, isSmallMobile, toast } = useContext(GlobalContext);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  // Data
  const { execute: uploadAvatar, loading: avatarLoading } = useAPI_userAvatar({
    body: { avatar: null },
    onComplete: completedData,
    onError: errorData,
  });
  const { execute: delAvatar, loading: delLoading } = useAPI_userDeleteAvatar({
    onComplete: completedData,
    onError: errorData,
  });

  // Memo
  const loading = useMemo(loadingMemo, [
    userLoading,
    avatarLoading,
    delLoading,
  ]);
  const noChange = useMemo(noChangeMemo, [selectedFile]);

  // Output
  return (
    <Box mx={4} my={2} width="100%">
      <Grid container direction="column" alignContent="stretch">
        {/* -------------------- Inputs -------------------- */}
        <Grid container item direction="column">
          {/* Current avatar */}
          <LumaText>
            <b>{t('user.currentAvatar')}</b>
          </LumaText>
          <Grid
            item
            container
            direction={isSmallMobile ? 'column' : 'row'}
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{ my: 2 }}
          >
            <Grid item>
              <Avatar src={avatar} sx={styles.avatarLarge} />
            </Grid>
            <Grid item>
              <Avatar src={avatar} sx={styles.avatarMedium} />
            </Grid>
            <Grid item>
              <Avatar src={avatar} sx={styles.navAvatar} />
            </Grid>
          </Grid>
          {/* Update avatar */}
          <LumaText>
            <b>{t('user.updateYourAvatar')}</b>
          </LumaText>
          <Grid container>
            <FileUploader
              accepts="image/gif, image/png, image/jpeg"
              disabled={loading}
              file={selectedFile}
              onChange={handleFileInput}
              onReset={handleReset}
            />
          </Grid>
          {/* Delete avatar */}
          <LumaText>
            <b>{t('user.clearAvatar')}</b>
          </LumaText>
          <LumaButton
            disabled={loading || !avatar || open}
            color="error"
            variant="contained"
            size="small"
            onClick={() => setOpen(true)}
            sx={{ mt: 1, width: 64 }}
          >
            {t('main.delete')}
          </LumaButton>
        </Grid>

        {/* -------------------- Submit/reset buttons -------------------- */}
        <Box mt={6} mb={2} width="100%">
          <LumaButton
            disabled={loading || noChange}
            color="secondary"
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            onClick={handleSubmit}
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
          title={t('user.clearAvatar')}
          message={t('user.diaglogAvatarDelete')}
          open={open}
          onConfirm={() => delAvatar()}
          onClose={() => setOpen(false)}
        />
      </Grid>
    </Box>
  );
  // Handles
  function handleFileInput(file: File | null) {
    setSelectedFile(file);
  }
  function handleSubmit() {
    uploadAvatar({ avatar: selectedFile });
  }
  function handleReset() {
    setSelectedFile(null);
  }

  // Memo hoists
  function noChangeMemo() {
    return !selectedFile;
  }
  function loadingMemo() {
    return userLoading || avatarLoading || delLoading;
  }

  // Data hoists
  function completedData() {
    toast(t('user.updateAvatarDone'), 'success');
    handleReset();
    if (loadUser) loadUser();
  }
  function errorData(err: ErrorObj) {
    toast(err.message, 'error');
  }
}
