import React, { useContext, useMemo, useState } from 'react';
import {
  AppBar,
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

export default function Navigation() {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { user, loaded, login } = useContext(UserContext);

  // State
  const [searchFocused, setSearchFocused] = useState(false);

  // Memo
  const [searchColor, searchBackground] = useMemo(searchBackgroundMemo, [
    searchFocused,
  ]);

  // Output
  return (
    <AppBar position="fixed" color="transparent">
      <Box sx={{ backgroundColor: theme.palette.primary.dark }}>
        <Container maxWidth="xl">
          <Grid container flexDirection="row">
            {/* Logo */}
            <Grid item container alignContent="center" xs="auto">
              <Box px={1}>
                <Typography variant="h3">{t('main.siteName')}</Typography>
              </Box>
            </Grid>
            {/* Nav */}
            <Grid item container flexDirection="row" xs="auto">
              <Grid item container alignContent="center" xs="auto">
                <Box px={1}>
                  <Typography variant="h5">{t('nav.games')}</Typography>
                </Box>
              </Grid>
              <Grid item container alignContent="center" xs="auto">
                <Box px={1}>
                  <Typography variant="h5">{t('nav.resources')}</Typography>
                </Box>
              </Grid>
              <Grid item container alignContent="center" xs="auto">
                <Box px={1}>
                  <Typography variant="h5">{t('nav.community')}</Typography>
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
            <Grid item container alignContent="center" xs="auto">
              {loaded ? (
                login ? (
                  <></>
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
