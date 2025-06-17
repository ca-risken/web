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
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="8" sm="4" md="4">
            <v-combobox
              variant="outlined"
              density="compact"
              clearable
              bg-color="white"
              :label="$t(`item['Organization']`)"
              :placeholder="searchForm.organizationName.placeholder"
              :items="organizationNameList"
              v-model="searchModel.organizationName"
            />
          </v-col>
          <v-spacer />
          <v-btn
            class="mt-3 mr-4"
            size="large"
            density="compact"
            :loading="loading"
            @click="handleSearch"
            icon="mdi-magnify"
          />
        </v-row>
      </v-form>
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
                item-key="organization_id"
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
                        v-for="action in table.actions"
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

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import organization from '@/mixin/api/organization'
import project from '@/mixin/api/project'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

export default {
  name: 'OrganizationInvitationList',
  mixins: [mixin, organization, project],
  components: {
    BottomSnackBar,
    VDataTableServer,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        organizationName: null,
      },
      searchForm: {
        organizationName: { label: 'Organization', placeholder: 'Filter for organization name' },
      },
      organizationNameList: [],
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['organization_id'] },
        actions: [
          { text: 'Accept Invitation', icon: 'mdi-check', click: this.handleAcceptInvitation },
          { text: 'Reject Invitation', icon: 'mdi-close', click: this.handleRejectInvitation },
        ],
        total: 0,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      invitations: [],
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
    async refleshList(organizationName) {
      try {
        const currentProjectID = this.getCurrentProjectID()
        if (!currentProjectID) {
          this.clearList()
          return
        }
        const invitations = await this.listProjectOrganizationInvitationAPI(currentProjectID)
        if (!invitations || invitations.length === 0) {
          this.clearList()
          return
        }
        let filteredInvitations = invitations
        if (organizationName) {
          const invitationDetails = await Promise.all(
            invitations.map(async (invitation) => {
              try {
                const organizations = await this.ListOrganizationAPI(`?organization_id=${invitation.organization_id}`)
                const organization = organizations && organizations.length > 0 ? organizations[0] : null
                return {
                  ...invitation,
                  organizationName: organization ? organization.name : `Organization ${invitation.organization_id}`
                }
              } catch (err) {
                return {
                  ...invitation,
                  organizationName: `Organization ${invitation.organization_id}`
                }
              }
            })
          )
          
          filteredInvitations = invitationDetails.filter(invitation =>
            invitation.organizationName.toLowerCase().includes(organizationName.toLowerCase())
          )
        }
        this.table.total = filteredInvitations.length
        this.invitations = filteredInvitations
        this.loadList()
      } catch (err) {
        console.error('Error loading organization invitations:', err)
        this.clearList()
        this.$refs.snackbar?.notifyError('組織招待の読み込みに失敗しました')
      }
    },

    async loadList() {
      this.loading = true
      try {
        let items = []
        let organizationNames = []
        const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
        const to = from + this.table.options.itemsPerPage
        const invitations = this.invitations.slice(from, to)

        items = await Promise.all(
          invitations.map(async (invitation) => {
            try {
              const organizations = await this.ListOrganizationAPI(`?organization_id=${invitation.organization_id}`)
              const organization = organizations && organizations.length > 0 ? organizations[0] : null
              
              const item = {
                organization_id: invitation.organization_id,
                name: organization ? organization.name : `Organization ${invitation.organization_id}`,
                status: invitation.status,
                created_at: invitation.created_at,
                updated_at: invitation.updated_at,
              }
              
              organizationNames.push(item.name)
              return item
            } catch (err) {
              console.error(`Error getting organization info for ${invitation.organization_id}:`, err)
              const fallbackItem = {
                organization_id: invitation.organization_id,
                name: `Organization ${invitation.organization_id}`,
                status: invitation.status,
                created_at: invitation.created_at,
                updated_at: invitation.updated_at,
              }
              organizationNames.push(fallbackItem.name)
              return fallbackItem
            }
          })
        )
        this.table.items = items
        this.organizationNameList = [...new Set(organizationNames)]
      } catch (err) {
        console.error('Error loading organization invitation list:', err)
        this.table.items = []
        this.$refs.snackbar?.notifyError('組織招待一覧の読み込みに失敗しました')
      } finally {
        this.loading = false
      }
    },

    clearList() {
      this.invitations = []
      this.table.total = 0
      this.table.items = []
      this.organizationNameList = []
    },

    getStatusText(status) {
      const numStatus = typeof status === 'string' ? parseInt(status) : status
      switch (numStatus) {
        case 1:
          return 'PENDING'
        case 2:
          return 'ACCEPTED'
        case 3:
          return 'REJECTED'
        default:
          console.warn('Unknown status value:', status, 'converted to:', numStatus)
          return 'UNKNOWN'
      }
    },

    getStatusColor(status) {
      const numStatus = typeof status === 'string' ? parseInt(status) : status
      switch (numStatus) {
        case 1:
          return 'orange'
        case 2:
          return 'green'
        case 3:
          return 'red'
        default:
          return 'grey'
      }
    },

    async handleAcceptInvitation(item) {
      if (!confirm(`組織「${item.name}」の招待を承認しますか？`)) {
        return
      }

      try {
        this.loading = true
        const currentProjectID = this.getCurrentProjectID()
        if (!currentProjectID) {
          this.$refs.snackbar.notifyError('プロジェクト情報が見つかりません')
          return
        }
        await this.ReplyOrganizationInvitationAPI(
          item.organization_id,
          currentProjectID,
          2 
        )

        this.$refs.snackbar.notifySuccess(
          `組織「${item.name}」の招待を承認しました`
        )
        
        // Refresh the invitation list to show updated data
        this.handleSearch()
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
      if (!confirm(`組織「${item.name}」の招待を拒否しますか？`)) {
        return
      }

      try {
        this.loading = true
        
        const currentProjectID = this.getCurrentProjectID()
        if (!currentProjectID) {
          this.$refs.snackbar.notifyError('プロジェクト情報が見つかりません')
          return
        }

        await this.ReplyOrganizationInvitationAPI(
          item.organization_id,
          currentProjectID,
          3 
        )

        this.$refs.snackbar.notifySuccess(
          `組織「${item.name}」の招待を拒否しました`
        )
        
        this.handleSearch()
      } catch (err) {
        console.error('Error rejecting invitation:', err)
        this.$refs.snackbar.notifyError(
          err.response?.data || '招待の拒否に失敗しました'
        )
      } finally {
        this.loading = false
      }
    },

    formatTime(time) {
      return Util.formatDate(new Date(time * 1000), 'yyyy/MM/dd HH:mm:ss')
    },

    handleSearch() {
      this.refleshList(this.searchModel.organizationName)
    },

    updateOptions(options) {
      this.table.options.page = options.page
      this.table.options.itemsPerPage = options.itemsPerPage
      this.loadList()
    },
  },
}
</script>
