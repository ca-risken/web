<template>
  <div>
    <invitation-table
      :config="tableConfig"
      :actions="tableActions"
      :loading="loading"
      :table-data="tableData"
      :search-items="organizationNameList"
      @search="handleSearch"
      @update-options="updateOptions"
      ref="invitationTable"
    />
  </div>
</template>

<script>
import mixin from '@/mixin'
import organization from '@/mixin/api/organization'
import project from '@/mixin/api/project'
import InvitationTable from '@/component/widget/table/InvitationTable.vue'

export default {
  name: 'OrganizationInvitationList',
  mixins: [mixin, organization, project],
  components: {
    InvitationTable,
  },
  data() {
    return {
      loading: false,
      invitations: [],
      organizationNameList: [],
      tableConfig: {
        icon: 'mdi-email-multiple',
        titleKey: 'OrganizationInvitation',
        searchLabel: 'Organization',
        searchPlaceholder: 'Filter for organization name',
        showInviteButton: false,
        itemKey: 'organization_id',
        idKey: 'organization_id',
      },
      tableActions: [
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
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['organization_id'] },
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
    async refleshList(organizationName) {
      try {
        // Get current project from store
        const currentProjectID = this.getCurrentProjectID()
        if (!currentProjectID) {
          console.error('No current project ID found')
          return
        }

        console.log('Current project ID:', currentProjectID)

        // Use listProjectOrganizationInvitationAPI to get project's organization invitations
        const invitations = await this.listProjectOrganizationInvitationAPI(
          currentProjectID
        )

        if (!invitations || invitations.length === 0) {
          console.log('No invitations found')
          this.invitations = []
          this.loadList()
          return
        }

        console.log('Raw invitations:', invitations)

        // Filter by organization name if provided
        let filteredInvitations = invitations
        if (organizationName && organizationName.trim() !== '') {
          // Get organization details for each invitation to enable filtering by organization name
          const invitationDetails = await Promise.all(
            invitations.map(async (invitation) => {
              try {
                const organizations = await this.ListOrganizationAPI(
                  `?organization_id=${invitation.organization_id}`
                )
                const organization =
                  organizations && organizations.length > 0
                    ? organizations[0]
                    : null
                return {
                  ...invitation,
                  organizationName: organization
                    ? organization.name
                    : `Organization ${invitation.organization_id}`,
                }
              } catch (err) {
                return {
                  ...invitation,
                  organizationName: `Organization ${invitation.organization_id}`,
                }
              }
            })
          )

          filteredInvitations = invitationDetails.filter((invitation) =>
            invitation.organizationName
              .toLowerCase()
              .includes(organizationName.toLowerCase())
          )
        }

        console.log('Filtered invitations:', filteredInvitations)
        this.invitations = filteredInvitations
        this.table.total = filteredInvitations.length
        this.loadList()
      } catch (err) {
        console.error('Error in refleshList:', err)
        this.$refs.invitationTable.$refs.snackbar.notifyError(
          err.response?.data || 'Failed to get organization invitation list'
        )
      }
    },

    async loadList() {
      this.loading = true
      try {
        let items = []
        let organizationNames = []
        const from =
          (this.table.options.page - 1) * this.table.options.itemsPerPage
        const to = from + this.table.options.itemsPerPage
        const invitations = this.invitations.slice(from, to)

        if (invitations && invitations.length > 0) {
          // Get organization information for each invitation
          const organizationPromises = invitations.map(async (invitation) => {
            try {
              // Get organization information using organization_id
              const organizations = await this.ListOrganizationAPI(
                `?organization_id=${invitation.organization_id}`
              )
              const organization =
                organizations && organizations.length > 0
                  ? organizations[0]
                  : null

              const item = {
                organization_id: invitation.organization_id,
                name: organization
                  ? organization.name
                  : `Organization ${invitation.organization_id}`,
                status: invitation.status,
                created_at: invitation.created_at,
                updated_at: invitation.updated_at,
                project_id: invitation.project_id,
              }

              // Add to organization names list for combobox
              if (organization && organization.name) {
                organizationNames.push(organization.name)
              }

              return item
            } catch (err) {
              console.error(
                `Error getting organization info for ${invitation.organization_id}:`,
                err
              )
              const fallbackItem = {
                organization_id: invitation.organization_id,
                name: `Organization ${invitation.organization_id}`,
                status: invitation.status,
                created_at: invitation.created_at,
                updated_at: invitation.updated_at,
                project_id: invitation.project_id,
              }
              return fallbackItem
            }
          })

          items = await Promise.all(organizationPromises)
        }

        console.log('Final items for table:', items)
        console.log('Organization names for combobox:', organizationNames)

        this.table.items = items
        this.organizationNameList = [...new Set(organizationNames)]
      } catch (err) {
        console.error('Error in loadList:', err)
        this.$refs.invitationTable.$refs.snackbar.notifyError(
          err.response?.data || 'Failed to load organization list'
        )
      } finally {
        this.loading = false
      }
    },

    handleSearch(searchModel) {
      console.log('Search triggered with:', searchModel)
      this.refleshList(searchModel || '')
    },

    updateOptions(options) {
      console.log('Options updated:', options)
      this.table.options.page = options.page
      this.table.options.itemsPerPage = options.itemsPerPage
      this.loadList()
    },

    async handleAcceptInvitation(item) {
      if (!confirm(`組織「${item.name}」の招待を承認しますか？`)) {
        return
      }

      try {
        this.loading = true

        // Get current project from store
        const currentProjectID = this.getCurrentProjectID()
        if (!currentProjectID) {
          this.$refs.invitationTable.$refs.snackbar.notifyError(
            'プロジェクト情報が見つかりません'
          )
          return
        }

        // Call ReplyOrganizationInvitation API with status=2 (ACCEPTED)
        await this.ReplyOrganizationInvitationAPI(
          item.organization_id,
          currentProjectID,
          2 // ACCEPTED status
        )

        this.$refs.invitationTable.$refs.snackbar.notifySuccess(
          `組織「${item.name}」の招待を承認しました`
        )

        // Refresh the invitation list to show updated data
        this.refleshList('')
      } catch (err) {
        console.error('Error accepting invitation:', err)
        this.$refs.invitationTable.$refs.snackbar.notifyError(
          err.response?.data || '招待の承認に失敗しました'
        )
      } finally {
        this.loading = false
      }
    },

    async handleRejectInvitation(item) {
      if (!confirm(`組織「${item.name}」の招待を拒否しますか？`)) {
        return
      }

      try {
        this.loading = true

        // Get current project from store
        const currentProjectID = this.getCurrentProjectID()
        if (!currentProjectID) {
          this.$refs.invitationTable.$refs.snackbar.notifyError(
            'プロジェクト情報が見つかりません'
          )
          return
        }

        // Call ReplyOrganizationInvitation API with status=3 (REJECTED)
        await this.ReplyOrganizationInvitationAPI(
          item.organization_id,
          currentProjectID,
          3 // REJECTED status
        )

        this.$refs.invitationTable.$refs.snackbar.notifySuccess(
          `組織「${item.name}」の招待を拒否しました`
        )

        // Refresh the invitation list to show updated data
        this.refleshList('')
      } catch (err) {
        console.error('Error rejecting invitation:', err)
        this.$refs.invitationTable.$refs.snackbar.notifyError(
          err.response?.data || '招待の拒否に失敗しました'
        )
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
