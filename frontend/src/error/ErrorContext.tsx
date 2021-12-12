import { createContext, useState } from 'react';
import { ContextProps, ErrorObj } from 'schema';

type ErrorContextBase = {
  error?: ErrorObj;
};

interface ErrorContextType extends ErrorContextBase {
  setError: (inputs?: ErrorObj) => void;
  resetError: () => void;
}

const defaultErrorContext: ErrorContextType = {
  setError: () => {},
  resetError: () => {},
};

export const ErrorContext =
  createContext<ErrorContextType>(defaultErrorContext);

export default function ErrorProvider(props: ContextProps) {
  // States
  const [error, setError] = useState<ErrorObj>();

  // Output
  return (
    <ErrorContext.Provider
      value={{
        error,
        setError,
        resetError,
      }}
    >
      {props.children}
    </ErrorContext.Provider>
  );

  // Element callbacks
  function resetError() {
    setError(undefined);
  }
}
