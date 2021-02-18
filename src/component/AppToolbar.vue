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
          <!-- Project -->
          <v-btn
            text dark
            slot="activator"
            v-on="on"
            class="pa-0 ml-4"
            style="text-transform: none"
            @click="handleSearchProject"
          >
            <v-card color="primary" elevation="0">
              <v-card-title>
                <v-avatar tile color="primary darken-2" size="42">
                  <span class="whie--text text-h6 font-weight-black">PJ</span>
                </v-avatar>
                <v-layout align-center justify-center
                  class="text-h5 ml-4 font-weight-black"
                  style="text-decoration: underline;"
                >
                  {{ projectName }}
                </v-layout>
              </v-card-title>
            </v-card>
          </v-btn>
        </template>
        <!-- <project-list></project-list> -->
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

    <!-- Project dialog -->
    <v-dialog max-width="60%" v-model="projectDialog" @click:outside="projectDialog = false">
      <v-card>
        <v-card-title>
          <span class="mx-2"> Project </span>
          <v-text-field
            outlined clearable dense
            prepend-icon="mdi-magnify"
            placeholder="Type something..."
            v-model="projectTable.search"
            hide-details
            class="hidden-sm-and-down"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-0">
          <v-data-table
            :search="projectTable.search"
            :headers="projectTable.headers"
            :items="projectTable.item"
            :options.sync="projectTable.options"
            :loading="loading"
            :footer-props="projectTable.footer"
            locale="ja-jp"
            loading-text="Loading..."
            no-data-text="No data."
            class="elevation-1"
            item-key="project_id"
            @click:row="handleProjectClick"
          >
            <template v-slot:[`item.updated_at`]="{ item }">
              <v-chip>{{ item.updated_at | formatTime }}</v-chip>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text outlined color="grey darken-1" @click="projectDialog = false">
            CANCEL
          </v-btn>
          <v-btn text outlined color="green darken-1" @click="$router.push('/project/new/'); projectDialog = false">
            CREATE NEW PROJECT
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <bottom-snack-bar ref="snackbar" />
  </v-app-bar>
</template>
<script>
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
import Util from '@/util'
import store from '@/store'
import mixin from '@/mixin'
export default {
  name: 'AppToolbar',
  components: {
    // ProjectList,
    BottomSnackBar,
  },
  mixins: [mixin],
  data() {
    return {
      loading: false,
      projectDialog:false,
      projectTable: {
        search: '',
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: true, value: 'project_id' },
          { text: 'Name', align: 'start', sortable: true, value: 'name' },
          { text: 'Updated', align: 'center', sortable: true, value: 'updated_at' },
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['project_id'] },
        footer: {
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        item: [],
      },

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
          title: 'Signout',
          click: this.handleLogut
        },
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
  filters: {
    formatTime: (unix) => {
      return Util.formatDate(new Date(unix * 1000), 'yyyy/MM/dd HH:mm')
    },
  },
  methods: {
    async listProject() {
      this.clearProjectList()
      if ( !store.state.user || !store.state.user.user_id ) {
        this.$refs.snackbar.notifyError( 'Error: Try again after signin.' )
        return
      }
      const admin = await this.$axios.get('/iam/is-admin/?user_id=' + store.state.user.user_id ).catch((err) =>  {
        return Promise.reject(err)
      })
      let listUserID = store.state.user.user_id
      if (admin.data.data.ok) {
        listUserID = ''
      }
      const res = await this.$axios.get('/project/list-project/?user_id=' + listUserID ).catch((err) =>  {
        return Promise.reject(err)
      })
      this.loading = false
      this.projectTable.item = res.data.data.project
    },
    clearProjectList() {
      this.projectTable.item = []
    },

    // handler
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
      this.$router.push('/iam/profile')
    },
    handleGoBack() {
      this.$router.go(-1)
    },
    handleProjectClick(project)  {
      this.clearProjectParam()
      store.commit('updateProject', project)
      this.reload()
    },
    handleNewProject() {
      this.$router.push('/project/new')
    },
    handleSearchProject() {
      this.loading = true
      this.projectDialog = true
      this.listProject()
    },
    clearProjectParam() {
      let query = Object.assign({}, this.$router.query)
      delete query["project_id"]
      this.$router.push({query: query})
    },
  },
  created() {}
}
</script>

<style lang="sass" scoped></style>
