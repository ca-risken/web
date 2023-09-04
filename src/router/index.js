import { createRouter, createWebHistory } from 'vue-router'
import { commonRoute, appRoute } from './config'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store'
import axios from '@/axios'
const routes = commonRoute.concat(appRoute)

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

const handleAPIError = (error) => {
  console.log(
    'Error: status=' + error.response.status + ', reponse=' + error.response
  )
  router.push({ path: '/' })
}

// Navigation guards
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const project_id = to.query.project_id
  const current_project_id = store.state.project.project_id
  const user_id = store.state.user.user_id
  if (
    typeof project_id != 'undefined' &&
    typeof user_id != 'undefined' &&
    project_id != current_project_id
  ) {
    const admin = await axios
      .get('/iam/is-admin/?user_id=' + user_id)
      .catch((err) => {
        handleAPIError(err)
        return
      })
    let q = 'project_id=' + project_id
    if (!admin.data.data.ok) {
      q += '&user_id=' + user_id
    }
    const res = await axios.get('/project/list-project/?' + q).catch((err) => {
      handleAPIError(err)
      return
    })
    if (res.data.data.project) {
      await store.commit('updateProject', res.data.data.project[0])
      let query = Object.assign({}, to.query)
      // delete query["project_id"]
      query.project_id = store.state.project.project_id
      router.push({ query: query }) // Edit query parameter
      router.go({ path: to.currentRoute })
      next()
      return
    }
  }
  next()
})

// Global after hook
router.afterEach(() => {
  if (store.state.interval.id) {
    clearInterval(store.state.interval.id)
  }
  store.commit('updateInterval', {}) // clear set interval
  NProgress.done()
})

export default router
