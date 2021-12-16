import { useEffect, useState } from 'react';
import axios from 'axios';

import CF from 'config';
import { AnyObject, ErrorObj } from 'schema';
import { isError } from 'lib';
import { APIDownloadProp, APIProp, RequestKinds } from 'schema/apiSchema';

// Init
const host = CF.HOST;
const otherErrorRegExp = /^(<!DOCTYPE html>)/gm;
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
const defaultAPIError: ErrorObj = {
  error: 'APIError',
  message: 'Failed to execute API request!',
};

// React hooks
export function useFetch(props: APIProp) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<ErrorObj | null>(null);

  const execute = async (newBody?: AnyObject) => {
    setLoading(true);
    await mainAPICall(
      props.kind,
      props.url,
      newBody || props.body,
      props.file,
      (data) => {
        if ((isError(data) || otherErrorRegExp.test(data)) && props.onError) {
          props.onError(data as ErrorObj);
          setError(data);
        }
        if (
          !isError(data) &&
          !otherErrorRegExp.test(data) &&
          props.onComplete
        ) {
          props.onComplete(data);
          setData(data);
        }
        setLoading(false);
        setRequested(true);
      }
    );
  };

  useEffect(() => {
    const getData = async () => {
      if (loading) return;
      setLoading(true);
      await mainAPICall(
        props.kind,
        props.url,
        props.body,
        props.file,
        (data) => {
          if ((isError(data) || otherErrorRegExp.test(data)) && props.onError) {
            props.onError(data as ErrorObj);
            setError(data);
          }
          if (
            !isError(data) &&
            !otherErrorRegExp.test(data) &&
            props.onComplete
          ) {
            props.onComplete(data);
            setData(data);
          }
          setLoading(false);
          setRequested(true);
          setData(data);
        }
      );
    };
    if (!loading && !requested && !props.skip) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data, loading, requested, execute, error };
}

export function useDownload(props: APIDownloadProp) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<ErrorObj | null>(null);

  const execute = async (newBody?: AnyObject) => {
    setLoading(true);
    await APIDownload(newBody || props.body, (data) => {
      if ((isError(data) || otherErrorRegExp.test(data)) && props.onError) {
        props.onError(data);
        setError(data);
      }
      if (!isError(data) && !otherErrorRegExp.test(data) && props.onComplete) {
        props.onComplete(data);
        setData(data);
      }
      setLoading(false);
      setRequested(true);
    });
  };

  useEffect(() => {
    const getData = async () => {
      if (loading) return;
      setLoading(true);
      await APIDownload(props.body, (data) => {
        if (!isError(data) && props.onComplete) {
          props.onComplete(data);
          setData(data);
        } else if (props.onError) {
          props.onError(data);
          setError(data);
        }
        setLoading(false);
        setRequested(true);
      });
    };
    if (!loading && !requested && !props.skip) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data, loading, requested, execute, error };
}

export function useSend(props: APIProp) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<ErrorObj | null>(null);
  const execute = async (newBody: AnyObject) => {
    setLoading(true);
    await mainAPICall(
      props.kind,
      props.url,
      newBody || props.body,
      props.file,
      (data) => {
        if ((isError(data) || otherErrorRegExp.test(data)) && props.onError) {
          props.onError(data as ErrorObj);
          setError(data);
        }
        if (
          !isError(data) &&
          !otherErrorRegExp.test(data) &&
          props.onComplete
        ) {
          props.onComplete(data);
          setData(data);
        }
        setLoading(false);
        setRequested(true);
      }
    );
  };
  return { data, loading, requested, execute, error };
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
  if (loadedFunction) loadedFunction(getData?.data || getData);
  return getData?.data || getData;
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
          resolve({ ...defaultAPIError, reason: err as string } as ErrorObj);
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
  const params = file
    ? prepareRequestBodyFormData(body)
    : prepareRequestBody(body);
  const output = await new Promise((resolve) => {
    axios[kind](
      `${host}/${url}`,
      params,
      file ? headerFileConfig : headerConfig
    )
      .then((data) => resolve(data))
      .catch((err) => {
        resolve({ ...defaultAPIError, reason: err as string } as ErrorObj);
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
          resolve({ ...defaultAPIError, reason: err as string } as ErrorObj);
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
function prepareRequestBodyFormData(body: AnyObject) {
  const bodyEntries = Object.entries(body);
  const formData = new FormData();
  bodyEntries.forEach((item) => {
    const [key, value] = item;
    console.log(typeof value);
    if (value instanceof File) {
      console.log(value);
      formData.append(key, value, value.name);
    }
  });

  console.log(formData);
  return formData;
}
