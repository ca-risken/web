<template>
  <div>
    <v-container>
      <page-header
        icon="mdi-email-multiple"
        :title="$t(`submenu['OrganizationInvitation']`)"
      />

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
        <template v-slot:[`item.membership`]="{ item }">
          <v-chip
            :color="item.value.membership ? 'success' : 'grey'"
            variant="flat"
            size="small"
          >
            {{
              item.value.membership
                ? $t('item["Joined"]')
                : $t('item["Not Joined"]')
            }}
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
import organization_helper from '@/mixin/helper/organization_helper'
import PageHeader from '@/component/widget/toolbar/PageHeader.vue'
import { INVITATION_STATUS } from '@/constants/invitationStatus'

export default {
  name: 'OrganizationInvitation',
  mixins: [mixin, organization, project, organization_helper],
  components: {
    SearchToolbar,
    BottomSnackBar,
    DataTable,
    PageHeader,
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
        total: 0,
      },
      invitations: [],
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
          title: this.$i18n.t('item["Membership"]'),
          align: 'center',
          sortable: false,
          key: 'membership',
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
        items: this.table.items,
        options: this.table.options,
        footer: this.table.footer,
        total: this.table.total,
      }
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(name) {
      this.loading = true
      const invitations =
        await this.listProjectOrganizationInvitationAPI().catch((error) => {
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
      const projectOrganizations = await this.listOrganizationAPI(
        `?project_id=${this.getCurrentProjectID()}`
      ).catch((err) => {
        console.error('Error loading organizations:', err)
        throw err
      })
      let invitationWithName = await Promise.all(
        invitations.map(async (invitation) => {
          const organizations = await this.listOrganizationAPI(
            `?organization_id=${invitation.organization_id}`
          )
          return {
            ...invitation,
            name: organizations[0].name,
            membership: projectOrganizations.some(
              (organization) =>
                organization.organization_id === invitation.organization_id
            ),
          }
        })
      ).catch((error) => {
        console.error('Error loading list:', error)
        this.clearList()
        this.loading = false
        throw error
      })
      if (name) {
        invitationWithName = invitationWithName.filter(
          (invitation) => invitation.name == name
        )
      }
      this.invitations = invitationWithName
      this.table.total = invitationWithName.length
      this.table.nameList = [
        ...new Set(invitationWithName.map((item) => item.name)),
      ]
      this.loadList()
    },
    clearList() {
      this.table.items = []
      this.table.nameList = []
      this.table.total = 0
      this.invitations = []
    },
    loadList() {
      this.loading = true
      const from =
        (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      this.table.items = this.invitations.slice(from, to)
      this.loading = false
    },

    handleSearch(searchModel) {
      let searchCond = ''
      if (searchModel.name) {
        searchCond += `&name=${searchModel.name}`
      }
      this.refleshList(searchCond)
    },
    async handleAcceptInvitation(item) {
      if (
        !confirm(
          this.$t('message["Accept organization invitation confirm"]', {
            name: item.value.name,
          })
        )
      ) {
        return
      }
      this.loading = true
      await this.replyOrganizationInvitationAPI(
        item.value.organization_id,
        INVITATION_STATUS.ACCEPTED
      ).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finishUpdated(
        this.$t('message["Accepted organization invitation"]', {
          name: item.value.name,
        })
      )
    },
    async handleRejectInvitation(item) {
      if (
        !confirm(
          this.$t('message["Reject organization invitation confirm"]', {
            name: item.value.name,
          })
        )
      ) {
        return
      }
      this.loading = true
      await this.replyOrganizationInvitationAPI(
        item.value.organization_id,
        INVITATION_STATUS.REJECTED
      ).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finishUpdated(
        this.$t('message["Rejected organization invitation"]', {
          name: item.value.name,
        })
      )
    },

    async finishUpdated(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.handleSearch(this.searchModel)
    },

    updateOptions(options) {
      this.table.options.page = options.page
      this.table.options.itemsPerPage = options.itemsPerPage
      this.loadList()
    },
  },
}
</script>
