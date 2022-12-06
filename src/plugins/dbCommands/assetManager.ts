import type { AxiosResponse, AxiosError, AxiosInstance } from "axios"
import type { AssetSchema, apiResponse } from "../interfaces"

export async function getAssetsByTextSearch(http: AxiosInstance, searchString: string, pageNum: number, callback: apiResponse) {
    // Send string query to API
    await http.get("/api/asset/search", {
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

export async function getAssetByID(http: AxiosInstance, id: string, callback: apiResponse) {
    // Request part using ID in query string
    await http.get("/api/asset/id", {
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

export async function getAssetsByData(http: AxiosInstance, asset: AssetSchema, callback: apiResponse) {
    await http.get("/api/asset", { params: asset })
        .then((res: AxiosResponse) => {
            // Success - send results to callback
            callback(res.data, null)
        })
        .catch((err: Error | AxiosError) => {
            // Error - send error to callback
            callback({}, err)
        })
}

export async function createAsset(http: AxiosInstance, asset: AssetSchema, callback: apiResponse) {
    // Send new part to API
    await http.post("/api/part", { asset })
        .then((res: AxiosResponse) => {
            // Success - send response to callback
            callback(res.data, null)
        })
        .catch((err: Error | AxiosError) => {
            // Error - send error to callback
            callback({}, err)
        })
}

export async function updateAsset(http: AxiosInstance, asset: AssetSchema, callback: apiResponse) {
    await http.put("/api/part", { asset })
        .then((res: AxiosResponse) => {
            // Success - send response to callback
            callback(res.data, null)
        })
        .catch((err: Error | AxiosError) => {
            // Error - send error to callback
            callback({}, err)
        })
}