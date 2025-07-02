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
      item-key="policy_id"
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
          @click="handleManageRoles(item)"
        >
          {{ $t(`btn['ROLE']`) }}
        </v-btn>
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
            <template v-slot:item.attached="{ item }">
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
import list from '@/mixin/util/list'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import DataTable from '@/component/widget/table/DataTable.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'

export default {
  name: 'OrganizationPolicy',
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
          key: 'policy_id',
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
    async listItem(searchCond) {
      return await this.listOrganizationPolicyAPI(searchCond)
    },

    async getItem(id) {
      return await this.getOrganizationPolicyAPI(id)
    },

    handleClear() {
      this.searchModel.name = null
      this.refleshList()
    },

    handleRowClick(event, { item }) {
      this.handleEdit(item)
    },

    handleEdit(item) {
      this.policyModel = { ...item }
      this.editDialog = true
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
      this.selectedPolicy = item
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
