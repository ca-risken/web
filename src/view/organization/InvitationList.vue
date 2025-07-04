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
        :name-field-items="table.nameList"
        name-field-key="name"
        :show-id-field="false"
        :show-create-button="true"
        @create="handleInviteProjects"
        :search-form-config="{
          nameField: searchForm.name,
        }"
        @search="handleSearch"
      />

      <!-- Table -->
      <data-table
        :table-data="tableData"
        :loading="loading"
        :headers="tableHeaders"
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

    <project-org-select-dialog
      v-model="projectDialog"
      entity-type="project"
      :items="projectList"
      :loading="projectListLoading"
      @item-selected="handleProjectDialogResponse"
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
import ProjectOrgSelectDialog from '@/component/dialog/ProjectOrgSelectDialog.vue'

export default {
  name: 'InvitationList',
  mixins: [mixin, organization, project, organization_base],
  components: {
    SearchToolbar,
    BottomSnackBar,
    DataTable,
    ProjectOrgSelectDialog,
  },
  data() {
    return {
      loading: false,
      projectDialog: false,
      projectList: [],
      projectListLoading: false,
      searchModel: { name: null },
      searchForm: {
        name: {
          label: 'Project',
          placeholder: 'Filter for project name',
        },
      },
      table: {
        items: [],
        nameList: [],
        options: { page: 1, itemsPerPage: 10, sortBy: ['project_id'] },
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
    tableHeaders() {
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
    tableData() {
      return {
        items: this.table.items,
        options: this.table.options,
        headers: this.tableHeaders,
        footer: this.table.footer,
        total: this.table.items.length,
      }
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      this.loading = true
      const invitations = await this.listOrganizationInvitationAPI(searchCond).catch((err) => {
        console.error('Error loading invitations:', err)
        throw err
      })
      if (!invitations || invitations.length === 0) {
        this.clearList()
        return
      }

      let invitationWithName = await Promise.all(
        invitations.map(async (invitation) => {
          const projects = await this.listProjectAPI(
            `?project_id=${invitation.project_id}`
          ).catch((err) => {
            console.error('Error loading project:', err)
            throw err
          })
          return {
            ...invitation,
            name: projects[0].name,
          }
        })
      ).catch((err) => {
        console.error('Error processing invitations:', err)
        throw err
      })

      /* 名前検索がinvitationではできない
      if (name) {
        invitationWithName = invitationWithName.filter(
          (invitation) => invitation.name == name
        )
      }
      */

      this.table.items = invitationWithName
      this.table.nameList = [...new Set(this.table.items.map((item) => item.name))]
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.table.nameList = []
    },
    handleInviteProjects() {
      this.projectDialog = true
      this.loadProjectList()
    },
    async loadProjectList() {
      this.projectListLoading = true
      try {
        const projects = await this.listProjectAPI()
        this.projectList = projects.map(project => ({
          ...project,
          tag: this.getProjectTagColor(project.tag || [])
        }))
      } catch (err) {
        console.error('Error loading projects:', err)
        this.$refs.snackbar.notifyError('Failed to load projects')
      } finally {
        this.projectListLoading = false
      }
    },
    getProjectTagColor(tags) {
      if (!tags || tags.length === 0) return []
      return tags.map((tag) => ({
        tag: tag,
        color: this.getRandomColor(),
      }))
    },
    getRandomColor() {
      const colors = [
        'red', 'pink', 'purple', 'deep-purple', 'indigo',
        'blue', 'light-blue', 'cyan', 'teal', 'green',
        'light-green', 'lime', 'yellow', 'amber', 'orange',
        'deep-orange', 'brown', 'blue-grey'
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    },
    handleSearch(searchModel) {
      let searchCond = ''
      if (searchModel.name) {
        searchCond += `&name=${searchModel.name}`
      }
      this.refleshList(searchCond)
    },
    async handleDeleteInvitation(item) {
      if (!confirm(`プロジェクト「${item.value.name}」の招待を削除しますか？`)) {
        return
      }
      this.loading = true
      await this.deleteOrganizationInvitationAPI(
        item.value.project_id
      ).then(() => {
        this.$refs.snackbar.notifySuccess(
          `プロジェクト「${item.value.name}」の招待を削除しました`
        )
        this.handleSearch(this.searchModel)
      }).catch((err) => {
        console.error('Error deleting invitation:', err)
        this.$refs.snackbar.notifyError(
          err.response?.data || '招待の削除に失敗しました'
        )
      }).finally(() => {
        this.loading = false
      })
    },

    async handleProjectDialogResponse(project) {
      this.projectDialog = false
      this.loading = true

      await this.putOrganizationInvitationAPI(
        project.project_id,
        1
      ).catch((err) => {
        this.$refs.snackbar.notifyError(
          err.response?.data || 'Failed to send organization invitation'
        )
        return Promise.reject(err)
      })
      this.finishUpdated(`Organization invitation sent to project: ${project.name}`)
    },

    async finishUpdated(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.handleSearch(this.searchModel)
    },

    updateOptions(options) {
      this.table.options = options
    },
  },
}
</script>
