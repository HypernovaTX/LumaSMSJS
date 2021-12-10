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
  InputBase,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from '@mui/material';
import { Login, Logout, PersonAdd, Search } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faCube,
  faGamepad,
  faHeadphones,
  faHeart,
  faImage,
  faLock,
  faMoon,
  faPlus,
  faQuestionCircle,
  faTrophy,
  faUserCog,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';

import { GlobalContext } from 'Global/GlobalContext';
import { A, LumaMenu } from 'Lib';
import logo from 'image/logo.svg';
import theme, { styles } from 'MUIConfig';
import { UserContext } from 'User/UserContext';

enum menuOpen {
  games,
  resources,
  community,
  user,
}

enum actions {
  // games
  games,
  hacks,
  hallOfFame,
  // resources
  graphics,
  models,
  sounds,
  misc,
  // community
  forums,
  discord,
  twitter,
  // user
  profile,
  staffCP,
  favorites,
  submit,
  preferences,
  logout,
}

export default function NavDesktop() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { avatar, checkPermit, user, loading, login, logout } =
    useContext(UserContext);
  const { navigate } = useContext(GlobalContext);

  // State
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [open, setOpen] = useState<menuOpen>();
  const [searchFocused, setSearchFocused] = useState(false);

  // Memo
  const [searchColor, searchBackground] = useMemo(searchBackgroundMemo, [
    searchFocused,
  ]);

  function searchBackgroundMemo() {
    return searchFocused
      ? [theme.palette.primary.dark, theme.palette.background.paper]
      : [theme.palette.background.paper, theme.palette.primary.main];
  }

  return (
    <Grid container flexDirection="row" sx={{ height: '80px' }}>
      {/* Logo */}
      <Grid item container alignContent="center" xs="auto">
        <A url="/">
          <Box
            mr={2}
            my={1}
            sx={{
              width: 160,
              height: 64,
              backgroundImage: `url(${logo})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: 'pointer',
            }}
          />
        </A>
      </Grid>
      {/* Nav */}
      <Grid item container flexDirection="row" xs="auto">
        {/* ----- GAMES ----- */}
        <Grid item container alignContent="center" xs="auto">
          <Box px={1}>
            <Button
              color="inherit"
              id="games-button"
              size="large"
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setOpen(menuOpen.games);
              }}
            >
              {t('nav.games')}
            </Button>
            <LumaMenu
              id="games-menu"
              aria-labelledby="games-button"
              anchorEl={anchorEl}
              open={open === menuOpen.games}
              onClose={handleCloseMenu}
            >
              {/* GAMES > Games */}
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faGamepad}
                    color={theme.palette.primary.contrastText}
                  />
                </ListItemIcon>
                <ListItemText>{t('nav.games')}</ListItemText>
              </MenuItem>
              {/* GAMES > Hacks */}
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faMoon}
                    color={theme.palette.primary.contrastText}
                  />
                </ListItemIcon>
                <ListItemText>{t('nav.hacks')}</ListItemText>
              </MenuItem>
              {/* GAMES > Hall of Fame */}
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faTrophy}
                    color={theme.palette.primary.contrastText}
                  />
                </ListItemIcon>
                <ListItemText>{t('nav.hallOfFame')}</ListItemText>
              </MenuItem>
            </LumaMenu>
          </Box>
        </Grid>
        {/* ----- RESOURCES ----- */}
        <Grid item container alignContent="center" xs="auto">
          <Box px={1}>
            <Button
              color="inherit"
              id="res-button"
              size="large"
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setOpen(menuOpen.resources);
              }}
            >
              {t('nav.resources')}
            </Button>
            <LumaMenu
              id="res-menu"
              aria-labelledby="res-button"
              anchorEl={anchorEl}
              open={open === menuOpen.resources}
              onClose={handleCloseMenu}
            >
              {/* RESOURCES > Graphics */}
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faImage}
                    color={theme.palette.primary.contrastText}
                  />
                </ListItemIcon>
                <ListItemText>{t('nav.graphics')}</ListItemText>
              </MenuItem>
              {/* RESOURCES > Models */}
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faCube}
                    color={theme.palette.primary.contrastText}
                  />
                </ListItemIcon>
                <ListItemText>{t('nav.models')}</ListItemText>
              </MenuItem>
              {/* RESOURCES > Sound & Music */}
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faHeadphones}
                    color={theme.palette.primary.contrastText}
                  />
                </ListItemIcon>
                <ListItemText>{t('nav.sounds')}</ListItemText>
              </MenuItem>
              {/* RESOURCES > Misc */}
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    color={theme.palette.primary.contrastText}
                  />
                </ListItemIcon>
                <ListItemText>{t('nav.misc')}</ListItemText>
              </MenuItem>
            </LumaMenu>
          </Box>
        </Grid>
        {/* ----- COMMUNITY ----- */}
        <Grid item container alignContent="center" xs="auto">
          <Box px={1}>
            <Button
              color="inherit"
              id="com-button"
              size="large"
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setOpen(menuOpen.community);
              }}
            >
              {t('nav.community')}
            </Button>
            <LumaMenu
              id="com-menu"
              aria-labelledby="com-button"
              anchorEl={anchorEl}
              open={open === menuOpen.community}
              onClose={handleCloseMenu}
            >
              {/* COMMUNITY > Forums */}
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faComments}
                    color={theme.palette.primary.contrastText}
                  />
                </ListItemIcon>
                <ListItemText>{t('nav.forums')}</ListItemText>
              </MenuItem>
              {/* GAMES > Hacks */}
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faDiscord}
                    color={theme.palette.primary.contrastText}
                  />
                </ListItemIcon>
                <ListItemText>{t('nav.discord')}</ListItemText>
              </MenuItem>
              {/* GAMES > Hall of Fame */}
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    icon={faTwitter}
                    color={theme.palette.primary.contrastText}
                  />
                </ListItemIcon>
                <ListItemText>{t('nav.twitter')}</ListItemText>
              </MenuItem>
            </LumaMenu>
          </Box>
        </Grid>
      </Grid>
      {/* Search */}
      <Grid item container flexDirection="row" xs={true}>
        <Box
          pl={2}
          m="auto 1rem"
          height="2.5rem"
          borderRadius="1rem"
          display="flex"
          alignItems="center"
          width="100%"
          sx={{
            backgroundColor: searchBackground,
            transition: styles.transition.transition,
          }}
        >
          <InputBase
            fullWidth
            margin="dense"
            placeholder={t('main.search')}
            sx={{
              color: searchColor,
              margin: '0.25rem',
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <IconButton
            //type="submit"
            sx={{ p: '10px', color: searchColor }}
            aria-label="search"
          >
            <Search />
          </IconButton>
        </Box>
      </Grid>
      {/* User profile/login section */}
      <Grid item container alignContent="center" xs="auto">
        {!loading ? (
          login && user ? (
            // logged in
            <Grid container item>
              <Grid container item xs="auto">
                <IconButton
                  id="user-button"
                  onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setOpen(menuOpen.user);
                  }}
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: theme.palette.primary.main,
                      border: `1px solid ${theme.palette.primary.main}`,
                    }}
                    variant="rounded"
                    alt={user?.username || t('main.unknown')}
                    src={avatar}
                  />
                </IconButton>
                <LumaMenu
                  id="user-menu"
                  aria-labelledby="user-button"
                  anchorEl={anchorEl}
                  open={open === menuOpen.user}
                  onClose={handleCloseMenu}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {/* USER > Profile */}
                  <MenuItem onClick={handleCloseMenu}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: theme.palette.primary.main,
                        }}
                        alt={user?.username || t('main.unknown')}
                        src={avatar}
                      />
                    </ListItemIcon>
                    <ListItemText>{user?.username}</ListItemText>
                  </MenuItem>
                  <Divider />
                  {checkPermit('acp_access') ? (
                    <>
                      {/* USER > STAFF */}
                      <MenuItem onClick={handleCloseMenu}>
                        <ListItemIcon>
                          <FontAwesomeIcon
                            icon={faLock}
                            color={theme.palette.primary.contrastText}
                          />
                        </ListItemIcon>
                        <ListItemText>{t('nav.staff')}</ListItemText>
                      </MenuItem>
                      <Divider />
                    </>
                  ) : null}
                  {/* USER > Favorites */}
                  <MenuItem onClick={handleCloseMenu}>
                    <ListItemIcon>
                      <FontAwesomeIcon
                        icon={faHeart}
                        color={theme.palette.primary.contrastText}
                      />
                    </ListItemIcon>
                    <ListItemText>{t('nav.favorites')}</ListItemText>
                  </MenuItem>
                  {/* USER > Submit File */}
                  <MenuItem onClick={handleCloseMenu}>
                    <ListItemIcon>
                      <FontAwesomeIcon
                        icon={faPlus}
                        color={theme.palette.primary.contrastText}
                      />
                    </ListItemIcon>
                    <ListItemText>{t('nav.submitFile')}</ListItemText>
                  </MenuItem>
                  {/* USER > preferences */}
                  <MenuItem onClick={handleCloseMenu}>
                    <ListItemIcon>
                      <FontAwesomeIcon
                        icon={faUserCog}
                        color={theme.palette.primary.contrastText}
                      />
                    </ListItemIcon>
                    <ListItemText>{t('nav.preferences')}</ListItemText>
                  </MenuItem>

                  {/* USER > log out */}
                  <Divider />
                  <MenuItem onClick={() => menuItem(actions.logout)}>
                    <ListItemIcon>
                      <Logout
                        fontSize="small"
                        sx={{ color: theme.palette.primary.contrastText }}
                      />
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
    </Grid>
  );

  // Handles
  function handleCloseMenu() {
    setOpen(undefined);
    setAnchorEl(null);
  }

  function menuItem(action: actions) {
    switch (action) {
      case actions.logout:
        logout();
        break;
    }
    handleCloseMenu();
  }
}
