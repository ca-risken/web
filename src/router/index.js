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
// router gards
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

// Global after hook
router.afterEach( async (to) => {
  NProgress.done()
  if ( !to.query || !to.query.project_id || !store.state.user.user_id ) return
  const admin = await axios.get('/iam/is-admin/?user_id=' + store.state.user.user_id ).catch((err) =>  {
    return Promise.reject(err)
  })
  let q = 'project_id=' + to.query.project_id
  if ( !admin.data.data.ok ) {
    q += '&user_id=' + store.state.user.user_id
  }
  const res = await axios.get('/project/list-project/?' + q ).catch((err) =>  {
    return Promise.reject(err)
  })
  if ( !res.data.data.project ) {
    console.log( 'Unauthorized switch project: user_id=' + store.state.user.user_id + ', project_id=' + to.query.project_id )
    return
  }
  store.commit('updateProject', res.data.data.project[0])
})

export default router
