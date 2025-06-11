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
    <v-list class="pa-0">
      <template v-for="(item, key) in computeMenu">
        <template v-if="item.children && item.children.length > 0">
          <v-list-group
            :model-value="item.meta.title"
            :prepend-icon="item.meta.icon"
            :key="key"
            v-show="!item.hidden && isMenuItemVisible(item)"
          >
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :title="$t(`menu['` + item.meta.title + `']`)"
                :prepend-icon="item.meta.icon"
              ></v-list-item>
            </template>
            <v-list-item
              v-for="sub in item.children"
              :key="sub.name"
              :to="sub.path"
              :title="$t(`submenu['` + sub.meta.title + `']`)"
              :prepend-icon="sub.meta.icon"
              v-show="!sub.meta.hiddenInMenu"
            ></v-list-item>
          </v-list-group>
        </template>
        <template v-else>
          <v-list-item
            :key="key"
            :to="item.path"
            v-show="!item.meta.hiddenInMenu && isMenuItemVisible(item)"
            :prepend-icon="item.meta.icon"
            :title="$t(`menu['` + item.meta.title + `']`)"
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
      drawerWidth: 260,
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
      return this.currentMode === 'organization'
    },
    computeMenu() {
      const allMenus = routes[0].children

      // Organization Modeの場合、特定のメニューのみ表示
      if (this.isOrganizationMode) {
        const allowedMenuTitles = ['Dashboard', 'IAM', 'Organization']
        return allMenus.filter((menu) =>
          allowedMenuTitles.includes(menu.meta.title)
        )
      }

      // Project Modeの場合、Organizationメニューを除外
      return allMenus.filter((menu) => menu.meta.title !== 'Organization')
    },
    drawerToolbarColor() {
      try {
        // Organization Modeの場合は補色を使用（彩度を抑えた色）
        if (this.isOrganizationMode) {
          return 'brown'
        }
        return 'primary'
      } catch (error) {
        console.error('Error in drawerToolbarColor:', error)
        return 'primary'
      }
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
    handleDrawerCollapse() {
      this.drawerWidth = this.drawerWidth === 256 ? 64 : 256
    },
    toTop() {
      this.$router.push('/')
    },
    isMenuItemVisible(item) {
      // Organization Modeの場合、特定のメニューのみ表示
      if (this.isOrganizationMode) {
        const allowedMenuTitles = ['Dashboard', 'IAM', 'Organization']
        return allowedMenuTitles.includes(item.meta.title)
      }

      // Project Modeの場合、Organizationメニューを除外
      return item.meta.title !== 'Organization'
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
