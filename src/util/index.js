const randomElement = (arr = []) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const kebab = (str) => {
  return (str || '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

const toggleFullScreen = () => {
  let doc = window.document
  let docEl = doc.documentElement

  let requestFullScreen =
    docEl.requestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.webkitRequestFullScreen ||
    docEl.msRequestFullscreen
  let cancelFullScreen =
    doc.exitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.webkitExitFullscreen ||
    doc.msExitFullscreen

  if (
    !doc.fullscreenElement &&
    !doc.mozFullScreenElement &&
    !doc.webkitFullscreenElement &&
    !doc.msFullscreenElement
  ) {
    requestFullScreen.call(docEl)
  } else {
    cancelFullScreen.call(doc)
  }
}

const formatDate = (date, format) => {
  format = format.replace(/yyyy/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
  return format;
}

const cutLongString = (str, maxLen) => {
  if (!str) {
    return ''
  }
  if (str.length >= maxLen ) {
    return str.substring(0, maxLen) + '...'
  }
  return str
}

const elapsedTimeText = (from) => {
  let diff = new Date().getTime() - from.getTime()
  let elapsed = new Date(diff)

  if (elapsed.getUTCFullYear() - 1970) {
    return elapsed.getUTCFullYear() - 1970 + ' years'
  } else if (elapsed.getUTCMonth()) {
    return elapsed.getUTCMonth() + ' months'
  } else if (elapsed.getUTCDate() - 1) {
    return elapsed.getUTCDate() - 1 + ' days'
  } else if (elapsed.getUTCHours()) {
    return elapsed.getUTCHours() + ' hours'
  } else if (elapsed.getUTCMinutes()) {
    return elapsed.getUTCMinutes() + ' minutes'
  } else {
    return 'just now'
  }
}

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

const generateRandomPassword = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const len = 64
  const string  = letters + letters.toUpperCase() + numbers

  let password=''
  for (var i = 0; i < len; i++) {
    password += string.charAt(Math.floor(Math.random() * string.length))
  }
  return password
}
export default {
  randomElement,
  toggleFullScreen,
  kebab,
  formatDate,
  cutLongString,
  elapsedTimeText,
  getNavigatorLanguage,
  generateRandomPassword,
}
