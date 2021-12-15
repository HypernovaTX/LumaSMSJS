import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import mixColor from 'mix-color';

import theme from 'MUIConfig';

export const LumaButton = styled(Button)({
  '&:Disabled': {
    cursor: 'not-allowed',
    backgroundColor: mixColor(theme.palette.primary.dark, '#000', 0.2),
  },
  '& .MuiButton-endIcon': {
    margin: 0,
  },
});
