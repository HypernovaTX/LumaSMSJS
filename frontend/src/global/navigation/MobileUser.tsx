import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  PopoverOrigin,
  Typography,
} from '@mui/material';
import {
  AccountCircle,
  Close,
  Email,
  Login,
  Notifications,
  PersonAdd,
} from '@mui/icons-material';

import { A, LumaButton, LumaDivider, LumaDrawer, LumaMenu } from 'components';
import theme, { styles } from 'MUIConfig';
import { UserContext } from 'user/UserContext';
import useUserOptions from 'global/navigation/ConfigUser';
import routes from 'route.config';

const anchorOrigin: PopoverOrigin = {
  vertical: 'bottom',
  horizontal: 'right',
};
const transformOrigin: PopoverOrigin = {
  vertical: 'top',
  horizontal: 'right',
};

export default function NavUserMobile() {
  // Const
  const { contrastText } = theme.palette.primary;

  // Custom hooks
  const { t } = useTranslation();
  const userMenu = useUserOptions();

  // Context
  const { avatar, checkPermit, user, loading, login } = useContext(UserContext);

  // State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Memo
  const username = useMemo(usernameMemo, [t, user?.username]);

  // Output
  return (
    <Grid item container alignContent="center" xs="auto">
      <Grid item container xs="auto">
        {!loading ? (
          login && user ? (
            // logged in
            <Box>
              <IconButton id="user-button" onClick={handleOpenMenu}>
                <Avatar
                  sx={styles.navAvatarMobile}
                  variant="rounded"
                  alt={username}
                  src={avatar}
                />
              </IconButton>
              <LumaDrawer
                anchor="right"
                open={open}
                onClose={handleCloseMenu}
                color={theme.palette.primary.dark}
              >
                {/* Info */}
                <Box mx={2} my={2} position="relative">
                  <Grid container direction="column">
                    <Grid item container justifyContent="center" xs={12}>
                      <Typography variant="body2">
                        {t('nav.signedInAs')}
                      </Typography>
                    </Grid>
                    <Grid item container justifyContent="center" xs={12}>
                      <Typography
                        align="center"
                        fontWeight={600}
                        sx={{ overflowWrap: 'break-word', maxWidth: '20ch' }}
                      >
                        {username}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box position="absolute" top="0" right="0">
                    <IconButton
                      onClick={handleCloseMenu}
                      style={{ color: theme.palette.primary.contrastText }}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                </Box>
                {/* Inbox / Notifications */}
                <Box mx={2} mb={2}>
                  <Grid container justifyContent="center">
                    <Grid item xs={5}>
                      <A url={routes.profileDM}>
                        <LumaButton
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={<Email />}
                          onClick={handleCloseMenu}
                          style={{
                            paddingRight: 10,
                          }}
                        />
                      </A>
                    </Grid>
                    <Grid item xs={1} />
                    <Grid item xs={5}>
                      <A url={routes.profileDM}>
                        <LumaButton
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={<Notifications />}
                          onClick={handleCloseMenu}
                          style={{
                            paddingRight: 10,
                          }}
                        />
                      </A>
                    </Grid>
                  </Grid>
                </Box>
                {/* Rest of the items */}
                {userMenu.map((i, k) =>
                  (!i.staff || (i.staff && checkPermit('acp_access'))) &&
                  i.showMobile ? (
                    <Box key={k}>
                      <A url={i.url} color={contrastText}>
                        <MenuItem onClick={handleCloseMenu}>
                          <Box my={1} display="inline-flex">
                            <ListItemIcon>{i.icon}</ListItemIcon>
                            <ListItemText>{t(i.translation)}</ListItemText>
                          </Box>
                        </MenuItem>
                      </A>
                      {i.divider ? <LumaDivider /> : null}
                    </Box>
                  ) : null
                )}
              </LumaDrawer>
            </Box>
          ) : (
            // guest
            <Box>
              <IconButton
                id="user-button"
                onClick={handleOpenMenu}
                style={{ color: theme.palette.primary.contrastText }}
              >
                <AccountCircle style={{ width: 40, height: 40 }} />
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
                <A url={routes.userLogin} color={contrastText}>
                  <MenuItem onClick={handleCloseMenu}>
                    <Box my={1} display="inline-flex">
                      <ListItemIcon>
                        <Login
                          style={{ color: theme.palette.primary.contrastText }}
                        />
                      </ListItemIcon>
                      <ListItemText>{t('user.login')}</ListItemText>
                    </Box>
                  </MenuItem>
                </A>
                <A url={routes.userRegister} color={contrastText}>
                  <MenuItem onClick={handleCloseMenu}>
                    <Box my={1} display="inline-flex">
                      <ListItemIcon>
                        <PersonAdd
                          style={{ color: theme.palette.primary.contrastText }}
                        />
                      </ListItemIcon>
                      <ListItemText>{t('user.register')}</ListItemText>
                    </Box>
                  </MenuItem>
                </A>
              </LumaMenu>
            </Box>
          )
        ) : (
          // loading
          <CircularProgress size={32} />
        )}
      </Grid>
    </Grid>
  );

  // Handles
  function handleOpenMenu(e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if ((!login || !user) && e) setAnchorEl(e.currentTarget);
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
