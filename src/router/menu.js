// Menu configuration separated from router
import { MODE } from '@/constants/mode'

// Menu visibility configuration
export const menuVisibility = {
  // Menus visible in Organization mode
  organizationModeAllowed: [
    'Finding',
    'Organization',
    'Organization IAM',
    'User Reservation',
  ],
  // Menus forbidden in Project mode
  projectModeForbidden: ['Organization IAM'],
}

// Child menu visibility configuration
export const childMenuVisibility = {
  // Child menus forbidden in Project mode
  projectModeForbidden: [
    'New Organization',
    'Organization Setting',
    'ProjectInvitation',
  ],
  // Child menus forbidden in Organization mode
  organizationModeForbidden: ['OrganizationInvitation'],
  // Child menus forbidden under 'Finding' in Organization mode
  findingOrganizationModeForbidden: ['Resource', 'Setting'],
}

// Menu structure definition (separated from routing)
export const menuDefinition = [
  {
    title: 'Home',
    icon: null,
    path: '/',
    hiddenInMenu: true,
  },
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    path: '/dashboard',
  },
  {
    title: 'Finding',
    icon: 'mdi-file-find-outline',
    path: '/finding',
    children: [
      { title: 'Resource', path: '/finding/resource' },
      { title: 'Finding', path: '/finding/finding' },
      { title: 'Setting', path: '/finding/setting' },
    ],
  },
  {
    title: 'Alert',
    icon: 'mdi-alert',
    path: '/alert',
    children: [
      { title: 'Alert', path: '/alert/alert' },
      { title: 'Condition', path: '/alert/condition' },
      { title: 'Rule', path: '/alert/rule' },
      { title: 'Notification', path: '/alert/notification' },
    ],
  },
  {
    title: 'AWS',
    icon: 'mdi-aws',
    path: '/aws',
    children: [
      { title: 'AWS', path: '/aws/aws' },
      { title: 'AWS DataSource', path: '/aws/data-source' },
    ],
  },
  {
    title: 'Google',
    icon: 'mdi-google',
    path: '/google',
    children: [
      { title: 'GCP', path: '/google/gcp' },
      { title: 'GCP DataSource', path: '/google/gcp-data-source' },
    ],
  },
  {
    title: 'Azure',
    icon: 'mdi-microsoft-azure',
    path: '/azure',
    children: [
      { title: 'Azure', path: '/azure/azure' },
      { title: 'Azure DataSource', path: '/azure/azure-data-source' },
    ],
  },
  {
    title: 'Diagnosis',
    icon: 'mdi-bug-check-outline',
    path: '/diagnosis',
    children: [
      { title: 'WPScan', path: '/diagnosis/wpscan' },
      { title: 'Portscan', path: '/diagnosis/portscan' },
      { title: 'Application Scan', path: '/diagnosis/applicationscan' },
    ],
  },
  {
    title: 'OSINT',
    icon: 'md:http',
    path: '/osint',
    children: [
      { title: 'OSINT', path: '/osint/osint' },
      { title: 'OSINT DataSource', path: '/osint/data-source' },
    ],
  },
  {
    title: 'Code',
    icon: 'mdi-github',
    path: '/code',
    children: [{ title: 'GitHub', path: '/code/github' }],
  },
  {
    title: 'Analysis',
    icon: 'mdi-file-chart',
    path: '/analysis',
    children: [
      { title: 'Report', path: '/report' },
      { title: 'AttackFlow', path: '/analysis/attack-flow' },
      { title: 'FindingSummary', path: '/analysis/finding' },
    ],
  },
  {
    title: 'IAM',
    icon: 'mdi-account-multiple',
    path: '/iam',
    children: [
      { title: 'User', path: '/iam/user' },
      { title: 'Role', path: '/iam/role' },
      { title: 'Policy', path: '/iam/policy' },
      { title: 'AccessToken', path: '/iam/access-token' },
      { title: 'User Reservation', path: '/iam/user-reservation' },
    ],
  },
  {
    title: 'Project',
    icon: 'mdi-alpha-p-box',
    path: '/project',
    children: [
      { title: 'ProjectSetting', path: '/project/setting' },
      { title: 'NewProject', path: '/project/new' },
    ],
  },
  {
    title: 'Organization',
    icon: 'mdi-account-group',
    path: '/organization',
    children: [
      { title: 'ProjectInvitation', path: '/organization/project' },
      { title: 'Organization Setting', path: '/organization/setting' },
      { title: 'New Organization', path: '/organization/new' },
      { title: 'OrganizationInvitation', path: '/organization/list' },
    ],
  },
  {
    title: 'Organization IAM',
    icon: 'mdi-account-multiple',
    path: '/organization-iam',
    children: [
      { title: 'User', path: '/organization-iam/user' },
      { title: 'Role', path: '/organization-iam/role' },
      { title: 'Policy', path: '/organization-iam/policy' },
      {
        title: 'AccessToken',
        path: '/organization-iam/organization-access-token',
      },
      { title: 'User Reservation', path: '/organization-iam/user-reservation' },
    ],
  },
  {
    title: 'Admin',
    icon: 'mdi-account-multiple',
    path: '/admin',
    hidden: true,
    hiddenInMenu: true,
    children: [
      { title: 'Menu', path: '/admin/menu', hiddenInMenu: true },
      { title: 'Role', path: '/admin/user', hiddenInMenu: true },
      { title: 'Report', path: '/admin/report', hiddenInMenu: true },
    ],
  },
  {
    title: 'Access Denied',
    path: '/403',
    hiddenInMenu: true,
  },
]

// External links
export const staticRoutes = getStaticRoutes()

function getStaticRoutes() {
  const routes = [{ title: 'Document', url: 'https://docs.security-hub.jp/' }]
  if (import.meta.env.VITE_STATIC_LINK == '') {
    return routes
  }
  try {
    const jsonRoutes = JSON.parse(import.meta.env.VITE_STATIC_LINK)
    return jsonRoutes
  } catch (e) {
    return routes
  }
}

// Helper function: Check if menu is visible for the given mode
export function isMenuVisibleForMode(title, mode) {
  if (!title) return false
  if (mode === MODE.ORGANIZATION) {
    return menuVisibility.organizationModeAllowed.includes(title)
  }
  return !menuVisibility.projectModeForbidden.includes(title)
}

// Helper function: Check if child menu is visible for the given mode
export function isChildMenuVisibleForMode(parentTitle, childTitle, mode) {
  if (!childTitle) return false
  if (mode !== MODE.ORGANIZATION) {
    return !childMenuVisibility.projectModeForbidden.includes(childTitle)
  }
  if (parentTitle === 'Finding') {
    return !childMenuVisibility.findingOrganizationModeForbidden.includes(
      childTitle
    )
  }
  return !childMenuVisibility.organizationModeForbidden.includes(childTitle)
}
