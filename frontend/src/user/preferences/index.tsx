import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Box, Container, Grid, ListItemText, MenuItem } from '@mui/material';

import { useAPI_userUpdate } from 'api';
import { A, LumaText } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import { useSetTitle } from 'lib';
import theme, { styles } from 'MUIConfig';
import routes from 'route.config';
import { User } from 'schema/userSchema';
import { UserContext } from 'user/UserContext';
import UserProfileSettings from './UserProfile';

const { contrastText } = theme.palette.primary;
const menuOptions = [
  {
    id: 'main',
    text: 'user.profile',
  },
  {
    id: 'avatar',
    text: 'user.avatar',
  },
  {
    id: 'banner',
    text: 'user.banner',
  },
  {
    id: 'username',
    text: 'user.username',
  },
  {
    id: 'email',
    text: 'user.email',
  },
  {
    id: 'password',
    text: 'user.password',
  },

  {
    id: 'site',
    text: 'user.siteSettings',
  },
] as const;
export type SettingMenuItems = typeof menuOptions[number]['id'];

export default function UserSettings() {
  // Custom hooks
  const { t } = useTranslation();
  const { kind: kindParam } =
    useParams<{ kind: SettingMenuItems | undefined }>();
  useSetTitle(t('title.settings'));

  // Context
  const { user, setUser } = useContext(UserContext);
  const { isMobile } = useContext(GlobalContext);

  // States
  const [kind, setKind] = useState<SettingMenuItems>('main');
  const [userProfile, setUserProfile] = useState<User>();

  // Data
  const { execute: updateUser } = useAPI_userUpdate({
    skip: true,
    body: {
      data: {},
    },
    onComplete: () => {
      if (userProfile) setUser(userProfile);
    },
    onError: () => {},
  });

  // Memo
  const childComponent = useMemo(childComponentMemo, [kind, setUser, user]);

  // Effects
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(initEffect, []);

  // Output
  return (
    <Box flex="1 0 auto" width="100%" style={styles.zigzagBG}>
      <Container maxWidth="xl">
        <Box width="100%" my={isMobile ? 2 : 4}>
          <LumaText isTitle align="center">
            {t('title.settings')}
          </LumaText>
        </Box>
      </Container>
      <Container maxWidth="md">
        <Box
          width="100%"
          style={{ backgroundColor: theme.palette.primary.dark }}
        >
          <Grid container>
            <Grid container item xs={3}>
              <Box
                width="100%"
                style={{ backgroundColor: theme.palette.primary.main }}
              >
                {menuOptions.map((i, k) => {
                  const url = `${routes.profileSettings}/${i.id}`;
                  return (
                    <A url={url} key={k} color={contrastText}>
                      <MenuItem>
                        <Box my={1} display="inline-flex">
                          <ListItemText>{t(i.text)}</ListItemText>
                        </Box>
                      </MenuItem>
                    </A>
                  );
                })}
              </Box>
            </Grid>
            <Grid container item xs={9}>
              {childComponent}
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );

  // Effect hoist
  function initEffect() {
    if (kindParam) setKind(kindParam);
    if (user) setUserProfile(user);
  }

  // Memo hoist
  function childComponentMemo() {
    switch (kind) {
      case 'main':
        return <UserProfileSettings user={user} update={setUser} />;
      case 'site':
        return null;
    }
  }
}
