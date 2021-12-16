import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar, Box, CircularProgress, Grid } from '@mui/material';

import { FileUploader, LumaButton, LumaText } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import { UserContext } from 'user/UserContext';
import { styles } from 'MUIConfig';
import { useAPI_userAvatar } from 'api';

export default function UserAvatarSettings() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { avatar, loading: userLoading, loadUser } = useContext(UserContext);
  const { isMobile, isSmallMobile, toast } = useContext(GlobalContext);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Data
  const { execute: uploadAvatar, loading: avatarLoading } = useAPI_userAvatar({
    skip: true,
    body: { avatar: null },
    onComplete: () => {
      toast(t('user.updateDone'), 'success');
      handleReset();
      if (loadUser) loadUser();
    },
    onError: (err) => {
      toast(err.message, 'error');
    },
  });

  // Memo
  const loading = useMemo(loadingMemo, [userLoading, avatarLoading]);
  const noChange = useMemo(noChangeMemo, [selectedFile]);

  // Output
  return (
    <Box mx={4} my={2} width="100%">
      <Grid container direction="column" alignContent="stretch">
        {/* Your avatar */}
        <Grid container item direction="column">
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
        </Grid>
        {/* -------------------- Submit/reset buttons -------------------- */}
        <Box my={2} width="100%">
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
          {/* <LumaButton
            disabled={loading || noChange}
            color="primary"
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            fullWidth={isSmallMobile}
            onClick={handleReset}
            sx={isSmallMobile ? { mt: 2 } : { ml: 2 }}
          >
            {t('main.reset')}
          </LumaButton> */}
        </Box>
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

  // Memo def
  function noChangeMemo() {
    return !selectedFile;
  }
  function loadingMemo() {
    return userLoading || avatarLoading;
  }
}
