import React, { ReactNode, useContext } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

import theme, { styles } from 'MUIConfig';
import { GlobalContext } from 'global/GlobalContext';

const httpRegExp = /^(http|https):\/\//gm;
const URLTxt = styled(Box)({
  '&': {
    ...styles.transition,
    color: theme.palette.secondary.main,
    cursor: 'pointer',
    display: 'inline',
  },
  '&:hover': {
    color: theme.palette.secondary.light,
  },
  '&.disabled, &.disabled > div': {
    color: theme.palette.primary.dark,
    cursor: 'not-allowed',
  },
});

type URLProps = {
  blocked?: boolean; // Enabled but cannot use it
  children: ReactNode;
  color?: string;
  disabled?: boolean;
  url: string;
  newWindow?: boolean;
};
export function A(props: URLProps) {
  // Const
  const className = props.disabled ? 'disabled' : undefined;

  // Context
  const { navigate } = useContext(GlobalContext);

  // Callbacks
  const href = () => {
    const { url, newWindow } = props;
    if (!props.disabled && !props.blocked) {
      if (url.match(httpRegExp)) {
        window.open(url, newWindow ? '_blank' : '_self');
      } else {
        navigate(url);
      }
    }
  };
  const clearA = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
  };

  const Wrapper = (child: ReactNode) => {
    return props.disabled ? (
      <>{child}</>
    ) : (
      <a href={props.url} onClick={clearA} style={{ textDecoration: 'none' }}>
        {child}
      </a>
    );
  };

  // Output
  return Wrapper(
    <URLTxt onClick={href} className={className}>
      {props.color ? (
        <Box color={props.color} display="inline">
          {props.children}
        </Box>
      ) : (
        props.children
      )}
    </URLTxt>
  );
}
