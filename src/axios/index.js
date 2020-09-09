import Axios from 'axios'
import router from '../router'

const axios = Axios.create({
  baseURL: '/api/v1',
})
axios.interceptors.request.use(
  config => {
    // for local
    // config.headers.common['x-amzn-oidc-identity'] = 'alice'
    return config
  },
  error => Promise.reject(error)
)

axios.interceptors.response.use(
  response => response,
  error => {
    const status = error.response.status
    if (status === 303) {
      console.log('303')
      router.push({path: '/'})
    } else if (status === 401) {
      console.log('401認証エラー')
      router.push({path: '/auth/signin', query: { url: router.currentRoute.fullPath }})
    } else if (status === 403) {
      console.log('403認可エラー')
      router.push({path: '/403', query: { url: router.currentRoute.fullPath }})
    } else if (status === 404) {
      router.push({path: '/404', query: { url: router.currentRoute.fullPath }})
    } else if (status >= 500) {
      console.log('500エラー')
      router.push({path: '/500'})
    }
    return Promise.reject(error)
  }
)

export default axios
