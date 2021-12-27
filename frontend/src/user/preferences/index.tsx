import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Box, Container, Grid, ListItemText, MenuItem } from '@mui/material';
import mixColor from 'mix-color';

import { useAPI_userUpdate } from 'api';
import { A, LumaText } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import { useSetTitle } from 'lib';
import theme, { styles } from 'theme/styles';
import routes from 'route.config';
import { User } from 'schema/userSchema';
import { UserContext } from 'user/UserContext';
import { menuOptions, SettingMenuItems } from 'user/preferences/options';
import UserAvatarSettings from 'user/preferences/UserAvatar';
import UserBannerSettings from 'user/preferences/UserBanner';
import UserEmailSettings from './UserEmail';
import UsernameSettings from 'user/preferences/Username';
import UserPasswordSettings from 'user/preferences/UserPassword';
import UserProfileSettings from 'user/preferences/UserProfile';

const { contrastText } = theme.palette.primary;
const navHighlight = mixColor(theme.palette.primary.main, '#FFF', 0.2);

export default function UserSettings() {
  // Custom hooks
  const { t } = useTranslation();
  const { kind: kindParam } =
    useParams<{ kind: SettingMenuItems | undefined }>();
  useSetTitle(t('title.settings'));

  // Context
  const { loading: userLoading, user, setUser } = useContext(UserContext);
  const { isMobile, isSmallMobile, toast } = useContext(GlobalContext);

  // States
  const [kind, setKind] = useState<SettingMenuItems>('main');
  const [userProfile, setUserProfile] = useState<User>(user ?? {});

  // Data
  const { execute: updateUser, loading: updateLoading } = useAPI_userUpdate({
    skip: true,
    body: {
      data: '{}',
    },
    onComplete: () => {
      toast(t('user.updateDone'), 'success');
      setUser(userProfile);
    },
    onError: (err) => {
      toast(err.message, 'error');
    },
  });

  // Memo
  const loading = useMemo(loadingMemo, [updateLoading, userLoading]);
  const childComponent = useMemo(childComponentMemo, [
    kind,
    loading,
    updateUser,
    user,
  ]);

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
          mb={isMobile ? 4 : 8}
          style={{ backgroundColor: theme.palette.primary.dark }}
        >
          <Grid container>
            {/* Nav Menu */}
            <Grid container item xs={isSmallMobile ? 12 : 3}>
              <Box
                width="100%"
                style={{ backgroundColor: theme.palette.primary.main }}
              >
                {menuOptions.map((i, k) => {
                  const url = `${routes.profileSettings}/${i.id}`;
                  return (
                    <A url={url} key={k} color={contrastText}>
                      <MenuItem
                        onClick={handleMenuItem(i.id)}
                        sx={
                          i.id === kind
                            ? { backgroundColor: navHighlight }
                            : undefined
                        }
                      >
                        <Box my={isSmallMobile ? 0 : 1} display="inline-flex">
                          <ListItemText>{t(i.text)}</ListItemText>
                        </Box>
                      </MenuItem>
                    </A>
                  );
                })}
              </Box>
            </Grid>
            {/* Settings section */}
            <Grid container item xs={isSmallMobile ? 12 : 9}>
              {childComponent}
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );

  // Handles
  function handleMenuItem(kind: SettingMenuItems) {
    return function () {
      setKind(kind);
    };
  }

  // Effect hoist
  function initEffect() {
    if (kindParam) setKind(kindParam);
    if (user) setUserProfile(user);
  }

  // Memo hoist
  function childComponentMemo() {
    function handleUpdateUser(body: User) {
      setUserProfile({ ...user, ...body } as User);
      updateUser({ data: JSON.stringify(body) });
    }
    switch (kind) {
      case 'main':
        return (
          <UserProfileSettings
            user={user}
            update={handleUpdateUser}
            loading={loading}
          />
        );
      case 'avatar':
        return <UserAvatarSettings />;
      case 'banner':
        return <UserBannerSettings />;
      case 'username':
        return <UsernameSettings />;
      case 'email':
        return <UserEmailSettings />;
      case 'password':
        return <UserPasswordSettings />;
      default:
        return null;
    }
  }
  function loadingMemo() {
    return userLoading || updateLoading;
  }
}
