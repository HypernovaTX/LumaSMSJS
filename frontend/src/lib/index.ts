import { ErrorObj } from 'schema';

export function isError(x: any) {
  return (x as ErrorObj)?.error && (x as ErrorObj).message;
}
