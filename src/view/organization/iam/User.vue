<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-account-multiple</v-icon>
              {{ $t(`submenu['OrganizationUser']`) }}
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
              :label="$t(`item['User']`)"
              :placeholder="searchForm.userName.placeholder"
              :items="userNameList"
              v-model="searchModel.userName"
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
          <v-btn
            class="mt-3 mr-4"
            color="primary-darken-3"
            size="large"
            density="compact"
            @click="handleNewUser"
            icon="mdi-plus"
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
                item-key="user_id"
                @update:options="updateOptions"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-2">
                    <v-img src="/static/avatar/default.png" alt="avatar" />
                  </v-avatar>
                </template>
                <template v-slot:[`item.role_cnt`]="{ item }">
                  <v-chip
                    variant="flat"
                    :color="getColorByCount(item.value.role_cnt)"
                    >{{ item.value.role_cnt }}</v-chip
                  >
                </template>
                <template v-slot:[`item.reserved`]="{ item }">
                  <v-icon v-if="!item.value.reserved" color="success"
                    >mdi-check-circle</v-icon
                  >
                  <v-chip v-else color="grey" variant="flat">{{
                    $t("item['Reserved']")
                  }}</v-chip>
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

    <!-- Edit Dialog -->
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

            <v-data-table
              v-model="roleTable.selected"
              :search="roleTable.search"
              :headers="roleHeaders"
              :items="roleTable.items"
              :sort-by="roleTable.options.sortBy"
              :page="roleTable.options.page"
              :items-per-page="roleTable.options.itemsPerPage"
              :items-per-page-options="roleTable.footer.itemsPerPageOptions"
              :items-per-page-text="roleTable.footer.itemsPerPageText"
              :showCurrentPage="roleTable.footer.showCurrentPage"
              :loading="loading"
              locale="ja-jp"
              loading-text="Loading..."
              no-data-text="No data."
              class="elevation-1"
              item-key="role_id"
              show-select
            >
              <template v-slot:[`item.policy_cnt`]="{ item }">
                <v-chip
                  :color="getColorByCount(item.policy_cnt)"
                  variant="flat"
                  >{{ item.policy_cnt }}</v-chip
                >
              </template>
            </v-data-table>

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
              {{ $t(`view.iam['from the project.']`) }}
            </v-alert>
            <v-card-actions>
              <v-spacer />
              <v-btn
                variant="outlined"
                color="grey-darken-1"
                @click="editDialog = false"
              >
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                variant="outlined"
                color="green-darken-1"
                :loading="loading"
                @click="handleEditSubmit"
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
              @click="editDialog = false"
            >
              {{ $t(`btn['CANCEL']`) }}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import organization_iam from '@/mixin/api/organization_iam'
import iam from '@/mixin/api/iam'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTable, VDataTableServer } from 'vuetify/labs/VDataTable'

export default {
  name: 'OrganizationUser',
  mixins: [mixin, organization_iam, iam],
  components: {
    BottomSnackBar,
    VDataTable,
    VDataTableServer,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        userName: null,
      },
      searchForm: {
        userName: {
          label: 'User',
          placeholder: 'Filter for user name',
        },
      },
      userNameList: [],
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['user_id'] },
        actions: [
          {
            text: 'Edit Item',
            icon: 'mdi-pencil',
            click: this.handleEditRole,
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
      users: [],
      userModel: {
        user_id: '',
        name: '',
        user_idp_key: '',
        role_cnt: 0,
        roles: [],
        reserved: false,
        updated_at: '',
      },
      editDialog: false,
      roleTable: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 5, sortBy: ['role_id'] },
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
          title: this.$i18n.t('item["User Key"]'),
          align: 'start',
          sortable: false,
          key: 'user_idp_key',
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
          key: 'reserved',
        },
        {
          title: this.$i18n.t('item["Roles"]'),
          align: 'center',
          sortable: false,
          key: 'role_cnt',
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
    roleHeaders() {
      return [
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          key: 'role_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Policies"]'),
          align: 'center',
          sortable: true,
          key: 'policy_cnt',
        },
      ]
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(userName) {
      let searchCond = '&organization_id=' + this.getCurrentOrganizationID()
      if (userName) {
        searchCond += '&name=' + userName
      }
      
      const userIDs = await this.listUserAPI(searchCond).catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      
      if (userIDs.length == 0) {
        this.clearList()
        return
      }
      
      this.table.total = userIDs.length
      this.users = userIDs
      this.loadList()
    },

    async loadList() {
      this.loading = true
      let items = []
      let userNames = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.users.slice(from, to)
      
      items = await Promise.all(
        ids.map(async (id) => {
          return await this.getUser(id)
        })
      )
      
      items.forEach((item) => {
        userNames.push(item.name)
      })
      
      this.table.items = items
      this.userNameList = [...new Set(userNames)]
      this.loading = false
    },

    async getUser(id) {
      const user = await this.getUserAPI(id).catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      
      // Get roles for this user in the current organization
      const organizationId = this.getCurrentOrganizationID()
      const roleIDs = await this.listOrganizationRoleAPI(organizationId).catch((err) => {
        console.warn('Failed to get roles for organization:', organizationId, err)
        return []
      })
      
      // Get detailed role information for roles attached to this user
      const userRoles = []
      for (const roleId of roleIDs) {
        try {
          const role = await this.getOrganizationRoleAPI(organizationId, roleId)
          // Check if this role is attached to the user (this would need to be determined by API)
          // For now, we'll assume all organization roles are available to the user
          userRoles.push(role)
        } catch (err) {
          console.warn('Failed to get role details:', roleId, err)
        }
      }
      
      const item = {
        user_id: user.user_id,
        name: user.name,
        user_idp_key: user.user_idp_key,
        updated_at: user.updated_at,
        role_cnt: userRoles.length,
        roles: userRoles,
        reserved: false,
      }
      return item
    },

    clearList() {
      this.users = []
      this.table.total = 0
      this.table.items = []
      this.userNameList = []
    },

    handleSearch() {
      this.refleshList(this.searchModel.userName)
    },

    updateOptions(options) {
      console.log('Options updated:', options)
      this.table.options.page = options.page
      this.table.options.itemsPerPage = options.itemsPerPage
      this.loadList()
    },

    handleNewUser() {
      // TODO: Implement new user invitation
      this.$refs.snackbar.notifyInfo('New user invitation feature coming soon')
    },

    async handleEditRole(item) {
      this.userModel = { ...item }
      this.editDialog = true
      await this.loadRoleList()
    },

    async loadRoleList() {
      this.loading = true
      try {
        // Get all roles in the organization
        const searchCond = '&organization_id=' + this.getCurrentOrganizationID()
        const roleIDs = await this.listOrganizationRoleAPI(searchCond)
        
        // Get role details with policy count
        const roles = await Promise.all(
          roleIDs.map(async (id) => {
            const role = await this.getOrganizationRoleAPI(id)
            
            // Get policy count for this role
            const policySearchCond = '&organization_id=' + this.getCurrentOrganizationID() + '&role_id=' + id
            const policies = await this.listOrganizationPolicyAPI(policySearchCond).catch(() => [])
            
            return {
              role_id: role.role_id,
              name: role.name,
              policy_cnt: policies.length,
            }
          })
        )
        
        this.roleTable.items = roles
        
        // Select roles that are currently attached to the user
        this.roleTable.selected = roles.filter(role => 
          this.userModel.roles && this.userModel.roles.some(userRole => userRole.role_id === role.role_id)
        )
      } catch (err) {
        console.error('Failed to load roles:', err)
        this.$refs.snackbar.notifyError(err.response?.data?.message || 'Failed to load roles')
      } finally {
        this.loading = false
      }
    },

    async handleEditSubmit() {
      this.loading = true
      try {
        const userId = this.userModel.user_id
        
        // Get current roles attached to user
        const currentRoleIds = this.userModel.roles.map(role => role.role_id)
        
        // Get selected role IDs
        const selectedRoleIds = this.roleTable.selected.map(role => role.role_id)
        
        // Roles to attach (selected but not currently attached)
        const rolesToAttach = selectedRoleIds.filter(roleId => !currentRoleIds.includes(roleId))
        
        // Roles to detach (currently attached but not selected)
        const rolesToDetach = currentRoleIds.filter(roleId => !selectedRoleIds.includes(roleId))
        
        // Attach new roles
        for (const roleId of rolesToAttach) {
          await this.attachOrganizationRoleAPI(userId, roleId)
        }
        
        // Detach removed roles
        for (const roleId of rolesToDetach) {
          await this.detachOrganizationRoleAPI(userId, roleId)
        }
        
        this.$refs.snackbar.notifySuccess('User roles updated successfully')
        this.editDialog = false
        this.refleshList('')
      } catch (err) {
        console.error('Failed to update user roles:', err)
        this.$refs.snackbar.notifyError(err.response?.data?.message || 'Failed to update user roles')
      } finally {
        this.loading = false
      }
    },



    getColorByCount(count) {
      if (count === 0) return 'grey'
      if (count <= 2) return 'green'
      if (count <= 5) return 'orange'
      return 'red'
    },

    formatTime(time) {
      return Util.formatDate(new Date(time * 1000), 'yyyy/MM/dd HH:mm:ss')
    },
  },
}
</script> 