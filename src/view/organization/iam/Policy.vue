<template>
  <v-container>
    <v-row dense justify="center" align-content="center">
      <v-col cols="12">
        <v-toolbar color="background" flat>
          <v-toolbar-title class="grey--text text--darken-4">
            <v-icon large class="pr-2">mdi-shield-account</v-icon>
            {{ $t(`submenu['Policy']`) }}
          </v-toolbar-title>
        </v-toolbar>
      </v-col>
    </v-row>

    <search-toolbar
      v-model="searchModel"
      :loading="loading"
      :name-field-items="nameList"
      name-field-key="policyName"
      :show-id-field="false"
      :show-create-button="true"
      button-size="large"
      create-button-icon="mdi-new-box"
      create-button-color="primary-darken-3"
      :search-form-config="{
        nameField: searchForm.policyName,
      }"
      @search="handleSearch"
      @create="handleNewItem"
    />

    <data-table
      :table-data="tableData"
      :loading="loading"
      :headers="headers"
      :actions="table.actions"
      item-key="policy_id"
      @update-options="updateOptions"
    >
      <template v-slot:[`item.avator`]>
        <v-avatar class="ma-3" size="48px">
          <v-icon size="x-large">mdi-certificate-outline</v-icon>
        </v-avatar>
      </template>

      <template v-slot:[`item.action_ptn`]="{ item }">
        <v-card
          label
          elevation="1"
          color="teal-lighten-5"
          class="mx-auto"
        >
          <v-card-text class="font-weight-bold">
            {{ item.value.action_ptn }}
          </v-card-text>
        </v-card>
      </template>
    </data-table>

    <!-- Edit Policy Dialog -->
    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ $t(`btn['EDIT POLICY']`) }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="policyModel.name"
            :label="$t(`item['Name']`)"
            required
          />
          <v-textarea
            v-model="policyModel.policy_document"
            :label="$t(`item['Policy Document']`)"
            rows="10"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="closeEditDialog">
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn variant="outlined" color="primary" @click="savePolicy">
            {{ $t(`btn['SAVE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Role Management Dialog -->
    <v-dialog v-model="roleDialog" max-width="800px">
      <v-card>
        <v-card-title>
          {{ $t(`btn['ROLE MANAGEMENT']`) }} - {{ selectedPolicy?.name }}
        </v-card-title>
        <v-card-text>
          <data-table
            :headers="roleHeaders"
            :items="roleTable.items"
            :loading="roleLoading"
            item-key="role_id"
            :show-footer="false"
          >
            <template v-slot:[`item.attached`]="{ item }">
              <v-switch
                :model-value="item.attached"
                @update:model-value="toggleRole(item, $event)"
                color="primary"
              />
            </template>
          </data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="closeRoleDialog">
            {{ $t(`btn['CLOSE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </v-container>
</template>

<script>
import mixin from '@/mixin'
import organization_iam from '@/mixin/api/organization_iam'
import organization_base from '@/mixin/util/organization_base'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import DataTable from '@/component/widget/table/DataTable.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'

export default {
  name: 'OrganizationPolicy',
  mixins: [mixin, organization_iam, organization_base],
  components: {
    SearchToolbar,
    DataTable,
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        policyName: null,
      },
      searchForm: {
        policyName: { label: 'Name', placeholder: 'Filter for policy name' },
      },
      nameList: [],
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['policy_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          { text: 'Manage Roles', icon: 'mdi-account-group', click: this.handleManageRoles },
          { text: 'Delete Item', icon: 'mdi-delete', click: this.handleDeleteItem },
        ],
        total: 0,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      policyModel: {
        policy_id: null,
        name: '',
        policy_document: '',
      },
      roleDialog: false,
      roleLoading: false,
      selectedPolicy: null,
      roleTable: {
        items: [],
      },
      roleHeaders: [
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          key: 'role_id',
          width: '15%',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          key: 'name',
          width: '40%',
        },
        {
          title: this.$i18n.t('item["Attached"]'),
          align: 'center',
          sortable: false,
          key: 'attached',
          width: '20%',
        },
      ],
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
          title: this.$i18n.t('item[""]'),
          align: 'center',
          width: '10%',
          sortable: false,
          key: 'avator',
        },
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: false,
          key: 'policy_id',
          width: '10%',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
          width: '30%',
        },
        {
          title: this.$i18n.t('item["Action Pattern"]'),
          align: 'start',
          sortable: false,
          key: 'action_ptn',
          width: '30%',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: false,
          key: 'updated_at',
          width: '10%',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          key: 'action',
          width: '10%',
        },
      ]
    },
  },
  mounted() {
    this.refleshList()
  },
  watch: {
    '$route.query.organization_id'() {
      this.editDialog = false
      this.roleDialog = false
      this.refleshList()
    },
  },
  methods: {
    async refleshList(name) {
      this.loading = true
      try {
        let searchCond = ''
        if (name) {
          searchCond += '&name=' + name
        }

        const policyIDs = await this.listOrganizationPolicyAPI(searchCond)
        if (!policyIDs || policyIDs.length === 0) {
          this.clearList()
          return
        }

        // Load policy details
        const policies = await Promise.all(
          policyIDs.map(async (policyId) => {
            const policy = await this.getOrganizationPolicyAPI(policyId)
            return {
              policy_id: policy.policy_id,
              name: policy.name,
              action_ptn: policy.action_ptn || '.*',
              updated_at: policy.updated_at,
            }
          })
        )

        this.table.items = policies
        this.table.total = policies.length
        this.nameList = [...new Set(policies.map((item) => item.name))]
      } catch (error) {
        console.error('Error loading list:', error)
        this.clearList()
      } finally {
        this.loading = false
      }
    },

    clearList() {
      this.table.items = []
      this.table.total = 0
      this.nameList = []
    },

    handleSearch() {
      const searchName = this.searchModel?.policyName || ''
      this.refleshList(searchName)
    },

    updateOptions(options) {
      this.table.options = options
    },

    handleNewItem() {
      this.policyModel = {
        policy_id: null,
        name: '',
        policy_document: '',
      }
      this.editDialog = true
    },

    handleEditItem(item) {
      this.policyModel = { ...item.value }
      this.editDialog = true
    },

    handleDeleteItem(item) {
      if (confirm(`ポリシー「${item.value.name}」を削除しますか？`)) {
        this.deletePolicy(item.value.policy_id)
      }
    },

    async deletePolicy(policyId) {
      try {
        this.loading = true
        await this.deleteOrganizationPolicyAPI(policyId)
        this.$refs.snackbar.notifySuccess(this.$t('message["Delete Successful"]'))
        this.handleSearch()
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || err.message)
      } finally {
        this.loading = false
      }
    },

    closeEditDialog() {
      this.editDialog = false
      this.policyModel = {
        policy_id: null,
        name: '',
        policy_document: '',
      }
    },

    async savePolicy() {
      try {
        this.loading = true
        await this.putOrganizationPolicyAPI(this.policyModel)
        this.$refs.snackbar.notifySuccess(this.$t('message["Save Successful"]'))
        this.closeEditDialog()
        this.refleshList()
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || err.message)
      } finally {
        this.loading = false
      }
    },

    async handleManageRoles(item) {
      this.selectedPolicy = item.value
      this.roleDialog = true
      await this.loadRoleList()
    },

    async loadRoleList() {
      this.roleLoading = true
      try {
        const roles = await this.listOrganizationRoleAPI('')
        const attachedPolicies = await this.listOrganizationPolicyAPI(
          `&role_id=${this.selectedPolicy.policy_id}`
        )

        this.roleTable.items = await Promise.all(
          roles.map(async (roleId) => {
            const role = await this.getOrganizationRoleAPI(roleId)
            return {
              ...role,
              attached: attachedPolicies.includes(
                this.selectedPolicy.policy_id
              ),
            }
          })
        )
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || err.message)
      } finally {
        this.roleLoading = false
      }
    },

    async toggleRole(role, attached) {
      try {
        if (attached) {
          await this.attachOrganizationPolicyAPI(
            role.role_id,
            this.selectedPolicy.policy_id
          )
        } else {
          await this.detachOrganizationPolicyAPI(
            this.selectedPolicy.policy_id,
            role.role_id
          )
        }
        role.attached = attached
        this.$refs.snackbar.notifySuccess(this.$t('message["Save Successful"]'))
      } catch (err) {
        role.attached = !attached // Revert on error
        this.$refs.snackbar.notifyError(err.response?.data || err.message)
      }
    },

    closeRoleDialog() {
      this.roleDialog = false
      this.selectedPolicy = null
      this.roleTable.items = []
    },
  },
}
</script>
