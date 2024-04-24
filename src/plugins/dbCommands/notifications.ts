import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { NOTIFICATION_PAGE_SIZE } from "../Constants";
import { apiResponse, NotificationTypes } from "../interfaces";

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

export function sendNotificationToUser(
  http: AxiosInstance,
  user: string,
  text: string,
  type: NotificationTypes,
  callback: apiResponse
) {
  http
    .post('/api/notifications/send', {
      user,
      text,
      type
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

export function sendNotificationToRole(
  http: AxiosInstance,
  role: string,
  text: string,
  type: NotificationTypes,
  callback: apiResponse
) {
  http
    .post('/api/notifications/send', {
      role,
      text,
      type
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

export function sendPayloadToUser(
  http: AxiosInstance,
  user: string,
  callback: apiResponse
) {
  http
    .post('/api/notifications/payload/send', {
      user,
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

export function sendPayloadToRole(
  http: AxiosInstance,
  role: string,
  callback: apiResponse
) {
  http
    .post('/api/notifications/payload/send', {
      role,
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

export function getUnreadNotifications(
  http: AxiosInstance,
  callback: apiResponse
) {
  http
    .get('/api/notifications/unread')
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback function
      callback({}, err);
    });
}

export function getPastNotifications(
  http: AxiosInstance,
  skip: number,
  callback: apiResponse
) {
  http
    .get('/api/notifications', {
      params: {
        skip,
        pageSize: NOTIFICATION_PAGE_SIZE
      }
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

export function markAllAsRead(
  http: AxiosInstance,
  callback: apiResponse
) {
  http
    .post('/api/notifications/markRead/all')
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback function
      callback({}, err);
    });
}

export function markAsRead(
  http: AxiosInstance,
  _id: string,
  callback: apiResponse
) {
  http
    .post('/api/notifications/markRead', {
      _id
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
