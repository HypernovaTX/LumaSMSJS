import CF from 'config';
import { ErrorObj } from 'schema';

export * from 'lib/Hooks';

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

export function isEmptyObject(obj: { [key: string]: any }) {
  return Object.keys(obj).length === 0;
}

export function bytesToSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
}

export function dateToDash(date: string | number | Date) {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  let year = `${d.getFullYear()}`;

  month = month.length < 2 ? `0${month}` : month;
  day = day.length < 2 ? `0${day}` : day;

  return [year, month, day].join('-');
}

export function universalUnixTime(date: number) {
  return Math.floor(date / 1000);
}

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const passwordRegex = {
  length: /(?=.{8,})/,
  lowerCase: /(?=.*[a-z])/,
  upperCase: /(?=.*[A-Z])/,
  number: /(?=.*[0-9])/,
  specialChar: /([^A-Za-z0-9])/,
  repeatedChar: /(^(.)\1{1,})/,
  strongLength: /(?=.{12,})/,
  endsWithOneSpecial: /[A-Za-z0-9][^A-Za-z0-9]{1}$/,
};
