<template>
  <v-app id="inspire" class="app dashboard">
    <app-drawer class="app--drawer" :show-drawer="showDrawer" />
    <app-toolbar class="app--toolbar" @side-icon-click="handleDrawerVisiable" />
    <v-main>
      <!-- Page Header -->
      <div class="page-wrapper"><router-view /></div>
      <!-- App Footer -->
      <v-footer height="auto" class="pa-3 app--footer">
        <span>RISKEN @ {{ new Date().getFullYear() }}</span>
        <v-spacer />
        <v-icon color="pink" small>favorite</v-icon>
      </v-footer>
    </v-main>
    <!-- Go to top -->
    <app-fab />
  </v-app>
</template>

<script>
import AppDrawer from '@/component/AppDrawer'
import AppToolbar from '@/component/AppToolbar'
import AppFab from '@/component/AppFab'
export default {
  name: 'LayoutDefault',
  components: {
    AppDrawer,
    AppToolbar,
    AppFab
  },
  data() {
    return {
      showDrawer: true
    }
  },
  methods: {
    handleDrawerVisiable() {
      this.showDrawer = !this.showDrawer
    }
  },
  created() {}
}
</script>

<style lang="sass" scoped>
.page-wrapper
  min-height: calc(100vh - 112px - 48px)
</style>
