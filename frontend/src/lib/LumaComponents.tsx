import { Checkbox, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import theme, { styles } from 'MUIConfig';

export const LumaInput = styled(TextField)({
  '& label': {
    color: theme.palette.primary.light,
    zIndex: 2,
  },
  '& label.Mui-focused': {
    color: theme.palette.primary.contrastText,
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: theme.palette.primary.light,
  },
  '& input': {
    zIndex: 1,
    color: theme.palette.primary.contrastText,
  },
  '& input:-internal-autofill-selected, & input:-webkit-autofill': {
    '-webkit-box-shadow': `0 0 0 50px ${theme.palette.secondary.main} inset`,
    '-webkit-text-fill-color': theme.palette.secondary.contrastText,
    zIndex: 1,
  },
  '& .MuiOutlinedInput-root': {
    transition: '200ms linear all',
    '& fieldset': {
      ...styles.transition,
      zIndex: 0,
      color: theme.palette.primary.light,
      border: 'none',
      backgroundColor: theme.palette.primary.dark,
    },
    '&:hover fieldset': {
      backgroundColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      color: theme.palette.primary.light,
      backgroundColor: theme.palette.primary.main,
    },
  },
});

export const LumaCheckbox = styled(Checkbox)({
  '&': {
    color: theme.palette.primary.light,
  },
  '&.Mui-checked': {
    color: theme.palette.primary.light,
  },
});
