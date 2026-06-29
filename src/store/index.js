import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'
import { MODE } from '@/constants/mode'

const vuexLocal = new VuexPersistence({
  key: 'risken',
  storage: window.localStorage,
})

const store = createStore({
  state() {
    return {
      user: {},
      project: {},
      organization: {},
      mode: MODE.PROJECT, // MODE.PROJECT or MODE.ORGANIZATION
      interval: {},
      locale: {},
      findingHistory: [],
      projectOrgSearch: {
        project: '',
        organization: '',
      },
    }
  },
  mutations: {
    storeUser: (state, payload) => {
      state.user = payload
    },
    updateProject: (state, payload) => {
      state.project = payload
    },
    updateOrganization: (state, payload) => {
      state.organization = payload
    },
    updateMode: (state, payload) => {
      state.mode = payload
    },
    updateInterval: (state, payload) => {
      state.interval = payload
    },
    updateLocale: (state, payload) => {
      state.locale = payload
    },
    updateFindingHistory: (state, payload) => {
      state.findingHistory = payload
    },
    updateProjectOrgSearch: (state, payload) => {
      if (!['project', 'organization'].includes(payload.entityType)) {
        return
      }
      state.projectOrgSearch = {
        ...state.projectOrgSearch,
        [payload.entityType]: payload.searchText || '',
      }
    },
  },
  plugins: [vuexLocal.plugin],
})

export default store
