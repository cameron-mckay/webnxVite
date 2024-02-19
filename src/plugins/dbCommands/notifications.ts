import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { apiResponse } from "../interfaces";

export function getPublicKey(
  http: AxiosInstance
) {
  return new Promise<string>(async (res, rej)=>{
    http.get('/api/notifications/publicKey')
      .then((val)=>{
        res(val.data)
      })
      .catch((err)=>{
        rej(err)
      })
  })
}

export function registerEndpoint(
  http: AxiosInstance,
  subscription: any,
  callback: apiResponse
) {
  http
    .post('/api/notifications/register', {
      subscription
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback function
      callback({}, err);
    });
}

export function sendNotifiction(
  http: AxiosInstance,
  subscription: any,
  callback: apiResponse
) {
  http
    .post('/api/notifications/send', {
      subscription
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback function
      callback({}, err);
    });
}
