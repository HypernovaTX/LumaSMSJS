import React, { useMemo, useState } from 'react';

import { Cancel, CheckCircle } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { LumaInput, LumaText } from 'components';
import { TextInputEvent } from 'schema';
import theme, { quiteDark, styles } from 'theme/styles';
import { passwordRegex } from 'lib';

interface PasswordStrengthProps {
  loading: boolean;
  name: string;
  onChange: (e: TextInputEvent) => void;
  setCriteria: (p: boolean) => void;
  value: string;
}
interface PasswordValidation {
  length: boolean;
  lower: boolean;
  upper: boolean;
  number: boolean;
  special: boolean;
  strong: boolean;
}
const defaultPasswordValidation: PasswordValidation = {
  length: false,
  lower: false,
  upper: false,
  number: false,
  special: false,
  strong: false,
};
const PassIcon = <CheckCircle style={styles.textIcon} />;
const FailIcon = <Cancel style={styles.textIcon} />;
const { light: colorPass } = theme.palette.success;
const { main: colorFail } = theme.palette.error;

export function PasswordStrength(props: PasswordStrengthProps) {
  // Custom hooks
  const { t } = useTranslation();

  // State
  const [validator, setValidator] = useState(defaultPasswordValidation);

  // Memo
  const criteria = useMemo(criteriaMemo, [
    props,
    validator.length,
    validator.lower,
    validator.number,
    validator.special,
    validator.upper,
  ]);

  // Output
  return (
    <Box>
      <Box my={2} p={1} bgcolor={quiteDark} borderRadius={2}>
        {/* 8 char */}
        <Box
          display="flex"
          alignItems="center"
          color={validator.length ? colorPass : colorFail}
        >
          {validator.length ? PassIcon : FailIcon}
          <LumaText variant="body2">
            {t('user.passwordStrength.atLeast')}
          </LumaText>
        </Box>
        {/* lowercase */}
        <Box
          display="flex"
          alignItems="center"
          color={validator.lower ? colorPass : colorFail}
        >
          {validator.lower ? PassIcon : FailIcon}
          <LumaText variant="body2">
            {t('user.passwordStrength.lowercase')}
          </LumaText>
        </Box>
        {/* uppercase */}
        <Box
          display="flex"
          alignItems="center"
          color={validator.upper ? colorPass : colorFail}
        >
          {validator.upper ? PassIcon : FailIcon}
          <LumaText variant="body2">
            {t('user.passwordStrength.uppercase')}
          </LumaText>
        </Box>
        {/* number */}
        <Box
          display="flex"
          alignItems="center"
          color={validator.number ? colorPass : colorFail}
        >
          {validator.number ? PassIcon : FailIcon}
          <LumaText variant="body2">
            {t('user.passwordStrength.number')}
          </LumaText>
        </Box>
        {/* Special character */}
        <Box
          display="flex"
          alignItems="center"
          color={validator.special ? colorPass : colorFail}
        >
          {validator.special ? PassIcon : FailIcon}
          <LumaText variant="body2">
            {t('user.passwordStrength.special')}
          </LumaText>
        </Box>
      </Box>
      {/* password input */}
      <LumaInput
        name={props.name}
        type="password"
        fullWidth
        size="small"
        autoComplete="new-password"
        disabled={props.loading}
        value={props.value}
        onChange={handleInputChange}
      />
      <Box borderRadius={1} mt="4px">
        <Grid container>
          <Grid item xs={4}>
            <Box
              borderRadius={1}
              style={{
                ...styles.passwordStrengthBar,
                margin: 2,
                backgroundColor:
                  props.value.length > 0
                    ? colorFail
                    : theme.palette.primary.main,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <Box
              borderRadius={1}
              style={{
                ...styles.passwordStrengthBar,
                margin: 2,
                backgroundColor: criteria
                  ? theme.palette.warning.main
                  : theme.palette.primary.main,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <Box
              borderRadius={1}
              style={{
                ...styles.passwordStrengthBar,
                margin: 2,
                backgroundColor: validator.strong
                  ? colorPass
                  : theme.palette.primary.main,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  // Handlers
  function handleInputChange(e: TextInputEvent) {
    props.onChange(e);
    const { value } = e.target;
    const length = passwordRegex.length.test(value);
    const lower = passwordRegex.lowerCase.test(value);
    const upper = passwordRegex.upperCase.test(value);
    const number = passwordRegex.number.test(value);
    const special = passwordRegex.specialChar.test(value);
    const strong = passwordRegex.strongLength.test(value);
    setValidator({
      ...validator,
      length,
      lower,
      upper,
      number,
      special,
      strong,
    });
  }

  // Memo Hoist
  function criteriaMemo() {
    const result =
      validator.length &&
      validator.lower &&
      validator.upper &&
      validator.number &&
      validator.special;
    props.setCriteria(result);
    return result;
  }
}
