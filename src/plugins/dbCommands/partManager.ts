import type { AxiosResponse, AxiosError, AxiosInstance } from "axios"
import type { CartItem, PartSchema, apiResponse } from "../interfaces"

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

export async function getPartQuantities(http: AxiosInstance, parts: Array<string>, callback: apiResponse, building?: number, location?: string) {
    await http.post("/api/part/search", {
        parts,
        building,
        location
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