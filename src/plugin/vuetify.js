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
        primary: '#37474F',
        // primary: '#880E4F',
        // primary: '#1A237E',
        // primary: '#006064',
        secondary: '#A12900',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#c0ae4c',
        background: '#F5F5F5',
      }
    }
  }
}

export default new Vuetify(opts)
