import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router/'
import store from '@/store/'
import axios from '@/axios/'
import vuetify from '@/plugin/vuetify'
import interval from '@/plugin/interval'

Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.use(interval)

new Vue({
  router,
  store,
  vuetify,
  interval,
  render: h => h(App)
}).$mount('#app')
