import { createContext, useState } from 'react';
import { ContextProps } from 'schema';

type ErrorContextBase = {
  code?: number;
  title?: string;
  message?: string;
  isError?: boolean;
};

interface ErrorContextType extends ErrorContextBase {
  setError: (inputs: ErrorContextBase) => void;
  resetError: () => void;
}

const defaultErrorContext: ErrorContextType = {
  code: 0,
  title: '',
  message: '',
  isError: false,
  setError: () => {},
  resetError: () => {},
};

export const ErrorContext =
  createContext<ErrorContextType>(defaultErrorContext);

export default function ErrorProvider(props: ContextProps) {
  // States
  const [code, setCode] = useState(defaultErrorContext.code);
  const [title, setTitle] = useState(defaultErrorContext.title);
  const [message, setMessage] = useState(defaultErrorContext.message);
  const [isError, setIsError] = useState(defaultErrorContext.isError);

  // Output
  return (
    <ErrorContext.Provider
      value={{
        code,
        title,
        message,
        isError,
        setError,
        resetError,
      }}
    >
      {props.children}
    </ErrorContext.Provider>
  );

  // Context hoists
  function setError(inputs: ErrorContextBase) {
    if (inputs?.code !== undefined) setCode(inputs.code);
    if (inputs?.title !== undefined) setTitle(inputs.title);
    if (inputs?.message !== undefined) setMessage(inputs.message);
    if (inputs?.isError !== undefined) setIsError(inputs.isError);
  }

  function resetError() {
    setCode(defaultErrorContext.code);
    setTitle(defaultErrorContext.title);
    setMessage(defaultErrorContext.message);
    setIsError(defaultErrorContext.isError);
  }
}
