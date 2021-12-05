import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Container,
  Grid,
  IconButton,
  InputBase,
  Typography,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function Navigation() {
  // Custom Hooks
  const theme = useTheme();

  // State
  const [searchFocused, setSearchFocused] = useState(false);

  // Memo
  const [searchColor, searchBackground] = useMemo(searchBackgroundMemo, [
    searchFocused,
    theme.palette.background.paper,
    theme.palette.primary.light,
    theme.palette.primary.main,
  ]);

  // Output
  return (
    <AppBar position="fixed">
      <Container>
        <Grid container flexDirection="row">
          {/* Logo */}
          <Grid item container alignContent="center" xs="auto">
            <Box px={1}>
              <Typography variant="h3">MFGG</Typography>
            </Box>
          </Grid>
          {/* Nav */}
          <Grid item container flexDirection="row" xs="auto">
            <Grid item container alignContent="center" xs="auto">
              <Box px={1}>
                <Typography variant="h5">Games</Typography>
              </Box>
            </Grid>
            <Grid item container alignContent="center" xs="auto">
              <Box px={1}>
                <Typography variant="h5">Resources</Typography>
              </Box>
            </Grid>
            <Grid item container alignContent="center" xs="auto">
              <Box px={1}>
                <Typography variant="h5">Forums</Typography>
              </Box>
            </Grid>
          </Grid>
          {/* Search */}
          <Grid item container flexDirection="row" xs={true}>
            <Box
              pl={2}
              m="0.5rem 1rem"
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
                placeholder="search"
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
    </AppBar>
  );

  function searchBackgroundMemo() {
    return searchFocused
      ? [theme.palette.primary.main, theme.palette.background.paper]
      : [theme.palette.background.paper, theme.palette.primary.light];
  }
}
