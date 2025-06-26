<template>
  <div>
    <invitation-table
      :config="tableConfig"
      :actions="tableActions"
      :loading="loading"
      :table-data="tableData"
      :search-items="nameList"
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
import list from '@/mixin/util/list'

export default {
  name: 'OrganizationInvitationList',
  mixins: [mixin, organization, project, list],
  components: {
    InvitationTable,
  },
  data() {
    return {
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
      sortBy: ['organization_id']
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
    async refleshList(name) {
      let searchCond = ''
      if (name) {
        searchCond += `&name=${name}`
      }
      const invitations = await this.listProjectOrganizationInvitationAPI(searchCond)
      if (!invitations || invitations.length === 0) {
        this.clearList()
        return
      }
      let invitationWithName = await Promise.all(
        invitations.map(async (invitation) => {
          const organizations = await this.ListOrganizationAPI(
            `?organization_id=${invitation.organization_id}`
          )
          return {
            ...invitation,
            name: organizations[0].name
          }
        })
      )
      if (name) {
        invitationWithName = invitationWithName.filter((invitation) =>
          invitation.name == name
        )
      }
      this.entities = invitationWithName
      this.loadList()
    },

    async getItem(item) {
      return item
    },

    handleSearch(searchModel) {
      this.refleshList(searchModel || '')
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
