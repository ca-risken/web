<template>
  <v-app id="inspire" class="app dashboard">
    <app-drawer class="app--drawer" :show-drawer="showDrawer" />
    <app-toolbar class="app--toolbar" @side-icon-click="handleDrawerVisiable" />
    <v-main>
      <!-- Page Header -->
      <v-card height="100%" color="background" class="page-wrapper">
        <router-view />
      </v-card>
    </v-main>
    <!-- App Footer -->
    <v-footer
      height="auto"
      class="pa-3 app--footer"
      dark
      color="primary lighten-1"
    >
      <v-spacer />
      <div class="mt-3">
        <v-icon class="mr-2" color="grey lighten-2">mdi-magnify</v-icon>
        <span class="mr-4 font-weight-bold"
          >RISKEN @ {{ new Date().getFullYear() }}</span
        >
      </div>
    </v-footer>

    <!-- Go to top -->
    <app-fab />
  </v-app>
</template>

<script>
import AppDrawer from '@/component/AppDrawer.vue'
import AppToolbar from '@/component/AppToolbar.vue'
import AppFab from '@/component/AppFab.vue'
export default {
  name: 'LayoutDefault',
  components: {
    AppDrawer,
    AppToolbar,
    AppFab,
  },
  data() {
    return {
      showDrawer: true,
    }
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
