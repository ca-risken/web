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

      <!-- Search Toolbar -->
      <search-toolbar
        v-model="searchModel"
        :loading="loading"
        :name-field-items="nameList"
        name-field-key="projectName"
        :show-id-field="false"
        :show-create-button="true"
        button-size="large"
        create-button-icon="mdi-send"
        create-button-color="primary-darken-3"
        :search-form-config="{
          nameField: searchForm.projectName,
        }"
        @search="handleSearch"
        @create="handleInviteProjects"
      />

      <!-- Table -->
      <data-table
        :table-data="tableData"
        :loading="loading"
        :headers="headers"
        :actions="table.actions"
        item-key="project_id"
        @update-options="updateOptions"
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
      </data-table>
    </v-container>

    <!-- Project Selection Dialog -->
    <project-list
      :projectDialog="projectDialog"
      @handleProjectDialogResponse="handleProjectDialogResponse"
    />

    <!-- Snackbar -->
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import project from '@/mixin/api/project'
import organization from '@/mixin/api/organization'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import DataTable from '@/component/widget/table/DataTable.vue'
import organization_base from '@/mixin/util/organization_base'
import ProjectList from '@/component/widget/list/ProjectList.vue'

export default {
  name: 'OrganizationProject',
  mixins: [mixin, project, organization, organization_base],
  components: {
    SearchToolbar,
    BottomSnackBar,
    DataTable,
    ProjectList,
  },
  data() {
    return {
      projectDialog: false,
      loading: false,
      searchModel: {
        projectName: null,
      },
      searchForm: {
        projectName: {
          label: 'Project',
          placeholder: 'Filter for project name',
        },
      },
      entities: [],
      nameList: [],
      table: {
        items: [],
        total: 0,
        options: {
          page: 1,
          itemsPerPage: 10,
          sortBy: [],
        },
        actions: [
          {
            text: 'Delete Invitation',
            icon: 'mdi-delete',
            click: this.handleDeleteInvitation,
          },
        ],
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
      },
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
          width: '15%',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
          width: '30%',
        },
        {
          title: this.$i18n.t('item["Status"]'),
          align: 'center',
          sortable: false,
          key: 'status',
          width: '15%',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: false,
          key: 'updated_at',
          width: '20%',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          key: 'action',
          width: '20%',
        },
      ]
    },
    tableData() {
      return {
        options: this.table.options,
        items: this.table.items,
        total: this.table.total,
        footer: this.table.footer,
      }
    },
  },
  mounted() {
    this.refleshList('')
  },
  watch: {
    '$route.query.organization_id': {
      handler(newOrganizationId, oldOrganizationId) {
        if (newOrganizationId && newOrganizationId !== oldOrganizationId) {
          console.log(
            'Organization ID changed in route, refreshing list:',
            newOrganizationId
          )
          this.refleshList('')
        }
      },
      immediate: false,
    },
  },
  methods: {
    // List management methods (replacing list.js mixin)
    loadList() {
      this.table.items = this.entities
      this.table.total = this.entities.length
      this.nameList = [...new Set(this.entities.map((item) => item.name))]
    },

    clearList() {
      this.entities = []
      this.table.items = []
      this.table.total = 0
      this.nameList = []
    },

    formatTime(time) {
      return Util.formatDate(new Date(time * 1000), 'yyyy/MM/dd HH:mm:ss')
    },

    async refleshList(name) {
      this.loading = true
      try {
        let searchCond = ''
        if (name) {
          searchCond += '&name=' + name
        }
        const invitations = await this.listItem(searchCond)
        if (!invitations || invitations.length === 0) {
          this.clearList()
          return
        }
        let invitationsWithProjectName = await Promise.all(
          invitations.map(async (invitation) => {
            let searchCond = `?project_id=${invitation.project_id}`
            const projects = await this.listProjectAPI(searchCond)
            return {
              ...invitation,
              name: projects[0].name,
            }
          })
        )
        if (name) {
          invitationsWithProjectName = invitationsWithProjectName.filter(
            (invitation) => {
              return name == invitation.name
            }
          )
        }
        this.entities = invitationsWithProjectName
        this.loadList()
      } catch (error) {
        console.error('Error loading list:', error)
        this.clearList()
      } finally {
        this.loading = false
      }
    },

    async getItem(item) {
      return item
    },

    async listItem(searchCond) {
      return await this.ListOrganizationInvitationAPI(searchCond)
    },

    handleInviteProjects() {
      this.projectDialog = true
    },

    handleSearch() {
      const searchName = this.searchModel?.projectName || ''
      this.refleshList(searchName)
    },

    updateOptions(options) {
      this.table.options = options
    },

    getStatusText(status) {
      const numStatus =
        typeof status === 'string' ? parseInt(status, 10) : status
      switch (numStatus) {
        case 1:
          return 'PENDING'
        case 2:
          return 'ACCEPTED'
        case 3:
          return 'REJECTED'
        default:
          console.warn(
            'Unknown status value:',
            status,
            'converted to:',
            numStatus
          )
          return 'UNKNOWN'
      }
    },

    getStatusColor(status) {
      const statusText = this.getStatusText(status)
      switch (statusText) {
        case 'PENDING':
          return 'orange'
        case 'ACCEPTED':
          return 'green'
        case 'REJECTED':
          return 'red'
        default:
          return 'grey'
      }
    },

    getColorByCount(count) {
      if (count === 0) return 'grey'
      if (count <= 2) return 'green'
      if (count <= 5) return 'orange'
      return 'red'
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
  },
}
</script>
