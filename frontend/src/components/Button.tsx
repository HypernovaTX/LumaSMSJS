import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

import theme from 'MUIConfig';

export const LumaButton = styled(Button)({
  '&:Disabled': {
    cursor: 'not-allowed',
    backgroundColor: theme.palette.primary.dark,
  },
  '& .MuiButton-endIcon': {
    margin: 0,
  },
});
