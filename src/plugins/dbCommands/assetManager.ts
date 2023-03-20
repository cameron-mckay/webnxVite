import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import type { apiResponse, AssetSchema, CartItem } from "../interfaces";

/**
 * @brief Get a list of 50 assets from a keyword search string
 *
 * @param http
 * @param searchString
 * @param pageNum
 * @param callback
 */
export async function getAssetsByTextSearch(
  http: AxiosInstance,
  searchString: string,
  pageNum: number,
  callback: apiResponse
) {
  // Send string query to API
  await http
    .get("/api/asset/search", {
      params: {
        searchString,
        pageNum,
        pageSize: 50,
      },
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
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
export async function getAssetByID(
  http: AxiosInstance,
  id: string,
  callback: apiResponse
) {
  // Request part using ID in query string
  await http
    .get("/api/asset/id", {
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
export async function getAssetsByData(
  http: AxiosInstance,
  asset: AssetSchema,
  callback: apiResponse
) {
  await http
    .get("/api/asset", { params: asset })
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
export async function createAsset(
  http: AxiosInstance,
  asset: AssetSchema,
  parts: Array<CartItem>,
  callback: apiResponse
) {
  // Send new part to API
  await http
    .post("/api/asset", { asset, parts })
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
export async function updateAsset(
  http: AxiosInstance,
  asset: AssetSchema,
  parts: Array<CartItem>,
  callback: apiResponse
) {
  await http
    .put("/api/asset", { asset, parts: parts })
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
export async function getPartsOnAsset(
  http: AxiosInstance,
  asset_tag: string,
  callback: apiResponse
) {
  await http
    .get("/api/asset/parts", { params: { asset_tag } })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}
