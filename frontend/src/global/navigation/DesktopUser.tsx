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
import { Login, PersonAdd } from '@mui/icons-material';

import { GlobalContext } from 'global/GlobalContext';
import { A, LumaDivider, LumaMenu } from 'components';
import theme, { styles } from 'MUIConfig';
import { UserContext } from 'user/UserContext';
import SubmitButtonDesktop from 'global/navigation/DesktopSubmitButton';
import useUserOptions from 'global/navigation/ConfigUser';

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
      {!loading ? (
        login && user ? (
          // logged in
          <Grid container item>
            <Grid container item alignContent="center" xs="auto">
              <SubmitButtonDesktop />
            </Grid>
            <Grid container item xs="auto">
              <IconButton id="user-button" onClick={handleOpenMenu}>
                <Avatar
                  sx={styles.navAvatar}
                  variant="rounded"
                  alt={username}
                  src={avatar}
                />
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
                    <Box my={1}>
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
                {userMenu.map((i, k) =>
                  !i.staff || (i.staff && checkPermit('acp_access')) ? (
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
            <Button
              color="secondary"
              variant="contained"
              startIcon={<Login />}
              sx={{ mr: 1, height: '2rem' }}
              onClick={() => navigate('/login')}
            >
              {t('user.login')}
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              startIcon={<PersonAdd />}
              sx={{ ml: 1, height: '2rem' }}
              onClick={() => navigate('/register')}
            >
              {t('user.register')}
            </Button>
          </>
        )
      ) : (
        // loading
        <CircularProgress size={32} />
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
