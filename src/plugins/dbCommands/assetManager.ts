import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { TEXT_SEARCH_PAGE_SIZE } from '../Constants';
import type {
  apiResponse,
  AssetSchema,
  CartItem,
  SortType,
} from '../interfaces';

/**
 * @brief Get a list of 50 assets from a keyword search string
 *
 * @param http
 * @param searchString
 * @param pageNum
 * @param callback
 */
export function getAssetsByTextSearch(
  http: AxiosInstance,
  searchString: string,
  pageNum: number,
  sortString: string,
  sortDir: SortType,
  callback: apiResponse
) {
  // Send string query to API
  http
    .get('/api/asset/search', {
      params: {
        searchString,
        pageNum,
        pageSize: TEXT_SEARCH_PAGE_SIZE,
        sortString,
        sortDir
      },
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data as { numPages: number, numAssets: number, assets: AssetSchema[]}, null);
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
export function getAssetByID(
  http: AxiosInstance,
  id: string,
  callback: apiResponse
) {
  // Request part using ID in query string
  http
    .get('/api/asset/id', {
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
export function getAssetsByData(
  http: AxiosInstance,
  asset: AssetSchema,
  callback: apiResponse
) {
    http
      .get('/api/asset', { params: asset })
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
export function createAsset(
  http: AxiosInstance,
  asset: AssetSchema,
  parts: Array<CartItem>,
  callback: apiResponse
) {
  // Send new part to API
  http
    .post('/api/asset', { asset, parts })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function createAssetTemplate(
  http: AxiosInstance,
  asset: AssetSchema,
  parts: Array<CartItem>,
  name: string,
  callback: apiResponse
) {
  // Send new part to API
  http
    .post('/api/asset/template', { asset, parts, name })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getAssetTemplates(
  http: AxiosInstance,
  callback: apiResponse
) {
  // Send new part to API
  http
    .get('/api/asset/template')
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function deleteAssetTemplate(
  http: AxiosInstance,
  id: string,
  callback: apiResponse
) {
  // Send new part to API
  http
    .delete('/api/asset/template',{params:{id}})
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
export function updateAsset(
  http: AxiosInstance,
  asset: AssetSchema,
  parts: Array<CartItem>,
  correction: boolean,
  callback: apiResponse,
  oldAssetTag?: string
) {
  http
    .put('/api/asset', { asset, parts: parts, correction, oldAssetTag })
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
export function getPartsOnAsset(
  http: AxiosInstance,
  asset_tag: string,
  callback: apiResponse
) {
  http
    .get('/api/asset/parts', { params: { asset_tag } })
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
export function getAssetHistory(
  http: AxiosInstance,
  asset_tag: string,
  pageNum: number,
  pageSize: number,
  callback: apiResponse
) {
  http
    .get('/api/asset/history', { 
      params: { 
        id: asset_tag,
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

export function getNodesOnAsset(
  http: AxiosInstance,
  asset_tag: string,
  callback: apiResponse
) {
  http
    .get('/api/asset/nodes', { 
      params: { 
        asset_tag
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
