import React from 'react';
import { Menu, MenuProps } from '@mui/material';
import { styled } from '@mui/material/styles';

import theme from 'theme/styles';

const CustomMenu = styled(Menu)({
  '& > .MuiPaper-root': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
});
export const LumaMenu = (props: MenuProps) => {
  return (
    <CustomMenu
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      {...props}
    >
      {props.children}
    </CustomMenu>
  );
};
