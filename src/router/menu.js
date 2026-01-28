import { MODE } from '@/constants/mode'

const ALL_MODES = [MODE.PROJECT, MODE.ORGANIZATION]

// Category definitions for PROJECT mode grouping
const projectCategoryDefinitions = [
  {
    title: 'Data Source',
    icon: 'mdi-database-cog',
    children: ['AWS', 'Google', 'Azure', 'Diagnosis', 'OSINT', 'Code'],
  },
  {
    title: 'Setting',
    icon: 'mdi-cog-outline',
    children: ['IAM', 'Alert', 'Organization'],
  },
]

// Category definitions for ORGANIZATION mode grouping
const organizationCategoryDefinitions = [
  {
    title: 'Setting',
    icon: 'mdi-cog-outline',
    children: ['Organization', 'Organization IAM'],
  },
]

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
      {
        title: 'Analysis',
        modes: [MODE.PROJECT],
        children: [
          { title: 'Report', path: '/report' },
          { title: 'AttackFlow', path: '/analysis/attack-flow' },
          { title: 'FindingSummary', path: '/analysis/finding' },
        ],
      },
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
]

export function isMenuVisibleForMode(menu, mode) {
  if (!menu) return false
  const modes = menu.modes || ALL_MODES
  return modes.includes(mode)
}

function filterMenuForMode(mode) {
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

function buildCategorizedMenu(filteredMenus, categoryDefs, menuOrder) {
  const menuMap = new Map()
  filteredMenus.forEach((menu) => {
    if (menu.title) {
      menuMap.set(menu.title, menu)
    }
  })

  const usedTitles = new Set()
  const orderedMenus = []

  const addMenuIfExists = (title) => {
    const menu = menuMap.get(title)
    if (menu) {
      usedTitles.add(title)
      orderedMenus.push(menu)
    }
  }

  const addCategoryIfExists = (definitionTitle) => {
    const definition = categoryDefs.find((d) => d.title === definitionTitle)
    if (!definition) return

    const children = definition.children
      .map((title) => {
        const menu = menuMap.get(title)
        if (menu) {
          usedTitles.add(title)
          return menu
        }
        return null
      })
      .filter((menu) => !!menu)

    if (children.length > 0) {
      orderedMenus.push({
        title: definition.title,
        icon: definition.icon,
        children,
      })
    }
  }

  // Apply menu order
  menuOrder.forEach((item) => {
    if (item.type === 'category') {
      addCategoryIfExists(item.title)
    } else {
      addMenuIfExists(item.title)
    }
  })

  // Add any remaining menus not in the defined order
  filteredMenus.forEach((menu) => {
    if (!usedTitles.has(menu.title)) {
      orderedMenus.push(menu)
    }
  })

  return orderedMenus
}

// Menu order definitions
const projectMenuOrder = [
  { title: 'Dashboard' },
  { title: 'Finding' },
  { title: 'Setting', type: 'category' },
  { title: 'Data Source', type: 'category' },
]

const organizationMenuOrder = [
  { title: 'Finding' },
  { title: 'Setting', type: 'category' },
]

export function getMenuForMode(mode) {
  const filteredMenus = filterMenuForMode(mode)

  if (mode === MODE.ORGANIZATION) {
    return buildCategorizedMenu(
      filteredMenus,
      organizationCategoryDefinitions,
      organizationMenuOrder
    )
  }

  return buildCategorizedMenu(
    filteredMenus,
    projectCategoryDefinitions,
    projectMenuOrder
  )
}
