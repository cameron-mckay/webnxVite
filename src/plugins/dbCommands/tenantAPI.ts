import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import type {
  apiResponse,
  User,
} from '../interfaces';

/**
 * @brief Get the current user's object from the API
 *
 * @param http
 * @param callback
 */
export function getAvail(
  http: AxiosInstance,
  power_status: string,
  tags: string[],
  brand: string,
  callback: apiResponse
) {
  // Send request to API
  http
    .get('/api/avail', {params:{
      power_status,
      tags,
      brand
    }})
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

