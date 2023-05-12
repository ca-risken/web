import store from '@/store'

export default {
  install(app) {
    app.config.globalProperties.$setInterval = (func, intervalMilliSec) => {
      if (typeof import.meta.env.VITE_DISABLE_SET_INTERVAL !== 'undefined') {
        console.log(`[DISABLE_SET_INTERVAL] Check environment vars`)
        return null
      }
      const id = setInterval(() => {
        if (document.visibilityState === 'visible') {
          func()
        }
      }, intervalMilliSec)
      store.commit('updateInterval', { id: id })
      return id
    }
  },
}
