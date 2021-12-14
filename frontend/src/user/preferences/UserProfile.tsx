import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Grid } from '@mui/material';

import { LumaInput, LumaText } from 'components';
import { User } from 'schema/userSchema';
import inputCF from './config';
import { dateToDash } from 'lib';

const today = dateToDash(new Date());
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
        <Grid container item direction="column">
          <Box mx={1}>
            <LumaText variant="body2">{t('user.bio')}</LumaText>
          </Box>
          <LumaInput
            name="bio"
            multiline
            fullWidth
            rows={3}
            maxRows={3}
            size="small"
            value={inputs.bio ?? ''}
            onChange={handleInputChange}
            inputProps={{ maxLength: inputCF.MAX_BIO }}
          />
          <Box width="100%" textAlign="right" mr={2} mb={1}>
            <LumaText variant="body2">
              {`${inputs.bio ? inputs.bio.length : 0}/${inputCF.MAX_BIO}`}
            </LumaText>
          </Box>
        </Grid>
        <Grid container item direction="column">
          <Box mx={1}>
            <LumaText variant="body2">{t('user.birthday')}</LumaText>
          </Box>
          <LumaInput
            name="birthday"
            type="date"
            defaultValue={today}
            value={inputs.birthday ?? ''}
            sx={{ width: 180 }}
            onChange={handleInputChange}
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
    let data = {} as User;
    switch (e.target.name) {
      case 'bio':
        data.bio = e.target.value;
        break;
      case 'birthday':
        data.birthday = e.target.value;
        break;
    }
    setInputs({ ...inputs, ...data });
  }
}
