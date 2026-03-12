import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://backend-xboi.onrender.com/api',          
  withCredentials: true,    
})