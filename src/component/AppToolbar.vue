<template>
  <v-app-bar color="primary" dark app>
    <v-app-bar-nav-icon @click="handleDrawerToggle" />
    <v-toolbar-items>
      <v-menu
        offset-y
        origin="center center"
        class="elelvation-1"
        transition="scale-transition"
      >
        <template v-slot:activator="{ on }">
          <v-btn text dark slot="activator" v-on="on" style="text-transform: none">
            <v-avatar color="purple darken-4" size="42">
              <span class="white--text headline">PJ</span>
            </v-avatar>
            <v-layout align-center justify-center
              class="text-h6 mx-4 font-weight-black"
              style="text-decoration: underline;"
            >
              {{ projectName }}
            </v-layout>
          </v-btn>
        </template>
        <project-list></project-list>
      </v-menu>
    </v-toolbar-items>
    <v-spacer />
    <v-toolbar-items>
      <v-btn icon @click="handleFullScreen()">
        <v-icon>fullscreen</v-icon>
      </v-btn>
      <v-menu offset-y origin="center center" transition="scale-transition">
        <template v-slot:activator="{ on }">
          <v-btn icon large text slot="activator" v-on="on">
            <v-avatar size="30px">
              <v-icon dark>mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list class="pa-0">
          <v-list-item
            v-for="(item, index) in profileMenus"
            :to="!item.href ? { name: item.name } : null"
            :href="item.href"
            @click="item.click"
            ripple="ripple"
            :disabled="item.disabled"
            :target="item.target"
            rel="noopener"
            :key="index"
          >
            <v-list-item-action v-if="item.icon">
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar-items>
    <v-toolbar tag="div" dense slot="extension" color="white" light>
      <v-icon>mdi-home</v-icon>
      <v-breadcrumbs :items="breadcrumbs" class="pa-3" />
      <v-spacer></v-spacer>
      <v-btn icon small color="black">
        <v-icon v-text="'mdi-arrow-left'" @click="handleGoBack" />
      </v-btn>
    </v-toolbar>
  </v-app-bar>
</template>
<script>
import ProjectList from '@/component/widget/list/Project'
import Util from '@/util'
import store from '@/store'
export default {
  name: 'AppToolbar',
  components: {
    ProjectList
  },
  data() {
    return {
      profileMenus: [
        {
          icon: 'settings',
          href: '#',
          title: 'Profile',
          click: this.handleSetting
        },
        {
          icon: 'mdi-logout',
          href: '#',
          title: 'Logout',
          click: this.handleLogut
        }
      ]
    }
  },
  computed: {
    toolbarColor() {
      return this.$vuetify.options.extra.mainNav
    },
    breadcrumbs() {
      const { matched } = this.$route
      return matched.map((route, index) => {
        const to =
          index === matched.length - 1
            ? this.$route.path
            : route.path || route.redirect
        return {
          text: route.meta.title,
          to: to,
          exact: true,
          disabled: false
        }
      })
    },
    projectName: () => {
      return store.state.project.name
    },
  },
  methods: {
    handleDrawerToggle() {
      this.$emit('side-icon-click')
    },
    handleFullScreen() {
      Util.toggleFullScreen()
    },
    handleLogut() {
      this.$router.push('/auth/signin')
    },
    handleSetting() {
      this.$router.push('/profile')
    },
    handleGoBack() {
      this.$router.go(-1)
    }
  },
  created() {}
}
</script>

<style lang="sass" scoped></style>
