import type { AxiosResponse, AxiosError, AxiosInstance } from "axios"
import type { CartItem, PartSchema, apiResponse, PartRecord } from "../interfaces"

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

export function getUniqueOnPartInfo(http: AxiosInstance, key: string, where: PartSchema) {
    http.get("/api/part/distinct", {
        params: { 
            key,
            where
        }
    })
    .then((res: AxiosResponse) => {
        // Success - send results to callback
        return res.data as string[]
    })
    .catch((err: Error | AxiosError) => {
        // Error - send error to callback
        return []
    })
}

export function getUniqueOnPartRecord(http: AxiosInstance, key: string, where: PartRecord) {
    http.get("/api/partRecord/distinct", {
        params: { 
            key,
            where
        }
    })
    .then((res: AxiosResponse) => {
        // Success - send results to callback
        return res.data as string[]
    })
    .catch((err: Error | AxiosError) => {
        // Error - send error to callback
        return []
    })
}

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