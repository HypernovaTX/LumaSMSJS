import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Container,
  Grid,
  IconButton,
  InputBase,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

import theme from 'MUIConfig';

export default function Navigation() {
  // Custom hooks
  const { t } = useTranslation();

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
        <Container>
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
                  transition: '200ms linear all',
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
