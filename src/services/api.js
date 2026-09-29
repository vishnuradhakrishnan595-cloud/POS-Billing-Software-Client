import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;

if (!BASE) {
  console.error(
    'VITE_API_BASE_URL is not defined. Check your .env file.'
  );
}

export const api = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});


// =========================================================
// CLEAR AUTHENTICATION
// =========================================================

export const clearAuth = () => {
  [
    'access_token',
    'refresh_token',
    'user',
  ].forEach((key) => {
    localStorage.removeItem(key);
  });
};


// =========================================================
// FORCE LOGOUT
// =========================================================

const forceLogout = () => {
  clearAuth();

  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};


// =========================================================
// REQUEST INTERCEPTOR
// Adds JWT access token to API requests
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// =========================================================
// RESPONSE INTERCEPTOR
// Automatically refreshes expired access tokens
// =========================================================

let refreshing = null;

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }


    // -----------------------------------------------------
    // Don't refresh authentication endpoints
    // -----------------------------------------------------

    const isAuthUrl =
      /\/accounts\/(login|token\/refresh)\//.test(
        originalRequest.url || ''
      );


    // -----------------------------------------------------
    // Only handle 401 errors
    // -----------------------------------------------------

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthUrl
    ) {
      return Promise.reject(error);
    }


    originalRequest._retry = true;


    // -----------------------------------------------------
    // Get refresh token
    // -----------------------------------------------------

    const refreshToken =
      localStorage.getItem('refresh_token');


    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }


    try {

      // ---------------------------------------------------
      // Only one refresh request at a time
      // ---------------------------------------------------

      refreshing =
        refreshing ||
        axios
          .post(
            `${BASE}/accounts/token/refresh/`,
            {
              refresh: refreshToken,
            }
          )
          .then((response) => {

            const newAccessToken =
              response.data.access;

            localStorage.setItem(
              'access_token',
              newAccessToken
            );


            // SimpleJWT may return a rotated refresh token
            if (response.data.refresh) {
              localStorage.setItem(
                'refresh_token',
                response.data.refresh
              );
            }


            return newAccessToken;
          })
          .finally(() => {
            refreshing = null;
          });


      const newAccessToken =
        await refreshing;


      // ---------------------------------------------------
      // Retry original request
      // ---------------------------------------------------

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;


      return api(originalRequest);

    } catch (refreshError) {

      forceLogout();

      return Promise.reject(refreshError);
    }
  }
);