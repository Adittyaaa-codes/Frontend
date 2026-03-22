import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://backend-xboi.onrender.com/api',          
  withCredentials: true,    
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})