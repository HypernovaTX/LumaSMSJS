import { ReactNode } from 'react';
import { Button, Checkbox, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import theme, { styles } from 'MUIConfig';

const URLTxt = styled(Typography)({
  '&': {
    ...styles.transition,
    color: theme.palette.secondary.main,
    cursor: 'pointer',
    display: 'inline',
  },
  '&:hover': {
    color: theme.palette.secondary.light,
  },
  '&.disabled, &.disabled:hover': {
    color: theme.palette.primary.dark,
    cursor: 'not-allowed',
  },
});

type URLProps = {
  children: ReactNode;
  click: () => void;
  disabled?: boolean;
};
export function Url(props: URLProps) {
  return (
    <URLTxt
      onClick={() => {
        if (!props.disabled) props.click();
      }}
      className={props.disabled ? 'disabled' : undefined}
    >
      {props.children}
    </URLTxt>
  );
}

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
  '& input:Disabled': {
    cursor: 'not-allowed',
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

export const LumaButton = styled(Button)({
  '&:Disabled': {
    cursor: 'not-allowed',
    backgroundColor: theme.palette.primary.dark,
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
