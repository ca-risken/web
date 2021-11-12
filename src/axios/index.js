import Axios from 'axios'
import router from '../router'

const axios = Axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})
axios.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

axios.interceptors.response.use(
  (response) => response,
  (error) => {
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
      // } else if (status === 404) {
      //   console.log('404 Not found')
      //   router.push({path: '/404', query: { url: router.currentRoute.fullPath }})
      // // } else if (status >= 500 ) {
      //   router.push({path: '/500', query: { url: router.currentRoute.fullPath }})
    }
    return Promise.reject(error)
  }
)

export default axios
