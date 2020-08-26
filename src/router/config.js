import {
  LayoutAuth,
  LayoutDefault,
  LayoutChat,
  RouteWrapper
} from '@/component/layout'

export const publicRoute = [
  {
    path: '*',
    component: () => import('@/view/error/NotFound.vue')
  },
  {
    path: '/auth',
    component: LayoutAuth,
    meta: {
      title: 'Login'
    },
    redirect: '/auth/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        meta: {
          title: 'Login'
        },
        component: () => import('@/view/auth/Login.vue')
      }
    ]
  },

  {
    path: '/404',
    name: '404',
    meta: {
      title: 'Not Found'
    },
    component: () => import('@/view/error/NotFound.vue')
  },

  {
    path: '/500',
    name: '500',
    meta: {
      title: 'Server Error'
    },
    component: () => import('@/view/error/Error.vue')
  }
]

export const protectedRoute = [
  {
    path: '/',
    component: LayoutDefault,
    meta: {
      title: 'Home',
      group: 'apps',
      icon: ''
    },
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        meta: {
          title: 'Dashboard',
          group: 'apps',
          icon: 'mdi-view-dashboard'
        },
        component: () => import('@/view/Dashboard.vue')
      },
      // {
      //   path: '/cms',
      //   component: RouteWrapper,
      //   redirect: '/cms/table',
      //   meta: {
      //     title: 'CMS',
      //     icon: 'view_compact',
      //     group: 'cms'
      //   },
      //   children: [
      //     {
      //       path: '/cms/table',
      //       name: 'ListTable',
      //       meta: {
      //         title: 'CMS Table',
      //         icon: 'mdi-database'
      //       },
      //       component: () => import('@/view/list/Table.vue')
      //     }
      //   ]
      // },
      {
        path: '/403',
        name: 'Forbidden',
        meta: {
          title: 'Access Denied',
          hiddenInMenu: true
        },
        component: () => import('@/view/error/Deny.vue')
      }
    ]
  }
]
