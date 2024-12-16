import Axios from 'axios'
import router from '../router'

// ResourceManager Config
const MAX_REQUESTS_COUNT = 5
const INTERVAL_MS = 10
let PENDING_REQUESTS = 0

const axios = Axios.create({
  baseURL: '/api/v1',
  timeout: 20000,
})
axios.interceptors.request.use(
  (config) => {
    return new Promise((resolve) => {
      let interval = setInterval(() => {
        if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
          PENDING_REQUESTS++
          clearInterval(interval)
          resolve(config)
        }
      }, INTERVAL_MS)
    })
  },
  (error) => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
    return Promise.resolve(response)
  },
  (error) => {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
    // Timeout
    if (error.code && error.code === 'ECONNABORTED') {
      console.log('Timeout error:', error)
      router.push({ path: '/timeout' })
      return Promise.reject(error)
    }
    // Cancel
    if (Axios.isCancel(error)) {
      console.log('Request canceled:', error.message)
      return Promise.reject(error)
    }
    // Network error
    if (!error.response) {
      console.log('Network error:', error)
      return Promise.reject(error)
    }

    if (!error.response.status) {
      Promise.reject(error)
    }
    const status = error.response.status
    if (status === 303) {
      console.log('303 Redirect')
      router.push({ path: '/', query: router.currentRoute.value.query })
    } else if (status === 401) {
      console.log('401 Unauthorized')
      router.push({
        path: '/iam/profile',
        query: router.currentRoute.value.query,
      })
    } else if (status === 403) {
      console.log('403 Forbidden')
      router.push({
        path: '/403',
        query: router.currentRoute.value.query,
      })
    }
    return Promise.reject(error)
  }
)

export default axios
