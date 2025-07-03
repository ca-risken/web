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
          nameField: {
            label: tableConfig.searchLabel,
            placeholder: tableConfig.searchPlaceholder,
          },
        }"
        @search="handleSearch"
      />

      <!-- Table -->
      <v-row dense>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table-server
                :headers="headers"
                :items-length="table.total"
                :items="table.items"
                :loading="loading"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :items-per-page-text="table.footer.itemsPerPageText"
                :show-current-page="table.footer.showCurrentPage"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                :item-key="tableConfig.itemKey"
                @update:options="updateOptions"
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
                <template v-slot:[`item.updated_at`]="{ item }">
                  <v-chip>{{ formatTime(item.value.updated_at) }}</v-chip>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-dots-vertical"></v-icon>
                    </template>
                    <v-list class="pa-0" dense>
                      <v-list-item
                        v-for="action in tableActions"
                        :key="action.text"
                        @click="action.click(item.value)"
                        :prepend-icon="action.icon"
                      >
                        <v-list-item-title>{{
                          $t(`action['` + action.text + `']`)
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table-server>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Confirm Dialog (using DeleteDialog as generic confirm dialog) -->
    <delete-dialog
      v-model="confirmDialog"
      :item-data="confirmTarget"
      item-icon="mdi-domain"
      :loading="loading"
      :confirm-text="confirmText"
      @confirm="executeConfirmAction"
      @cancel="cancelAction"
    />

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import organization from '@/mixin/api/organization'
import project from '@/mixin/api/project'
import EntitySearchForm from '@/component/dialog/EntitySearchForm.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import DeleteDialog from '@/component/dialog/DeleteDialog.vue'

export default {
  name: 'OrganizationInvitationList',
  mixins: [mixin, organization, project],
  components: {
    EntitySearchForm,
    BottomSnackBar,
    VDataTableServer,
    DeleteDialog,
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
          sortBy: [],
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
          click: this.handleAcceptItem,
        },
        {
          text: 'Reject Invitation',
          icon: 'mdi-close',
          click: this.handleRejectItem,
        },
      ],
      sortBy: ['organization_id'],
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
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    // List management methods
    loadList() {
      this.table.items = this.entities
      this.table.total = this.entities.length
      this.nameList = [...new Set(this.entities.map((item) => item.name))]
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
          searchCond += `&name=${name}`
        }
        const invitations = await this.listProjectOrganizationInvitationAPI(
          searchCond
        )
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
              name: organizations[0].name,
            }
          })
        )
        if (name) {
          invitationWithName = invitationWithName.filter(
            (invitation) => invitation.name == name
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

    getStatusColor(status) {
      const statusText = this.getStatusText(status)
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

    handleAcceptItem(item) {
      this.confirmTarget = {
        id: item.value.invitation_id,
        name: item.value.name,
      }
      this.confirmText = this.$t('btn["ACCEPT"]')
      this.pendingAction = () => this.handleAcceptInvitation(item.value)
      this.confirmDialog = true
    },

    handleRejectItem(item) {
      this.confirmTarget = {
        id: item.value.invitation_id,
        name: item.value.name,
      }
      this.confirmText = this.$t('btn["REJECT"]')
      this.pendingAction = () => this.handleRejectInvitation(item.value)
      this.confirmDialog = true
    },

    executeConfirmAction() {
      if (this.pendingAction) {
        this.pendingAction()
      }
      this.confirmDialog = false
    },

    cancelAction() {
      this.confirmTarget = {}
      this.confirmText = ''
      this.pendingAction = null
      this.confirmDialog = false
    },

    async handleAcceptInvitation(item) {
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

        this.$refs.snackbar.notifySuccess(
          `組織「${item.name}」の招待を承認しました`
        )

        // Refresh the invitation list to show updated data
        this.handleSearch(this.searchModel)
      } catch (err) {
        console.error('Error accepting invitation:', err)
        this.$refs.snackbar.notifyError(
          err.response?.data || '招待の承認に失敗しました'
        )
      } finally {
        this.loading = false
      }
    },

    async handleRejectInvitation(item) {
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

        this.$refs.snackbar.notifySuccess(
          `組織「${item.name}」の招待を拒否しました`
        )

        // Refresh the invitation list to show updated data
        this.handleSearch(this.searchModel)
      } catch (err) {
        console.error('Error rejecting invitation:', err)
        this.$refs.snackbar.notifyError(
          err.response?.data || '招待の拒否に失敗しました'
        )
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
