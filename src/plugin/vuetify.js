import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

const opts = {
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: '#00838F',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#c0ae4c'
      }
    }
  }
}

export default new Vuetify(opts)
