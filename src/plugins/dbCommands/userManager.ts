import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import type { User, apiResponse } from "../interfaces";

/**
 * @brief Get the current user's object from the API
 *
 * @param http
 * @param callback
 */
export async function getCurrentUser(
  http: AxiosInstance,
  callback: apiResponse
) {
  // Send request to API
  await http
    .get("/api/user")
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Get user object from a Mongo ID
 *
 * @param http
 * @param id
 * @param callback
 */
export async function getUserByID(
  http: AxiosInstance,
  id: string,
  callback: apiResponse
) {
  // Send request to API
  await http
    .get("/api/user", {
      params: {
        id,
      },
    })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Check if current user token exists and is valid
 *
 * @param http
 * @param callback
 */
export async function checkAuth(http: AxiosInstance, callback: apiResponse) {
  // Add token to default headers
  http.defaults.headers.common["Authorization"] = localStorage.getItem("token");
  // Check with API to see if authorized
  await http
    .post("/api/auth")
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
      // Unauthenticated - send error to callback
      callback({}, err);
    });
}

/**
 * @brief Get all user objects from the API
 *
 * @param http
 * @param callback
 */
export async function getAllUsers(http: AxiosInstance, callback: apiResponse) {
  await http
    .get("/api/user/all")
    .then((res: AxiosResponse) => {
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
      callback({}, err);
    });
}

/**
 * @brief Update the user who's ID matches the given user._id
 *
 * @param http
 * @param user
 * @param callback
 */
export async function updateUser(
  http: AxiosInstance,
  user: User,
  callback: apiResponse
) {
  await http
    .put("/api/user", { user })
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
 * @brief Get inventory of current user
 *
 * @param http
 * @param callback
 */
export async function getUserInventory(
  http: AxiosInstance,
  callback: apiResponse
) {
  await http
    .get("/api/user/inventory")
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
 * @brief Get inventory of user from ID
 *
 * @param http
 * @param user_id
 * @param callback
 */
export async function getUserInventoryByID(
  http: AxiosInstance,
  user_id: string,
  callback: apiResponse
) {
  await http
    .get("/api/user/inventory", {
      params: {
        user_id,
      },
    })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export async function getAllTechsInventory(
  http: AxiosInstance,
  callback: apiResponse
) {
  await http
    .get("/api/user/inventory", {
      params: {
        user_id: "all",
      },
    })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: Error | AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}
