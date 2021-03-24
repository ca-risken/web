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
    path: '/timeout',
    name: 'timeout',
    meta: {
      title: 'Server Error'
    },
    component: () => import('@/view/error/Timeout.vue')
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
          hiddenInMenu: true,
        },
        component: () => import('@/view/Home.vue')
      },
      {
        path: '/project/new',
        name: 'NewProject',
        meta: {
          title: 'Project',
          hiddenInMenu: true,
        },
        component: () => import('@/view/project/New.vue')
      },
      {
        path: '/project/setting',
        name: 'Project',
        meta: {
          title: 'Project',
          hiddenInMenu: true,
        },
        component: () => import('@/view/project/Setting.vue')
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
          {
            path: '/finding/setting',
            name: 'Setting',
            meta: {
              title: 'Setting'
            },
            component: () => import('@/view/finding/Setting.vue')
          },
        ]
      },
      {
        path: '/alert',
        component: RouteWrapper,
        redirect: '/alert/alert',
        meta: {
          title: 'Alert',
          icon: 'mdi-alert',
          group: 'alert'
        },
        children: [
          {
            path: '/alert/alert',
            name: 'Alert',
            meta: {
              title: 'Alert'
            },
            component: () => import('@/view/alert/Alert.vue')
          },
          {
            path: '/alert/condition',
            name: 'Condition',
            meta: {
              title: 'Condition'
            },
            component: () => import('@/view/alert/Condition.vue')
          },
          {
            path: '/alert/rule',
            name: 'Rule',
            meta: {
              title: 'Rule'
            },
            component: () => import('@/view/alert/Rule.vue')
          },
          {
            path: '/alert/notification',
            name: 'Notification',
            meta: {
              title: 'Notification'
            },
            component: () => import('@/view/alert/Notification.vue')
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
            name: 'AWS DataSource',
            meta: {
              title: 'AWS DataSource',
            },
            component: () => import('@/view/aws/DataSource.vue')
          },
        ]
      },
      {
        path: '/google',
        component: RouteWrapper,
        redirect: '/google/gcp',
        meta: {
          title: 'Google',
          icon: 'mdi-google',
          group: 'google'
        },
        children: [
          {
            path: '/google/gcp',
            name: 'GCP',
            meta: {
              title: 'GCP',
            },
            component: () => import('@/view/google/GCP.vue')
          },
          {
            path: '/google/gcp-data-source',
            name: 'GCP DataSource',
            meta: {
              title: 'GCP DataSource',
            },
            component: () => import('@/view/google/GCPDataSource.vue')
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
            name: 'JIRA',
            meta: {
              title: 'JIRA',
            },
            component: () => import('@/view/diagnosis/JIRA.vue')
          },
          {
            path: '/diagnosis/wpscan',
            name: 'Diagnosis',
            meta: {
              title: 'WPScan',
            },
            component: () => import('@/view/diagnosis/WPScan.vue')
          },
        ]
      },
      {
        path: '/osint',
        component: RouteWrapper,
        redirect: '/osint/osint',
        meta: {
          title: 'OSINT',
          icon: 'http',
          group: 'osint'
        },
        children: [
          {
            path: '/osint/osint',
            name: 'OSINT',
            meta: {
              title: 'OSINT',
            },
            component: () => import('@/view/osint/OSINT.vue')
          },
          {
            path: '/osint/data-source',
            name: 'OSINT DataSource',
            meta: {
              title: 'OSINT DataSource',
            },
            component: () => import('@/view/osint/DataSource.vue')
          },
        ]
      },
      {
        path: '/code',
        component: RouteWrapper,
        redirect: '/code/gitleaks',
        meta: {
          title: 'Code',
          icon: 'mdi-github',
          group: 'code'
        },
        children: [
          {
            path: '/code/gitleaks',
            name: 'Gitleaks',
            meta: {
              title: 'Gitleaks',
            },
            component: () => import('@/view/code/Gitleaks.vue')
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
        path: '/report',
        component: RouteWrapper,
        redirect: '/report/finding',
        meta: {
          title: 'Report',
          icon: 'mdi-file-chart',
          group: 'report'
        },
        children: [
          {
            path: '/report/finding',
            name: 'ReportFinding',
            meta: {
              title: 'ReportFinding',
            },
            component: () => import('@/view/report/Finding.vue')
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
