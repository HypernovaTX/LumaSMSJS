import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from '@mui/material';

import menu from 'global/navigation/ConfigMenu';
import {
  A,
  LumaAccordion,
  LumaAccordionContent,
  LumaAccordionItem,
} from 'components';
import theme from 'MUIConfig';

interface NavMobileType {
  close: () => void;
}

export default function NavMenuMobile(props: NavMobileType) {
  // Const
  const { contrastText } = theme.palette.primary;

  // Custom hooks
  const { t } = useTranslation();

  // Output
  return (
    <>
      {menu.map((m, k) => (
        <LumaAccordion key={k}>
          <LumaAccordionItem
            aria-controls={`${m.id}-content`}
            id={`${m.id}-header`}
          >
            <Typography>{t(`nav.${m.id}`)}</Typography>
          </LumaAccordionItem>
          <LumaAccordionContent>
            {m.items.map((i, k2) => (
              <A url={i.external || i.navigate} key={k2} color={contrastText}>
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
            ))}
          </LumaAccordionContent>
        </LumaAccordion>
      ))}
    </>
  );

  // Handles
  function handleCloseMenu() {
    props.close();
  }
  function handleOpenExternal(url: string) {
    window.open(url, '_blank');
    handleCloseMenu();
  }
}
