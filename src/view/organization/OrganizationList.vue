<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-email-multiple</v-icon>
              {{ $t(`submenu['OrganizationInvitation']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>

      <!-- Search Toolbar -->
      <search-toolbar
        v-model="searchModel"
        :loading="loading"
        :name-field-items="nameList"
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
        :headers="headers"
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

    <!-- Confirm Dialog -->
    <delete-dialog
      v-model="confirmDialog"
      :title="confirmText"
      :item-data="confirmTarget"
      item-icon="mdi-domain"
      :loading="loading"
      @confirm="executeConfirmAction"
      @cancel="cancelAction"
    />

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
import DeleteDialog from '@/component/dialog/DeleteDialog.vue'

export default {
  name: 'OrganizationList',
  mixins: [mixin, organization, project],
  components: {
    SearchToolbar,
    BottomSnackBar,
    DataTable,
    DeleteDialog,
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
            text: 'Accept Invitation',
            icon: 'mdi-check',
            click: this.handleAcceptItem,
          },
          {
            text: 'Reject Invitation',
            icon: 'mdi-close',
            click: this.handleRejectItem,
          },
        ],
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
      },
      confirmDialog: false,
      confirmTarget: {},
      confirmText: '',
      pendingAction: null,
    }
  },
  computed: {
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
  methods: {
    async refleshList(searchCond) {
      this.loading = true
      this.clearList()

      const organizationInvitations = await this.listOrganizationInvitationAPI(
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
          const organization = await this.getOrganizationAPI(
            invitation.organization_id
          )
            .then((response) => {
              return response
            })
            .catch((err) => {
              console.error('Error fetching organization:', err)
              return null
            })

          if (organization) {
            const item = {
              organization_id: organization.organization_id,
              name: organization.name,
              status: invitation.status,
              updated_at: invitation.updated_at,
              invitation_id: invitation.invitation_id,
            }
            items.push(item)
            nameList.push(organization.name)
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
    handleAcceptItem(item) {
      this.confirmTarget = {
        id: item.value.invitation_id,
        name: item.value.name,
      }
      this.confirmText = 'Accept this organization invitation?'
      this.pendingAction = 'accept'
      this.confirmDialog = true
    },
    handleRejectItem(item) {
      this.confirmTarget = {
        id: item.value.invitation_id,
        name: item.value.name,
      }
      this.confirmText = 'Reject this organization invitation?'
      this.pendingAction = 'reject'
      this.confirmDialog = true
    },
    async executeConfirmAction() {
      this.loading = true

      if (this.pendingAction === 'accept') {
        await this.acceptOrganizationInvitationAPI(this.confirmTarget.id)
          .then(() => {
            this.$refs.snackbar.notifySuccess(
              'Organization invitation accepted'
            )
            this.refleshList('')
          })
          .catch((err) => {
            this.$refs.snackbar.notifyError(err.response.data)
          })
      } else if (this.pendingAction === 'reject') {
        await this.rejectOrganizationInvitationAPI(this.confirmTarget.id)
          .then(() => {
            this.$refs.snackbar.notifySuccess(
              'Organization invitation rejected'
            )
            this.refleshList('')
          })
          .catch((err) => {
            this.$refs.snackbar.notifyError(err.response.data)
          })
      }

      this.loading = false
      this.confirmDialog = false
      this.pendingAction = null
    },
    cancelAction() {
      this.confirmDialog = false
      this.confirmTarget = {}
      this.confirmText = ''
      this.pendingAction = null
    },
    handleSearch() {
      let searchCond = ''
      if (this.searchModel.name) {
        searchCond += '&name=' + this.searchModel.name
      }
      this.refleshList(searchCond)
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
