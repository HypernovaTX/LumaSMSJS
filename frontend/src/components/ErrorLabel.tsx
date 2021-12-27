import React from 'react';
import { Box, Collapse } from '@mui/material';

import { LumaText } from 'components';
import theme from 'theme/styles';

interface ErrorLabelProps {
  message: string;
  in: boolean;
  style?: React.CSSProperties;
}

export function ErrorLabel(props: ErrorLabelProps) {
  return (
    <Collapse in={props.in}>
      <Box
        // bgcolor={theme.palette.error.dark}
        // borderRadius="8px"
        style={{
          //padding: '0rem 1rem 0.1rem',
          ...props.style,
        }}
      >
        <LumaText color={theme.palette.error.main} style={{ fontSize: 14 }}>
          {props.message}
        </LumaText>
      </Box>
    </Collapse>
  );
}
