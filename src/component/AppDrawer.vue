<template>
  <v-navigation-drawer
    class="app--drawer"
    v-model="drawer"
    v-model:mini-variant="mini"
    :width="drawerWidth"
  >
    <v-toolbar :color="drawerToolbarColor">
      <div
        class="d-flex align-center justify-start"
        height="64"
        @click="toTop"
        style="cursor: pointer; width: 100%"
      >
        <v-img
          :src="computeLogo"
          alt="RISKEN"
          class="ma-2"
          style="max-width: 20%"
        />
        <v-toolbar-title class="ml-2 pl-0">
          <span class="font-weight-bold text-h5">RISKEN</span>
        </v-toolbar-title>
      </div>
    </v-toolbar>
    <v-list class="pa-0" nav>
      <template v-for="(item, key) in computeMenu" :key="`menu-${key}`">
        <template v-if="hasChildren(item)">
          <v-list-group
            :model-value="true"
            :prepend-icon="item.meta?.icon"
            v-show="!item.hidden"
          >
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                :title="getMenuTitle(item, 'menu')"
                :prepend-icon="item.meta?.icon"
              ></v-list-item>
            </template>
            <template
              v-for="(sub, subIndex) in item.children"
              :key="`sub-${key}-${subIndex}`"
            >
              <template v-if="hasChildren(sub)">
                <v-list-group
                  :model-value="true"
                  :prepend-icon="sub.meta?.icon"
                  v-show="!sub.meta?.hiddenInMenu"
                >
                  <template #activator="{ props: subProps }">
                    <v-list-item
                      v-bind="subProps"
                      :title="getMenuTitle(sub, 'menu')"
                      :prepend-icon="sub.meta?.icon"
                    ></v-list-item>
                  </template>
                  <v-list-item
                    v-for="leaf in sub.children"
                    :key="leaf.name || leaf.meta?.title"
                    :to="leaf.path"
                    v-show="!leaf.meta?.hiddenInMenu"
                    :prepend-icon="leaf.meta?.icon"
                    :title="getMenuTitle(leaf, 'submenu')"
                  ></v-list-item>
                </v-list-group>
              </template>
              <v-list-item
                v-else
                :key="sub.name || sub.meta?.title"
                :to="sub.path"
                v-show="!sub.meta?.hiddenInMenu"
                :prepend-icon="sub.meta?.icon"
                :title="getMenuTitle(sub, 'submenu')"
              ></v-list-item>
            </template>
          </v-list-group>
        </template>
        <template v-else>
          <v-list-item
            :key="item.name || item.meta?.title"
            :to="item.path"
            v-show="!item.meta?.hiddenInMenu"
            :prepend-icon="item.meta?.icon"
            :title="getMenuTitle(item, 'menu')"
          >
          </v-list-item>
        </template>
      </template>
      <v-list-group
        prepend-icon="mdi-open-in-new"
        v-if="staticRoutes.length > 0"
      >
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props">
            <v-list-item-title>
              {{ $t(`item['Link']`) }}
            </v-list-item-title>
          </v-list-item>
        </template>
        <v-list-item
          v-for="(item, key) in staticRoutes"
          :key="`static-${key}`"
          :href="item.url"
          target="_blank"
          rel="noopener"
          :risken-action-name="`click-link-${item.title}-from-menu-bar`"
          :title="item.title"
        >
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
import { appRoute as routes, staticRoutes } from '@/router/config'
import store from '@/store'
import { MODE } from '@/constants/mode'

export default {
  name: 'AppDrawer',
  components: {},
  props: {
    expanded: {
      type: Boolean,
      default: true,
    },
    showDrawer: Boolean,
  },
  data() {
    return {
      mini: false,
      drawerWidth: 263,
      drawer: true,
      scrollSettings: {
        maxScrollbarLength: 160,
      },
      staticRoutes: staticRoutes,
    }
  },
  computed: {
    computeLogo() {
      return '/static/m.png'
    },
    currentMode() {
      return store.state.mode
    },
    isOrganizationMode() {
      return this.currentMode === MODE.ORGANIZATION
    },
    drawerToolbarColor() {
      return this.isOrganizationMode ? 'light-blue' : 'primary'
    },
    computeMenu() {
      const allMenus = routes[0].children || []
      const visibleMenus = allMenus
        .filter((menu) => !menu.hidden)
        .filter((menu) => this.isMenuVisible(menu.meta?.title))
        .map((menu) => this.buildVisibleMenuTree(menu))

      if (this.isOrganizationMode) {
        return visibleMenus
      }

      const menuMap = new Map()
      visibleMenus.forEach((menu) => {
        if (menu.meta?.title) {
          menuMap.set(menu.meta.title, menu)
        }
      })

      const usedTitles = new Set()
      const orderedMenus = []
      const addMenuIfExists = (title) => {
        if (!title) return
        const menu = menuMap.get(title)
        if (menu) {
          usedTitles.add(title)
          orderedMenus.push(menu)
        }
      }

      addMenuIfExists('Dashboard')
      addMenuIfExists('Finding')

      const categoryDefinitions = [
        {
          title: 'Data Source',
          icon: 'mdi-database-cog',
          children: ['AWS', 'Google', 'Azure', 'Diagnosis', 'OSINT', 'Code'],
        },
        {
          title: 'Setting',
          icon: 'mdi-cog-outline',
          children: ['IAM', 'Project', 'Alert'],
        },
        {
          title: 'Operation',
          icon: 'mdi-briefcase-check-outline',
          children: ['Analysis', 'Organization', 'Organization IAM'],
        },
      ]

      categoryDefinitions.forEach((definition) => {
        const category = this.buildCategory(definition, menuMap, usedTitles)
        if (category) {
          orderedMenus.push(category)
        }
      })

      visibleMenus.forEach((menu) => {
        if (!usedTitles.has(menu.meta?.title)) {
          orderedMenus.push(menu)
        }
      })

      return orderedMenus
    },
  },
  watch: {
    showDrawer: {
      handler(val) {
        this.drawer = val
      },
      immediate: true,
    },
  },
  methods: {
    getMenuTitle(item, dictionary = 'menu') {
      const titleKey = item?.meta?.title
      if (!titleKey) {
        return ''
      }
      const locale = this.$i18n?.locale
      const messages = this.$i18n?.messages?.[locale]?.[dictionary]
      if (messages && messages[titleKey]) {
        return messages[titleKey]
      }
      return titleKey
    },
    hasChildren(item) {
      return Array.isArray(item?.children) && item.children.length > 0
    },
    buildVisibleMenuTree(menu) {
      if (!menu) return null
      const cloned = { ...menu }
      delete cloned.children
      if (menu.children && menu.children.length > 0) {
        const children = menu.children
          .filter((child) => !child.meta?.hiddenInMenu)
          .filter((child) =>
            this.isChildMenuVisible(menu.meta?.title, child.meta?.title)
          )
          .map((child) => this.buildVisibleMenuTree(child))
        if (children.length > 0) {
          cloned.children = children
        }
      }
      return cloned
    },
    isMenuVisible(title) {
      if (!title) {
        return false
      }
      if (this.isOrganizationMode) {
        const allowedMenuTitles = [
          'Finding',
          'Organization',
          'Organization IAM',
          'User Reservation',
        ]
        return allowedMenuTitles.includes(title)
      }
      const forbiddenMenuTitles = ['Organization IAM']
      return !forbiddenMenuTitles.includes(title)
    },
    isChildMenuVisible(parentTitle, childTitle) {
      if (!childTitle) {
        return false
      }
      if (!this.isOrganizationMode) {
        const projectModeForbiddenTitles = [
          'New Organization',
          'Organization Setting',
          'ProjectInvitation',
        ]
        return !projectModeForbiddenTitles.includes(childTitle)
      }
      if (parentTitle === 'Finding') {
        const findingForbiddenTitles = ['Resource', 'Setting']
        return !findingForbiddenTitles.includes(childTitle)
      }
      const organizationModeForbiddenTitles = ['OrganizationInvitation']
      return !organizationModeForbiddenTitles.includes(childTitle)
    },
    buildCategory(definition, menuMap, usedTitles) {
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
      if (!children.length) {
        return null
      }
      return {
        meta: {
          title: definition.title,
          icon: definition.icon,
        },
        children,
      }
    },
    handleDrawerCollapse() {
      this.drawerWidth = this.drawerWidth === 256 ? 64 : 256
    },
    toTop() {
      this.$router.push('/')
    },
  },
}
</script>

<style lang="sass" scoped>
.app--drawer
  overflow: hidden !important
  .drawer-menu--scroll
    overflow: auto
</style>
