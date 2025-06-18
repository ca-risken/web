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
  const organization_id = to.query.organization_id
  const current_project_id = store.state.project.project_id
  const current_organization_id = store.state.organization.organization_id
  const user_id = store.state.user.user_id

  // Handle organization_id changes
  if (
    typeof organization_id != 'undefined' &&
    typeof user_id != 'undefined' &&
    organization_id != current_organization_id
  ) {
    // Change organization
    console.log(
      `Changing organization from ${current_organization_id} to ${organization_id}`
    )

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
    if (res.data.data.organization && res.data.data.organization.length > 0) {
      // Find the specific organization by ID instead of always using the first one
      const targetOrganization =
        res.data.data.organization.find(
          (o) => o.organization_id == organization_id
        ) || res.data.data.organization[0]
      console.log('Setting organization to:', targetOrganization)
      await store.commit('updateOrganization', targetOrganization)
      next()
      return
    } else {
      console.warn('No organization found for ID:', organization_id)
    }
  }

  // Handle project_id changes
  if (
    typeof project_id != 'undefined' &&
    typeof user_id != 'undefined' &&
    project_id != current_project_id
  ) {
    // Change project
    console.log(`Changing project from ${current_project_id} to ${project_id}`)

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
    if (res.data.data.project && res.data.data.project.length > 0) {
      // Find the specific project by ID instead of always using the first one
      const targetProject =
        res.data.data.project.find((p) => p.project_id == project_id) ||
        res.data.data.project[0]
      console.log('Setting project to:', targetProject)
      await store.commit('updateProject', targetProject)
      next()
      return
    } else {
      console.warn('No project found for ID:', project_id)
    }
  }

  // Force set organization_id parameter for organization routes
  if (
    to.path.startsWith('/organization') &&
    !to.query.organization_id &&
    current_organization_id &&
    current_organization_id != ''
  ) {
    let query = Object.assign({}, to.query)
    query.organization_id = current_organization_id
    next({ ...to, query })
    return
  }

  // Force set project_id parameter for non-organization routes
  if (
    !to.path.startsWith('/organization') &&
    !to.query.project_id &&
    current_project_id &&
    current_project_id != ''
  ) {
    let query = Object.assign({}, to.query)
    query.project_id = current_project_id
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
