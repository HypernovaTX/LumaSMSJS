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
import { Login, Logout, PersonAdd } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCogs,
  faEnvelope,
  faFileUpload,
  faHeart,
  faLock,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

import { GlobalContext } from 'Global/GlobalContext';
import { LumaMenu } from 'Components';
import theme from 'MUIConfig';
import { UserContext } from 'User/UserContext';
import SubmitButton from './SubmitButton';

export default function NavUserDesktop() {
  // Const
  const { contrastText, main: mainColor, dark } = theme.palette.primary;
  const avatarStyle = {
    width: 48,
    height: 48,
    backgroundColor: mainColor,
    border: `1px solid ${mainColor}`,
  };
  const avatarMenuStyle = {
    width: 128,
    height: 128,
    backgroundColor: dark,
    border: `2px solid ${dark}`,
  };
  const anchorOrigin: PopoverOrigin = {
    vertical: 'bottom',
    horizontal: 'right',
  };
  const transformOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: 'right',
  };

  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { avatar, checkPermit, user, loading, login, logout } =
    useContext(UserContext);
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
              <SubmitButton />
            </Grid>
            <Grid container item xs="auto">
              <IconButton id="user-button" onClick={handleOpenMenu}>
                <Avatar
                  sx={avatarStyle}
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
                      <Typography fontWeight={500} variant="body2">
                        {t('nav.signedInAs')}
                      </Typography>
                      <Typography
                        sx={{ overflowWrap: 'break-word', maxWidth: 160 }}
                      >
                        <b>{username}</b>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item>
                    <Box my={1}>
                      <Avatar
                        sx={avatarMenuStyle}
                        alt={username}
                        src={avatar}
                        variant="rounded"
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Divider />
                {/* Profile */}
                <MenuItem onClick={handleCloseMenu}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faUser} color={contrastText} />
                  </ListItemIcon>
                  <ListItemText>{t('nav.profile')}</ListItemText>
                </MenuItem>
                {/* Message */}
                <MenuItem onClick={handleCloseMenu}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faEnvelope} color={contrastText} />
                  </ListItemIcon>
                  <ListItemText>{t('nav.DM')}</ListItemText>
                </MenuItem>
                <Divider />
                {/* Staff CP */}
                {checkPermit('acp_access')
                  ? [
                      <MenuItem onClick={handleCloseMenu} key="acp">
                        <ListItemIcon>
                          <FontAwesomeIcon icon={faLock} color={contrastText} />
                        </ListItemIcon>
                        <ListItemText>{t('nav.staff')}</ListItemText>
                      </MenuItem>,
                      <Divider key="div" />,
                    ]
                  : null}
                {/* Favorites */}
                <MenuItem onClick={handleCloseMenu}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faHeart} color={contrastText} />
                  </ListItemIcon>
                  <ListItemText>{t('nav.favorites')}</ListItemText>
                </MenuItem>
                {/* My Submissions */}
                <MenuItem onClick={handleCloseMenu}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faFileUpload} color={contrastText} />
                  </ListItemIcon>
                  <ListItemText>{t('nav.mySubmissions')}</ListItemText>
                </MenuItem>
                {/* preferences */}
                <MenuItem onClick={handleCloseMenu}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faCogs} color={contrastText} />
                  </ListItemIcon>
                  <ListItemText>{t('nav.preferences')}</ListItemText>
                </MenuItem>
                <Divider />
                {/* Log out */}
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" sx={{ color: contrastText }} />
                  </ListItemIcon>
                  <ListItemText>{t('nav.logout')}</ListItemText>
                </MenuItem>
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
  function handleLogout() {
    handleCloseMenu();
    logout();
  }

  // Memo hoists
  function usernameMemo() {
    return user?.username || t('main.unknown');
  }
}
