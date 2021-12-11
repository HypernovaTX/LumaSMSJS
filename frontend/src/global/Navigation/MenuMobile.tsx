import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from '@mui/material';

import menu, { Menus } from 'Global/Navigation/MenuOptions';
import {
  A,
  LumaAccordion,
  LumaAccordionContent,
  LumaAccordionItem,
} from 'Components';
import theme from 'MUIConfig';

export default function NavMenuMobile() {
  // Const
  const { contrastText } = theme.palette.primary;
  // Custom hooks
  const { t } = useTranslation();

  // State
  const [open, setOpen] = useState<Menus>();

  // Special Handle
  const handleChange =
    (panel: Menus) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setOpen(newExpanded ? panel : undefined);
    };

  // Output
  return (
    <>
      {menu.map((m, k) => (
        <LumaAccordion
          expanded={open === m.id}
          onChange={handleChange(m.id)}
          key={k}
        >
          <LumaAccordionItem
            aria-controls={`${m.id}-content`}
            id={`${m.id}-header`}
          >
            <Typography>{t(`nav.${m.id}`)}</Typography>
          </LumaAccordionItem>
          <LumaAccordionContent>
            {m.items.map((i, k2) =>
              i.external ? (
                <MenuItem
                  onClick={() => handleOpenExternal(i.external)}
                  key={k2}
                >
                  <ListItemIcon>{i.icon}</ListItemIcon>
                  <ListItemText>{t(`nav.${i.id}`)}</ListItemText>
                </MenuItem>
              ) : (
                <A url={`/${i.id.toLowerCase()}`} key={k2} color={contrastText}>
                  <MenuItem onClick={handleCloseMenu}>
                    <ListItemIcon>{i.icon}</ListItemIcon>
                    <ListItemText>{t(`nav.${i.id}`)}</ListItemText>
                  </MenuItem>
                </A>
              )
            )}
          </LumaAccordionContent>
        </LumaAccordion>
      ))}
    </>
  );

  // Handles
  function handleCloseMenu() {}
  function handleOpenExternal(url: string) {
    window.open(url, '_blank');
    handleCloseMenu();
  }
}
