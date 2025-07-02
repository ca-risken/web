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
      item-key="user_id"
      @update:options="updateOptions"
      @click:row="handleRowClick"
    >
      <template v-slot:item.name="{ item }">
        <span class="font-weight-bold">{{ item.name }}</span>
      </template>

      <template v-slot:item.updated_at="{ item }">
        {{ formatTime(item.updated_at) }}
      </template>

      <template v-slot:item.role_cnt="{ item }">
        <v-chip :color="getColorByCount(item.role_cnt)" variant="flat">
          {{ item.role_cnt }}
        </v-chip>
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
import list from '@/mixin/util/list'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import DataTable from '@/component/widget/table/DataTable.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'

export default {
  name: 'OrganizationUser',
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
          title: this.$i18n.t('item["User Key"]'),
          align: 'start',
          sortable: true,
          key: 'user_idp_key',
          width: '25%',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
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
          sortable: true,
          key: 'updated_at',
          width: '20%',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          key: 'actions',
          width: '15%',
        },
      ],
      searchFormConfig: {
        nameField: {
          label: this.$i18n.t('item["Name"]'),
          type: 'text',
          model: 'name',
        },
        userIdField: {
          label: this.$i18n.t('item["User ID"]'),
          type: 'text',
          model: 'user_id',
        },
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
      let searchCond = ''
      if (name) {
        searchCond += '&name=' + name
      }
      if (this.searchModel.user_id) {
        searchCond += '&user_id=' + this.searchModel.user_id
      }

      const userIDs = await this.listUserAPI(searchCond).catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })

      if (userIDs.length == 0) {
        this.clearList()
        return
      }
      this.entities = userIDs
      this.loadList()
    },

    handleClear() {
      this.searchModel.name = null
      this.searchModel.user_id = null
      this.refleshList()
    },

    handleRowClick(event, { item }) {
      this.handleEdit(item)
    },

    handleEdit(item) {
      this.userModel = { ...item }
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
  },
}
</script>
