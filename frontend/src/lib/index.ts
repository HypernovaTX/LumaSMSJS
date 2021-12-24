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
