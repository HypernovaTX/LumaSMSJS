import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Grid } from '@mui/material';

import { LumaButton, LumaInput, LumaText } from 'components';
import CF from 'config';
import { GlobalContext } from 'global/GlobalContext';
import { User, UserKeys } from 'schema/userSchema';
import { isEmptyObject } from 'lib';
import { TextInputEvent } from 'schema';

interface SocialMediaProps {
  loading?: boolean;
  user?: User;
  update: (p: User) => void;
}

export default function UserSocialMedia(props: SocialMediaProps) {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { isMobile, isSmallMobile, toast } = useContext(GlobalContext);

  // State
  const [inputs, setInputs] = useState<User>({});

  // Memo
  const noChange = useMemo(noChangeMemo, [inputs]);

  // Output
  return (
    <Box mx={4} my={2} width="100%">
      <form onSubmit={handleFormSubmit}>
        <Grid container direction="column" alignContent="stretch">
          {/* -------------------- Website Name -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.socialOptions.siteName')}</b>
            </LumaText>
            <LumaText variant="body2">{t('user.socialInfo.siteName')}</LumaText>
            <LumaInput
              name="website"
              fullWidth
              size="small"
              disabled={props.loading}
              value={inputs.website ?? props.user?.website}
              onChange={handleInputChange}
              inputProps={{ maxLength: CF.MAX_128 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${
                  inputs.website?.length ?? props?.user?.website?.length ?? 0
                }/${CF.MAX_128}`}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Website Url -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.socialOptions.siteUrl')}</b>
            </LumaText>
            <LumaText variant="body2">{t('user.socialInfo.siteUrl')}</LumaText>
            <LumaInput
              name="weburl"
              fullWidth
              size="small"
              disabled={props.loading}
              value={inputs.weburl ?? props.user?.weburl}
              onChange={handleInputChange}
              inputProps={{ maxLength: CF.MAX_128 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${
                  inputs.weburl?.length ?? props?.user?.weburl?.length ?? 0
                }/${CF.MAX_128}`}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Twitter -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.socialOptions.twitter')}</b>
            </LumaText>
            <LumaText variant="body2">{t('user.socialInfo.twitter')}</LumaText>
            <LumaInput
              name="twitter"
              fullWidth
              size="small"
              disabled={props.loading}
              value={inputs.twitter ?? props.user?.twitter}
              onChange={handleInputChange}
              inputProps={{ maxLength: CF.MAX_128 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${
                  inputs.twitter?.length ?? props?.user?.twitter?.length ?? 0
                }/${CF.MAX_128}`}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- YouTube -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.socialOptions.youtube')}</b>
            </LumaText>
            <LumaText variant="body2">{t('user.socialInfo.youtube')}</LumaText>
            <LumaInput
              name="youtube"
              fullWidth
              size="small"
              disabled={props.loading}
              value={inputs.youtube ?? props.user?.youtube}
              onChange={handleInputChange}
              inputProps={{ maxLength: CF.MAX_128 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${
                  inputs.youtube?.length ?? props?.user?.youtube?.length ?? 0
                }/${CF.MAX_128}`}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Discord -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.socialOptions.discord')}</b>
            </LumaText>
            <LumaText variant="body2">{t('user.socialInfo.discord')}</LumaText>
            <LumaInput
              name="discord"
              fullWidth
              size="small"
              disabled={props.loading}
              value={inputs.discord ?? props.user?.discord}
              onChange={handleInputChange}
              inputProps={{ maxLength: CF.MAX_128 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${
                  inputs.discord?.length ?? props?.user?.discord?.length ?? 0
                }/${CF.MAX_128}`}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Twitch -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.socialOptions.twitch')}</b>
            </LumaText>
            <LumaText variant="body2">{t('user.socialInfo.twitch')}</LumaText>
            <LumaInput
              name="twitch"
              fullWidth
              size="small"
              disabled={props.loading}
              value={inputs.twitch ?? props.user?.twitch}
              onChange={handleInputChange}
              inputProps={{ maxLength: CF.MAX_128 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${
                  inputs.twitch?.length ?? props?.user?.twitch?.length ?? 0
                }/${CF.MAX_128}`}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Reddit -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.socialOptions.reddit')}</b>
            </LumaText>
            <LumaText variant="body2">{t('user.socialInfo.reddit')}</LumaText>
            <LumaInput
              name="reddit"
              fullWidth
              size="small"
              disabled={props.loading}
              value={inputs.reddit ?? props.user?.reddit}
              onChange={handleInputChange}
              inputProps={{ maxLength: CF.MAX_128 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${
                  inputs.reddit?.length ?? props?.user?.reddit?.length ?? 0
                }/${CF.MAX_128}`}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- GitHub -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.socialOptions.github')}</b>
            </LumaText>
            <LumaText variant="body2">{t('user.socialInfo.github')}</LumaText>
            <LumaInput
              name="github"
              fullWidth
              size="small"
              disabled={props.loading}
              value={inputs.github ?? props.user?.github}
              onChange={handleInputChange}
              inputProps={{ maxLength: CF.MAX_128 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${
                  inputs.github?.length ?? props?.user?.github?.length ?? 0
                }/${CF.MAX_128}`}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Steam -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.socialOptions.steam')}</b>
            </LumaText>
            <LumaText variant="body2">{t('user.socialInfo.steam')}</LumaText>
            <LumaInput
              name="steam"
              fullWidth
              size="small"
              disabled={props.loading}
              value={inputs.steam ?? props.user?.steam}
              onChange={handleInputChange}
              inputProps={{ maxLength: CF.MAX_128 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${inputs.steam?.length ?? props?.user?.steam?.length ?? 0}/${
                  CF.MAX_128
                }`}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Switch Friend Code -------------------- */}
          <Grid container item direction="column">
            <LumaText variant="body2">
              <b>{t('user.socialOptions.switch')}</b>
            </LumaText>
            <LumaText variant="body2">{t('user.socialInfo.switch')}</LumaText>
            <LumaInput
              name="switch_code"
              fullWidth
              size="small"
              disabled={props.loading}
              value={inputs.switch_code ?? props.user?.switch_code}
              onChange={handleInputChange}
              inputProps={{ maxLength: CF.MAX_032 }}
            />
            <Box width="100%" textAlign="right" mr={2} mb={1}>
              <LumaText variant="body2">
                {`${
                  inputs.switch_code?.length ??
                  props?.user?.switch_code?.length ??
                  0
                }/${CF.MAX_032}`}
              </LumaText>
            </Box>
          </Grid>
          {/* -------------------- Submit/reset buttons -------------------- */}
          <Box my={2} width="100%">
            <LumaButton
              disabled={props.loading || noChange}
              color="secondary"
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              type="submit"
              fullWidth={isSmallMobile}
              sx={
                isSmallMobile
                  ? undefined
                  : { px: props.loading ? 4 : undefined }
              }
            >
              {props.loading ? (
                <CircularProgress size={26} color="secondary" />
              ) : (
                t('main.applyChanges')
              )}
            </LumaButton>
            <LumaButton
              disabled={props.loading || noChange}
              color="primary"
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              fullWidth={isSmallMobile}
              onClick={handleReset}
              sx={isSmallMobile ? { mt: 2 } : { ml: 2 }}
            >
              {t('main.reset')}
            </LumaButton>
          </Box>
        </Grid>
      </form>
    </Box>
  );
  // Handles
  function handleInputChange(e: TextInputEvent) {
    const input = e.target.name as UserKeys;
    let data = {} as User;
    switch (input) {
      case 'website':
        data.website = e.target.value;
        break;
      case 'weburl':
        data.weburl = e.target.value;
        break;
      case 'twitter':
        data.twitter = e.target.value;
        break;
      case 'youtube':
        data.youtube = e.target.value;
        break;
      case 'discord':
        data.discord = e.target.value;
        break;
      case 'twitch':
        data.twitch = e.target.value;
        break;
      case 'reddit':
        data.reddit = e.target.value;
        break;
      case 'github':
        data.github = e.target.value;
        break;
      case 'steam':
        data.steam = e.target.value;
        break;
      case 'switch_code':
        data.switch_code = e.target.value;
        break;
    }
    setInputs({ ...inputs, ...data });
  }
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Do not make changes under certain circumstances
    if (noChange) {
      toast(t('error.noChangesMade'), 'error');
      return;
    }
    if (props.loading) {
      return;
    }
    // Clean up any undefined values
    const output = Object.fromEntries(
      Object.entries(inputs).filter(([_, value]) => value !== undefined)
    ) as User;
    props.update(output);
  }
  function handleReset() {
    setInputs({});
  }

  // Memo def
  function noChangeMemo() {
    return isEmptyObject(inputs);
  }
}
