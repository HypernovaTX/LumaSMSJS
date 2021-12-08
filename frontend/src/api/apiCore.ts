import axios from 'axios';
import CF from 'config';
import { useEffect, useState } from 'react';
import { AnyObject, ErrorObj } from 'schema';

// Types
export type APIError = {
  error: string;
  reason: string;
  message?: string;
};
export type FetchResponse<T> = {
  data: T | null | ErrorObj;
  refetch: () => Promise<void>;
  loaded: boolean;
};
export type FetchNoResponse = {
  refetch: () => Promise<void>;
  loaded: boolean;
};
export type SendResponse<T> = {
  data: T | null | ErrorObj;
  execute: () => Promise<void>;
  loaded: boolean;
};
export type SendNoResponse = {
  execute: () => Promise<void>;
  loaded: boolean;
};
type RequestKinds = typeof requestKinds[number];

// Init
const host = CF.HOST;
axios.defaults.withCredentials = true;
const headerConfig = {
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
  },
};
const headerFileConfig = {
  headers: {
    'content-type': 'multipart/form-data',
  },
};
const defaultAPIError: APIError = {
  error: 'APIError',
  reason: 'Failed to execute API request!',
};
const requestKinds = ['get', 'put', 'patch', 'post', 'delete'] as const;

// React hooks
export default function useFetch(
  skip: boolean,
  kind: RequestKinds,
  url: string,
  body?: AnyObject,
  file?: boolean
) {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const refetch = async () => {
    setLoaded(false);
    const waitData = await mainAPICall(kind, url, body, file, () =>
      setLoaded(true)
    );
    setData(waitData);
  };

  useEffect(() => {
    const load = async () => {
      const waitData = await mainAPICall(kind, url, body, file, () =>
        setLoaded(true)
      );
      setData(waitData);
    };
    if (!loaded && !skip) load();
  }, [body, file, kind, loaded, skip, url]);
  return { data, loaded, refetch };
}

export function useSend(
  onComplete: (data: any) => void,
  kind: RequestKinds,
  url: string,
  body?: AnyObject,
  file?: boolean
) {
  const [loaded, setLoaded] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const execute = async () => {
    setLoaded(false);
    const waitData = await mainAPICall(kind, url, body, file, () =>
      setLoaded(true)
    );
    setData(waitData);
  };
  useEffect(() => {
    if (loaded && !completed) {
      setCompleted(true);
      onComplete(data);
    }
  }, [completed, data, loaded, onComplete]);
  return { execute, data, loaded };
}

// Root API call function
export async function mainAPICall(
  kind: RequestKinds,
  url: string,
  body?: AnyObject,
  file?: boolean,
  loadedFunction?: () => void
) {
  let getData = null;
  if (body) {
    getData = await APICallBody(kind, url, body, file);
  } else {
    getData = await APICall(kind, url);
  }
  if (loadedFunction) loadedFunction();
  return getData;
}

// All requests
async function APICall(kind: RequestKinds, url: string) {
  if (kind === 'put' || kind === 'patch' || kind === 'post') {
    return defaultAPIError;
  }
  const output = await new Promise((resolve) => {
    axios[kind](`${host}/${url}`)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        if (err?.response?.data) {
          resolve(err?.response?.data as ErrorObj);
        } else {
          resolve({ ...defaultAPIError, reason: err } as APIError);
        }
      });
  });
  console.log(4);
  return output as any;
}

async function APICallBody(
  kind: RequestKinds,
  url: string,
  body: AnyObject,
  file?: boolean
) {
  if (kind === 'get' || kind === 'delete') {
    return defaultAPIError;
  }
  const params = prepareRequestBody(body);
  const output = await new Promise((resolve) => {
    axios[kind](
      `${host}/${url}`,
      params,
      file ? headerFileConfig : headerConfig
    )
      .then((data) => resolve(data))
      .catch((err) => {
        if (err?.response?.data) {
          resolve(err?.response?.data as ErrorObj);
        } else {
          resolve({ ...defaultAPIError, reason: err } as APIError);
        }
      });
  });
  return output as any;
}

// Util functions
function prepareRequestBody(body: AnyObject) {
  const bodyEntries = Object.entries(body);
  const params = new URLSearchParams();
  bodyEntries.forEach((item) => {
    const [key, value] = item;
    params.append(key, value);
  });
  return params;
}
