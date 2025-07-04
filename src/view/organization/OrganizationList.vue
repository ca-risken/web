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
        :show-create-button="false"
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
        item-key="organization_id"
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

export default {
  name: 'OrganizationList',
  mixins: [mixin, organization, project, organization_base],
  components: {
    SearchToolbar,
    BottomSnackBar,
    DataTable,
  },
  data() {
    return {
      loading: false,
      searchModel: { name: null },
      searchForm: {
        name: {
          label: 'Organization',
          placeholder: 'Filter for organization name',
        },
      },
      table: {
        items: [],
        nameList: [],
        options: { page: 1, itemsPerPage: 10, sortBy: ['organization_id'] },
        actions: [
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
    tableData() {
      return {
        items: this.items,
        options: this.table.options,
        footer: this.table.footer,
        total: this.items.length,
      }
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      this.loading = true
      const invitations = await this.listOrganizationInvitationAPI(searchCond).catch((error) => {
        console.error('Error loading list:', error)
        this.clearList()
        this.loading = false
        throw error
      })
      if (!invitations || invitations.length === 0) {
        this.clearList()
        this.loading = false
        return
      }
      
      let invitationWithName = await Promise.all(
        invitations.map(async (invitation) => {
          const organizations = await this.listOrganizationAPI(
            `?organization_id=${invitation.organization_id}`
          )
          return {
            ...invitation,
            name: organizations[0].name,
          }
        })
      ).catch((error) => {
        console.error('Error loading list:', error)
        this.clearList()
        this.loading = false
        throw error
      })
      /*
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

    handleSearch(searchModel) {
      let searchCond = ''
      if (searchModel.name) {
        searchCond += `&name=${searchModel.name}`
      }
      this.refleshList(searchCond)
    },
    async handleAcceptInvitation(item) {
      if (!confirm(`組織「${item.name}」の招待を承認しますか？`)) {
        return
      }

      this.loading = true
      const currentProjectID = this.getCurrentProjectID()
      if (!currentProjectID) {
        this.$refs.snackbar.notifyError('プロジェクト情報が見つかりません')
        this.loading = false
        return
      }

      await this.replyOrganizationInvitationAPI(
        item.organization_id,
        currentProjectID,
        2 // ACCEPTED status
      ).then(() => {
        this.$refs.snackbar.notifySuccess(
          `組織「${item.name}」の招待を承認しました`
        )
        this.handleSearch(this.searchModel)
      }).catch((err) => {
        console.error('Error accepting invitation:', err)
        this.$refs.snackbar.notifyError(
          err.response?.data || '招待の承認に失敗しました'
        )
      }).finally(() => {
        this.loading = false
      })
    },
    async handleRejectInvitation(item) {
      if (!confirm(`組織「${item.name}」の招待を拒否しますか？`)) {
        return
      }

      this.loading = true
      const currentProjectID = this.getCurrentProjectID()
      if (!currentProjectID) {
        this.$refs.snackbar.notifyError('プロジェクト情報が見つかりません')
        this.loading = false
        return
      }

      await this.replyOrganizationInvitationAPI(
        item.organization_id,
        currentProjectID,
        3 // REJECTED status
      ).then(() => {
        this.$refs.snackbar.notifySuccess(
          `組織「${item.name}」の招待を拒否しました`
        )
        this.handleSearch(this.searchModel)
      }).catch((err) => {
        console.error('Error rejecting invitation:', err)
        this.$refs.snackbar.notifyError(
          err.response?.data || '招待の拒否に失敗しました'
        )
      }).finally(() => {
        this.loading = false
      })
    },

    updateOptions(options) {
      this.table.options = options
    },

    getStatusColor(status) {
      const numStatus =
        typeof status === 'string' ? parseInt(status, 10) : status
      const statusText = this.getStatusText(numStatus)
      switch (statusText) {
        case 'PENDING':
          return 'orange'
        case 'ACCEPTED':
          return 'green'
        case 'REJECTED':
          return 'red'
        default:
          return 'grey'
      }
    },
    getStatusText(status) {
      const numStatus =
        typeof status === 'string' ? parseInt(status, 10) : status
      switch (numStatus) {
        case 1:
          return 'PENDING'
        case 2:
          return 'ACCEPTED'
        case 3:
          return 'REJECTED'
        default:
          console.warn(
            'Unknown status value:',
            status,
            'converted to:',
            numStatus
          )
          return 'UNKNOWN'
      }
    },

  },
}
</script>
