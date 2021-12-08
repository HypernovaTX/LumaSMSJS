import CF from 'config';
import { ErrorObj } from 'schema';

export function isError(x: any) {
  return (x as ErrorObj)?.error && (x as ErrorObj).message;
}

export function isStringJSON(toCheck: string) {
  try {
    JSON.parse(toCheck);
  } catch (e) {
    CF.DEBUG_MODE && console.log(e);
    return false;
  }
  return true;
}
