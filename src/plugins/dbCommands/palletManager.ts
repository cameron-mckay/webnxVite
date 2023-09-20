import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import type {
  apiResponse,
  CartItem,
  LoadedCartItem,
  PartCache,
  PartSchema,
  PalletSchema
} from '../interfaces';

/**
 * @brief Get a list of 50 assets from a keyword search string
 *
 * @param http
 * @param searchString
 * @param pageNum
 * @param callback
 */
export function getPalletsByTextSearch(
  http: AxiosInstance,
  searchString: string,
  pageNum: number,
  callback: apiResponse
) {
  // Send string query to API
  http
    .get('/api/pallet/search', {
      params: {
        searchString,
        pageNum,
        pageSize: 50,
      },
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data as { numPages: number, numPallets: number, pallets: PalletSchema[]}, null);
    })
    .catch((err: Error | AxiosError) => {
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
export function getPalletByID(
  http: AxiosInstance,
  id: string,
  callback: apiResponse
) {
  // Request part using ID in query string
  http
    .get('/api/pallet/id', {
      params: {
        id,
      },
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
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
export function getPalletsByData(
  http: AxiosInstance,
  pallet: PalletSchema,
  callback: apiResponse
) {
  http
    .get('/api/pallet', { params: pallet })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
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
export function createPallet(
  http: AxiosInstance,
  pallet: PalletSchema,
  parts: Array<CartItem>,
  assets: string,
  callback: apiResponse
) {
  // Send new part to API
  http
    .post('/api/pallet', { pallet, parts, assets })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
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
export function updatePallet(
  http: AxiosInstance,
  pallet: PalletSchema,
  parts: Array<CartItem>,
  assets: string,
  correction: boolean,
  callback: apiResponse
) {
  http
    .put('/api/pallet', { pallet, parts, correction, assets })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
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
export function getPartsOnPallet(
  http: AxiosInstance,
  pallet_tag: string,
  callback: apiResponse
) {
  http
    .get('/api/pallet/parts', { params: { pallet_tag } })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      let partsArr = res.data.parts as PartCache;
      let records = res.data.records as CartItem[];
      let parts = new Map<string, PartSchema>();
      partsArr.map((obj) => {
        parts.set(obj.nxid, obj.part);
      });
      let returnParts = records.map((item) => {
        if (item.serial) {
          return {
            part: parts.get(item.nxid),
            serial: item.serial,
          } as LoadedCartItem;
        }
        return {
          part: parts.get(item.nxid),
          quantity: item.quantity,
        } as LoadedCartItem;
      });
      callback({ parts: returnParts, assets: res.data.assets}, null);
    })
    .catch((err: Error | AxiosError) => {
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
export function getPalletHistory(
  http: AxiosInstance,
  pallet_tag: string,
  pageNum: number,
  pageSize: number,
  callback: apiResponse
) {
  http
    .get('/api/pallet/history', { 
      params: { 
        id: pallet_tag,
        pageNum,
        pageSize
      } 
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}
