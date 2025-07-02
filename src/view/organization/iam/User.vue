<template>
  <v-container>
    <v-row dense justify="center" align-content="center">
      <v-col cols="12">
        <v-toolbar color="background" flat>
          <v-toolbar-title class="grey--text text--darken-4">
            <v-icon large class="pr-2">mdi-account-multiple</v-icon>
            {{ $t(`submenu['User']`) }}
          </v-toolbar-title>
        </v-toolbar>
      </v-col>
    </v-row>

    <search-toolbar
      v-model="searchModel"
      :loading="loading"
      :name-field-items="nameList"
      name-field-key="userName"
      :show-id-field="false"
      :show-create-button="false"
      :search-form-config="{
        nameField: searchForm.userName,
      }"
      @search="handleSearch"
    />

    <data-table
      :table-data="tableData"
      :loading="loading"
      :headers="headers"
      :actions="table.actions"
      item-key="user_id"
      @update-options="updateOptions"
    >
      <template v-slot:[`item.name`]="{ item }">
        <span class="font-weight-bold">{{ item.value.name }}</span>
      </template>

      <template v-slot:[`item.updated_at`]="{ item }">
        {{ formatTime(item.value.updated_at) }}
      </template>

      <template v-slot:[`item.role_cnt`]="{ item }">
        <v-chip :color="getColorByCount(item.value.role_cnt)" variant="flat">
          {{ item.value.role_cnt }}
        </v-chip>
      </template>
    </data-table>

    <!-- Edit User Dialog -->
    <v-dialog v-model="editDialog" max-width="70%">
      <v-card>
        <v-card-title>
          <v-icon size="large">mdi-account-multiple</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['User']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-row no-gutters>
            <v-col>
              <v-text-field
                v-model="userModel.user_id"
                :label="$t(`item['ID']`)"
                placeholder="-"
                filled
                disabled
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <v-text-field
                v-model="userModel.name"
                :label="$t(`item['Name']`)"
                filled
                disabled
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <v-text-field
                v-model="userModel.user_idp_key"
                :label="$t(`item['User Key']`)"
                filled
                disabled
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
          <!-- Role List -->
          <div v-show="userModel.user_idp_key">
            <v-toolbar flat color="white">
              <v-icon size="x-large">mdi-alpha-r-circle</v-icon>
              <span class="mx-4 text-h6">
                {{ $t(`submenu['Role']`) }}
              </span>
              <v-text-field
                variant="plain"
                prepend-icon="mdi-magnify"
                placeholder="Type something"
                v-model="roleTable.search"
                hide-details
                class="hidden-sm-and-down"
              />
              <v-btn icon>
                <v-icon>mdi-filter</v-icon>
              </v-btn>
            </v-toolbar>
            <v-divider></v-divider>

            <data-table
              v-model="roleTable.selected"
              :search="roleTable.search"
              :headers="roleHeaders"
              :items="roleTable.items"
              :loading="roleLoading"
              item-key="role_id"
              :show-footer="false"
              show-select
            >
            </data-table>

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-alert
              v-if="roleTable.selected.length == 0"
              density="compact"
              variant="outlined"
              type="error"
            >
              {{
                $t(
                  `view.iam['Please select one or more roles. If you do not select any role, the user will be ']`
                )
              }}
              <strong>{{ $t(`view.iam['removed']`) }}</strong>
              {{ $t(`view.iam['from the organization.']`) }}
            </v-alert>
            <v-card-actions>
              <v-spacer />
              <v-btn
                variant="outlined"
                color="grey-darken-1"
                @click="closeEditDialog"
              >
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                variant="outlined"
                color="green-darken-1"
                :loading="loading"
                @click="saveUser"
              >
                {{ $t(`btn['SAVE']`) }}
              </v-btn>
            </v-card-actions>
          </div>
          <v-divider class="mt-3 mb-3"></v-divider>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              @click="closeEditDialog"
            >
              {{ $t(`btn['CANCEL']`) }}
            </v-btn>
          </v-card-actions>
        </v-card-text>
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
  name: 'OrganizationUser',
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
        userName: null,
      },
      searchForm: {
        userName: { label: 'Name', placeholder: 'Filter for user name' },
      },
      nameList: [],
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['user_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEdit },
        ],
        total: 0,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      userModel: {
        user_id: null,
        name: '',
        user_idp_key: '',
        role_cnt: 0,
        roles: [],
        updated_at: '',
      },
      roleLoading: false,
      roleTable: {
        selected: [],
        search: '',
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
          title: this.$i18n.t('item["User Key"]'),
          align: 'start',
          sortable: false,
          key: 'user_idp_key',
          width: '25%',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
          width: '25%',
        },
        {
          title: this.$i18n.t('item["Roles"]'),
          align: 'center',
          sortable: false,
          key: 'role_cnt',
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
          width: '15%',
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
      this.refleshList()
    },
  },
  methods: {
    async listItem(searchCond) {
      return await this.listUserAPI(searchCond)
    },

    async getItem(id) {
      const user = await this.getUserAPI(id)
      const roles = await this.listOrganizationRoleAPI('&user_id=' + id)
      return {
        user_id: user.user_id,
        name: user.name,
        user_idp_key: user.user_idp_key,
        updated_at: user.updated_at,
        role_cnt: roles.length,
        roles: roles,
      }
    },

    async refleshList(name) {
      this.loading = true
      try {
        let searchCond = ''
        if (name) {
          searchCond += '&name=' + name
        }

        const userIDs = await this.listUserAPI(searchCond)
        if (!userIDs || userIDs.length === 0) {
          this.clearList()
          return
        }

        // Load user details
        const users = await Promise.all(
          userIDs.map(async (userId) => {
            const user = await this.getUserAPI(userId)
            const roles = await this.listOrganizationRoleAPI('&user_id=' + userId)
            return {
              user_id: user.user_id,
              name: user.name,
              user_idp_key: user.user_idp_key,
              updated_at: user.updated_at,
              role_cnt: roles.length,
              roles: roles,
            }
          })
        )

        this.table.items = users
        this.table.total = users.length
        this.nameList = [...new Set(users.map((item) => item.name))]
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
      const searchName = this.searchModel?.userName || ''
      this.refleshList(searchName)
    },

    updateOptions(options) {
      this.table.options = options
    },

    handleEdit(item) {
      this.userModel = { ...item.value }
      this.editDialog = true
      this.loadRoleList()
    },

    closeEditDialog() {
      this.editDialog = false
      this.userModel = {
        user_id: null,
        name: '',
        user_idp_key: '',
        role_cnt: 0,
        roles: [],
        updated_at: '',
      }
      this.roleTable.selected = []
      this.roleTable.items = []
    },

    async saveUser() {
      try {
        this.loading = true

        // Get current roles and selected roles
        const currentRoleIds = this.userModel.roles || []
        const selectedRoleIds = this.roleTable.selected.map(
          (role) => role.role_id
        )

        // Find roles to attach and detach
        const rolesToAttach = selectedRoleIds.filter(
          (roleId) => !currentRoleIds.includes(roleId)
        )
        const rolesToDetach = currentRoleIds.filter(
          (roleId) => !selectedRoleIds.includes(roleId)
        )

        // Attach new roles
        for (const roleId of rolesToAttach) {
          await this.attachOrganizationRoleAPI(this.userModel.user_id, roleId)
        }

        // Detach removed roles
        for (const roleId of rolesToDetach) {
          await this.detachOrganizationRoleAPI(this.userModel.user_id, roleId)
        }

        this.$refs.snackbar.notifySuccess(this.$t('message["Save Successful"]'))
        this.closeEditDialog()
        this.refleshList()
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || err.message)
      } finally {
        this.loading = false
      }
    },

    async loadRoleList() {
      this.roleLoading = true
      try {
        const roles = await this.listOrganizationRoleAPI('')
        const userRoles = this.userModel.roles || []

        this.roleTable.items = await Promise.all(
          roles.map(async (roleId) => {
            const role = await this.getOrganizationRoleAPI(roleId)
            return role
          })
        )

        // Pre-select user's current roles
        this.roleTable.selected = this.roleTable.items.filter((role) =>
          userRoles.includes(role.role_id)
        )
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || err.message)
      } finally {
        this.roleLoading = false
      }
    },

    getColorByCount(count) {
      if (count === 0) return 'grey'
      if (count <= 2) return 'green'
      if (count <= 5) return 'orange'
      return 'red'
    },

    formatTime(time) {
      return new Date(time * 1000).toLocaleString()
    },
  },
}
</script>
