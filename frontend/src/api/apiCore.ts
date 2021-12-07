import { Axios } from 'axios';
import { AnyObject } from 'schema';

const axios = new Axios();
const host = process.env.PUBLIC_URL;
const headerConfig = {
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
};

export type APIError = {
  error: string;
  reason: string;
  message?: string;
};

const defaultAPIError: APIError = {
  error: 'APIError',
  reason: 'Failed to execute API request!',
};

export async function GET(url: string) {
  const output = await new Promise((resolve) => {
    axios
      .get(`${host}/${url}`)
      .then((data) => resolve(data))
      .catch((err) => resolve({ ...defaultAPIError, reason: err } as APIError));
  });
  return output;
}

export async function PUT(url: string, body: AnyObject) {
  const params = prepareRequestBody(body);
  const output = await new Promise((resolve) => {
    axios
      .put(`${host}/${url}`, params, headerConfig)
      .then((data) => resolve(data))
      .catch((err) => resolve({ ...defaultAPIError, reason: err } as APIError));
  });
  return output;
}

export async function PATCH(url: string, body: AnyObject) {
  const params = prepareRequestBody(body);
  const output = await new Promise((resolve) => {
    axios
      .patch(`${host}/${url}`, params, headerConfig)
      .then((data) => resolve(data))
      .catch((err) => resolve({ ...defaultAPIError, reason: err } as APIError));
  });
  return output;
}

export async function POST(url: string, body: AnyObject) {
  const params = prepareRequestBody(body);
  const output = await new Promise((resolve) => {
    axios
      .post(`${host}/${url}`, params, headerConfig)
      .then((data) => resolve(data))
      .catch((err) => resolve({ ...defaultAPIError, reason: err } as APIError));
  });
  return output;
}

export async function DELETE(url: string) {
  const output = await new Promise((resolve) => {
    axios
      .delete(`${host}/${url}`, headerConfig)
      .then((data) => resolve(data))
      .catch((err) => resolve({ ...defaultAPIError, reason: err } as APIError));
  });
  return output;
}

function prepareRequestBody(body: AnyObject) {
  const bodyEntries = Object.entries(body);
  const params = new URLSearchParams();
  bodyEntries.forEach((item) => {
    const [key, value] = item;
    params.append(key, value);
  });
  return params;
}
