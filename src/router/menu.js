// Menu configuration separated from router
import { MODE } from '@/constants/mode'

// All modes for convenience
const ALL_MODES = [MODE.PROJECT, MODE.ORGANIZATION]

// Menu structure definition with mode visibility
// - modes: array of modes where menu is visible (default: all modes)
// - hiddenInMenu: if true, never shown in menu
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
    modes: [MODE.PROJECT],
  },
  {
    title: 'Finding',
    icon: 'mdi-file-find-outline',
    path: '/finding',
    children: [
      { title: 'Resource', path: '/finding/resource', modes: [MODE.PROJECT] },
      { title: 'Finding', path: '/finding/finding' },
      { title: 'Setting', path: '/finding/setting', modes: [MODE.PROJECT] },
    ],
  },
  {
    title: 'Alert',
    icon: 'mdi-alert',
    path: '/alert',
    modes: [MODE.PROJECT],
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
    modes: [MODE.PROJECT],
    children: [
      { title: 'AWS', path: '/aws/aws' },
      { title: 'AWS DataSource', path: '/aws/data-source' },
    ],
  },
  {
    title: 'Google',
    icon: 'mdi-google',
    path: '/google',
    modes: [MODE.PROJECT],
    children: [
      { title: 'GCP', path: '/google/gcp' },
      { title: 'GCP DataSource', path: '/google/gcp-data-source' },
    ],
  },
  {
    title: 'Azure',
    icon: 'mdi-microsoft-azure',
    path: '/azure',
    modes: [MODE.PROJECT],
    children: [
      { title: 'Azure', path: '/azure/azure' },
      { title: 'Azure DataSource', path: '/azure/azure-data-source' },
    ],
  },
  {
    title: 'Diagnosis',
    icon: 'mdi-bug-check-outline',
    path: '/diagnosis',
    modes: [MODE.PROJECT],
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
    modes: [MODE.PROJECT],
    children: [
      { title: 'OSINT', path: '/osint/osint' },
      { title: 'OSINT DataSource', path: '/osint/data-source' },
    ],
  },
  {
    title: 'Code',
    icon: 'mdi-github',
    path: '/code',
    modes: [MODE.PROJECT],
    children: [{ title: 'GitHub', path: '/code/github' }],
  },
  {
    title: 'Analysis',
    icon: 'mdi-file-chart',
    path: '/analysis',
    modes: [MODE.PROJECT],
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
    modes: [MODE.PROJECT],
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
    modes: [MODE.PROJECT],
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
      {
        title: 'ProjectInvitation',
        path: '/organization/project',
        modes: [MODE.ORGANIZATION],
      },
      {
        title: 'Organization Setting',
        path: '/organization/setting',
        modes: [MODE.ORGANIZATION],
      },
      {
        title: 'New Organization',
        path: '/organization/new',
        modes: [MODE.ORGANIZATION],
      },
      {
        title: 'OrganizationInvitation',
        path: '/organization/list',
        modes: [MODE.PROJECT],
      },
    ],
  },
  {
    title: 'Organization IAM',
    icon: 'mdi-account-multiple',
    path: '/organization-iam',
    modes: [MODE.ORGANIZATION],
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
export function isMenuVisibleForMode(menu, mode) {
  if (!menu) return false
  if (menu.hiddenInMenu) return false
  const modes = menu.modes || ALL_MODES
  return modes.includes(mode)
}

// Helper function: Filter menu items by mode
export function getMenuForMode(mode) {
  return menuDefinition
    .filter((menu) => isMenuVisibleForMode(menu, mode))
    .map((menu) => {
      if (menu.children && menu.children.length > 0) {
        const cloned = { ...menu }
        cloned.children = menu.children.filter((child) =>
          isMenuVisibleForMode(child, mode)
        )
        return cloned
      }
      return menu
    })
}
