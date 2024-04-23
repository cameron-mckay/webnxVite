import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { TEXT_SEARCH_PAGE_SIZE } from '../Constants';
import type {
  apiResponse,
  BoxSchema,
  CartItem,
} from '../interfaces';

/**
 * @brief Get a list of 50 assets from a keyword search string
 *
 * @param http
 * @param searchString
 * @param pageNum
 * @param callback
 */
export function getBoxesByTextSearch(
  http: AxiosInstance,
  searchString: string,
  pageNum: number,
  callback: apiResponse
) {
  // Send string query to API
  http
    .get('/api/box/search', {
      params: {
        searchString,
        pageNum,
        pageSize: TEXT_SEARCH_PAGE_SIZE,
      },
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data as { pages: number, total: number, items: BoxSchema[]}, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback
      callback({}, err);
    });
}

/**
 * @brief Get asset using mongo ID or NXID
 *
 * @param http
 * @param id
 * @param callback
 */
export function getBoxByID(
  http: AxiosInstance,
  id: string,
  callback: apiResponse
) {
  // Request part using ID in query string
  http
    .get('/api/box/id', {
      params: {
        id,
      },
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

/**
 * @brief Get a list of assets using a partial asset object
 *
 * @param http
 * @param asset
 * @param callback
 */
export function getBoxesByData(
  http: AxiosInstance,
  box: BoxSchema,
  callback: apiResponse
) {
  http
    .get('/api/box', { params: box })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Create a new asset and associated parts records
 *
 * @param http
 * @param asset
 * @param parts
 * @param callback
 */
export function createBox(
  http: AxiosInstance,
  box: BoxSchema,
  parts: Array<CartItem>,
  callback: apiResponse
) {
  // Send new part to API
  http
    .post('/api/box', { box, parts })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Update an asset with a new full asset schema
 *
 * @param http
 * @param asset
 * @param callback
 */
export function updateBox(
  http: AxiosInstance,
  box: BoxSchema,
  parts: Array<CartItem>,
  correction: boolean,
  callback: apiResponse
) {
  http
    .put('/api/box', { box, parts, correction })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Get all the parts records associated with an asset
 *
 * @param http
 * @param asset_tag
 * @param callback
 */
export function getPartsOnBox(
  http: AxiosInstance,
  box_tag: string,
  callback: apiResponse
) {
  http
    .get('/api/box/parts', { params: { box_tag } })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Get asset history from asset tag
 *
 * @param http
 * @param asset_tag
 * @param callback
 */
export function getBoxHistory(
  http: AxiosInstance,
  box_tag: string,
  pageNum: number,
  pageSize: number,
  callback: apiResponse
) {
  http
    .get('/api/box/history', { 
      params: { 
        id: box_tag,
        pageNum,
        pageSize
      } 
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}
