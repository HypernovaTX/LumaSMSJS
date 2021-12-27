import { AnyObject, ErrorObj } from 'schema';
export * from './userApiSchema';

export type APIError = {
  error: string;
  reason: string;
  message?: string;
};
export type APIResponse<T, B> = {
  data: T | null;
  error: ErrorObj;
  execute: (body?: B) => Promise<void>;
  requested: boolean;
  loading: boolean;
};
export type APINoResponse<B> = {
  execute: (body?: B) => Promise<void>;
  error: ErrorObj;
  requested: boolean;
  loading: boolean;
};
export type OnComplete<T> = (data: T) => void;
export type OnError = (data: ErrorObj) => void;
export type APIProp = {
  onComplete?: (data: any) => void;
  onError?: (error: ErrorObj) => void;
  skip?: boolean;
  kind: RequestKinds;
  url: string;
  body?: AnyObject | undefined;
  file?: boolean;
};
export interface APIPropTemplate extends Omit<APIProp, 'kind' | 'url'> {}
export type APIDownloadProp = {
  onComplete?: (data: any) => void;
  onError?: (error: ErrorObj) => void;
  skip?: boolean;
  body: AnyObject;
};
export interface APIPropsNoBody extends Omit<APIPropTemplate, 'body'> {
  onComplete?: OnComplete<null>;
}
export type RequestKinds = typeof requestKinds[number];
const requestKinds = ['get', 'put', 'patch', 'post', 'delete'] as const;
