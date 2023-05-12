<template>
  <v-app id="inspire" class="app">
    <app-drawer class="app--drawer" :show-drawer="showDrawer" />
    <app-toolbar class="app--toolbar" @side-icon-click="handleDrawerVisiable" />
    <v-main :style="styles">
      <!-- Page Header -->
      <v-card height="100%" color="background" class="page-wrapper">
        <router-view />
        <!-- <app-fab /> -->
      </v-card>
    </v-main>
    <!-- App Footer -->
    <v-footer height="auto" class="pa-3 app--footer" color="primary-lighten-1">
      <v-spacer />
      <div class="mt-3">
        <v-icon class="mr-2" color="grey-lighten-2">mdi-magnify</v-icon>
        <span class="mr-4 font-weight-bold"
          >RISKEN @ {{ new Date().getFullYear() }}</span
        >
      </div>
    </v-footer>

    <!-- Go to top -->
  </v-app>
</template>

<script>
import AppDrawer from '@/component/AppDrawer.vue'
import AppToolbar from '@/component/AppToolbar.vue'
export default {
  name: 'LayoutDefault',
  components: {
    AppDrawer,
    AppToolbar,
  },
  data() {
    return {
      showDrawer: true,
    }
  },
  computed: {
    styles() {
      return {
        '--v-layout-bottom': '0px',
      }
    },
  },
  methods: {
    handleDrawerVisiable() {
      this.showDrawer = !this.showDrawer
    },
  },
  created() {},
}
</script>

<style lang="sass" scoped>
.page-wrapper
  min-height: calc(100vh - 112px - 48px)
</style>
