import type { AxiosResponse, AxiosError, AxiosInstance, Axios } from "axios"
import type { CartItem, PartSchema, User } from "../plugins/interfaces"
import type { apiResponse } from "./interfaces"

// Gets user data from API using the user's token
export async function getCurrentUser(http: AxiosInstance, callback: apiResponse) {
    // Send request to API
    await http.get("/api/user")
        .then((res: AxiosResponse) => {
            // Success - send response data to callback
            callback(res.data, null);
        })
        .catch((err: Error | AxiosError) => {
            // Error - send error to callback
            callback({}, err);
        })
}

export async function getUserByID(http: AxiosInstance, id: string, callback: apiResponse) {
    // Send request to API
    await http.get("/api/user", {
        params: {
            id
        }
    })
        .then((res: AxiosResponse) => {
            // Success - send response data to callback
            callback(res.data, null);
        })
        .catch((err: Error | AxiosError) => {
            // Error - send error to callback
            callback({}, err);
        })
}


/**
 * @name checkAuth
 * 
 * @brief Checks with database to see if user is authorized, will return error in 
 * callback if not authenticated
 * 
 * @param http 
 * @param callback 
 */
export async function checkAuth(http: AxiosInstance, callback: apiResponse) {
    // Add token to default headers
    http.defaults.headers.common["Authorization"] = localStorage.getItem('token')
    // Check with API to see if authorized
    await http.post("/api/auth")
        .then((res: AxiosResponse) => {
            // Authenticated - send null error to callback
            callback(res.data, null)
        })
        .catch((err: Error | AxiosError) => {
            // Unauthenticated - send error to callback
            callback({}, err)
        })
}

export async function getPartsByTextSearch(http: AxiosInstance, searchString: string, pageNum: number, callback: apiResponse) {
    // Send string query to API
    await http.get("/api/part/search", {
        params: {
            searchString,
            pageNum,
            pageSize: 50
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
 * @brief Gets a part by id 
 * 
 * @param http 
 * @param id 
 * @param callback 
 */
export async function getPartByID(http: AxiosInstance, id: string, callback: apiResponse) {
    // Request part using ID in query string
    await http.get("/api/part/id", {
        params: {
            id
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
 * @brief Finds parts that match a provided partial part schema
 * 
 * @param http 
 * @param part 
 * @param callback 
 */
export async function getPartsByData(http: AxiosInstance, part: PartSchema, callback: apiResponse) {
    await http.get("/api/part", { params: part })
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
 * 
 * @brief Creates a part from a completed part schema object
 * 
 * @param http 
 * @param part 
 * @param callback 
 */
export async function createPart(http: AxiosInstance, part: PartSchema, callback: apiResponse) {
    // Send new part to API
    await http.post("/api/part", { part })
        .then((res: AxiosResponse) => {
            // Success - send response to callback
            callback(res.data, null)
        })
        .catch((err: Error | AxiosError) => {
            // Error - send error to callback
            callback({}, err)
        })
}

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

export async function updateUser(http:AxiosInstance, user: User, callback: apiResponse) {
    await http.put("/api/user", { user })
        .then((res: AxiosResponse) => {
            // Success - send response to callback
            callback(res.data, null)
        })
        .catch((err: Error | AxiosError) => {
            // Error - send error to callback
            callback({}, err)
        })
}


export async function checkout(http: AxiosInstance, cart: Array<CartItem>, callback: apiResponse) {
    await http.post("/api/checkout", { cart })
        .then((res: AxiosResponse) => {
            // Authenticated - send null error to callback
            callback(res, null)
        })
        .catch((err: Error | AxiosError) => {
            // Unauthenticated - send error to callback
            callback({}, err)
        })
}

export async function checkin(http: AxiosInstance, cart: Array<CartItem>, callback: apiResponse) {
    await http.post("/api/checkin", { cart })
        .then((res: AxiosResponse) => {
            // Authenticated - send null error to callback
            callback(res, null)
        })
        .catch((err: Error | AxiosError) => {
            // Unauthenticated - send error to callback
            callback({}, err)
        })
}

export async function getAllUsers(http: AxiosInstance, callback: apiResponse) {
    await http.get("/api/user/all")
        .then((res: AxiosResponse) => {
            callback(res.data, null)
        })
        .catch((err: Error | AxiosError) => {
            callback({}, err)
        })
}