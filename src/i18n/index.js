import {createI18n} from 'vue-i18n'
import en from '@/i18n/message/en.js'
import ja from '@/i18n/message/ja.js'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: en,
    ja: ja,
  },
})

export default i18n
