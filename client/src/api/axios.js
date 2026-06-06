import axios from 'axios'

const api = axios.create({
  baseURL:         import.meta.env.VITE_SERVER_URL
    ? `${import.meta.env.VITE_SERVER_URL}/api`
    : 'http://localhost:5000/api',
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Session expired — redirect to login
    if (err.response?.status === 401) {
      // Don't redirect if already on auth pages
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }

    // Network error — no response at all
    if (!err.response) {
      err.message = 'Network error — check your connection'
    }

    return Promise.reject(err)
  }
)

export default api