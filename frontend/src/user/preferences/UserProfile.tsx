import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, CircularProgress, Grid } from '@mui/material';
import { getNames as getCountryData } from 'country-list';

import { LumaButton, LumaInput, LumaSelect, LumaText } from 'components';
import CF from 'config';
import { GlobalContext } from 'global/GlobalContext';
import { User, UserKeys } from 'schema/userSchema';
import { isEmptyObject } from 'lib';
import { TextInputEvent } from 'schema';
interface ProfileSettingsProps {
  loading?: boolean;
  user?: User;
  update: (p: User) => void;
}

export default function UserProfileSettings(props: ProfileSettingsProps) {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { isMobile, isSmallMobile } = useContext(GlobalContext);

  // State
  const [inputs, setInputs] = useState<User>({});

  // Memo
  const countries = useMemo(countriesMemo, []);
  const noChange = useMemo(noChangeMemo, [inputs]);

  // Output
  return (
    <Box mx={4} my={2} width="100%">
      <Grid container direction="column" alignContent="stretch">
        {/* -------------------- Title -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.title')}</b>
          </LumaText>
          <LumaInput
            name="title"
            fullWidth
            size="small"
            disabled={props.loading}
            value={inputs.title ?? props.user?.title}
            onChange={handleInputChange}
            inputProps={{ maxLength: CF.MAX_128 }}
          />
          <Box width="100%" textAlign="right" mr={2} mb={1}>
            <LumaText variant="body2">
              {`${inputs.title?.length ?? props?.user?.title?.length ?? 0}/${
                CF.MAX_128
              }`}
            </LumaText>
          </Box>
        </Grid>
        {/* -------------------- Signature -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.signature')}</b>
          </LumaText>
          <LumaInput
            name="signature"
            multiline
            fullWidth
            rows={3}
            size="small"
            disabled={props.loading}
            value={inputs.signature ?? props.user?.signature}
            onChange={handleInputChange}
            inputProps={{ maxLength: CF.MAX_X24 }}
          />
          <Box width="100%" textAlign="right" mr={2} mb={1}>
            <LumaText variant="body2">
              {`${
                inputs.signature?.length ?? props?.user?.signature?.length ?? 0
              }/${CF.MAX_X24}`}
            </LumaText>
          </Box>
        </Grid>
        {/* -------------------- Bio -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.bio')}</b>
          </LumaText>
          <LumaInput
            name="bio"
            multiline
            fullWidth
            rows={3}
            size="small"
            disabled={props.loading}
            value={inputs.bio ?? props.user?.bio}
            onChange={handleInputChange}
            inputProps={{ maxLength: CF.MAX_512 }}
          />
          <Box width="100%" textAlign="right" mr={2} mb={1}>
            <LumaText variant="body2">
              {`${inputs.bio?.length ?? props?.user?.bio?.length ?? 0}/${
                CF.MAX_512
              }`}
            </LumaText>
          </Box>
        </Grid>
        {/* -------------------- Birthday -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.birthday')}</b>
          </LumaText>
          <Grid container item direction="row" alignItems="center">
            <LumaInput
              name="birthday"
              type="date"
              disabled={props.loading}
              value={inputs.birthday ?? props.user?.birthday ?? ''}
              sx={{ width: 180 }}
              onChange={handleInputChange}
              onBlur={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
            <LumaButton
              size="small"
              sx={{ height: '2rem' }}
              color="secondary"
              onClick={() => handleButton('birthday')}
            >
              {t('main.clear')}
            </LumaButton>
          </Grid>
          <Box width="100%" textAlign="right" mr={2} mb={1} height="1rem" />
        </Grid>
        {/* -------------------- Pronoun -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.pronoun')}</b>
          </LumaText>
          <LumaSelect
            name="pronoun"
            fullWidth
            disabled={props.loading}
            value={inputs.pronoun ?? props.user?.pronoun ?? 'Unspecified'}
            onChange={handleMenu}
          >
            <option value="Unspecified">{t('main.unspecified')}</option>
            <option value="He">{t('user.pronounHe')}</option>
            <option value="She">{t('user.pronounShe')}</option>
            <option value="They">{t('user.pronounThey')}</option>
            <option value="Ze">{t('user.pronounZe')}</option>
          </LumaSelect>
          <Box width="100%" textAlign="right" mr={2} mb={1} height="1rem" />
        </Grid>
        {/* -------------------- Country -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.country')}</b>
          </LumaText>
          <LumaSelect
            name="country"
            fullWidth
            disabled={props.loading}
            value={inputs.country ?? props.user?.country ?? 'Unspecified'}
            onChange={handleMenu}
          >
            <option value="Unspecified">{t('main.unspecified')}</option>
            {countries.map((c, k) => (
              <option key={k} value={c}>
                {c}
              </option>
            ))}
          </LumaSelect>
          <Box width="100%" textAlign="right" mr={2} mb={1} height="1rem" />
        </Grid>
        {/* -------------------- Location -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.location')}</b>
          </LumaText>
          <LumaInput
            name="location"
            fullWidth
            size="small"
            disabled={props.loading}
            value={inputs.location ?? props.user?.location}
            onChange={handleInputChange}
            inputProps={{ maxLength: CF.MAX_128 }}
          />
          <Box width="100%" textAlign="right" mr={2} mb={1}>
            <LumaText variant="body2">
              {`${
                inputs.location?.length ?? props?.user?.location?.length ?? 0
              }/${CF.MAX_128}`}
            </LumaText>
          </Box>
        </Grid>
        {/* -------------------- Favorite Game -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.favoriteGame')}</b>
          </LumaText>
          <LumaInput
            name="favorite_game"
            fullWidth
            size="small"
            disabled={props.loading}
            value={inputs.favorite_game ?? props.user?.favorite_game}
            onChange={handleInputChange}
            inputProps={{ maxLength: CF.MAX_064 }}
          />
          <Box width="100%" textAlign="right" mr={2} mb={1}>
            <LumaText variant="body2">
              {`${
                inputs.favorite_game?.length ??
                props?.user?.favorite_game?.length ??
                0
              }/${CF.MAX_064}`}
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
            onClick={handleSubmit}
            fullWidth={isSmallMobile}
            sx={
              isSmallMobile ? undefined : { px: props.loading ? 4 : undefined }
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
    </Box>
  );
  // Handles
  function handleInputChange(e: TextInputEvent) {
    const input = e.target.name as UserKeys;
    let data = {} as User;
    switch (input) {
      case 'bio':
        data.bio = e.target.value;
        break;
      case 'signature':
        data.signature = e.target.value;
        break;
      case 'birthday':
        data.birthday = e.target.value;
        break;
      case 'title':
        data.title = e.target.value;
        break;
      case 'location':
        data.location = e.target.value;
        break;
      case 'favorite_game':
        data.favorite_game = e.target.value;
        break;
    }
    setInputs({ ...inputs, ...data });
  }
  function handleButton(kind: UserKeys) {
    const handleData = inputs;
    switch (kind) {
      case 'birthday':
        handleData.birthday = '';
        break;
    }
    setInputs({ ...handleData } as User);
  }
  function handleMenu(e: React.ChangeEvent<HTMLSelectElement>) {
    const input = e.target.name as UserKeys;
    let data = {} as User;
    switch (input) {
      case 'country':
        data.country = e.target.value;
        break;
      case 'pronoun':
        data.pronoun = e.target.value;
        break;
    }
    setInputs({ ...inputs, ...data });
  }
  function handleSubmit() {
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
  function countriesMemo() {
    return getCountryData();
  }
  function noChangeMemo() {
    return isEmptyObject(inputs);
  }
}
