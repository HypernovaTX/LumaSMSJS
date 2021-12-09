import { createContext, createRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { noop } from 'lodash';
import {
  SnackbarKey,
  SnackbarProvider,
  VariantType,
  useSnackbar,
} from 'notistack/dist';
import { Box, IconButton } from '@mui/material';
import {
  CheckCircle,
  Clear,
  Dangerous,
  Info,
  Warning,
} from '@mui/icons-material';

import { ContextProps } from 'schema';
import theme from 'MUIConfig';

interface GlobalContextType {
  navigate: (p: string) => void;
  prevPath?: string;
  toast: (m: string, v: VariantType) => void;
}
export const GlobalContext = createContext<GlobalContextType>({
  navigate: noop,
  toast: noop,
});

export default function GlobalProvider(props: ContextProps) {
  // Const
  const Gap = <Box width={8} />;
  // Ref
  const snackbarRef = createRef<SnackbarProvider>();

  // Output
  return (
    <SnackbarProvider
      maxSnack={3}
      ref={snackbarRef}
      iconVariant={{
        success: [<CheckCircle />, Gap],
        error: [<Dangerous />, Gap],
        warning: [<Warning />, Gap],
        info: [<Info />, Gap],
      }}
      action={(key: SnackbarKey) => (
        <IconButton
          onClick={() => dismissSnackbar(key)}
          sx={{
            color: theme.palette.primary.contrastText,
          }}
        >
          <Clear />
        </IconButton>
      )}
    >
      <GlobalProviderChild>{props.children}</GlobalProviderChild>
    </SnackbarProvider>
  );

  // Callback
  function dismissSnackbar(key: SnackbarKey) {
    if (snackbarRef && snackbarRef?.current) {
      snackbarRef.current.closeSnackbar(key);
    }
  }
}

export function GlobalProviderChild(props: ContextProps) {
  // Custom Hook
  const history = useHistory();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  // States
  const [prevPath, setPrevPath] = useState<string>();

  // Return
  return (
    <GlobalContext.Provider value={{ navigate, prevPath, toast }}>
      {props.children}
    </GlobalContext.Provider>
  );

  // Callback
  function navigate(url: string) {
    setPrevPath(location.pathname);
    history.push(url);
  }

  function toast(message: string, variant: VariantType) {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: {
        horizontal: 'center',
        vertical: 'top',
      },
    });
  }
}
