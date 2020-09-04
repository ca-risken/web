import Axios from 'axios'
import router from '../router'

const axios = Axios.create()
axios.interceptors.request.use(
  config => {
    // let id = localStorage.getItem('x-amzn-oidc-identity')
    // if (id) {
    //   config.headers.common['x-amzn-oidc-identity'] = id
    // }
    config.headers.common['x-amzn-oidc-identity'] = 'alice'
    return config
  },
  error => Promise.reject(error)
)

axios.interceptors.response.use(
  response => response,
  error => {
    const status = error.response.status
    if (status === 401) {
      console.log('401認証エラー')
      router.push({path: '/auth/login', query: { url: router.currentRoute.fullPath }})
    } else if (status === 403) {
      console.log('403認可エラー')
      router.push({path: '/403', query: { url: router.currentRoute.fullPath }})
    } else if (status >= 500) {
      console.log('500エラー')
      router.push({path: '/500'})
    }
    return Promise.reject(error)
  }
)

export default axios
