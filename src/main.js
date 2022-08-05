import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router/'
import store from '@/store/'
import axios from '@/axios/'
import vuetify from '@/plugin/vuetify'
import interval from '@/plugin/interval'
import i18n from '@/i18n'
import { datadogRum } from '@datadog/browser-rum'

// RUM
if (process.env.VUE_APP_RUM_ID !== '' && process.env.VUE_APP_RUM_TOKEN !== '') {
  datadogRum.init({
    // parameters: https://docs.datadoghq.com/real_user_monitoring/browser/#configuration
    applicationId: process.env.VUE_APP_RUM_ID,
    clientToken: process.env.VUE_APP_RUM_TOKEN,
    site: 'datadoghq.com',
    service: 'risken',
    sampleRate: 100,
    premiumSampleRate: 100,
    trackInteractions: true,
    defaultPrivacyLevel: 'mask-user-input',
  })
  datadogRum.startSessionReplayRecording()
}

Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.use(interval)

new Vue({
  router,
  store,
  vuetify,
  interval,
  i18n,
  render: (h) => h(App),
}).$mount('#app')
