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
        :show-create-button="false"
        :search-form-config="{
          nameField: { label: tableConfig.searchLabel, placeholder: tableConfig.searchPlaceholder }
        }"
        @search="handleSearch"
      />

      <!-- Table -->
      <generic-data-table
        :table-data="tableData"
        :loading="loading"
        :headers="headers"
        :actions="tableActions"
        :item-key="tableConfig.itemKey"
        id-field-type="organization"
        @update-options="updateOptions"
      />
    </v-container>

    <!-- Snackbar -->
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import organization from '@/mixin/api/organization'
import project from '@/mixin/api/project'
import EntitySearchForm from '@/component/dialog/EntitySearchForm.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import GenericDataTable from '@/component/widget/table/GenericDataTable.vue'

export default {
  name: 'OrganizationInvitationList',
  mixins: [mixin, organization, project],
  components: {
    EntitySearchForm,
    BottomSnackBar,
    GenericDataTable,
  },
  data() {
    return {
      loading: false,
      searchModel: { name: null },
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
        footer: this.table.footer,
      }
    },
    headers() {
      return [
        {
          title: 'Organization ID',
          align: 'start',
          sortable: false,
          key: 'organization_id',
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
  methods: {
    // List management methods
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



    async refleshList(name) {
      this.loading = true
      try {
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
      } catch (error) {
        console.error('Error loading list:', error)
        this.clearList()
      } finally {
        this.loading = false
      }
    },

    handleSearch(searchModel) {
      const searchName = searchModel?.name || ''
      this.refleshList(searchName)
    },

    updateOptions(options) {
      this.table.options = options
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
          this.$refs.snackbar.notifyError('プロジェクト情報が見つかりません')
          return
        }

        // Call ReplyOrganizationInvitation API with status=2 (ACCEPTED)
        await this.ReplyOrganizationInvitationAPI(
          item.organization_id,
          currentProjectID,
          2 // ACCEPTED status
        )

        this.$refs.snackbar.notifySuccess(`組織「${item.name}」の招待を承認しました`)

        // Refresh the invitation list to show updated data
        this.handleSearch(this.searchModel)
      } catch (err) {
        console.error('Error accepting invitation:', err)
        this.$refs.snackbar.notifyError(err.response?.data || '招待の承認に失敗しました')
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
          this.$refs.snackbar.notifyError('プロジェクト情報が見つかりません')
          return
        }

        // Call ReplyOrganizationInvitation API with status=3 (REJECTED)
        await this.ReplyOrganizationInvitationAPI(
          item.organization_id,
          currentProjectID,
          3 // REJECTED status
        )

        this.$refs.snackbar.notifySuccess(`組織「${item.name}」の招待を拒否しました`)

        // Refresh the invitation list to show updated data
        this.handleSearch(this.searchModel)
      } catch (err) {
        console.error('Error rejecting invitation:', err)
        this.$refs.snackbar.notifyError(err.response?.data || '招待の拒否に失敗しました')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
