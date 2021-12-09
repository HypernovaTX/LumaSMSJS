import { createContext } from 'react';
import { VariantType, useSnackbar } from 'notistack/dist';

import { ContextProps } from 'schema';

interface ToastContextType {
  toastPush: (message: string, variant: VariantType) => void;
}
export const ToastContext = createContext<ToastContextType>({
  toastPush: () => {},
});

export default function ToastProvider(props: ContextProps) {
  // Custom Hook
  const { enqueueSnackbar } = useSnackbar();

  // Return
  return (
    <ToastContext.Provider value={{ toastPush }}>
      {props.children}
    </ToastContext.Provider>
  );

  // Callback
  function toastPush(message: string, variant: VariantType) {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: {
        horizontal: 'center',
        vertical: 'top',
      },
    });
  }
}
