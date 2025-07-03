<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-alpha-r-circle</v-icon>
              {{ $t(`submenu['Role']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>

      <search-toolbar
        v-model="searchModel"
        :loading="loading"
        :name-field-items="roleNameList"
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
          <v-chip
            :color="getColorByCount(item.value.policy_cnt)"
            variant="flat"
          >
            {{ item.value.policy_cnt }}
          </v-chip>
        </template>
      </data-table>
    </v-container>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="70%">
      <v-card>
        <v-card-title>
          <v-icon size="large">mdi-alpha-r-circle</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['Role']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="roleForm.valid" ref="form">
            <v-text-field
              v-model="roleModel.role_id"
              :label="$t(`item['` + roleForm.role_id.label + `']`)"
              :placeholder="roleForm.role_id.placeholder"
              filled
              disabled
            ></v-text-field>
            <template v-if="roleForm.newRole">
              <v-text-field
                v-model="roleModel.name"
                :counter="64"
                :rules="roleForm.name.validator"
                :label="$t(`item['` + roleForm.name.label + `']`) + ' *'"
                :placeholder="roleForm.name.placeholder"
                required
              ></v-text-field>
            </template>
            <template v-else>
              <v-text-field
                v-model="roleModel.name"
                :counter="64"
                :rules="roleForm.name.validator"
                :label="$t(`item['` + roleForm.name.label + `']`) + ' *'"
                :placeholder="roleForm.name.placeholder"
                filled
                disabled
              ></v-text-field>
            </template>
            <!-- Policy List -->
            <template v-if="!roleForm.newRole">
              <v-toolbar flat color="white">
                <v-icon size="large">mdi-certificate-outline</v-icon>
                <span class="mx-4">
                  {{ $t(`submenu['Policy']`) }}
                </span>
                <v-text-field
                  variant="plain"
                  prepend-icon="mdi-magnify"
                  placeholder="Type something"
                  v-model="policyTable.search"
                  hide-details
                  class="hidden-sm-and-down"
                />
                <v-btn icon>
                  <v-icon>mdi-filter</v-icon>
                </v-btn>
              </v-toolbar>
              <v-divider></v-divider>

              <v-data-table
                v-model="policyTable.selected"
                :search="policyTable.search"
                :headers="policyHeaders"
                :items="policyTable.items"
                :loading="loading"
                :sort-by="policyTable.options.sortBy"
                :page="policyTable.options.page"
                :items-per-page="policyTable.options.itemsPerPage"
                :items-per-page-options="policyTable.footer.itemsPerPageOptions"
                :items-per-page-text="policyTable.footer.itemsPerPageText"
                :showCurrentPage="policyTable.footer.showCurrentPage"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="policy_id"
                show-select
              >
                <template v-slot:[`item.action_ptn`]="{ item }">
                  <v-card
                    label
                    elevation="0"
                    color="teal-lighten-5"
                    class="my-1"
                  >
                    <v-card-text class="font-weight-bold">
                      {{ item.value.action_ptn }}
                    </v-card-text>
                  </v-card>
                </template>
                <template v-slot:[`item.resource_ptn`]="{ item }">
                  <v-card
                    label
                    elevation="0"
                    color="light-green-lighten-5"
                    class="my-1"
                  >
                    <v-card-text class="font-weight-bold">
                      {{ item.value.resource_ptn }}
                    </v-card-text>
                  </v-card>
                </template>
              </v-data-table>
            </template>

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                variant="outlined"
                color="grey-darken-1"
                @click="editDialog = false"
              >
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                text
                variant="outlined"
                color="green-darken-1"
                :loading="loading"
                @click="putItem"
              >
                <template v-if="roleForm.newRole">Regist</template>
                <template v-else>Edit</template>
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <delete-dialog
      v-model="deleteDialog"
      :title="$t(`message['Do you really want to delete this?']`)"
      :item-data="{ id: roleModel.role_id, name: roleModel.name }"
      item-icon="mdi-alpha-r-circle"
      :loading="loading"
      @confirm="deleteItem(roleModel.role_id)"
      @cancel="deleteDialog = false"
    />

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import organization_iam from '@/mixin/api/organization_iam'
import organization_base from '@/mixin/util/organization_base'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import DeleteDialog from '@/component/dialog/DeleteDialog.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import DataTable from '@/component/widget/table/DataTable.vue'

export default {
  name: 'OrganizationRole',
  mixins: [mixin, organization_iam, organization_base],
  components: {
    BottomSnackBar,
    DeleteDialog,
    VDataTable,
    SearchToolbar,
    DataTable,
  },
  data() {
    return {
      loading: false,
      searchModel: { roleName: null },
      searchForm: {
        roleName: { label: 'Name', placeholder: 'Filter for role name' },
      },
      roleForm: {
        newRole: false,
        valid: false,
        role_id: { label: 'ID', placeholder: '-' },
        name: {
          label: 'Name',
          placeholder: 'something-policy',
          validator: [
            (v) => !!v || 'Name is required',
            (v) => v.length <= 64 || 'Name must be less than 64 characters',
          ],
        },
      },

      roleNameList: [],
      roleModel: {
        role_id: '',
        name: '',
        policy_cnt: 0,
        policies: '',
        updated_at: '',
      },
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['role_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
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
      roles: [],
      deleteDialog: false,
      editDialog: false,
      policyTable: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 5, sortBy: ['policy_id'] },
        total: 0,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 5, title: '5' }],
          showCurrentPage: true,
        },
        items: [],
      },
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
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Policies"]'),
          align: 'center',
          sortable: false,
          key: 'policy_cnt',
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
    policyHeaders() {
      return [
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          key: 'policy_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Action Pattern"]'),
          align: 'start',
          sortable: true,
          key: 'action_ptn',
        },
        {
          title: this.$i18n.t('item["Resource Pattern"]'),
          align: 'start',
          sortable: true,
          key: 'resource_ptn',
        },
      ]
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      const roles = await this.listOrganizationRoleAPI(searchCond).catch(
        (err) => {
          this.clearList()
          return Promise.reject(err)
        }
      )
      if (!roles) {
        this.clearList()
        return false
      }
      this.table.total = roles.length
      this.roles = roles
      this.loadList()
    },
    async loadList() {
      this.loading = true
      let items = []
      let roleNames = []
      await Promise.all(
        this.roles.map(async (id) => {
          const role = await this.getOrganizationRoleAPI(id).catch((err) => {
            this.clearList()
            return Promise.reject(err)
          })
          const policies = await this.listOrganizationPolicyAPI(
            '&role_id=' + id
          ).catch((err) => {
            this.clearList()
            return Promise.reject(err)
          })
          const item = {
            role_id: role.role_id,
            name: role.name,
            updated_at: role.updated_at,
            policy_cnt: policies.length,
            policies: policies,
          }
          items.push(item)
          roleNames.push(item.name)
        })
      )
      this.table.items = items
      this.roleNameList = roleNames
      this.loading = false
    },
    clearList() {
      this.roles = []
      this.table.total = 0
      this.table.items = []
      this.roleNameList = []
    },

    async loadPolicyList() {
      this.loading = true
      this.clearPolicyList()
      const policies = await this.listOrganizationPolicyAPI('').catch((err) => {
        return Promise.reject(err)
      })
      policies.forEach(async (id) => {
        const policy = await this.getOrganizationPolicyAPI(id).catch((err) => {
          return Promise.reject(err)
        })
        this.policyTable.items.push(policy)
        if (this.roleModel.policies.indexOf(policy.policy_id) !== -1) {
          this.policyTable.selected.push(policy)
        }
      })
      this.loading = false
    },
    clearPolicyList() {
      this.policyTable.items = []
      this.policyTable.selected = []
    },

    async putItem() {
      this.loading = true
      // Update role
      await this.putOrganizationRoleAPI(this.roleModel).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })

      if (this.roleForm.newRole) {
        this.finishUpdated('Success: Created role.')
        return
      }
      // Attach/Detach policies
      this.policyTable.items.forEach(async (item) => {
        let attachPolicy = false
        this.policyTable.selected.some((selected) => {
          if (item.policy_id === selected.policy_id) {
            attachPolicy = true
            return true
          }
        })
        if (attachPolicy) {
          this.attachOrganizationPolicyAPI(
            this.roleModel.role_id,
            item.policy_id
          ).catch((err) => {
            this.$refs.snackbar.notifyError(err.response.data)
            return Promise.reject(err)
          })
        } else {
          this.detachOrganizationPolicyAPI(
            item.policy_id,
            this.roleModel.role_id
          ).catch((err) => {
            this.$refs.snackbar.notifyError(err.response.data)
            return Promise.reject(err)
          })
        }
      })

      this.finishUpdated('Success: Updated role.')
    },
    async deleteItem(roleID) {
      this.loading = true
      await this.deleteOrganizationRoleAPI(roleID).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finishUpdated('Success: Deleted role.')
    },
    async finishUpdated(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.deleteDialog = false
      this.editDialog = false
      this.handleSearch()
    },

    handleNewItem() {
      this.roleModel = {
        role_id: '',
        name: '',
        policy_cnt: 0,
        policies: '',
        updated_at: '',
      }
      this.loadPolicyList()
      this.roleForm.newRole = true
      this.editDialog = true
    },
    handleRowClick(event, roles) {
      this.handleEditItem(roles.item)
    },
    handleEditItem(item) {
      this.assignDataModel(item.value)
      this.loadPolicyList()
      this.roleForm.newRole = false
      this.editDialog = true
    },
    handleDeleteItem(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true
    },
    handleSearch() {
      let searchCond = ''
      if (this.searchModel.roleName) {
        searchCond += '&name=' + this.searchModel.roleName
      }
      this.refleshList(searchCond)
    },
    assignDataModel(item) {
      this.roleModel = {
        role_id: '',
        name: '',
        policy_cnt: 0,
        policies: '',
        updated_at: '',
      }
      this.roleModel = Object.assign(this.roleModel, item)
    },
    updateOptions(options) {
      this.table.options = options
    },
  },
}
</script>
