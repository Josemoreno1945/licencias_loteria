import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de solicitud: adjunta el token JWT automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token') ||
      localStorage.getItem('token') // legacy
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor de respuesta: manejo global de errores 401
let onUnauthorized = null

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      ;['auth_token', 'auth_user', 'token', 'user'].forEach((k) => {
        localStorage.removeItem(k)
        sessionStorage.removeItem(k)
      })
      if (typeof onUnauthorized === 'function') {
        onUnauthorized()
      } else if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
