<template>
  <div>
    <invitation-table
      :config="tableConfig"
      :actions="tableActions"
      :loading="loading"
      :table-data="tableData"
      :search-items="nameList"
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
import list from '@/mixin/util/list'
import project from '@/mixin/api/project'
import organization from '@/mixin/api/organization'
import InvitationTable from '@/component/widget/table/InvitationTable.vue'
import ProjectList from '@/component/widget/list/ProjectList.vue'

export default {
  name: 'OrganizationProject',
  mixins: [mixin, project, organization, list],
  components: {
    InvitationTable,
    ProjectList,
  },
  data() {
    return {
      projectDialog: false,
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
          console.log('Organization ID changed in route, refreshing list:', newOrganizationId)
          this.refleshList('')
        }
      },
      immediate: false
    }
  },
  methods: {
    async refleshList(name) {
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
      this.refleshList(searchModel || '')
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
  },
}
</script>
