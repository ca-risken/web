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

    <!-- Delete Dialog -->
    <delete-dialog
      v-model="deleteDialog"
      :title="$t(`message['Do you really want to delete this?']`)"
      :item-data="{
        id: invitationModel.project_id,
        name: invitationModel.name,
      }"
      item-icon="mdi-alpha-r-circle"
      :loading="loading"
      @confirm="deleteItem(invitationModel.project_id)"
      @cancel="deleteDialog = false"
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
import organization_helper from '@/mixin/helper/organization_helper'
import ProjectOrgSelectDialog from '@/component/dialog/ProjectOrgSelectDialog.vue'
import PageHeader from '@/component/widget/toolbar/PageHeader.vue'
import { INVITATION_STATUS } from '@/constants/invitationStatus'
import { MODE } from '@/constants/mode'
import DeleteDialog from '@/component/dialog/DeleteDialog.vue'

export default {
  name: 'ProjectInvitation',
  mixins: [mixin, organization, project, organization_helper, iam],
  components: {
    SearchToolbar,
    BottomSnackBar,
    DataTable,
    ProjectOrgSelectDialog,
    PageHeader,
    DeleteDialog,
  },
  data() {
    return {
      loading: false,
      projectDialog: false,
      deleteDialog: false,
      projectList: [],
      projectListLoading: false,
      invitationModel: {
        project_id: '',
        organization_id: '',
        name: '',
        status: '',
        membership: false,
        updated_at: '',
      },
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
          {
            text: 'Visit Project',
            icon: 'mdi-arrow-right-bold',
            click: this.handleVisitProject,
          },
        ],
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        total: 0,
      },
      invitations: [],
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
        total: this.table.total,
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

      this.invitations = invitationWithName
      this.table.total = invitationWithName.length
      this.table.nameList = [
        ...new Set(invitationWithName.map((item) => item.name)),
      ]
      this.loadList()
    },
    clearList() {
      this.table.items = []
      this.table.nameList = []
      this.table.total = 0
      this.invitations = []
    },
    loadList() {
      this.loading = true
      const from =
        (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      this.table.items = this.invitations.slice(from, to)
      this.loading = false
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

    async deleteItem(projectID) {
      this.loading = true
      await this.deleteOrganizationInvitationAPI(projectID).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finishUpdated('Success: Deleted invitation.')
    },

    async handleDeleteInvitation(item) {
      this.invitationModel = item.value
      this.deleteDialog = true
    },

    async handleVisitProject(item) {
      const project = await this.listProjectAPI(
        `?project_id=${item.value.project_id}`
      ).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      delete project[0].tag
      store.commit('updateMode', MODE.PROJECT)
      store.commit('updateProject', project[0])
      await this.$router.push('/dashboard')
      this.reload()
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
      this.deleteDialog = false
      this.handleSearch(this.searchModel)
    },

    updateOptions(options) {
      this.table.options.page = options.page
      this.table.options.itemsPerPage = options.itemsPerPage
      this.loadList()
    },
  },
}
</script>
