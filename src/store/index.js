import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

const vuexLocal = new VuexPersistence({
  key: 'risken',
  storage: window.localStorage,
})

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: {},
    project: {},
    interval: {},
  },
  mutations: {
    storeUser: (state, payload) => {
      state.user = payload
    },
    updateProject: (state, payload) => {
      state.project = payload
    },
    updateInterval: (state, payload) => {
      state.interval = payload
    }
  },
  plugins: [vuexLocal.plugin],
})

export default store
