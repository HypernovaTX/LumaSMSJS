import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, IconButton, InputBase } from '@mui/material';
import { Search } from '@mui/icons-material';

import { A } from 'components';
import logo from 'image/logo.svg';
import theme, { styles } from 'MUIConfig';
import NavMenuDesktop from 'global/navigation/MenuDesktop';
import NavUserDesktop from 'global/navigation/UserDesktop';

export default function NavDesktop() {
  // Custom hooks
  const { t } = useTranslation();

  // State
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
      {/* Menu */}
      <NavMenuDesktop />
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
      <NavUserDesktop />
    </Grid>
  );
}
