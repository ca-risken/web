<template>
  <v-app-bar
    v-bind="$attrs"
    color="primary-darken-2"
    extension-height="48"
    extended
  >
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="handleDrawerToggle" />
    </template>
    <v-app-bar-title>
      <v-menu
        location="bottom"
        class="elevation-1"
        transition="scale-transition"
      >
        <template v-slot:activator="{ props }">
          <!-- Project -->
          <v-btn
            v-bind="props"
            variant="text"
            class="pa-0 ml-4"
            style="text-transform: none"
            height="42"
            @click="handleSearchProject"
          >
            <v-icon size="42">mdi-alpha-p-box</v-icon>
            <span class="text-h5 mx-4 font-weight-black">
              {{ projectName }}
            </span>
          </v-btn>
        </template>
      </v-menu>
    </v-app-bar-title>
    <v-spacer />
    <v-btn icon @click="handleFullScreen()">
      <v-icon icon="mdi-fullscreen" size="x-large" />
    </v-btn>
    <v-menu location="bottom" class="elevation-1" transition="scale-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" variant="text">
          <v-icon size="x-large" icon="mdi-web" />
          <span class="ml-2"> {{ getLocaleText($i18n.locale) }} </span>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          @click="handleChangeLocale(item)"
          v-for="item in availableLanguages"
          :key="item.value"
          v-model:value="item.value"
        >
          <v-list-item-title>
            {{ item.text }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu location="bottom" class="elevation-1" transition="scale-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" variant="text">
          <v-icon icon="mdi-open-in-new" size="x-large"></v-icon>
          <span class="ml-2"> {{ $t(`item['Link']`) }} </span>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, key) in staticRoutes"
          :key="`static-${key}`"
          :href="item.url"
          rel="noopener"
          target="_blank"
          :risken-action-name="`click-link-${item.title}-from-header`"
          :title="item.title"
          prepend-icon="mdi-open-in-new"
        />
      </v-list>
    </v-menu>
    <v-menu location="bottom" transition="scale-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props">
          <v-icon icon="mdi-cog" size="x-large" />
        </v-btn>
      </template>
      <v-list class="pa-1 my-1">
        <v-list-item
          v-for="(item, index) in myMenu"
          :to="!item.href ? { name: item.name } : null"
          @click="item.click"
          :disabled="item.disabled"
          :target="item.target"
          :key="index"
          :model-value="index"
          :title="item.title"
          :prepend-icon="item.icon"
        />
      </v-list>
    </v-menu>
    <template v-slot:extension>
      <v-card width="95%" class="mx-auto" flat>
        <v-toolbar dense color="white" light class="mx-5">
          <v-icon>mdi-home</v-icon>
          <v-breadcrumbs :items="breadcrumbs" class="pa-3" />
          <v-spacer></v-spacer>
          <v-btn icon size="small" color="black">
            <v-icon @click="handleGoBack">
              {{ 'mdi-arrow-left' }}
            </v-icon>
          </v-btn>
        </v-toolbar>
      </v-card>
    </template>
  </v-app-bar>

  <!-- Project dialog -->
  <v-dialog
    max-width="64%"
    v-model="projectDialog"
    @click:outside="projectDialog = false"
  >
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="auto">
            <span class="mx-2"> Project </span>
          </v-col>
          <v-col>
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              prepend-icon="mdi-magnify"
              placeholder="Type something..."
              v-model="projectTable.search"
              hide-details
              class="hidden-sm-and-down"
            />
          </v-col>
        </v-row>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-0">
        <v-data-table
          :search="projectTable.search"
          :headers="headers"
          :items="projectTable.item"
          item-key="project_id"
          :items-per-page="projectTable.options.itemsPerPage"
          :page="projectTable.options.page"
          :loading="loading"
          :items-per-page-options="projectTable.footer.itemsPerPageOptions"
          :show-current-page="projectTable.footer.showCurrentPage"
          locale="ja-jp"
          loading-text="Loading..."
          no-data-text="No data."
          class="elevation-1"
          hide-default-footer
          :custom-filter="customFilter"
          @click:row="handleProjectClick"
        >
          <template v-slot:[`item.tag`]="{ item }">
            <v-chip
              v-for="t in item.value.tag"
              :key="t.tag"
              :color="t.color"
              variant="flat"
              class="ma-1 text-white"
              link
            >
              {{ t.tag }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="outlined"
          color="info"
          v-if="currentProjectID"
          @click="handleSettingProject"
        >
          {{ $t(`btn['EDIT PROJECT']`) }}
        </v-btn>
        <v-spacer />
        <v-btn
          variant="outlined"
          color="grey-en-1"
          @click="projectDialog = false"
        >
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
        <v-btn variant="outlined" color="success" @click="handleNewProject">
          {{ $t(`btn['CREATE NEW PROJECT']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <bottom-snack-bar ref="snackbar" />
</template>
<script>
import { staticRoutes } from '@/router/config'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import Util from '@/util'
import store from '@/store'
import mixin from '@/mixin'
import iam from '@/mixin/api/iam'
import signin from '@/mixin/api/signin'
import project from '@/mixin/api/project'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'AppToolbar',
  components: {
    BottomSnackBar,
    VDataTable,
  },
  mixins: [mixin, project, iam, signin],
  data() {
    return {
      loading: false,
      projectDialog: false,
      projectTable: {
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['project_id'] },
        footer: {
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        item: [],
      },
      currentProjectID: '',
      availableLanguages: [
        { text: 'English', value: 'en' },
        { text: '日本語', value: 'ja' },
      ],
      myMenu: [
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
          click: this.handleSignout,
        },
      ],
      isAdmin: false,
      staticRoutes: staticRoutes,
    }
  },
  computed: {
    headers() {
      return [
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          width: '5%',
          sortable: true,
          key: 'project_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          width: '25%',
          sortable: true,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Tag"]'),
          align: 'start',
          width: '70%',
          sortable: true,
          key: 'tag',
        },
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
          disabled: false,
        }
      })
    },
    projectName: () => {
      return store.state.project.name
    },
  },
  async mounted() {
    await this.signinUser()
    if (!store.state.user || !store.state.user.user_id) {
      console.log('Error: Try again after signin.')
      return
    }
    const admin = await this.isAdminAPI(store.state.user.user_id).catch(
      (err) => {
        return Promise.reject(err)
      }
    )
    if (admin) {
      this.isAdmin = true
    }
    this.myMenu = await this.getMenu()

    this.currentProjectID = store.state.project.project_id
    const userLocale = store.state.locale
    const browserLocale = Util.getNavigatorLanguage()
    if (userLocale.lang && userLocale.text) {
      this.handleChangeLocale({
        value: userLocale.lang,
        text: userLocale.text,
      })
    } else {
      this.handleChangeLocale({
        value: browserLocale,
        text: this.getLocaleText(browserLocale),
      })
    }
  },
  methods: {
    customFilter(value, search) {
      return (
        value != null &&
        search != null &&
        value.type !== 'item' &&
        (typeof value === 'object' ? value.map((i) => i.tag).join(',') : value)
          .toString()
          .toLocaleLowerCase()
          .indexOf(search.toLocaleLowerCase()) !== -1
      )
    },
    async listProject() {
      this.clearProjectList()
      let listProjectParam = '?user_id=' + store.state.user.user_id
      if (this.isAdmin) {
        listProjectParam = ''
      }
      this.projectTable.item = await this.listProjectAPI(
        listProjectParam
      ).catch((err) => {
        return Promise.reject(err)
      })
      this.loading = false
    },
    clearProjectList() {
      this.projectTable.item = []
    },

    getLocaleText(locale) {
      if (typeof locale !== 'string' || locale === '') return '?'
      switch (locale.toLowerCase()) {
        case 'en':
          return 'English'
        case 'ja':
          return '日本語'
        default:
          return '?'
      }
    },

    async getMenu() {
      let menu = [
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
      ]
      if (this.isAdmin) {
        menu.push({
          icon: 'mdi-head-minus',
          href: '#',
          title: 'Admin Menu',
          click: this.handleAdmin,
        })
      }
      menu.push({
        icon: 'mdi-logout',
        href: '#',
        title: 'Signout',
        click: this.handleSignout,
      })
      return menu
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
    async handleSignout() {
      await this.signout()
      this.$router.push('/auth/signin/')
    },
    handleAccountSetting() {
      this.$router.push('/iam/profile/')
    },
    handleProjectSetting() {
      this.$router.push('/project/setting/')
    },
    handleAdmin() {
      this.$router.push('/admin/menu/')
    },
    handleGoBack() {
      this.$router.go(-1)
    },
    async handleProjectClick(event, project) {
      await this.setProjectQueryParam(project.item.value.project_id)
      await store.commit('updateProject', project.item.value)
      this.reload()
    },
    handleNewProject() {
      this.$router.push('/project/new')
      this.projectDialog = false
    },
    handleSettingProject() {
      this.$router.push('/project/setting/')
      this.projectDialog = false
    },
    handleSearchProject() {
      this.loading = true
      this.projectDialog = true
      this.listProject()
    },
    async setProjectQueryParam(project_id) {
      let query = await Object.assign({}, this.$router.query)
      // delete query["project_id"]
      query.project_id = project_id
      await this.$router.push({ query: query })
    },
  },
}
</script>

<style lang="sass" scoped></style>
