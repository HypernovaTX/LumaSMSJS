import { createContext, createRef, useEffect, useMemo, useState } from 'react';
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

import CF from 'config';
import theme from 'MUIConfig';
import { useWindowWidth } from 'lib';
import { ContextProps } from 'schema';

interface GlobalContextType {
  isMobile: boolean;
  isTinyMobile: boolean;
  navigate: (p: string) => void;
  nativateToPrevious: () => void;
  prevPath?: string;
  setTitle: (p: string) => void;
  title: string;
  toast: (m: string, v: VariantType) => void;
}
export const GlobalContext = createContext<GlobalContextType>({
  isMobile: false,
  isTinyMobile: false,
  navigate: noop,
  nativateToPrevious: noop,
  setTitle: noop,
  title: '(null)',
  toast: noop,
});

export function GlobalProviderChild(props: ContextProps) {
  // Custom Hook
  const history = useHistory();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const displayWidth = useWindowWidth();

  // States
  const [prevPath, setPrevPath] = useState<string>();
  const [title, setTitle] = useState('(null)');

  // Memo
  const isMobile = useMemo(isMobileMemo, [displayWidth]);
  const isTinyMobile = useMemo(isTinyMobileMemo, [displayWidth]);

  // Effects
  useEffect(documentTitleEffect, [title]);

  // Return
  return (
    <GlobalContext.Provider
      value={{
        isMobile,
        isTinyMobile,
        navigate,
        nativateToPrevious,
        prevPath,
        setTitle,
        title,
        toast,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );

  // Callback
  function navigate(url: string) {
    if (url === location.pathname) return;
    setPrevPath(location.pathname);
    history.push(url);
  }

  function nativateToPrevious() {
    navigate(prevPath === location.pathname || !prevPath ? '/' : prevPath);
  }

  function toast(message: string, variant: VariantType) {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 2500,
      anchorOrigin: {
        horizontal: 'center',
        vertical: 'top',
      },
    });
  }

  // Memo hoists
  function isMobileMemo() {
    return !!displayWidth && displayWidth <= CF.MAX_MOBILESIZE;
  }
  function isTinyMobileMemo() {
    return !!displayWidth && displayWidth <= CF.MAX_TINYSIZE;
  }

  // Effect hoists
  function documentTitleEffect() {
    const pageTitle = `${CF.SITE_NAME} - ${title}`;
    if (document.title !== pageTitle) {
      document.title = pageTitle;
    }
  }
}

export default function GlobalProvider(props: ContextProps) {
  // Const
  const Gap = <Box width={8} key="gap" />;

  // Ref
  const snackbarRef = createRef<SnackbarProvider>();

  // Output
  return (
    <SnackbarProvider
      maxSnack={3}
      ref={snackbarRef}
      iconVariant={{
        success: [<CheckCircle key="success" />, Gap],
        error: [<Dangerous key="danger" />, Gap],
        warning: [<Warning key="warning" />, Gap],
        info: [<Info key="info" />, Gap],
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
