import { ReactNode, useContext } from 'react';
import {
  Button,
  Checkbox,
  Menu,
  MenuProps,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import theme, { styles } from 'MUIConfig';
import { GlobalContext } from 'Global/GlobalContext';

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
  url: string;
  disabled?: boolean;
};
export function A(props: URLProps) {
  // Const
  const className = props.disabled ? 'disabled' : undefined;

  // Context
  const { navigate } = useContext(GlobalContext);

  // Callbacks
  const href = () => {
    if (!props.disabled) navigate(props.url);
  };
  const clearA = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
  };

  // Output
  return (
    <a href={props.url} onClick={clearA} style={{ textDecoration: 'none' }}>
      <URLTxt onClick={href} className={className}>
        {props.children}
      </URLTxt>
    </a>
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
    '-webkit-box-shadow': `0 0 0 50px ${theme.palette.primary.main} inset`,
    '-webkit-text-fill-color': theme.palette.primary.contrastText,
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
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      {...props}
    >
      {props.children}
    </CustomMenu>
  );
};
