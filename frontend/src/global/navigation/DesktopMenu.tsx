import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Box,
  Button,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from '@mui/material';

import menu, { Menus } from 'global/navigation/ConfigMenu';
import { A, LumaDivider, LumaMenu } from 'components';
import theme from 'MUIConfig';

export default function NavMenuDesktop() {
  // Const
  const { contrastText } = theme.palette.primary;
  // Custom hooks
  const { t } = useTranslation();

  // State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState<Menus>();

  // Output
  return (
    <Grid item container flexDirection="row" xs="auto">
      {menu.map((m, k) => (
        <Grid item container alignContent="center" xs="auto" key={k}>
          <Box px={1}>
            <Button
              color="inherit"
              id={`${m.id}-button`}
              size="large"
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setOpen(m.id);
              }}
            >
              {t(`nav.${m.id}`)}
            </Button>
            <LumaMenu
              id={`${m.id}-menu`}
              aria-labelledby={`${m.id}-button`}
              anchorEl={anchorEl}
              open={open === m.id}
              onClose={handleCloseMenu}
            >
              {m.items.map((i, k2) => (
                <Box key={k2}>
                  <A
                    url={i.external || i.navigate}
                    color={contrastText}
                    blocked={!!i.external}
                  >
                    <MenuItem
                      onClick={
                        i.external
                          ? () => handleOpenExternal(i.external)
                          : handleCloseMenu
                      }
                    >
                      <ListItemIcon>{i.icon}</ListItemIcon>
                      <ListItemText>{t(`nav.${i.id}`)}</ListItemText>
                    </MenuItem>
                  </A>
                  {i.divider ? <LumaDivider /> : null}
                </Box>
              ))}
            </LumaMenu>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  // Handles
  function handleCloseMenu() {
    setOpen(undefined);
    setAnchorEl(null);
  }
  function handleOpenExternal(url: string) {
    window.open(url, '_blank');
    handleCloseMenu();
  }
}
