import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { md } from 'vuetify/iconsets/md'

const riskenLightTheme = {
  dark: false,
  colors: {
    primary: '#B0BEC5',
    secondary: '#A12900',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#c0ae4c',
    surface: '#FFFFFF',
    'on-surface-variant': '#FFFFFF',
    background: '#F5F5F5',
  },
}

const riskenTheme = {
  defaultTheme: 'riskenLightTheme',
  variations: {
    colors: ['primary', 'success'],
    lighten: 1,
    darken: 3,
  },

  themes: {
    riskenLightTheme,
  },
}

export default createVuetify({
  components,
  directives,
  theme: riskenTheme,
  icons: {
    sets: {
      md,
    },
  },
})
