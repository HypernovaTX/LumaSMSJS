import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, InputBase } from '@mui/material';
import { Search } from '@mui/icons-material';

import theme, { styles } from 'theme/styles';

interface SearchBarProps {
  disabled?: boolean;
}

export default function SearchBar(props: SearchBarProps) {
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
        type="text"
        margin="dense"
        placeholder={t('main.search')}
        sx={{
          color: searchColor,
          margin: '0.25rem',
        }}
        name="search"
        autoComplete="off"
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        disabled={props.disabled}
      />
      <IconButton
        //type="submit"
        sx={{ p: '10px', color: searchColor }}
        aria-label="search"
        disabled={props.disabled}
      >
        <Search />
      </IconButton>
    </Box>
  );
}
