import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import type {
  apiResponse,
  User,
} from '../interfaces';

/**
 * @brief Get the current user's object from the API
 *
 * @param http
 * @param callback
 */
export function getCurrentUser(
  http: AxiosInstance,
  callback: apiResponse
) {
  // Send request to API
  http
    .get('/api/user')
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
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
export function getUserByID(
  http: AxiosInstance,
  id: string,
  callback: apiResponse
) {
  // Send request to API
  http
    .get('/api/user', {
      params: {
        id,
      },
    })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
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
export function checkAuth(http: AxiosInstance, callback: apiResponse) {
  // Add token to default headers
  http.defaults.headers.common['Authorization'] = localStorage.getItem('token');
  // Check with API to see if authorized
  http
    .post('/api/auth')
    .then((res: AxiosResponse) => {
      // Authenticated - send null error to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
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
export function getAllUsers(http: AxiosInstance, callback: apiResponse) {
  http
    .get('/api/user/all')
    .then((res: AxiosResponse) => {
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
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
export function updateUser(
  http: AxiosInstance,
  user: User,
  callback: apiResponse
) {
  http
    .put('/api/user', { user })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function createUser(
  http: AxiosInstance,
  user: User,
  callback: apiResponse
) {
  http
    .post('/api/user', { user })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
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
export function getUserInventory(
  http: AxiosInstance,
  callback: apiResponse
) {
  http
    .get('/api/user/inventory')
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
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
export function getUserInventoryByID(
  http: AxiosInstance,
  user_id: string,
  callback: apiResponse
) {
  http
    .get('/api/user/inventory', {
      params: {
        user_id,
      },
    })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getAllTechsInventory(
  http: AxiosInstance,
  callback: apiResponse
) {
  http
    .get('/api/user/inventory', {
      params: {
        user_id: 'all',
      },
    })
    .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function checkRoles(http: AxiosInstance, roles: string[], callback: apiResponse) {
  http.get('/api/user/roles', {
    params: {
      roles
    }
  })
  .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function sendPasswordResetEmail(http: AxiosInstance, email: string, callback: apiResponse) {
  http.get('/api/password/reset', {
    params: {
      email
    }
  })
  .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function submitNewPassword(http: AxiosInstance, user_id: string, token: string, password: string, callback: apiResponse) {
  http.post('/api/password/reset', {
    user_id,
    token,
    password
  })
  .then((res: AxiosResponse) => {
      // Success - send response to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getAssetUpdates(
  http: AxiosInstance,
  startDate: number,
  endDate: number,
  pageNum: number,
  pageSize: number,
  callback: apiResponse,
  users?: string[],
  nxids?: string[],
  hideOthers?: boolean,
  asset_tags?: string[]
) {
  // Send request to API
  http
    .get('/api/history/assetsUpdated', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers,
      asset_tags
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getAssetUpdatesNoDetails(
  http: AxiosInstance,
  startDate: number,
  endDate: number,
  pageNum: number,
  pageSize: number,
  callback: apiResponse,
  users?: string[],
  nxids?: string[],
  hideOthers?: boolean,
  asset_tags?: string[]
) {
  // Send request to API
  http
    .get('/api/history/assetsUpdated/noDetails', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers,
      asset_tags
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getNewAssets(
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
  // Send request to API
  http
    .get('/api/history/newAssets', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getNewAssetsNoDetails(
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
  // Send request to API
  http
    .get('/api/history/newAssets/noDetails', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getCheckinHistory(
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
  // Send request to API
  http
    .get('/api/history/checkins', {
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
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getCheckoutHistory(
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
  // Send request to API
  http
    .get('/api/history/checkouts', {
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
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getAllTechsHistory(
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
  // Send request to API
  http
    .get('/api/history/alltechs', {
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
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getNewPallets(
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
  // Send request to API
  http
    .get('/api/history/newPallets', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getNewPalletsNoDetails(
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
  // Send request to API
  http
    .get('/api/history/newPallets/noDetails', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getPalletUpdates(
  http: AxiosInstance,
  startDate: number,
  endDate: number,
  pageNum: number,
  pageSize: number,
  callback: apiResponse,
  users?: string[],
  nxids?: string[],
  hideOthers?: boolean,
  pallet_tags?: string[]
) {
  // Send request to API
  http
    .get('/api/history/palletsUpdated', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers,
      pallet_tags
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getPalletUpdatesNoDetails(
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
  // Send request to API
  http
    .get('/api/history/palletsUpdated/noDetails', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getEbayHistory(
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
  // Send request to API
  http
    .get('/api/history/sales', {
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
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getBoxUpdates(
  http: AxiosInstance,
  startDate: number,
  endDate: number,
  pageNum: number,
  pageSize: number,
  callback: apiResponse,
  users?: string[],
  nxids?: string[],
  hideOthers?: boolean,
  box_tags?: string[]
) {
  // Send request to API
  http
    .get('/api/history/boxesUpdated', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers,
      box_tags
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getBoxUpdatesNoDetails(
  http: AxiosInstance,
  startDate: number,
  endDate: number,
  pageNum: number,
  pageSize: number,
  callback: apiResponse,
  users?: string[],
  nxids?: string[],
  hideOthers?: boolean,
  box_tags?: string[]
) {
  // Send request to API
  http
    .get('/api/history/boxesUpdated/noDetails', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers,
      box_tags
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getNewBoxes(
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
  // Send request to API
  http
    .get('/api/history/newBoxes', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}

export function getNewBoxesNoDetails(
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
  // Send request to API
  http
    .get('/api/history/newBoxes/noDetails', {
    params: {
      users,
      startDate,
      endDate,
      pageNum,
      pageSize,
      nxids,
      hideOthers
    }
  })
    .then((res: AxiosResponse) => {
      // Success - send response data to callback
      callback(res.data, null);
    })
    .catch((err: AxiosError) => {
      // Error - send error to callback
      callback({}, err);
    });
}
