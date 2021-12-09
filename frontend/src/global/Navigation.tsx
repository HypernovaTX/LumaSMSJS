import React, { useContext, useMemo, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputBase,
  Typography,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

import theme, { styles } from 'MUIConfig';
import { UserContext } from 'User/UserContext';
import logo from 'image/logo.svg';
import { GlobalContext } from 'Global/GlobalContext';

export default function Navigation() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { avatar, user, loaded, login } = useContext(UserContext);
  const { navigate } = useContext(GlobalContext);

  // State
  const [searchFocused, setSearchFocused] = useState(false);

  // Memo
  const [searchColor, searchBackground] = useMemo(searchBackgroundMemo, [
    searchFocused,
  ]);

  // Output
  return (
    <AppBar position="sticky" color="transparent">
      <Box sx={{ backgroundColor: theme.palette.primary.dark }}>
        <Container maxWidth="xl">
          <Grid container flexDirection="row" sx={{ height: '80px' }}>
            {/* Logo */}
            <Grid item container alignContent="center" xs="auto">
              <Box
                px={1}
                sx={{
                  width: 160,
                  height: 64,
                  backgroundImage: `url(${logo})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/')}
              />
            </Grid>
            {/* Nav */}
            <Grid item container flexDirection="row" xs="auto">
              <Grid item container alignContent="center" xs="auto">
                <Box px={1}>
                  <Typography variant="h6">{t('nav.games')}</Typography>
                </Box>
              </Grid>
              <Grid item container alignContent="center" xs="auto">
                <Box px={1}>
                  <Typography variant="h6">{t('nav.resources')}</Typography>
                </Box>
              </Grid>
              <Grid item container alignContent="center" xs="auto">
                <Box px={1}>
                  <Typography variant="h6">{t('nav.community')}</Typography>
                </Box>
              </Grid>
            </Grid>
            {/* Search */}
            <Grid item container flexDirection="row" xs={true}>
              <Box
                pl={2}
                m="1rem 1rem"
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
                  <SearchIcon />
                </IconButton>
              </Box>
            </Grid>
            {/* User profile/login */}
            <Grid item container alignContent="center" xs="auto">
              {loaded ? (
                login && user ? (
                  <Grid container item>
                    <Grid container item xs="auto" alignContent="center">
                      <Box px={1}>
                        <Typography>{user?.username}</Typography>
                      </Box>
                    </Grid>
                    <Grid container item xs="auto">
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
                    </Grid>
                  </Grid>
                ) : (
                  <>
                    <Button
                      color="secondary"
                      variant="contained"
                      startIcon={<LoginIcon />}
                      sx={{ mr: 1, height: '2rem' }}
                    >
                      {t('user.login')}
                    </Button>
                    <Button
                      color="secondary"
                      variant="outlined"
                      startIcon={<PersonAddIcon />}
                      sx={{ ml: 1, height: '2rem' }}
                    >
                      {t('user.register')}
                    </Button>
                  </>
                )
              ) : (
                <CircularProgress size={32} />
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </AppBar>
  );

  function searchBackgroundMemo() {
    return searchFocused
      ? [theme.palette.primary.dark, theme.palette.background.paper]
      : [theme.palette.background.paper, theme.palette.primary.main];
  }
}
