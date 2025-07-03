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

    <!-- Delete Dialog -->
    <delete-dialog
      v-model="deleteDialog"
      :item-data="deleteTarget"
      item-icon="mdi-folder-outline"
      :loading="loading"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <!-- Snackbar -->
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import project from '@/mixin/api/project'
import organization from '@/mixin/api/organization'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import DataTable from '@/component/widget/table/DataTable.vue'
import organization_base from '@/mixin/util/organization_base'
import ProjectList from '@/component/widget/list/ProjectList.vue'
import DeleteDialog from '@/component/dialog/DeleteDialog.vue'

export default {
  name: 'OrganizationProjectList',
  mixins: [mixin, project, organization, organization_base],
  components: {
    SearchToolbar,
    BottomSnackBar,
    DataTable,
    ProjectList,
    DeleteDialog,
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
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteItem,
          },
        ],
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
      },
      deleteDialog: false,
      deleteTarget: {},
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
    async refleshList() {
      this.loading = true
      this.clearList()
      let searchCond = ''
      if (this.searchModel.projectName) {
        searchCond += '&name=' + this.searchModel.projectName
      }
      const organizationInvitations = await this.ListOrganizationInvitationAPI(
        searchCond
      )
        .then((response) => {
          return response
        })
        .catch((err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          return []
        })

      if (organizationInvitations.length === 0) {
        this.loading = false
        return
      }

      this.entities = organizationInvitations
      this.table.total = organizationInvitations.length
      this.loadList()
    },
    async loadList() {
      this.loading = true
      let items = []
      let nameList = []
      const from =
        (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const targetEntities = this.entities.slice(from, to)

      await Promise.all(
        targetEntities.map(async (invitation) => {
          let searchCond = `?project_id=${invitation.project_id}`
          const projects = await this.ListProjectAPI(searchCond)
          return {
            ...invitation,
            name: projects[0].name,
          }
        })
      )

      this.table.items = items
      this.nameList = nameList
      this.loading = false
    },
    clearList() {
      this.entities = []
      this.table.items = []
      this.table.total = 0
      this.nameList = []
    },
    handleInviteProjects() {
      this.projectDialog = true
    },
    handleProjectDialogResponse(projectIds) {
      this.projectDialog = false
      if (projectIds && projectIds.length > 0) {
        this.inviteProjects(projectIds)
      }
    },
    async inviteProjects(projectIds) {
      this.loading = true
      const organizationId = this.getCurrentOrganizationID()
      const promises = projectIds.map(async (projectId) => {
        const param = {
          organization_id: organizationId,
          project_id: projectId,
        }
        return this.putOrganizationAPI(param).catch((err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        })
      })

      try {
        await Promise.all(promises)
        this.$refs.snackbar.notifySuccess('Projects invited successfully')
        this.refleshList('')
      } catch (error) {
        this.$refs.snackbar.notifyError('Failed to invite some projects')
      }
      this.loading = false
    },
    handleDeleteItem(item) {
      this.deleteTarget = {
        id: item.value.invitation_id,
        name: item.value.name,
      }
      this.deleteDialog = true
    },
    async confirmDelete() {
      this.loading = true
      await this.deleteOrganizationAPI(this.deleteTarget.id)
        .then(() => {
          this.$refs.snackbar.notifySuccess('Invitation deleted successfully')
          this.refleshList('')
        })
        .catch((err) => {
          this.$refs.snackbar.notifyError(err.response.data)
        })
      this.loading = false
      this.deleteDialog = false
    },
    cancelDelete() {
      this.deleteDialog = false
      this.deleteTarget = {}
    },
    handleSearch() {
      this.refleshList()
    },
    updateOptions(options) {
      this.table.options = options
      this.loadList()
    },
    getStatusColor(status) {
      switch (status) {
        case 'INVITED':
          return 'orange'
        case 'ACTIVE':
          return 'green'
        case 'INACTIVE':
          return 'red'
        default:
          return 'grey'
      }
    },
    getStatusText(status) {
      return status || 'Unknown'
    },
  },
}
</script>

<style scoped></style>
