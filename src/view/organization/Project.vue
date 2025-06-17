<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-alpha-p-box</v-icon>
              {{ $t(`submenu['OrganizationProject']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="8" sm="4" md="4">
            <v-combobox
              variant="outlined"
              density="compact"
              clearable
              bg-color="white"
              :label="$t(`item['Project']`)"
              :placeholder="searchForm.projectName.placeholder"
              :items="projectNameList"
              v-model="searchModel.projectName"
            />
          </v-col>
          <v-spacer />
          <v-btn
            class="mt-3 mr-4"
            size="large"
            density="compact"
            :loading="loading"
            @click="handleSearch"
            icon="mdi-magnify"
          />
          <v-btn
            class="mt-3 mr-4"
            color="primary-darken-3"
            size="large"
            density="compact"
            @click="handleInviteProjects"
            icon="mdi-send"
          />
        </v-row>
      </v-form>
      <v-row dense>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table-server
                :headers="headers"
                :items-length="table.total"
                :items="table.items"
                :loading="loading"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :items-per-page-text="table.footer.itemsPerPageText"
                :show-current-page="table.footer.showCurrentPage"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="project_id"
                @update:options="updateOptions"
              >
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    :color="getStatusColor(item.value.status)"
                    variant="flat"
                    size="small"
                  >
                    {{ getStatusText(item.value.status) }}
                  </v-chip>
                </template>
                <template v-slot:[`item.updated_at`]="{ item }">
                  <v-chip>{{ formatTime(item.value.updated_at) }}</v-chip>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-dots-vertical"></v-icon>
                    </template>
                    <v-list class="pa-0" dense>
                      <v-list-item
                        v-for="action in table.actions"
                        :key="action.text"
                        @click="action.click(item.value)"
                        :prepend-icon="action.icon"
                      >
                        <v-list-item-title>{{
                          $t(`action['` + action.text + `']`)
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table-server>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Project Selection Dialog -->
    <project-list
      :projectDialog="projectDialog"
      @handleProjectDialogResponse="handleProjectDialogResponse"
    />
    
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import project from '@/mixin/api/project'
import organization from '@/mixin/api/organization'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ProjectList from '@/component/widget/list/ProjectList.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

export default {
  name: 'OrganizationProject',
  mixins: [mixin, project, organization],
  components: {
    BottomSnackBar,
    ProjectList,
    VDataTableServer,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        projectName: null,
      },
      searchForm: {
        projectName: { label: 'Project', placeholder: 'Filter for project name' },
      },
      projectNameList: [],
      projectDialog: false,
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['project_id'] },
        actions: [
          { text: 'Delete Invitation', icon: 'mdi-delete', click: this.handleDeleteInvitation },
        ],
        total: 0,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      projects: [],
    }
  },
  computed: {
    headers() {
      return [
        {
          title: 'Project ID',
          align: 'start',
          sortable: false,
          key: 'project_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Status"]'),
          align: 'center',
          sortable: false,
          key: 'status',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: false,
          key: 'updated_at',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          key: 'action',
        },
      ]
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(projectName) {
      // Get current organization from store
      const currentOrganization = this.$store.state.organization
      if (!currentOrganization || !currentOrganization.organization_id) {
        this.clearList()
        return
      }

      try {
        const invitations = await this.ListOrganizationInvitationAPI(
          currentOrganization.organization_id
        )
        if (!invitations || invitations.length === 0) {
          this.clearList()
          return
        }
        let filteredInvitations = invitations
        if (projectName) {
          const projectDetails = await Promise.all(
            invitations.map(async (invitation) => {
              try {
                const projectParam = `?project_id=${invitation.project_id}`
                const projects = await this.listProjectAPI(projectParam)
                const project = projects && projects.length > 0 ? projects[0] : null
                return {
                  ...invitation,
                  projectName: project ? project.name : `Project ${invitation.project_id}`
                }
              } catch (err) {
                return {
                  ...invitation,
                  projectName: `Project ${invitation.project_id}`
                }
              }
            })
          )
          filteredInvitations = projectDetails.filter(invitation =>
            invitation.projectName.toLowerCase().includes(projectName.toLowerCase())
          )
        }
        this.table.total = filteredInvitations.length
        this.projects = filteredInvitations
        this.loadList()
      } catch (err) {
        console.error('Error loading organization invitations:', err)
        this.clearList()
        this.$refs.snackbar?.notifyError('組織プロジェクトの読み込みに失敗しました')
      }
    },

    async loadList() {
      this.loading = true
      try {
        let items = []
        let projectNames = []
        const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
        const to = from + this.table.options.itemsPerPage
        const invitations = this.projects.slice(from, to)

        items = await Promise.all(
          invitations.map(async (invitation) => {
            try {
              const projectParam = `?project_id=${invitation.project_id}`
              const projects = await this.listProjectAPI(projectParam)
              const project = projects && projects.length > 0 ? projects[0] : null
              const item = {
                project_id: invitation.project_id,
                name: project ? project.name : `Project ${invitation.project_id}`,
                status: invitation.status,
                organization_id: invitation.organization_id,
                created_at: invitation.created_at,
                updated_at: invitation.updated_at,
              }
              projectNames.push(item.name)
              return item
            } catch (err) {
              console.error(`Error getting project info for ${invitation.project_id}:`, err)
              const fallbackItem = {
                project_id: invitation.project_id,
                name: `Project ${invitation.project_id}`,
                status: invitation.status,
                organization_id: invitation.organization_id,
                created_at: invitation.created_at,
                updated_at: invitation.updated_at,
              }
              console.log(`Fallback Project ${invitation.project_id} status:`, invitation.status, 'type:', typeof invitation.status)
              projectNames.push(fallbackItem.name)
              return fallbackItem
            }
          })
        )

        this.table.items = items
        this.projectNameList = [...new Set(projectNames)]
      } catch (err) {
        console.error('Error loading project list:', err)
        this.table.items = []
        this.$refs.snackbar?.notifyError('プロジェクト一覧の読み込みに失敗しました')
      } finally {
        this.loading = false
      }
    },

    clearList() {
      this.projects = []
      this.table.total = 0
      this.table.items = []
      this.projectNameList = []
    },

    getStatusText(status) {
      const numStatus = typeof status === 'string' ? parseInt(status) : status
      switch (numStatus) {
        case 1:
          return 'PENDING'
        case 2:
          return 'ACCEPTED'
        case 3:
          return 'REJECTED'
        default:
          console.warn('Unknown status value:', status, 'converted to:', numStatus)
          return 'UNKNOWN'
      }
    },
    getStatusColor(status) {
      const numStatus = typeof status === 'string' ? parseInt(status) : status
      switch (numStatus) {
        case 1:
          return 'orange'
        case 2:
          return 'green'
        case 3:
          return 'red'
        default:
          return 'grey'
      }
    },
    async handleDeleteInvitation(item) {
      if (!confirm(`プロジェクト「${item.name}」の招待を削除しますか？`)) {
        return
      }
      try {
        this.loading = true
        const currentOrganization = this.$store.state.organization
        if (!currentOrganization || !currentOrganization.organization_id) {
          this.$refs.snackbar.notifyError('No organization selected')
          return
        }
        await this.DeleteOrganizationInvitationAPI(
          currentOrganization.organization_id,
          item.project_id
        )
        this.$refs.snackbar.notifySuccess(
          `プロジェクト「${item.name}」の招待を削除しました`
        )
        this.handleSearch()
      } catch (err) {
        console.error('Error deleting invitation:', err)
        this.$refs.snackbar.notifyError(
          err.response?.data || '招待の削除に失敗しました'
        )
      } finally {
        this.loading = false
      }
    },

    formatTime(time) {
      return Util.formatDate(new Date(time * 1000), 'yyyy/MM/dd HH:mm:ss')
    },

    handleSearch() {
      this.refleshList(this.searchModel.projectName)
    },

    handleInviteProjects() {
      this.projectDialog = true
    },

    async handleProjectDialogResponse(project) {
      this.projectDialog = false
      
      if (!project.project_id) {
        return // User cancelled
      }

      try {
        this.loading = true
        const currentOrganization = this.$store.state.organization
        if (!currentOrganization || !currentOrganization.organization_id) {
          this.$refs.snackbar.notifyError('No organization selected')
          return
        }
        await this.PutOrganizationInvitationAPI(
          currentOrganization.organization_id,
          project.project_id,
          1
        )
        this.$refs.snackbar.notifySuccess(
          `Organization invitation sent to project: ${project.name}`
        )
        this.handleSearch()
      } catch (err) {
        this.$refs.snackbar.notifyError(
          err.response?.data || 'Failed to send organization invitation'
        )
      } finally {
        this.loading = false
      }
    },

    updateOptions(options) {
      this.table.options.page = options.page
      this.table.options.itemsPerPage = options.itemsPerPage
      this.loadList()
    },
  },
}
</script>
