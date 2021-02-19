import Vue from 'vue'
import Router from 'vue-router'
import { commonRoute, appRoute } from './config'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store'
import axios from '@/axios'
const routes = commonRoute.concat(appRoute)

Vue.use(Router)
const router = new Router({
  mode: 'hash',
  linkActiveClass: 'active',
  routes: routes,
})

// Navigation guards
router.beforeEach( async (to, from, next) => {
  NProgress.start()
  const project_id = to.query.project_id
  const current_project_id = store.state.project.project_id 
  const user_id = store.state.user.user_id
  if ( typeof project_id != 'undefined' && typeof user_id != 'undefined' && project_id !== current_project_id ) {
    const admin = await axios.get('/iam/is-admin/?user_id=' + user_id )
    let q = 'project_id=' + project_id
    if ( !admin.data.data.ok ) {
      q += '&user_id=' + user_id
    }
    const res = await axios.get('/project/list-project/?' + q )
    if ( res.data.data.project ) {
      store.commit('updateProject', res.data.data.project[0])
      next({path: to.currentRoute, force: true})
    }
  }
  next()
})

// Global after hook
router.afterEach(()=>{
  NProgress.done()
})

export default router
