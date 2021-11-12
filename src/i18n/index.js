import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from '@/i18n/message/en.js'
import ja from '@/i18n/message/ja.js'

Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: 'en',
  messages: {
    en: en,
    ja: ja,
  },
})

export default i18n
