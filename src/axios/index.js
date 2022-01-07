import Axios from 'axios'
import router from '../router'

// ResourceManager Config
const MAX_REQUESTS_COUNT = 5
const INTERVAL_MS = 10
let PENDING_REQUESTS = 0

const axios = Axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
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
    Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
    return Promise.resolve(response)
  },
  (error) => {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
    if (error.code && error.code === 'ECONNABORTED') {
      // timeout
      console.log(error)
      router.push({ path: '/timeout' })
    }

    if (!error.response.status) {
      Promise.reject(error)
    }
    const status = error.response.status
    if (status === 303) {
      console.log('303')
      router.push({ path: '/' })
    } else if (status === 401) {
      console.log('401 Authn error')
      router.push({
        path: '/iam/profile',
        query: { url: router.currentRoute.fullPath },
      })
    } else if (status === 403) {
      console.log('403 Authz error')
      router.push({
        path: '/403',
        query: { url: router.currentRoute.fullPath },
      })
    }
    return Promise.reject(error)
  }
)

export default axios
