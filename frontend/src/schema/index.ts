import React, { ReactNode } from 'react';

export type ContextProps = {
  children: ReactNode;
};
export type AnyObject = {
  [key: string]: any;
};
export type NoResponse =
  | {
      loaded: boolean;
    }
  | ErrorObj;
export interface ErrorObj {
  error: string;
  message: string;
  reason?: string;
  code?: number;
}

export type TextInputEvent = React.ChangeEvent<
  HTMLTextAreaElement | HTMLInputElement
>;
