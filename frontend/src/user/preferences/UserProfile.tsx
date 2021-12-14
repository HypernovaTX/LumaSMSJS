import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Grid } from '@mui/material';

import { LumaInput, LumaText } from 'components';
import { User, UserKeys } from 'schema/userSchema';
import CF from 'config';
interface ProfileSettingsProps {
  user?: User;
  update: (p: User) => void;
}

export default function UserProfileSettings(props: ProfileSettingsProps) {
  // Custom hooks
  const { t } = useTranslation();

  // State
  const [inputs, setInputs] = useState<User>(props?.user ?? {});

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
            value={inputs.title}
            onChange={handleInputChange}
            inputProps={{ maxLength: CF.MAX_128 }}
          />
          <Box width="100%" textAlign="right" mr={2} mb={1}>
            <LumaText variant="body2">
              {`${inputs.title ? inputs.title.length : 0}/${CF.MAX_128}`}
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
            maxRows={3}
            size="small"
            value={inputs.signature}
            onChange={handleInputChange}
            inputProps={{ maxLength: CF.MAX_512 }}
          />
          <Box width="100%" textAlign="right" mr={2} mb={1}>
            <LumaText variant="body2">
              {`${inputs.signature ? inputs.signature.length : 0}/${
                CF.MAX_512
              }`}
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
            maxRows={3}
            size="small"
            value={inputs.bio}
            onChange={handleInputChange}
            inputProps={{ maxLength: CF.MAX_512 }}
          />
          <Box width="100%" textAlign="right" mr={2} mb={1}>
            <LumaText variant="body2">
              {`${inputs.bio ? inputs.bio.length : 0}/${CF.MAX_512}`}
            </LumaText>
          </Box>
        </Grid>
        {/* -------------------- Birthday -------------------- */}
        <Grid container item direction="column">
          <LumaText variant="body2">
            <b>{t('user.birthday')}</b>
          </LumaText>
          <LumaInput
            name="birthday"
            type="date"
            value={inputs.birthday}
            sx={{ width: 180 }}
            onChange={handleInputChange}
            onBlur={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
          <Box width="100%" textAlign="right" mr={2} mb={1} />
        </Grid>
      </Grid>
    </Box>
  );
  // Handles
  function handleInputChange(
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
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
    }
    setInputs({ ...inputs, ...data });
  }
}
