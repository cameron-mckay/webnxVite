import type { AxiosResponse, AxiosError, AxiosInstance } from "axios"
import type { CartItem, PartSchema, apiResponse, PartRecord } from "../interfaces"

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
export async function getPartsByTextSearch(http: AxiosInstance, searchString: string, pageNum: number, building: number, location: string, callback: apiResponse) {
    // Send string query to API
    await http.get("/api/part/search", {
        params: {
            searchString,
            pageNum,
            pageSize: 50,
            building,
            location
        }
    })
    .then((res: AxiosResponse) => {
        // Success and send back results
        callback(res.data, null)
    })
    .catch((err: Error | AxiosError) => {
        // Send error to callback
        callback({}, err)
    })
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
export async function getPartByID(http: AxiosInstance, id: string, building: number, location: string, callback: apiResponse) {
    // Request part using ID in query string
    await http.get("/api/part/id", {
        params: {
            id,
            building,
            location
        }
    })
    .then((res: AxiosResponse) => {
        // Success and send back results
        callback(res.data, null)
    })
    .catch((err: Error | AxiosError) => {
        // Send error to callback function
        callback({}, err)
    })
}

/**
 * @brief Get a list of parts that match the provided partial part object
 * 
 * @param http 
 * @param part 
 * @param building 
 * @param location 
 * @param callback 
 */
export async function getPartsByData(http: AxiosInstance, part: PartSchema, building: number, location: string, callback: apiResponse) {
    await http.get("/api/part", {
        params: { 
            part,
            building,
            location
        }
    })
    .then((res: AxiosResponse) => {
        // Success - send results to callback
        callback(res.data, null)
    })
    .catch((err: Error | AxiosError) => {
        // Error - send error to callback
        callback({}, err)
    })
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
export async function createPart(http: AxiosInstance, part: PartSchema, building: number, location: string, callback: apiResponse) {
    // Send new part to API
    await http.post("/api/part", {
        part, 
        building,
        location
    })
    .then((res: AxiosResponse) => {
        // Success - send response to callback
        callback(res.data, null)
    })
    .catch((err: Error | AxiosError) => {
        // Error - send error to callback
        callback({}, err)
    })
}

/**
 * @brief Update the part who's ID matches the ID of the provided part object
 * 
 * @param http 
 * @param part 
 * @param callback 
 */
export async function updatePart(http: AxiosInstance, part: PartSchema, callback: apiResponse) {
    await http.put("/api/part", { part })
    .then((res: AxiosResponse) => {
        // Success - send response to callback
        callback(res.data, null)
    })
    .catch((err: Error | AxiosError) => {
        // Error - send error to callback
        callback({}, err)
    })
}

/**
 * @brief Checkout the parts from the provided building number and assign ownership to the current user
 * 
 * @param http 
 * @param cart 
 * @param building 
 * @param callback 
 */
export async function checkout(http: AxiosInstance, cart: Array<CartItem>, building: number, callback: apiResponse) {
    await http.post("/api/checkout", {
        cart,
        building
    })
    .then((res: AxiosResponse) => {
        // Authenticated - send null error to callback
        callback(res, null)
    })
    .catch((err: Error | AxiosError) => {
        // Unauthenticated - send error to callback
        callback({}, err)
    })
}

/**
 * @brief Check in parts from the current user's inventory
 * 
 * @param http 
 * @param cart 
 * @param building 
 * @param callback 
 */
export async function checkin(http: AxiosInstance, cart: Array<CartItem>, building: number, callback: apiResponse) {
    await http.post("/api/checkin", {
        cart,
        building
    })
    .then((res: AxiosResponse) => {
        // Authenticated - send null error to callback
        callback(res, null)
    })
    .catch((err: Error | AxiosError) => {
        // Unauthenticated - send error to callback
        callback({}, err)
    })
}

/**
 * @brief Get unique values for specific attributes on the part info schema from the API
 * 
 * @param http 
 * @param key - attribute to get list of i.e. "manufacturer" or "chipset"
 * @param where - partial part object to restrict results of info search (pass {} for no restrictions)
 */
export function getUniqueOnPartInfo(http: AxiosInstance, key: string, where: PartSchema , callback: apiResponse) {
    http.get("/api/part/distinct", {
        params: { 
            key,
            where
        }
    })
    .then((res: AxiosResponse) => {
        // Success - send results to callback
        callback(res, null)
    })
    .catch((err: Error | AxiosError) => {
        // Error - send error to callback
        callback({}, err)
    })
}

/**
 * @brief Get unique values for specific attributes on the part record schema from the API
 * 
 * @param http 
 * @param key - attribute to get list of i.e. "location" or "owner"
 * @param where - partial part record object to restrict results of info search (pass {} for no restrictions)
 */
export function getUniqueOnPartRecord(http: AxiosInstance, key: string, where: PartRecord, callback: apiResponse) {
    http.get("/api/partRecord/distinct", {
        params: { 
            key,
            where
        }
    })
    .then((res: AxiosResponse) => {
        // Success - send results to callback
        callback(res, null)
    })
    .catch((err: Error | AxiosError) => {
        // Error - send error to callback
        callback({}, err)
    })
}

/**
 * @brief Create new parts records and add them to the location given on the CartItem
 * 
 * @param http 
 * @param part 
 * @param callback 
 */
export async function createNewPartRecords(http: AxiosInstance, part: CartItem, callback: apiResponse) {
    await http.post("/api/part/add", {
        part
    })
    .then((res: AxiosResponse) => {
        // Success - send results to callback
        callback(res.data, null)
    })
    .catch((err: Error | AxiosError) => {
        // Error - send error to callback
        callback({}, err)
    })
}