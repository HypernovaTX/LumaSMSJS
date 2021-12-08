import { useEffect, useState } from 'react';
import axios from 'axios';

import CF from 'config';
import { AnyObject, ErrorObj } from 'schema';

// Types
export type APIError = {
  error: string;
  reason: string;
  message?: string;
};
export type APIResponse<T, B> = {
  data: T | null | ErrorObj;
  execute: (body?: B) => Promise<void>;
  requested: boolean;
  loading: boolean;
};
export type APINoResponse<B> = {
  execute: (body?: B) => Promise<void>;
  requested: boolean;
  loading: boolean;
};
export type OnComplete<T> = (data: T) => void;
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
  onComplete: (data: any) => void,
  skip: boolean,
  kind: RequestKinds,
  url: string,
  body?: AnyObject,
  file?: boolean
) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);

  const execute = async (newBody?: AnyObject) => {
    setLoading(true);
    await mainAPICall(kind, url, newBody || body, file, (data) => {
      onComplete(data);
      setLoading(false);
      setRequested(true);
      setData(data);
    });
  };

  useEffect(() => {
    const getData = async () => {
      if (loading) return;
      setLoading(true);
      await mainAPICall(kind, url, body, file, (data) => {
        setLoading(false);
        setRequested(true);
        onComplete(data);
        setData(data);
      });
    };
    if (!loading && !requested && !skip) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data, loading, requested, execute };
}

export function useDownload(
  onComplete: (data: any) => void,
  skip: boolean,
  body: AnyObject
) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);

  const execute = async (newBody?: AnyObject) => {
    setLoading(true);
    await APIDownload(newBody || body, (data) => {
      onComplete(data);
      setLoading(false);
      setRequested(true);
      setData(data);
    });
  };

  useEffect(() => {
    const getData = async () => {
      if (loading) return;
      setLoading(true);
      await APIDownload(body, (data) => {
        onComplete(data);
        setLoading(false);
        setRequested(true);
        setData(data);
      });
    };
    if (!loading && !requested && !skip) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data, loading, requested, execute };
}

export function useSend(
  onComplete: (data: any) => void,
  kind: RequestKinds,
  url: string,
  body?: AnyObject,
  file?: boolean
) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const execute = async () => {
    setLoading(true);
    await mainAPICall(kind, url, body, file, () => {
      setLoading(false);
      setRequested(true);
      onComplete(data);
      setData(data);
    });
  };
  return { data, loading, requested, execute };
}

// Root API call function
export async function mainAPICall(
  kind: RequestKinds,
  url: string,
  body?: AnyObject,
  file?: boolean,
  loadedFunction?: (data: any) => void
) {
  let getData = null;
  if (body) {
    getData = await APICallBody(kind, url, body, file);
  } else {
    getData = await APICall(kind, url);
  }
  if (loadedFunction) loadedFunction(getData?.data);
  return getData?.data;
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

async function APIDownload(
  body: AnyObject,
  loadedFunction?: (data: any) => void
) {
  const params = prepareRequestBody(body);
  const output = await new Promise((resolve) => {
    axios
      .put(`${host}/file`, params, { ...headerConfig, responseType: 'blob' })
      .then((response) => {
        if (loadedFunction) loadedFunction(response?.data);
        resolve(response?.data);
      })
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
    params.append(key, value || '(null)');
  });
  return params;
}
