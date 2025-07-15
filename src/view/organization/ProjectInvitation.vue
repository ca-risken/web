<template>
  <div>
    <v-container>
      <page-header
        icon="mdi-email-multiple"
        :title="$t(`submenu['ProjectInvitation']`)"
      />

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
        <template v-slot:[`item.membership`]="{ item }">
          <v-chip
            :color="item.value.membership ? 'success' : 'grey'"
            variant="flat"
            size="small"
          >
            {{
              item.value.membership
                ? $t('item["Joined"]')
                : $t('item["Not Joined"]')
            }}
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
import store from '@/store'
import mixin from '@/mixin'
import organization from '@/mixin/api/organization'
import project from '@/mixin/api/project'
import iam from '@/mixin/api/iam'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import DataTable from '@/component/widget/table/DataTable.vue'
import organization_base from '@/mixin/util/organization_base'
import ProjectOrgSelectDialog from '@/component/dialog/ProjectOrgSelectDialog.vue'
import PageHeader from '@/component/widget/toolbar/PageHeader.vue'
import { INVITATION_STATUS } from '@/constants/invitationStatus'

export default {
  name: 'ProjectInvitation',
  mixins: [mixin, organization, project, organization_base, iam],
  components: {
    SearchToolbar,
    BottomSnackBar,
    DataTable,
    ProjectOrgSelectDialog,
    PageHeader,
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
          title: this.$i18n.t('item["Membership"]'),
          align: 'center',
          sortable: false,
          key: 'membership',
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
    async refleshList(name) {
      this.loading = true
      const invitations = await this.listOrganizationInvitationAPI().catch(
        (err) => {
          console.error('Error loading invitations:', err)
          throw err
        }
      )
      if (!invitations || invitations.length === 0) {
        this.clearList()
        this.loading = false
        return
      }
      const organizationProject = await this.listProjectAPI(
        `?organization_id=${this.getCurrentOrganizationID()}`
      ).catch((err) => {
        console.error('Error loading projects:', err)
        throw err
      })
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
            membership: organizationProject.some(
              (project) => project.project_id === invitation.project_id
            ),
          }
        })
      ).catch((err) => {
        console.error('Error processing invitations:', err)
        throw err
      })
      if (name) {
        invitationWithName = invitationWithName.filter(
          (invitation) => invitation.name == name
        )
      }

      this.table.items = invitationWithName
      this.table.nameList = [
        ...new Set(this.table.items.map((item) => item.name)),
      ]
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
      this.clearProjectList()
      this.projectListLoading = true
      let listProjectParam = '?user_id=' + store.state.user.user_id
      const isAdmin = await this.isAdminAPI(store.state.user.user_id).catch(
        (err) => {
          return Promise.reject(err)
        }
      )
      if (isAdmin) {
        listProjectParam = ''
      }
      this.projectList = await this.listProjectAPI(listProjectParam).catch(
        (err) => {
          console.error('Error loading projects:', err)
          this.$refs.snackbar.notifyError('Failed to load projects')
          return Promise.reject(err)
        }
      )
      this.projectListLoading = false
    },
    clearProjectList() {
      this.projectList = []
    },
    handleSearch(searchModel) {
      this.refleshList(searchModel.name)
    },
    async handleDeleteInvitation(item) {
      if (
        !confirm(`プロジェクト「${item.value.name}」の招待を削除しますか？`)
      ) {
        return
      }
      this.loading = true
      await this.deleteOrganizationInvitationAPI(item.value.project_id)
        .then(() => {
          this.$refs.snackbar.notifySuccess(
            `プロジェクト「${item.value.name}」の招待を削除しました`
          )
          this.handleSearch(this.searchModel)
        })
        .catch((err) => {
          console.error('Error deleting invitation:', err)
          this.$refs.snackbar.notifyError(
            err.response?.data || '招待の削除に失敗しました'
          )
        })
        .finally(() => {
          this.loading = false
        })
    },

    async handleProjectDialogResponse(project) {
      this.projectDialog = false
      this.loading = true

      await this.putOrganizationInvitationAPI(
        project.project_id,
        INVITATION_STATUS.PENDING
      ).catch((err) => {
        this.$refs.snackbar.notifyError(
          err.response?.data || 'Failed to send organization invitation'
        )
        return Promise.reject(err)
      })
      this.finishUpdated(
        `Organization invitation sent to project: ${project.name}`
      )
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
