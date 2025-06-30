<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">{{ tableConfig.icon }}</v-icon>
              {{ $t(`submenu['${tableConfig.titleKey}']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>

      <!-- Search Form -->
      <entity-search-form
        v-model="searchModel"
        :loading="loading"
        :name-field-items="nameList"
        :show-id-field="false"
        :show-create-button="true"
        button-size="large"
        create-button-icon="mdi-send"
        create-button-color="primary-darken-3"
        :search-form-config="{
          nameField: { label: tableConfig.searchLabel, placeholder: tableConfig.searchPlaceholder }
        }"
        @search="handleSearch"
        @create="handleInviteProjects"
      />

      <!-- Table -->
      <generic-data-table
        :table-data="tableData"
        :loading="loading"
        :headers="headers"
        :actions="tableActions"
        :item-key="tableConfig.itemKey"
        id-field-type="project"
        @update-options="updateOptions"
      />
    </v-container>

    <!-- Snackbar -->
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import project from '@/mixin/api/project'
import organization from '@/mixin/api/organization'
import organization_base from '@/mixin/util/organization_base'
import EntitySearchForm from '@/component/dialog/EntitySearchForm.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import GenericDataTable from '@/component/widget/table/GenericDataTable.vue'

export default {
  name: 'OrganizationProject',
  mixins: [mixin, project, organization, organization_base],
  components: {
    EntitySearchForm,
    BottomSnackBar,
    GenericDataTable,
  },
  data() {
    return {
      projectDialog: false,
      searchModel: { name: null },
      loading: false,
      entities: [],
      nameList: [],
      table: {
        items: [],
        total: 0,
        options: {
          page: 1,
          itemsPerPage: 10,
          sortBy: []
        },
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
      },
      tableConfig: {
        icon: 'mdi-alpha-p-box',
        titleKey: 'OrganizationProject',
        searchLabel: 'Project',
        searchPlaceholder: 'Filter for project name',
        showInviteButton: true,
        itemKey: 'project_id',
        idKey: 'project_id',
      },
      tableActions: [
        {
          text: 'Delete Invitation',
          icon: 'mdi-delete',
          click: this.handleDeleteInvitation,
        },
      ],
      sortBy: ['project_id'] 
    }
  },
  computed: {
    tableData() {
      return {
        items: this.table.items,
        total: this.table.total,
        options: this.table.options,
        footer: this.table.footer,
      }
    },
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
  watch: {
    '$route.query.organization_id': {
      handler(newOrganizationId, oldOrganizationId) {
        if (newOrganizationId && newOrganizationId !== oldOrganizationId) {
          console.log('Organization ID changed in route, refreshing list:', newOrganizationId)
          this.refleshList('')
        }
      },
      immediate: false
    }
  },
  methods: {
    // List management methods (replacing list.js mixin)
    loadList() {
      this.table.items = this.entities
      this.table.total = this.entities.length
      this.nameList = [...new Set(this.entities.map(item => item.name))]
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
        if(name) {
          invitationsWithProjectName = invitationsWithProjectName.filter((invitation) => {
            return name == invitation.name
          })
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

    handleSearch(searchModel) {
      const searchName = searchModel?.name || ''
      this.refleshList(searchName)
    },

    updateOptions(options) {
      this.table.options = options
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
        this.$refs.snackbar.notifySuccess(`プロジェクト「${item.name}」の招待を削除しました`)
        this.handleSearch(this.searchModel)
      } catch (err) {
        console.error('Error deleting invitation:', err)
        this.$refs.snackbar.notifyError(err.response?.data || '招待の削除に失敗しました')
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
        this.$refs.snackbar.notifySuccess(`Organization invitation sent to project: ${project.name}`)
        this.handleSearch(this.searchModel)
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || 'Failed to send organization invitation')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
