import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from '@/i18n/message/en.js'
import ja from '@/i18n/message/ja.js'

Vue.use(VueI18n);
const getNavigatorLanguage = () => {
  let lang = ''
  if (navigator.languages && navigator.languages.length) {
    lang = navigator.languages[0];
  } else {
    lang = navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en';
  }
  if (lang && (lang === 'en' || lang === 'ja' ) ) {
    return lang
  } else {
    console.log('Unsupported language, lang=' + lang)
    return 'en'
  }
}

const i18n = new VueI18n({
  locale: getNavigatorLanguage(),
  messages: {
    en : en,
    ja : ja,
  }
})

export default i18n
