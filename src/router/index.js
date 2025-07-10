import { createRouter, createWebHistory } from 'vue-router'
import { commonRoute, appRoute } from './config'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store'
import axios from '@/axios'
import { MODE } from '@/constants/mode'
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
  const organization_id = to.query.organization_id
  const current_project_id = store.state.project.project_id
  const current_organization_id = store.state.organization.organization_id
  const user_id = store.state.user.user_id

  if (
    typeof organization_id != 'undefined' &&
    typeof user_id != 'undefined' &&
    organization_id != current_organization_id
  ) {
    const admin = await axios
      .get('/iam/is-admin/?user_id=' + user_id)
      .catch((err) => {
        handleAPIError(err)
        return
      })
    let q = 'organization_id=' + organization_id
    if (!admin.data.data.ok) {
      q += '&user_id=' + user_id
    }
    const res = await axios
      .get('/organization/list-organization/?' + q)
      .catch((err) => {
        handleAPIError(err)
        return
      })
    if (res.data.data.organization) {
      await store.commit('updateOrganization', res.data.data.organization[0])
      const query = {
        ...to.query,
        organization_id: store.state.organization.organization_id,
      }
      router.push({ query: query })
      router.go({ path: to.currentRoute })
      next()
      return
    }
  } else if (
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
      const query = { ...to.query, project_id: store.state.project.project_id }
      router.push({ query: query })
      router.go({ path: to.currentRoute })
      next()
      return
    }
  }

  if (
    store.state.mode === MODE.ORGANIZATION &&
    !to.path.startsWith('/organization/select') &&
    !to.path.startsWith('/organization/new') &&
    !to.path.startsWith('/auth/signin') &&
    (!store.state.organization ||
      !store.state.organization.organization_id ||
      Object.keys(store.state.organization).length === 0)
  ) {
    next('/organization/select')
    return
  }

  if (
    store.state.mode === MODE.ORGANIZATION &&
    to.path.startsWith('/organization') &&
    !to.path.startsWith('/organization/new') &&
    !to.path.startsWith('/organization/select') &&
    !to.query.organization_id &&
    current_organization_id &&
    current_organization_id != ''
  ) {
    const query = { ...to.query, organization_id: current_organization_id }
    next({ ...to, query })
    return
  } else if (
    store.state.mode === MODE.PROJECT &&
    !to.path.startsWith('/project/new') &&
    !to.query.project_id &&
    current_project_id &&
    current_project_id != ''
  ) {
    const query = { ...to.query, project_id: current_project_id }
    next({ ...to, query })
    return
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
