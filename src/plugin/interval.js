import store from '@/store'

export default {
  install (vue) {
    vue.prototype.$setInterval = (func, intervalMilliSec) => {
      if (typeof (process.env.VUE_APP_DISABLE_SET_INTERVAL) !== 'undefined') {
        console.log(`[DISABLE_SET_INTERVAL] Check environment vars`)
        return null
      }
      const id = setInterval(() => {
        if (document.visibilityState === 'visible') {
          func()
        }
      }, intervalMilliSec)
      store.commit('updateInterval', {id: id})
      return id
    }
  }
}
