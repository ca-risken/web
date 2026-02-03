import { MODE } from '@/constants/mode'

const ALL_MODES = [MODE.PROJECT, MODE.ORGANIZATION]

export const menuDefinition = [
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
      { title: 'Finding', path: '/finding/finding' },
      { title: 'Resource', path: '/finding/resource', modes: [MODE.PROJECT] },
      { title: 'Setting', path: '/finding/setting', modes: [MODE.PROJECT] },
    ],
  },
  {
    title: 'Setting',
    icon: 'mdi-cog-outline',
    children: [
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
          {
            title: 'User Reservation',
            path: '/organization-iam/user-reservation',
          },
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
            title: 'OrganizationInvitation',
            path: '/organization/list',
            modes: [MODE.PROJECT],
          },
        ],
      },
    ],
  },
  {
    title: 'Data Source',
    icon: 'mdi-database-cog',
    modes: [MODE.PROJECT],
    children: [
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
    ],
  },
  {
    title: 'Analysis',
    icon: 'mdi-file-chart',
    modes: [MODE.PROJECT],
    children: [
      { title: 'Report', path: '/report' },
      { title: 'AttackFlow', path: '/analysis/attack-flow' },
      { title: 'FindingSummary', path: '/analysis/finding' },
    ],
  },
]

export function isMenuVisibleForMode(menu, mode) {
  if (!menu) return false
  const modes = menu.modes || ALL_MODES
  return modes.includes(mode)
}

export function getMenuForMode(mode, menus = menuDefinition) {
  return menus
    .filter((menu) => isMenuVisibleForMode(menu, mode))
    .map((menu) => {
      if (menu.children && menu.children.length > 0) {
        const filteredChildren = getMenuForMode(mode, menu.children)
        if (!menu.path && filteredChildren.length === 0) {
          return null
        }
        return { ...menu, children: filteredChildren }
      }
      return menu
    })
    .filter((menu) => menu !== null)
}
