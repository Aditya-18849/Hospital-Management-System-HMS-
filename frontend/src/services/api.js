import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

// Flexible request helpers
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

const get = (url, config) => api.get(url, config)
const post = (url, data, config) => api.post(url, data, config)
const put = (url, data, config) => api.put(url, data, config)
const del = (url, config) => api.delete(url, config)

export default api
export { setAuthToken, get, post, put, del }
