import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Typography,
} from '@mui/material';

import { Add, ExpandMore } from '@mui/icons-material';

import { A } from 'components';
import { LumaMenu, LumaToolTip } from 'components';
import theme from 'theme/styles';

export default function SubmitButtonDesktop() {
  // Const
  const { contrastText } = theme.palette.primary;
  const menuItems = [
    'games',
    'hacks',
    'graphics',
    'models',
    'sounds',
    'tutorials',
    'misc',
  ];

  // Custom hooks
  const { t } = useTranslation();

  // State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Output
  return (
    <Box position="relative" mr={2}>
      <Box position="absolute" top={12} right={-8}>
        <ExpandMore fontSize="small" />
      </Box>
      <LumaToolTip title={`${t('nav.submitFile')}`}>
        <IconButton
          id="submit-button"
          onClick={handleOpenMenu}
          style={{ color: contrastText }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            alignContent="center"
          >
            <Add style={{ width: 32, height: 32 }} />
          </Box>
        </IconButton>
      </LumaToolTip>
      <LumaMenu
        id="submit-menu"
        aria-labelledby="submit-button"
        anchorEl={anchorEl}
        open={open}
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
        <Grid container direction="column" alignItems="center">
          <Grid item>
            <Box mx={2} mt={1} mb={1.5} textAlign="center">
              <Typography fontWeight={600}>{t('nav.submitAs')}</Typography>
            </Box>
          </Grid>
        </Grid>
        <Divider />
        {menuItems.map((i, k) => (
          <A url={`/submit/${i.toLowerCase()}`} key={k} color={contrastText}>
            <MenuItem onClick={handleCloseMenu}>
              {t(`submission.${i}`)}
            </MenuItem>
          </A>
        ))}
      </LumaMenu>
    </Box>
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
}
