import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, CircularProgress, Grid } from '@mui/material';

import { FileUploader, LumaButton, LumaDiaglog, LumaText } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import { UserContext } from 'user/UserContext';
import { useAPI_userBanner, useAPI_userDeleteBanner } from 'api';
import { ErrorObj } from 'schema';
import theme from 'theme/styles';

type BannerSize = {
  width?: number;
  height?: number;
};

export default function UserBannerSettings() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { banner, loading: userLoading, loadUser } = useContext(UserContext);
  const { isMobile, isSmallMobile, toast } = useContext(GlobalContext);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [bannerSize, setBannerSize] = useState<BannerSize>({});

  // Ref
  const bannerBox = useRef() as React.RefObject<HTMLDivElement>;

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

  // Effect
  useEffect(bannerSizeEffect, [
    banner,
    bannerBox?.current?.clientWidth,
    isSmallMobile,
  ]);

  // Output
  return (
    <Box mx={4} my={2} width="100%" ref={bannerBox} overflow="hidden">
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
            <Grid item xs={12}>
              {banner ? (
                <img
                  src={banner}
                  alt="banner"
                  style={{ ...bannerSize, objectFit: 'cover' }}
                />
              ) : (
                <Box
                  border={`2px solid ${theme.palette.primary.main}`}
                  textAlign="center"
                  p={2}
                  borderRadius="8px"
                >
                  <LumaText variant="body2" sx={{ fontWeight: 300 }}>
                    <b>{t('user.noBanner')}</b>
                  </LumaText>
                </Box>
              )}
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
    uploadBanner({ banner: selectedFile });
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

  // Data hoists
  function completedData() {
    toast(t('user.updateBannerDone'), 'success');
    handleReset();
    if (loadUser) loadUser();
  }
  function errorData(err: ErrorObj) {
    toast(err.message, 'error');
  }

  // Effect hoists
  function bannerSizeEffect() {
    const updateSize = () => {
      const [ratioX, ratioY] = isSmallMobile ? [2, 1] : [8, 3];
      setBannerSize({
        width: bannerBox.current?.clientWidth,
        height: (bannerBox.current?.clientWidth ?? 0 * ratioY) / ratioX,
      });
    };
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }
}
