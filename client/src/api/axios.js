import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL
    ? `${import.meta.env.VITE_SERVER_URL}/api`
    : "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status
    const message = err.response?.data?.message

    if (status === 401) {
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }

    if (status === 429) {
      // Show rate limit message with retry time if available
      const retry = err.response?.data?.retryAfter
      err.message = retry
        ? `${message} (retry in ${Math.ceil(retry / 60)} min)`
        : message || 'Too many requests. Please slow down.'
    }

    if (!err.response) {
      err.message = 'Network error — check your connection'
    }

    return Promise.reject(err)
  }
);

export default api;
