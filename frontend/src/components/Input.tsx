import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import mixColor from 'mix-color';

import theme, { styles } from 'MUIConfig';

export const LumaInput = styled(TextField)({
  '& textarea': {
    cursor: 'initial',
  },
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
  '& input, & textarea': {
    zIndex: 1,
    color: theme.palette.primary.contrastText,
  },
  '& input:disabled, & textarea:disabled': {
    cursor: 'not-allowed',
  },
  '& input:-internal-autofill-selected, & input:-webkit-autofill, & textarea:-internal-autofill-selected, & textarea:-webkit-autofill':
    {
      boxShadow: `0 0 0 50px ${theme.palette.primary.main} inset`,
      textFillColor: theme.palette.primary.contrastText,
      zIndex: 1,
    },
  '& input::-webkit-calendar-picker-indicator': {
    filter: 'invert(1)',
    // display: 'none',
  },
  '& .MuiOutlinedInput-root': {
    transition: '200ms linear all',
    '& fieldset': {
      ...styles.transition,
      zIndex: 0,
      color: theme.palette.primary.light,
      border: 'none',
      backgroundColor: theme.palette.primary.main,
    },
    '&:hover fieldset': {
      backgroundColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
    },
  },
  '& ::-webkit-scrollbar': {
    width: '10px',
  },
  '& ::-webkit-scrollbar-track': {
    background: theme.palette.primary.dark,
    borderRadius: '1rem',
  },
  '& ::-webkit-scrollbar-thumb': {
    cursor: 'pointer',
    background: mixColor(theme.palette.primary.main, '#FFF', 0.2),
    borderRadius: '1rem',
  },
});
