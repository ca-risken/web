import { createRouter, createWebHistory, isNavigationFailure, NavigationFailureType } from 'vue-router'
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

let navigationId = 0
const reloadRoutes = new WeakSet()

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const currentNavigationId = ++navigationId
  NProgress.start()
  // Authentication and error pages must not retry a failed scope lookup.
  if (
    to.path === '/' ||
    to.path.startsWith('/auth/') ||
    ['/403', '/404', '/timeout', '/iam/profile'].includes(to.path)
  ) {
    next()
    return
  }

  const organization_id = to.query.organization_id
  const project_id = to.query.project_id
  const user_id = store.state.user.user_id
  const hasOrganization = typeof organization_id !== 'undefined'
  const hasProject = typeof project_id !== 'undefined'

  if ((hasOrganization || hasProject) && !user_id) {
    next({ path: '/', query: to.query })
    return
  }

  if (hasOrganization && hasProject) {
    const query = { ...to.query }
    delete query.project_id
    next({ ...to, query, replace: true })
    return
  }

  if (hasOrganization || hasProject) {
    // Organization takes precedence in legacy links containing both IDs.
    const scope = hasOrganization ? 'organization' : 'project'
    const mode = hasOrganization ? MODE.ORGANIZATION : MODE.PROJECT
    const key = scope + '_id'
    const id = to.query[key]
    const changed = store.state.mode !== mode || store.state[scope][key] != id
    if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) {
      next('/403')
      return
    }
    if (changed) {
      try {
        // This guard owns lookup redirects; the global interceptor must not
        // navigate after this request has been superseded.
        const config = { skipErrorNavigation: true }
        const admin = await axios.get('/iam/is-admin/?user_id=' + user_id, config)
        if (currentNavigationId !== navigationId) {
          next(false)
          return
        }
        let q = key + '=' + id
        if (!admin.data.data.ok) {
          q += '&user_id=' + user_id
        }
        const res = await axios.get('/' + scope + '/list-' + scope + '/?' + q, config)
        if (currentNavigationId !== navigationId) {
          next(false)
          return
        }
        const target = res.data.data[scope]?.find((item) => item[key] == id)
        if (!target) {
          next('/403')
          return
        }
        store.commit(hasOrganization ? 'updateOrganization' : 'updateProject', target)
        store.commit('updateMode', mode)
        if (from.matched.length > 0) {
          reloadRoutes.add(to)
        }
      } catch (error) {
        if (currentNavigationId !== navigationId) {
          next(false)
          return
        }
        const status = error.response?.status
        if (status === 303 || status === 401) {
          next({ path: status === 303 ? '/' : '/iam/profile', query: to.query })
        } else {
          next(status === 403 ? '/403' : '/timeout')
        }
        return
      }
    }
  }

  const current_project_id = store.state.project.project_id
  const current_organization_id = store.state.organization.organization_id

  if (
    store.state.mode === MODE.PROJECT &&
    !to.path.startsWith('/project/select') &&
    !to.path.startsWith('/project/new') &&
    !to.path.startsWith('/iam/profile') &&
    !to.path.startsWith('/admin/menu') &&
    !to.path.startsWith('/auth/signin') &&
    (!store.state.project ||
      !store.state.project.project_id ||
      Object.keys(store.state.project).length === 0)
  ) {
    next('/project/select')
    return
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
router.afterEach((to, from, failure) => {
  // Duplicate navigations supersede pending work without entering beforeEach.
  if (failure && isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    navigationId++
  }
  if (store.state.interval.id) {
    clearInterval(store.state.interval.id)
  }
  store.commit('updateInterval', {}) // clear set interval
  NProgress.done()
  if (!failure && reloadRoutes.has(to)) {
    router.go(0)
  }
  reloadRoutes.delete(to)
})

export default router
