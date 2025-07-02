<template>
  <v-container>
    <v-row dense justify="center" align-content="center">
      <v-col cols="12">
        <v-toolbar color="background" flat>
          <v-toolbar-title class="grey--text text--darken-4">
            <v-icon large class="pr-2">mdi-account-key</v-icon>
            {{ $t(`submenu['Role']`) }}
          </v-toolbar-title>
        </v-toolbar>
      </v-col>
    </v-row>

    <search-toolbar
      v-model="searchModel"
      :loading="loading"
      :name-field-items="nameList"
      name-field-key="roleName"
      :show-id-field="false"
      :show-create-button="true"
      button-size="large"
      create-button-icon="mdi-new-box"
      create-button-color="primary-darken-3"
      :search-form-config="{
        nameField: searchForm.roleName,
      }"
      @search="handleSearch"
      @create="handleNewItem"
    />

    <data-table
      :table-data="tableData"
      :loading="loading"
      :headers="headers"
      :actions="table.actions"
      item-key="role_id"
      @update-options="updateOptions"
    >
      <template v-slot:[`item.avator`]>
        <v-avatar class="ma-3" size="48px">
          <v-icon size="x-large">mdi-alpha-r-circle</v-icon>
        </v-avatar>
      </template>

      <template v-slot:[`item.policy_cnt`]="{ item }">
        <v-chip :color="getColorByCount(item.value.policy_cnt)" variant="flat">
          {{ item.value.policy_cnt }}
        </v-chip>
      </template>
    </data-table>

    <!-- Edit Role Dialog -->
    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ $t(`btn['EDIT ROLE']`) }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="roleModel.name"
            :label="$t(`item['Name']`)"
            required
          />
          <v-textarea
            v-model="roleModel.assume_role_policy_document"
            :label="$t(`item['Assume Role Policy Document']`)"
            rows="10"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="closeEditDialog">
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn variant="outlined" color="primary" @click="saveRole">
            {{ $t(`btn['SAVE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Policy Management Dialog -->
    <v-dialog v-model="policyDialog" max-width="800px">
      <v-card>
        <v-card-title>
          {{ $t(`btn['POLICY MANAGEMENT']`) }} - {{ selectedRole?.name }}
        </v-card-title>
        <v-card-text>
          <data-table
            :headers="policyHeaders"
            :items="policyTable.items"
            :loading="policyLoading"
            item-key="policy_id"
            :show-footer="false"
          >
            <template v-slot:[`item.attached`]="{ item }">
              <v-switch
                :model-value="item.attached"
                @update:model-value="togglePolicy(item, $event)"
                color="primary"
              />
            </template>
          </data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="closePolicyDialog">
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
  name: 'OrganizationRole',
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
        roleName: null,
      },
      searchForm: {
        roleName: { label: 'Name', placeholder: 'Filter for role name' },
      },
      nameList: [],
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['role_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Manage Policies',
            icon: 'mdi-shield-account',
            click: this.handleManagePolicies,
          },
          {
            text: 'Delete Item',
            icon: 'mdi-delete',
            click: this.handleDeleteItem,
          },
        ],
        total: 0,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      roleModel: {
        role_id: null,
        name: '',
        assume_role_policy_document: '',
      },
      policyDialog: false,
      policyLoading: false,
      selectedRole: null,
      policyTable: {
        items: [],
      },
      policyHeaders: [
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          key: 'policy_id',
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
          key: 'role_id',
          width: '10%',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
          width: '25%',
        },
        {
          title: this.$i18n.t('item["Policies"]'),
          align: 'center',
          sortable: false,
          key: 'policy_cnt',
          width: '15%',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: false,
          key: 'updated_at',
          width: '20%',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          key: 'action',
          width: '20%',
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
      this.policyDialog = false
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

        const roleIDs = await this.listOrganizationRoleAPI(searchCond)
        if (!roleIDs || roleIDs.length === 0) {
          this.clearList()
          return
        }

        // Load role details
        const roles = await Promise.all(
          roleIDs.map(async (roleId) => {
            const role = await this.getOrganizationRoleAPI(roleId)
            const policies = await this.listOrganizationPolicyAPI(
              '&role_id=' + roleId
            )
            return {
              role_id: role.role_id,
              name: role.name,
              updated_at: role.updated_at,
              policy_cnt: policies.length,
            }
          })
        )

        this.table.items = roles
        this.table.total = roles.length
        this.nameList = [...new Set(roles.map((item) => item.name))]
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
      const searchName = this.searchModel?.roleName || ''
      this.refleshList(searchName)
    },

    updateOptions(options) {
      this.table.options = options
    },

    handleNewItem() {
      this.roleModel = {
        role_id: null,
        name: '',
        assume_role_policy_document: '',
      }
      this.editDialog = true
    },

    handleEditItem(item) {
      this.roleModel = { ...item.value }
      this.editDialog = true
    },

    closeEditDialog() {
      this.editDialog = false
      this.roleModel = {
        role_id: null,
        name: '',
        assume_role_policy_document: '',
      }
    },

    async saveRole() {
      try {
        this.loading = true
        await this.putOrganizationRoleAPI(this.roleModel)
        this.$refs.snackbar.notifySuccess(this.$t('message["Save Successful"]'))
        this.closeEditDialog()
        this.refleshList()
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || err.message)
      } finally {
        this.loading = false
      }
    },

    handleDeleteItem(item) {
      if (confirm(`ロール「${item.value.name}」を削除しますか？`)) {
        this.deleteRole(item.value.role_id)
      }
    },

    async deleteRole(roleId) {
      try {
        this.loading = true
        await this.deleteOrganizationRoleAPI(roleId)
        this.$refs.snackbar.notifySuccess(
          this.$t('message["Delete Successful"]')
        )
        this.handleSearch()
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || err.message)
      } finally {
        this.loading = false
      }
    },

    async handleManagePolicies(item) {
      this.selectedRole = item.value
      this.policyDialog = true
      await this.loadPolicyList()
    },

    async loadPolicyList() {
      this.policyLoading = true
      try {
        const policies = await this.listOrganizationPolicyAPI('')
        const attachedPolicies = await this.listOrganizationPolicyAPI(
          `&role_id=${this.selectedRole.role_id}`
        )

        this.policyTable.items = await Promise.all(
          policies.map(async (policyId) => {
            const policy = await this.getOrganizationPolicyAPI(policyId)
            return {
              ...policy,
              attached: attachedPolicies.includes(policy.policy_id),
            }
          })
        )
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || err.message)
      } finally {
        this.policyLoading = false
      }
    },

    async togglePolicy(policy, attached) {
      try {
        if (attached) {
          await this.attachOrganizationPolicyAPI(
            this.selectedRole.role_id,
            policy.policy_id
          )
        } else {
          await this.detachOrganizationPolicyAPI(
            policy.policy_id,
            this.selectedRole.role_id
          )
        }
        policy.attached = attached
        this.$refs.snackbar.notifySuccess(this.$t('message["Save Successful"]'))
      } catch (err) {
        policy.attached = !attached // Revert on error
        this.$refs.snackbar.notifyError(err.response?.data || err.message)
      }
    },

    closePolicyDialog() {
      this.policyDialog = false
      this.selectedRole = null
      this.policyTable.items = []
    },

    getColorByCount(count) {
      if (count === 0) return 'grey'
      if (count <= 2) return 'green'
      if (count <= 5) return 'orange'
      return 'red'
    },
  },
}
</script>
