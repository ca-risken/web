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
        path: '/project/new',
        name: 'Project',
        meta: {
          title: 'Project',
          hiddenInMenu: true,
        },
        component: () => import('@/view/project/Project.vue')
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
          {
            path: '/iam/profile',
            name: 'Profile',
            meta: {
              title: 'Profile',
              hiddenInMenu: true,
            },
            component: () => import('@/view/iam/Profile.vue')
          },
        ]
      },
      {
        path: '/aws',
        component: RouteWrapper,
        redirect: '/aws/aws',
        meta: {
          title: 'AWS',
          icon: 'mdi-aws',
          group: 'aws'
        },
        children: [
          {
            path: '/aws/aws',
            name: 'AWS',
            meta: {
              title: 'AWS',
            },
            component: () => import('@/view/aws/AWS.vue')
          },
          {
            path: '/aws/data-source',
            name: 'DataSource',
            meta: {
              title: 'DataSource',
            },
            component: () => import('@/view/aws/DataSource.vue')
          },
        ]
      },
      {
        path: '/diagnosis',
        component: RouteWrapper,
        redirect: '/diagnosis/jira',
        meta: {
          title: 'Diagnosis',
          icon: 'mdi-bug-check-outline',
          group: 'diagnosis'
        },
        children: [
          {
            path: '/diagnosis/jira',
            name: 'Diagnosis',
            meta: {
              title: 'JIRA',
            },
            component: () => import('@/view/diagnosis/JIRA.vue')
          },
        ]
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
