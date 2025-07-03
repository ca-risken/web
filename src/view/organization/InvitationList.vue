<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-email-multiple</v-icon>
              {{ $t('submenu["OrganizationInvitation"]') }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>

      <!-- Search Form -->
      <search-toolbar
        v-model="searchModel"
        :loading="loading"
        :name-field-items="nameList"
        name-field-key="name"
        :show-id-field="false"
        :show-create-button="false"
        :search-form-config="{
          nameField: searchForm.name,
        }"
        @search="handleSearch"
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

    <project-list
      :projectDialog="projectDialog"
      @handleProjectDialogResponse="handleProjectDialogResponse"
    />

    <!-- Snackbar -->
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import organization from '@/mixin/api/organization'
import project from '@/mixin/api/project'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import DataTable from '@/component/widget/table/DataTable.vue'
import organization_base from '@/mixin/util/organization_base'
import ProjectList from '@/component/widget/list/ProjectList.vue'

export default {
  name: 'InvitationList',
  mixins: [mixin, organization, project, organization_base],
  components: {
    SearchToolbar,
    BottomSnackBar,
    DataTable,
    ProjectList,
  },
  data() {
    return {
      loading: false,
      searchModel: { name: null },
      searchForm: {
        name: {
          label: 'Project',
          placeholder: 'Filter for project name',
        },
      },
      entities: [],
      nameList: [],
      headers: [
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
      ],
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['project_id'] },
        actions: [
          {
            text: 'Accept Invitation',
            icon: 'mdi-check',
            click: this.handleAcceptInvitation,
          },
          {
            text: 'Reject Invitation',
            icon: 'mdi-close',
            click: this.handleRejectInvitation,
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
    tableData() {
      return {
        items: this.entities,
        options: this.table.options,
        footer: this.table.footer,
        total: this.entities.length,
      }
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    loadList() {
      this.nameList = [...new Set(this.entities.map((item) => item.name))]
    },

    getStatusColor(status) {
      const numStatus = parseInt(status)
      switch (numStatus) {
        case 1:
          return 'info'
        case 2:
          return 'success'
        case 3:
          return 'error'
        default:
          return 'warning'
      }
    },

    getStatusText(status) {
      const numStatus = parseInt(status)
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

    clearList() {
      this.entities = []
      this.nameList = []
    },

    async refleshList(name) {
      this.loading = true
      try {
        let searchCond = ''
        if (name) {
          searchCond += `&name=${name}`
        }
        const invitations = await this.listOrganizationInvitationAPI(searchCond)
        if (!invitations || invitations.length === 0) {
          this.clearList()
          return
        }
        let invitationWithName = await Promise.all(
          invitations.map(async (invitation) => {
            const projects = await this.listProjectAPI(
              `?project_id=${invitation.project_id}`
            )
            return {
              ...invitation,
              name: projects[0].name,
            }
          })
        )
        if (name) {
          invitationWithName = invitationWithName.filter(
            (invitation) => invitation.name == name
          )
        }
        this.entities = invitationWithName
        this.loadList()
      } catch (error) {
        console.error('Error loading list:', error)
        this.clearList()
      } finally {
        this.loading = false
      }
    },

    handleInviteProjects() {
      this.projectDialog = true
    },

    handleSearch(searchModel) {
      this.refleshList(searchModel.name || '')
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
        this.handleSearch(this.searchModel)
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
        this.handleSearch(this.searchModel)
      } catch (err) {
        this.$refs.snackbar.notifyError(
          err.response?.data || 'Failed to send organization invitation'
        )
      } finally {
        this.loading = false
      }
    },

    updateOptions(options) {
      this.table.options = options
    },
  },
}
</script>
