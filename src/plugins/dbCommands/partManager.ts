import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import type {
  apiResponse,
  CartItem,
  PartRecord,
  PartSchema,
  User,
  InventoryEntry
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
export async function getPartsByTextSearch(
  http: AxiosInstance,
  searchString: string,
  pageNum: number,
  building: number,
  location: string,
  callback: apiResponse
) {
  // Send string query to API
  await http
    .get('/api/part/search', {
      params: {
        searchString,
        pageNum,
        pageSize: 50,
        building,
        location,
      },
    })
    .then((res: AxiosResponse) => {
      // Success and send back results
      callback(res.data as { numPages: number, numParts: number, parts: PartSchema[] }, null);
    })
    .catch((err: Error | AxiosError) => {
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
export async function getPartByID(
  http: AxiosInstance,
  id: string,
  building: number,
  location: string,
  callback: apiResponse
) {
  // Request part using ID in query string
  await http
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
    .catch((err: Error | AxiosError) => {
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
export async function getPartsByData(
  http: AxiosInstance,
  part: PartSchema,
  callback: apiResponse
) {
  await http
    .get('/api/part', {
      params: part,
    })
    .then((res: AxiosResponse) => {
      // Success - send results to callback
      callback(res.data as { numPages: number, numParts: number, parts: PartSchema[] }, null);
    })
    .catch((err: Error | AxiosError) => {
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
export async function createPart(
  http: AxiosInstance,
  part: PartSchema,
  building: number,
  location: string,
  callback: apiResponse
) {
  // Send new part to API
  await http
    .post('/api/part', {
      part,
      building,
      location,
    })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data as PartSchema, null);
    })
    .catch((err: Error | AxiosError) => {
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
export async function updatePart(
  http: AxiosInstance,
  part: PartSchema,
  callback: apiResponse
) {
  await http
    .put('/api/part', { part })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data , null);
    })
    .catch((err: Error | AxiosError) => {
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
export async function checkout(
  http: AxiosInstance,
  cart: Array<CartItem>,
  user_id: string,
  callback: apiResponse
) {
  await http
    .post('/api/checkout', {
      cart,
      user_id,
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: Error | AxiosError) => {
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
export async function checkin(
  http: AxiosInstance,
  inventory: Array<CartItem>,
  user_id: string,
  callback: apiResponse
) {
  await http
    .post('/api/checkin', {
      inventory,
      user_id,
    })
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data as string, null);
    })
    .catch((err: Error | AxiosError) => {
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
    .catch((err: Error | AxiosError) => {
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
    .catch((err: Error | AxiosError) => {
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
export async function createNewPartRecords(
  http: AxiosInstance,
  part: CartItem,
  owner: User,
  callback: apiResponse
) {
  await http
    .post('/api/part/add', {
      part,
      owner,
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
    .catch((err: Error | AxiosError) => {
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
    .catch((err: Error | AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function movePart(
  http: AxiosInstance,
  new_owner: string,
  old_owner: string,
  parts: InventoryEntry[],
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
    .catch((err: Error | AxiosError) => { // Error - send error to callback
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
    .catch((err: Error | AxiosError) => {
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
    .catch((err: Error | AxiosError) => {
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
    .catch((err: Error | AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function deleteFromPartsRoom(
  http: AxiosInstance,
  nxid: string,
  new_quantity: number,
  building: number,
  callback: apiResponse
) {
  http
    .delete('/api/partRecord', {
      params: {
        nxid,
        new_quantity,
        building
      },
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

export function auditPart(
  http: AxiosInstance,
  nxid: string,
  callback: apiResponse
) {
  http
    .get('/api/part/audit', {
      params: {
        nxid
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
    .catch((err: Error | AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}
