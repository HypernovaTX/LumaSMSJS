import { Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';

import theme from 'theme/styles';

export const LumaCheckbox = styled(Checkbox)({
  '&': {
    color: theme.palette.primary.light,
  },
  '&.Mui-checked': {
    color: theme.palette.primary.light,
  },
});
