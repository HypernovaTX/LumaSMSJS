import { useContext, useMemo } from 'react';

import { Typography, TypographyProps } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';

import { GlobalContext } from 'global/GlobalContext';
import { styles } from 'theme/styles';

export interface LumaTextProps extends TypographyProps {
  isTitle?: boolean;
  color?: string;
}

export function LumaText(props: LumaTextProps) {
  // Context
  const { isMobile } = useContext(GlobalContext);

  // Memo
  const variant = useMemo(applyVariant, [isMobile, props.isTitle]);

  // Output
  return (
    <Typography
      variant={variant || props.variant}
      component="span"
      style={{
        ...(props.isTitle ? styles.bigText : undefined),
        display: 'block',
        textAlign: props.align,
        color: props.color,
        ...props.style,
      }}
    >
      {props.children}
    </Typography>
  );

  // Memo hoist
  function applyVariant(): Variant | undefined {
    if (props.isTitle) {
      return isMobile ? 'h5' : 'h3';
    }
    return undefined;
  }
}
