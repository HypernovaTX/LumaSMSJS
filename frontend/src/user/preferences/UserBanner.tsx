import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, CircularProgress, Grid } from '@mui/material';

import { FileUploader, LumaButton, LumaDiaglog, LumaText } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import { UserContext } from 'user/UserContext';
import { styles } from 'MUIConfig';
import {
  useAPI_image,
  useAPI_userBanner,
  useAPI_userDeleteAvatar,
  useAPI_userDeleteBanner,
} from 'api';
import { ErrorObj } from 'schema';
import { isError } from 'lib';

export default function UserBannerSettings() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { banner, loading: userLoading, loadUser } = useContext(UserContext);
  const { isMobile, isSmallMobile, toast } = useContext(GlobalContext);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  // Data
  const { execute: uploadBanner, loading: bannerLoading } = useAPI_userBanner({
    body: { banner: null },
    onComplete: completedData,
    onError: errorData,
  });
  const { execute: delBanner, loading: delLoading } = useAPI_userDeleteBanner({
    onComplete: completedData,
    onError: errorData,
  });

  // Memo
  const loading = useMemo(loadingMemo, [
    bannerLoading,
    delLoading,
    userLoading,
  ]);
  const noChange = useMemo(noChangeMemo, [selectedFile]);

  // Output
  return (
    <Box mx={4} my={2} width="100%">
      <Grid container direction="column" alignContent="stretch">
        {/* -------------------- Inputs -------------------- */}
        <Grid container item direction="column">
          {/* Current banner */}
          <LumaText>
            <b>{t('user.currentBanner')}</b>
          </LumaText>
          <Grid
            item
            container
            direction={isSmallMobile ? 'column' : 'row'}
            justifyContent="center"
            alignItems="center"
            spacing={2}
            xs={12}
            sx={{ my: 2 }}
          >
            <Grid item>
              <img src={banner} alt="banner" style={{ width: '100%' }} />
            </Grid>
          </Grid>
          {/* Update banner */}
          <LumaText>
            <b>{t('user.updateYourBanner')}</b>
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
          {/* Delete banner */}
          <LumaText>
            <b>{t('user.clearBanner')}</b>
          </LumaText>
          <LumaButton
            disabled={loading || !banner || open}
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
          title={t('user.clearBanner')}
          message={t('user.diaglogBannerDelete')}
          open={open}
          onConfirm={() => delBanner()}
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
    uploadBanner({ avatar: selectedFile });
  }
  function handleReset() {
    setSelectedFile(null);
  }

  // Memo hoists
  function noChangeMemo() {
    return !selectedFile;
  }
  function loadingMemo() {
    return userLoading || bannerLoading || delLoading;
  }
  function completedData() {
    toast(t('user.updateBannerDone'), 'success');
    handleReset();
    if (loadUser) loadUser();
  }
  function errorData(err: ErrorObj) {
    toast(err.message, 'error');
  }
}
