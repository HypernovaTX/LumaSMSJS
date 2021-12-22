import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Box,
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
import theme from 'theme/styles';

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
              <A
                url={i.url}
                key={k2}
                color={contrastText}
                newWindow={i.newWindow}
              >
                <MenuItem onClick={handleCloseMenu}>
                  <Box my={1} display="inline-flex">
                    <ListItemIcon>{i.icon}</ListItemIcon>
                    <ListItemText>{t(`nav.${i.id}`)}</ListItemText>
                  </Box>
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
}
