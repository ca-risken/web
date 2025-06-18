<template>
  <div>
    <invitation-table
      :config="tableConfig"
      :actions="tableActions"
      :loading="loading"
      :table-data="tableData"
      :search-items="projectNameList"
      @search="handleSearch"
      @invite="handleInviteProjects"
      @update-options="updateOptions"
      ref="invitationTable"
    />

    <!-- Project Selection Dialog -->
    <project-list
      :projectDialog="projectDialog"
      @handleProjectDialogResponse="handleProjectDialogResponse"
    />
  </div>
</template>

<script>
import mixin from '@/mixin'
import project from '@/mixin/api/project'
import organization from '@/mixin/api/organization'
import InvitationTable from '@/component/widget/table/InvitationTable.vue'
import ProjectList from '@/component/widget/list/ProjectList.vue'

export default {
  name: 'OrganizationProject',
  mixins: [mixin, project, organization],
  components: {
    InvitationTable,
    ProjectList,
  },
  data() {
    return {
      loading: false,
      projectDialog: false,
      projects: [],
      projectNameList: [],
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
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['project_id'] },
        total: 0,
        items: [],
      },
    }
  },
  computed: {
    tableData() {
      return {
        items: this.table.items,
        total: this.table.total,
        options: this.table.options,
      }
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
                const project =
                  projects && projects.length > 0 ? projects[0] : null
                return {
                  ...invitation,
                  projectName: project
                    ? project.name
                    : `Project ${invitation.project_id}`,
                }
              } catch (err) {
                return {
                  ...invitation,
                  projectName: `Project ${invitation.project_id}`,
                }
              }
            })
          )
          filteredInvitations = projectDetails.filter((invitation) =>
            invitation.projectName
              .toLowerCase()
              .includes(projectName.toLowerCase())
          )
        }
        this.table.total = filteredInvitations.length
        this.projects = filteredInvitations
        this.loadList()
      } catch (err) {
        console.error('Error loading organization invitations:', err)
        this.clearList()
        this.$refs.invitationTable.$refs.snackbar?.notifyError(
          '組織プロジェクトの読み込みに失敗しました'
        )
      }
    },

    async loadList() {
      this.loading = true
      try {
        let items = []
        let projectNames = []
        const from =
          (this.table.options.page - 1) * this.table.options.itemsPerPage
        const to = from + this.table.options.itemsPerPage
        const invitations = this.projects.slice(from, to)

        items = await Promise.all(
          invitations.map(async (invitation) => {
            try {
              const projectParam = `?project_id=${invitation.project_id}`
              const projects = await this.listProjectAPI(projectParam)
              const project =
                projects && projects.length > 0 ? projects[0] : null
              const item = {
                project_id: invitation.project_id,
                name: project
                  ? project.name
                  : `Project ${invitation.project_id}`,
                status: invitation.status,
                organization_id: invitation.organization_id,
                created_at: invitation.created_at,
                updated_at: invitation.updated_at,
              }
              projectNames.push(item.name)
              return item
            } catch (err) {
              console.error(
                `Error getting project info for ${invitation.project_id}:`,
                err
              )
              const fallbackItem = {
                project_id: invitation.project_id,
                name: `Project ${invitation.project_id}`,
                status: invitation.status,
                organization_id: invitation.organization_id,
                created_at: invitation.created_at,
                updated_at: invitation.updated_at,
              }
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
        this.$refs.invitationTable.$refs.snackbar?.notifyError(
          'プロジェクト一覧の読み込みに失敗しました'
        )
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

    async handleDeleteInvitation(item) {
      if (!confirm(`プロジェクト「${item.name}」の招待を削除しますか？`)) {
        return
      }
      try {
        this.loading = true
        const currentOrganization = this.$store.state.organization
        if (!currentOrganization || !currentOrganization.organization_id) {
          this.$refs.invitationTable.$refs.snackbar.notifyError(
            'No organization selected'
          )
          return
        }
        await this.DeleteOrganizationInvitationAPI(
          currentOrganization.organization_id,
          item.project_id
        )
        this.$refs.invitationTable.$refs.snackbar.notifySuccess(
          `プロジェクト「${item.name}」の招待を削除しました`
        )
        this.handleSearch('')
      } catch (err) {
        console.error('Error deleting invitation:', err)
        this.$refs.invitationTable.$refs.snackbar.notifyError(
          err.response?.data || '招待の削除に失敗しました'
        )
      } finally {
        this.loading = false
      }
    },

    handleSearch(searchModel) {
      this.refleshList(searchModel || '')
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
          this.$refs.invitationTable.$refs.snackbar.notifyError(
            'No organization selected'
          )
          return
        }
        await this.PutOrganizationInvitationAPI(
          currentOrganization.organization_id,
          project.project_id,
          1
        )
        this.$refs.invitationTable.$refs.snackbar.notifySuccess(
          `Organization invitation sent to project: ${project.name}`
        )
        this.handleSearch('')
      } catch (err) {
        this.$refs.invitationTable.$refs.snackbar.notifyError(
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
