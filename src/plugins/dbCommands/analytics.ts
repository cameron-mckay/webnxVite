import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import type {
  apiResponse,
} from '../interfaces';

export function getNumParts(
  http: AxiosInstance,
  callback: apiResponse
) {
  // Send string query to API
  http
    .get('/api/part/count')
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback
      callback({}, err);
    });
}

export function getNumAssets(
  http: AxiosInstance,
  callback: apiResponse
) {
  // Send string query to API
  http
    .get('/api/asset/count')
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback
      callback({}, err);
    });
}

export function getNumPallets(
  http: AxiosInstance,
  callback: apiResponse
) {
  // Send string query to API
  http
    .get('/api/pallet/count')
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback
      callback({}, err);
    });
}

export function getNumBoxes(
  http: AxiosInstance,
  callback: apiResponse
) {
  // Send string query to API
  http
    .get('/api/box/count')
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback
      callback({}, err);
    });
}
