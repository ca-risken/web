import {
  LayoutAuth,
  LayoutDefault,
  RouteWrapper
} from '@/component/layout'

export const commonRoute = [
  {
    path: '*',
    component: () => import('@/view/error/NotFound.vue')
  },
  {
    path: '/auth',
    component: LayoutAuth,
    meta: {
      title: 'Signin'
    },
    redirect: '/auth/signin',
    hidden: true,
    children: [
      {
        path: 'signin',
        name: 'signin',
        meta: {
          title: 'Signin'
        },
        component: () => import('@/view/auth/Signin.vue')
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
  },
]

export const appRoute = [
  {
    path: '/',
    component: LayoutDefault,
    meta: {
      title: 'Home',
      group: 'apps',
    },
    children: [
      {
        path: '/',
        name: 'Home',
        meta: {
          title: 'Home',
          group: 'apps',
          icon: 'mdi-home'
        },
        component: () => import('@/view/Home.vue')
      },
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
      {
        path: '/finding',
        component: RouteWrapper,
        redirect: '/finding/resource',
        meta: {
          title: 'Finding',
          icon: 'mdi-file-find-outline',
          group: 'finding'
        },
        children: [
          {
            path: '/finding/resource',
            name: 'Resource',
            meta: {
              title: 'Resource'
            },
            component: () => import('@/view/finding/Resource.vue')
          },
          {
            path: '/finding/finding',
            name: 'Finding',
            meta: {
              title: 'Finding'
            },
            component: () => import('@/view/finding/Finding.vue')
          },
        ]
      },
      {
        path: '/iam',
        component: RouteWrapper,
        redirect: '/iam/user',
        meta: {
          title: 'IAM',
          icon: 'mdi-account-multiple',
          group: 'iam'
        },
        children: [
          {
            path: '/iam/user',
            name: 'User',
            meta: {
              title: 'User',
            },
            component: () => import('@/view/iam/User.vue')
          },
          {
            path: '/iam/role',
            name: 'Role',
            meta: {
              title: 'Role'
            },
            component: () => import('@/view/iam/Role.vue')
          },
          {
            path: '/iam/policy',
            name: 'Policy',
            meta: {
              title: 'Policy'
            },
            component: () => import('@/view/iam/Policy.vue')
          },
        ]
      },
      {
        path: '/profile',
        name: 'profile',
        meta: {
          title: 'Profile',
          hiddenInMenu: true,
        },
        component: () => import('@/view/iam/Profile.vue')
      },
      {
        path: '/403',
        name: 'Forbidden',
        meta: {
          title: 'Access Denied',
          hiddenInMenu: true
        },
        component: () => import('@/view/error/Deny.vue')
      },
    ]
  }
]
