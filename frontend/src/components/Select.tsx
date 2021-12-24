import { NativeSelect } from '@mui/material';
import { styled } from '@mui/material/styles';
import mixColor from 'mix-color';

import theme from 'theme/styles';

export const LumaSelect = styled(NativeSelect)({
  '&': {
    backgroundColor: 'initial',
    borderRadius: 8,
  },
  '& > MuiFocused': {
    backgroundColor: 'initial',
  },
  '& select': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '12px 12px',
    borderRadius: 8,
    transition: '200ms linear all',
  },
  '& select:focus': {
    backgroundColor: mixColor(theme.palette.primary.main, '#FFF', 0.2),
    color: theme.palette.primary.contrastText,
    padding: '12px 12px',
    borderRadius: 8,
  },
  '& select option': {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: theme.palette.primary.contrastText,
  },
  '& select:disabled': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    cursor: 'not-allowed',
  },
  '&::before, &::after, & select::before, & select::after': {
    display: 'none',
  },
  '& svg': {
    color: theme.palette.primary.contrastText,
  },
});
