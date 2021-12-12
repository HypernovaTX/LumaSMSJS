import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  PopoverOrigin,
  Typography,
} from '@mui/material';
import { Login, NotificationsNone, PersonAdd } from '@mui/icons-material';

import { A, LumaDivider, LumaMenu, LumaToolTip } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import useUserOptions from 'global/navigation/ConfigUser';
import SubmitButtonDesktop from 'global/navigation/DesktopSubmitButton';
import theme, { styles } from 'MUIConfig';
import routes from 'route.config';
import { UserContext } from 'user/UserContext';

const anchorOrigin: PopoverOrigin = {
  vertical: 'bottom',
  horizontal: 'right',
};
const transformOrigin: PopoverOrigin = {
  vertical: 'top',
  horizontal: 'right',
};

export default function NavUserDesktop() {
  // Const
  const { contrastText } = theme.palette.primary;

  // Custom hooks
  const { t } = useTranslation();
  const userMenu = useUserOptions();

  // Context
  const { avatar, checkPermit, user, loading, login } = useContext(UserContext);
  const { navigate } = useContext(GlobalContext);

  // State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Memo
  const username = useMemo(usernameMemo, [t, user?.username]);

  // Output
  return (
    <Grid item container alignContent="center" xs="auto">
      {login && user ? (
          // logged in
          <Grid container item>
            <Grid container item alignContent="center" xs="auto">
              <LumaToolTip title={`${t('nav.notifications')}`}>
                <IconButton
                  id="submit-button"
                  onClick={() => navigate(routes.profileNotifications)}
                  style={{ color: contrastText }}
                >
                  <Box
                    width={32}
                    height={32}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <NotificationsNone style={{ width: 26, height: 26 }} />
                  </Box>
                </IconButton>
              </LumaToolTip>
            </Grid>
            <Grid container item alignContent="center" xs="auto">
              <SubmitButtonDesktop />
            </Grid>
            <Grid container item xs="auto">
              <IconButton id="user-button" onClick={handleOpenMenu}>
                {!loading ? (
                  // The user avatar
                <Avatar
                  sx={styles.navAvatar}
                  variant="rounded"
                  alt={username}
                  src={avatar}
                />
                ) : (
                  // If the avatar is loading show the loading icon in place of it
                  <CircularProgress size={32} />
                )}
              </IconButton>
              <LumaMenu
                id="user-menu"
                aria-labelledby="user-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                anchorOrigin={anchorOrigin}
                transformOrigin={transformOrigin}
              >
                {/* Info */}
                <Grid container direction="column" alignItems="center">
                  <Grid item>
                    <Box mx={2} textAlign="center">
                      <Typography variant="body2">
                        {t('nav.signedInAs')}
                      </Typography>
                      <Typography
                        fontWeight={600}
                        sx={{ overflowWrap: 'break-word', maxWidth: 160 }}
                      >
                        {username}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item>
                    <Box mt={1} mb={2}>
                      <Avatar
                        sx={styles.navAvatarMenu}
                        alt={username}
                        src={avatar}
                        variant="rounded"
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Divider />
                {/* Rest of the items */}
                {userMenu.map((i, k) =>
                  (!i.staff || (i.staff && checkPermit('acp_access'))) &&
                  i.showDesktop ? (
                    <Box key={k}>
                      <A url={i.url} color={contrastText}>
                        <MenuItem onClick={handleCloseMenu}>
                          <ListItemIcon>{i.icon}</ListItemIcon>
                          <ListItemText>{t(i.translation)}</ListItemText>
                        </MenuItem>
                      </A>
                      {i.divider ? <LumaDivider /> : null}
                    </Box>
                  ) : null
                )}
              </LumaMenu>
            </Grid>
          </Grid>
        ) : (
          // guest
          <>
          {!loading ? (
            <>
            <Button
              color="secondary"
              variant="contained"
              startIcon={<Login />}
              sx={{ mr: 1, height: '2rem' }}
              onClick={() => navigate(routes.userLogin)}
            >
              {t('user.login')}
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              startIcon={<PersonAdd />}
              sx={{ ml: 1, height: '2rem' }}
              onClick={() => navigate(routes.userRegister)}
            >
              {t('user.register')}
            </Button>
            </>
          ) : (
            // Only show the loading icon when the page is loading
            // and when we are unsure if the user is logged in or not
            <CircularProgress size={32} />
          )}
          </>
        )}
    </Grid>
  );

  // Handles
  function handleOpenMenu(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setAnchorEl(e.currentTarget);
    setOpen(true);
  }
  function handleCloseMenu() {
    setAnchorEl(null);
    setOpen(false);
  }

  // Memo hoists
  function usernameMemo() {
    return user?.username || t('main.unknown');
  }
}
