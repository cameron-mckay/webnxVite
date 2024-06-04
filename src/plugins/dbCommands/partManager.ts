import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { BUILD_KIT_PAGE_SIZE, TEXT_SEARCH_PAGE_SIZE } from '../Constants';

import type {
  apiResponse,
  CartItem,
  PartRecord,
  PartSchema,
  User,
  InventoryEntry,
  CheckInRequest,
  SortType,
  AssetSchema
} from '../interfaces';

/**
 * @brief Get a list of 50 parts from a keyword search string
 *
 * @param http
 * @param searchString
 * @param pageNum
 * @param building
 * @param location
 * @param callback
 */
export function getPartsByTextSearch(
  http: AxiosInstance,
  searchString: string,
  pageNum: number,
  building: number,
  sortString: string,
  sortDir: SortType,
  callback: apiResponse,
  location?: string,
  skipPagination?: boolean
) {
  // Send string query to API
  http
    .get('/api/part/search', {
      params: {
        searchString,
        pageNum,
        pageSize: TEXT_SEARCH_PAGE_SIZE,
        building,
        sortString,
        sortDir,
        location,
        skipPagination
      },
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data as { numPages: number, numParts: number, parts: PartSchema[] }, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback
      callback({}, err);
    });
}

/**
 * @brief Get part info from a mongo ID or NXID
 *
 * @param http
 * @param id
 * @param building
 * @param location
 * @param callback
 */
export function getPartByID(
  http: AxiosInstance,
  id: string,
  building: number,
  callback: apiResponse,
  location?: string
) {
  // Request part using ID in query string
  http
    .get('/api/part/id', {
      params: {
        id,
        building,
        location,
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
 * @brief Get a list of parts that match the provided partial part object
 *
 * @param http
 * @param part
 * @param callback
 */
export function getPartsByData(
  http: AxiosInstance,
  part: PartSchema,
  callback: apiResponse,
) {
  http
    .get('/api/part', {
      params: part,
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as { numPages: number, numParts: number, parts: PartSchema[] }, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Create a new part and the associated part records based on quantity, building, and location
 *
 * @param http
 * @param part
 * @param building
 * @param location
 * @param callback
 */
export function createPart(
  http: AxiosInstance,
  part: PartSchema,
  building: number,
  location: string,
  callback: apiResponse
) {
  // Send new part to API
  http
    .post('/api/part', {
      part,
      building,
      location,
    })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data as PartSchema, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Update the part who's ID matches the ID of the provided part object
 *
 * @param http
 * @param part
 * @param callback
 */
export function updatePart(
  http: AxiosInstance,
  part: PartSchema,
  callback: apiResponse
) {
  http
    .put('/api/part', { part })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data , null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Checkout the parts from the provided building number and assign ownership to the current user
 *
 * @param http
 * @param cart
 * @param user_id
 * @param callback
 */
export function checkout(
  http: AxiosInstance,
  cart: Array<InventoryEntry>,
  user_id: string,
  callback: apiResponse
) {
  http
    .post('/api/checkout', {
      cart,
      user_id,
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Check in parts from the current user's inventory
 *
 * @param http
 * @param inventory 
 * @param user_id 
 * @param callback
 */
export function checkin(
  http: AxiosInstance,
  inventory: Array<CartItem>,
  user_id: string,
  callback: apiResponse
) {
  http
    .post('/api/checkin', {
      inventory,
      user_id,
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Get unique values for specific attributes on the part info schema from the API
 *
 * @param http
 * @param key - attribute to get list of i.e. "manufacturer" or "chipset"
 * @param where - partial part object to restrict results of info search (pass {} for no restrictions)
 */
export function getUniqueOnPartInfo(
  http: AxiosInstance,
  key: string,
  where: PartSchema,
  callback: apiResponse
) {
  http
    .get('/api/part/distinct', {
      params: {
        key,
        where,
      },
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

/**
 * @brief Get unique values for specific attributes on the part record schema from the API
 *
 * @param http
 * @param key - attribute to get list of i.e. "location" or "owner"
 * @param where - partial part record object to restrict results of info search (pass {} for no restrictions)
 */
export function getUniqueOnPartRecord(
  http: AxiosInstance,
  key: string,
  where: PartRecord,
  callback: apiResponse
) {
  http
    .get('/api/partRecord/distinct', {
      params: {
        key,
        where,
      },
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

/**
 * @brief Create new parts records and add them to the location given on the CartItem
 *
 * @param http
 * @param part
 * @param callback
 */
export function createNewPartRecords(
  http: AxiosInstance,
  part: CartItem,
  owner: User,
  callback: apiResponse
) {
  http
    .post('/api/part/add', {
      part,
      owner,
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

/**
 * @brief Get current part records from a part info ID
 *
 * @param http
 * @param nxid
 * @param callback
 */
export function getPartRecordsByID(
  http: AxiosInstance,
  nxid: string,
  callback: apiResponse
) {
  http
    .get('/api/part/records/id', {
      params: {
        nxid,
      },
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

/**
 * @brief Get history of a part record by ID
 *
 * @param http
 * @param id
 * @param callback
 */
export function getPartHistoryByID(
  http: AxiosInstance,
  id: string,
  callback: apiResponse
) {
  http
    .get('/api/partRecord/history', {
      params: {
        id,
      },
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

export function movePart(
  http: AxiosInstance,
  new_owner: string,
  old_owner: string,
  parts: CartItem[],
  callback: apiResponse,
  orderID?: string
) {
  http
    .post('/api/part/move', {
      new_owner,
      old_owner,
      parts,
      orderID
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      callback({}, err);
    });
}

export function sellOnEbay(
  http: AxiosInstance,
  parts: InventoryEntry[],
  assets: AssetSchema[],
  orderID: string,
  perUnitPrice: {nxid: string, cost: number}[],
  callback: apiResponse,
) {
  http
    .post('/api/part/sell', {
      parts,
      assets,
      orderID,
      perUnitPrice
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      callback({}, err);
    });
}
/**
 *
 * @param http
 * @param image
 * @param callback
 */
export function updatePartImage(
  http: AxiosInstance,
  image: File,
  callback: apiResponse
) {
  // Create blank form
  const formData = new FormData();
  // Add part id
  // Add file blob
  formData.append('file', image);
  // Set headers
  let imgConfig = {
    header: {
      'Content-Type': image.type,
    },
  } as AxiosRequestConfig<FormData>;
  http
    .put(`/images/parts`, formData, imgConfig)
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getPartRecords(
  http: AxiosInstance,
  params: PartRecord,
  callback: apiResponse
) {
  http
    .get('/api/part/records', {
      params,
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

export function deletePart(
  http: AxiosInstance,
  nxid: string,
  callback: apiResponse
) {
  http
    .delete('/api/part', {
      params: {
        nxid,
      },
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

export function deleteFromPartsRoom(
  http: AxiosInstance,
  nxid: string,
  new_quantity: number,
  building: number,
  location: string,
  callback: apiResponse
) {
  http
    .delete('/api/partRecord', {
      params: {
        nxid,
        new_quantity,
        location,
        building
      },
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

export function auditPart(
  http: AxiosInstance,
  nxid: string,
  notes: string,
  callback: apiResponse
) {
  http
    .post('/api/part/audit', 
      {
        notes
      },
      {
        params: {
          nxid
        }
      }
    )
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getNextNXID(
  http: AxiosInstance,
  callback: apiResponse
) {
  http
    .get('/api/part/nextNXID')
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getCheckInQueue(
  http: AxiosInstance,
  callback: apiResponse
) {
  http
    .get('/api/checkin/queue')
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function processCheckInRequest(
  http: AxiosInstance,
  req: CheckInRequest,
  callback: apiResponse
) {
  http
    .post('/api/checkin/queue', req)
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getPartCreateAndDeleteHistory(
  http: AxiosInstance,
  startDate: number,
  endDate: number,
  pageNum: number,
  pageSize: number,
  callback: apiResponse,
  users?: string[],
  nxids?: string[],
  hideOthers?: boolean,
) {
  http
    .get('/api/history/part', {
      params: {
        startDate,
        endDate,
        pageNum,
        pageSize,
        users,
        nxids,
        hideOthers
      }
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getPartCreateAndDeleteHistoryNoDetails(
  http: AxiosInstance,
  startDate: number,
  endDate: number,
  pageNum: number,
  pageSize: number,
  callback: apiResponse,
) {
  http
    .get('/api/history/part/noDetails', {
      params: {
        startDate,
        endDate,
        pageNum,
        pageSize,
      }
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getKioskQuantities(
  http: AxiosInstance,
  part: string|string[],
  callback: apiResponse,
) {
  http
    .get('/api/part/quantities', {
      params: {
        part
      }
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getActivePartRequests(
  http: AxiosInstance,
  callback: apiResponse,
  id?: string
) {
  http
    .get('/api/part/requests/active', {
      params: {
        id
      }
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getFulfilledPartRequests(
  http: AxiosInstance,
  startDate: number,
  endDate: number,
  pageNum: number,
  pageSize: number,
  callback: apiResponse,
  users?: string[],
) {
  http
    .get('/api/part/requests/fulfilled', {
      params: {
        startDate,
        endDate,
        pageNum,
        pageSize,
        users,
      }
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function requestParts(
  http: AxiosInstance,
  parts: Array<CartItem>,
  notes: string,
  callback: apiResponse
) {
  http
    .post('/api/part/request/create', {
      parts,
      notes
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function cancelPartRequest(
  http: AxiosInstance,
  id: string,
  callback: apiResponse
) {
  http
    .post('/api/part/request/cancel', {
      id
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function fulfillPartRequest(
  http: AxiosInstance,
  request_id: string,
  kiosk_list: Array<{kiosk: string, parts: InventoryEntry[]}>,
  boxes: Array<{box_tag: string, parts: InventoryEntry[]}>,
  notes: string,
  approved: boolean,
  callback: apiResponse
) {
  http
    .post('/api/part/request/fulfill', {
      request_id,
      list: kiosk_list,
      boxes,
      notes,
      approved
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function createBuildKit(
  http: AxiosInstance,
  kit_name: string,
  parts: Array<{kiosk: string, parts: InventoryEntry[]}>,
  kiosk: string,
  notes: string,
  callback: apiResponse
) {
  http
    .post('/api/buildKit', {
      kit_name,
      parts,
      kiosk,
      notes
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function getBuildKitsByTextSearch(
  http: AxiosInstance,
  searchString: string,
  pageNum: number,
  building: number,
  callback: apiResponse,
  location?: string
) {
  // Send string query to API
  http
    .get('/api/buildKit/search', {
      params: {
        searchString,
        pageNum,
        pageSize: BUILD_KIT_PAGE_SIZE,
        building,
        location,
      },
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data as { numPages: number, numParts: number, parts: PartSchema[] }, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback
      callback({}, err);
    });
}

export function claimBuildKit(
  http: AxiosInstance,
  kit_id: string,
  callback: apiResponse,
  user_id?: string
) {
  http
    .put('/api/buildKit', {
      kit_id,
      user_id
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function requestBuildKit(
  http: AxiosInstance,
  kit_id: string,
  callback: apiResponse
) {
  http
    .post('/api/buildKit/request', {
      kit_id
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function deleteBuildKit(
  http: AxiosInstance,
  kit_id: string,
  parts: Array<{kiosk: string, parts: CartItem[]}>,
  callback: apiResponse
) {
  http
    .post('/api/buildKit/delete', {
      kit_id,
      parts,
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function getBuildKitByID(
  http: AxiosInstance,
  id: string,
  callback: apiResponse,
) {
  // Send string query to API
  http
    .get('/api/buildKit', {
      params: {
        id
      },
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Send error to callback
      callback({}, err);
    });
}

export function processBuildKitRequest(
  http: AxiosInstance,
  request_id: string,
  notes: string,
  approved: boolean,
  callback: apiResponse
) {
  http
    .post('/api/buildKit/request/process', {
      request_id,
      notes,
      approved
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function getPartAuditHistory(
  http: AxiosInstance,
  startDate: number,
  endDate: number,
  pageNum: number,
  pageSize: number,
  callback: apiResponse,
  nxids?: string[],
  users?: string[],
  skipPagination?: boolean
) {
  http
    .get('/api/part/audit', {
      params: {
        nxids,
        users,
        startDate,
        endDate,
        pageNum,
        pageSize,
        skipPagination
      }
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function mergeParts(
  http: AxiosInstance,
  keep: string,
  deleted: string,
  callback: apiResponse
) {
  http
    .post('/api/part/merge', {}, {
      params: {
        keep,
        deleted
      }
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function createPartOrder(
  http: AxiosInstance,
  parts: CartItem[],
  notes: string,
  callback: apiResponse
) {
  http
    .post('/api/part/order/create', {
      parts,
      notes
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function getActivePartOrders(
  http: AxiosInstance,
  callback: apiResponse,
) {
  http
    .get('/api/part/orders/active')
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getFulfilledPartOrders(
  http: AxiosInstance,
  startDate: number,
  endDate: number,
  pageNum: number,
  pageSize: number,
  callback: apiResponse,
  users?: string[],
  parts?: string[]
) {
  http
    .get('/api/part/orders/received', {
      params: {
        startDate,
        endDate,
        pageNum,
        pageSize,
        users,
        parts
      }
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function cancelPartOrder(
  http: AxiosInstance,
  id: string,
  notes: string,
  callback: apiResponse
) {
  http
    .post('/api/part/order/cancel', {
      id,
      notes
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

export function getPartOrderByID(
  http: AxiosInstance,
  id: string,
  callback: apiResponse,
) {
  http
    .get('/api/part/order', {
      params: {
        id
      }
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function fulfillPartOrder(
  http: AxiosInstance,
  order_id: string,
  list: {kiosk: string, parts: InventoryEntry[]}[],
  notes: string,
  boxes: {box_tag: string, parts: InventoryEntry[]}[],
  per_unit: {nxid: string, cost: number}[],
  callback: apiResponse
) {
  http
    .post('/api/part/order/receive', {
      order_id,
      list,
      notes,
      boxes,
      per_unit
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as string, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}
