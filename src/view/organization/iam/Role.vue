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
      :loading="loading"
      :search-form-config="searchFormConfig"
      @search="handleSearch"
      @clear="handleClear"
    />

    <data-table
      :headers="headers"
      :items="table.items"
      :loading="loading"
      :options="table.options"
      :total="table.total"
      :footer="table.footer"
      item-key="role_id"
      @update:options="updateOptions"
      @click:row="handleRowClick"
    >
      <template v-slot:item.name="{ item }">
        <span class="font-weight-bold">{{ item.name }}</span>
      </template>

      <template v-slot:item.updated_at="{ item }">
        {{ formatTime(item.updated_at) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          variant="outlined"
          color="primary"
          size="small"
          @click="handleEdit(item)"
        >
          {{ $t(`btn['EDIT']`) }}
        </v-btn>
        <v-btn
          variant="outlined"
          color="info"
          size="small"
          class="ml-2"
          @click="handleManagePolicies(item)"
        >
          {{ $t(`btn['POLICY']`) }}
        </v-btn>
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
            <template v-slot:item.attached="{ item }">
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
import list from '@/mixin/util/list'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import DataTable from '@/component/widget/table/DataTable.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'

export default {
  name: 'OrganizationRole',
  mixins: [mixin, organization_iam, organization_base, list],
  components: {
    SearchToolbar,
    DataTable,
    BottomSnackBar,
  },
  data() {
    return {
      headers: [
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          key: 'role_id',
          width: '10%',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          key: 'name',
          width: '30%',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: true,
          key: 'updated_at',
          width: '20%',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          key: 'actions',
          width: '20%',
        },
      ],
      searchFormConfig: {
        nameField: {
          label: this.$i18n.t('item["Name"]'),
          type: 'text',
          model: 'name',
        },
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
    async listItem(searchCond) {
      return await this.listOrganizationRoleAPI(searchCond)
    },

    async getItem(id) {
      return await this.getOrganizationRoleAPI(id)
    },

    handleClear() {
      this.searchModel.name = null
      this.refleshList()
    },

    handleRowClick(event, { item }) {
      this.handleEdit(item)
    },

    handleEdit(item) {
      this.roleModel = { ...item }
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

    async handleManagePolicies(item) {
      this.selectedRole = item
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
  },
}
</script>
