import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auto-logout when token expires (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Show native alert to notify user before logging out
      window.alert('Your session has expired. Please log in again.')
      
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user') // Clear any user data
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)