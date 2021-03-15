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
                <v-avatar tile size="42">
                  <v-icon x-large>mdi-alpha-p-box</v-icon>
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
      </v-menu>
    </v-toolbar-items>
    <v-spacer />
    <v-toolbar-items>
      <v-btn icon @click="handleFullScreen()">
        <v-icon>fullscreen</v-icon>
      </v-btn>
      <v-menu
        offset-y
        origin="center center"
        class="elelvation-1"
        transition="scale-transition"
      >
        <template v-slot:activator="{ on }">
          <v-btn text slot="activator" v-on="on">
            <v-icon medium>mdi-web</v-icon>
            <span class="ml-2"> {{ getLocaleText($i18n.locale) }} </span>
          </v-btn>
        </template>
        <v-list>
          <v-list-item-group v-model="$i18n.locale">
            <v-list-item
              @click="handleChangeLocale(item)"
              v-for="item in availableLanguages"
              :key="item.value"
              :value="item.value"
            >
              <v-list-item-title v-text="item.text" />
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
      <v-menu offset-y origin="center center" transition="scale-transition">
        <template v-slot:activator="{ on }">
          <v-btn icon large text slot="activator" v-on="on">
            <v-avatar size="30px">
              <v-icon dark>settings</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list class="pa-0">
          <v-list-item
            v-for="(item, index) in myMenus"
            :to="!item.href ? { name: item.name } : null"
            :href="item.href"
            @click="item.click"
            ripple="ripple"
            :disabled="item.disabled"
            :target="item.target"
            rel="noopener"
            :key="index"
          >
            <v-list-item-action v-if="item.icon"  class="mr-4">
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
    <v-dialog max-width="64%" v-model="projectDialog" @click:outside="projectDialog = false">
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
            :headers="headers"
            :items="projectTable.item"
            :options.sync="projectTable.options"
            :loading="loading"
            :footer-props="projectTable.footer"
            locale="ja-jp"
            loading-text="Loading..."
            no-data-text="No data."
            class="elevation-1"
            item-key="project_id"
            :custom-filter="customFilter"
            @click:row="handleProjectClick"
          >
            <template v-slot:[`item.tag`]="{ item }">
              <v-chip
                v-for="t in item.tag"
                :key="t.tag"
                :color="t.color"
                class="ma-1"
                dark link
              >
                {{ t.tag }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn text outlined color="blue darken-1" @click="$router.push('/project/setting/'); projectDialog = false">
            {{ $t(`btn['EDIT PROJECT']`) }}
          </v-btn>
          <v-spacer />
          <v-btn text outlined color="grey darken-1" @click="projectDialog = false">
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn text outlined color="green darken-1" @click="$router.push('/project/new/'); projectDialog = false">
            {{ $t(`btn['CREATE NEW PROJECT']`) }}
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
import project from '@/mixin/api/project'
export default {
  name: 'AppToolbar',
  components: {
    // ProjectList,
    BottomSnackBar,
  },
  mixins: [mixin, project],
  data() {
    return {
      loading: false,
      projectDialog:false,
      projectTable: {
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['project_id'] },
        footer: {
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        item: [],
      },
      availableLanguages: [
        {text: "English", value : "en"},
        {text: "日本語",   value : "ja"},
      ],

      myMenus: [
        {
          icon: 'mdi-account-circle',
          href: '#',
          title: 'Account',
          click: this.handleAccountSetting,
        },
        {
          icon: 'mdi-alpha-p-box',
          href: '#',
          title: 'My Project',
          click: this.handleProjectSetting,
        },
        {
          icon: 'mdi-logout',
          href: '#',
          title: 'Signout',
          click: this.handleLogut,
        },
      ]
    }
  },
  computed: {
    headers() {
      return [
        { text: this.$i18n.t('item["ID"]'),   align: 'start',  width: '5%',  sortable: true, value: 'project_id' },
        { text: this.$i18n.t('item["Name"]'), align: 'start',  width: '25%', sortable: true, value: 'name' },
        { text: this.$i18n.t('item["Tag"]'),  align: 'start', width: '70%',  sortable: true, value: 'tag' },
      ]
    },
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
    customFilter (value, search) {
      return value != null &&
        search != null &&
        typeof value !== 'boolean' &&
        (typeof value === 'object' ? value.map(v => v.tag).join(',') : value)
          .toString().toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) !== -1;
    },
    async listProject() {
      this.clearProjectList()
      if ( !store.state.user || !store.state.user.user_id ) {
        this.$refs.snackbar.notifyError( 'Error: Try again after signin.' )
        return
      }
      const admin = await this.$axios.get('/iam/is-admin/?user_id=' + store.state.user.user_id ).catch((err) =>  {
        return Promise.reject(err)
      })
      let listProjectParam = '?user_id=' + store.state.user.user_id
      if (admin.data.data.ok) {
        listProjectParam = ''
      }
      this.projectTable.item = await this.listProjectAPI(listProjectParam).catch((err) =>  {
        return Promise.reject(err)
      })
      this.loading = false
    },
    clearProjectList() {
      this.projectTable.item = []
    },

    getLocaleText(locale) {
      if (typeof locale !== 'string' || locale ===  '') return '?'
      switch (locale.toLowerCase()) {
        case 'en':
          return 'English'
        case 'ja':
          return '日本語'
        default:
          return '?'
      }
    },

    // handler
    handleDrawerToggle() {
      this.$emit('side-icon-click')
    },
    handleFullScreen() {
      Util.toggleFullScreen()
    },
    handleChangeLocale(item) {
      const locale = {
        lang: item.value,
        text: item.text,
      }
      this.$i18n.locale = item.value
      store.commit('updateLocale', locale)
    },
    handleLogut() {
      this.$router.push('/auth/signin/')
    },
    handleAccountSetting() {
      this.$router.push('/iam/profile/')
    },
    handleProjectSetting() {
      this.$router.push('/project/setting/')
    },
    handleGoBack() {
      this.$router.go(-1)
    },
    handleProjectClick(project)  {
      this.clearProjectQueryParam()
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
    clearProjectQueryParam() {
      let query = Object.assign({}, this.$router.query)
      delete query["project_id"]
      this.$router.query = query
    },
  },
}
</script>

<style lang="sass" scoped></style>
