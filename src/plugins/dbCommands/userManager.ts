import type { AxiosResponse, AxiosError, AxiosInstance } from "axios"
import type { User, apiResponse } from "../interfaces"

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

export async function getAllUsers(http: AxiosInstance, callback: apiResponse) {
    await http.get("/api/user/all")
        .then((res: AxiosResponse) => {
            callback(res.data, null)
        })
        .catch((err: Error | AxiosError) => {
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