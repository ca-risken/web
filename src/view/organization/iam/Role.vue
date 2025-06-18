<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-account-multiple</v-icon>
              {{ $t(`submenu['Role']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
            <v-combobox
              variant="outlined"
              density="compact"
              clearable
              bg-color="white"
              :label="$t(`item['` + searchForm.roleName.label + `']`)"
              :placeholder="searchForm.roleName.placeholder"
              :items="roleNameList"
              v-model="searchModel.roleName"
            />
          </v-col>

          <v-spacer />
          <v-btn
            class="mt-3 mr-4"
            size="large"
            density="compact"
            @click="handleSearch"
            icon="mdi-magnify"
          />
          <v-btn
            class="mt-3 mr-4"
            color="primary-darken-3"
            size="large"
            density="compact"
            @click="handleNewItem"
            icon="mdi-new-box"
          />
        </v-row>
      </v-form>
      <v-row dense>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                :headers="headers"
                :items="table.items"
                :server-items-length="table.total"
                :loading="loading"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :items-per-page-text="table.footer.itemsPerPageText"
                :showCurrentPage="table.footer.showCurrentPage"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="role_id"
                @click:row="handleRowClick"
                @update:options="updateOptions"
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
                    >{{ item.value.policy_cnt }}</v-chip
                  >
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
                        @click="action.click(item)"
                        :prepend-icon="action.icon"
                      >
                        <v-list-item-title>{{
                          $t(`action['` + action.text + `']`)
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
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

    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="text-h5">
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-identifier">
            <v-list-item-title>
              {{ roleModel.role_id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['ID']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-alpha-r-circle">
            <v-list-item-title>
              {{ roleModel.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Name']`) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="deleteDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red-darken-1"
            text
            variant="outlined"
            @click="deleteItem(roleModel.role_id)"
          >
            {{ $t(`btn['DELETE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import organization_iam from '@/mixin/api/organization_iam'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
import Util from '@/util'

export default {
  name: 'OrganizationRoleList',
  mixins: [mixin, organization_iam],
  components: {
    BottomSnackBar,
    VDataTable,
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
          placeholder: 'something-role',
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
    // Check if user has access to organization IAM
    this.checkAccessAndLoad()
  },
  methods: {
    async checkAccessAndLoad() {
      const currentOrganizationID = this.getCurrentOrganizationID()
      
      if (!currentOrganizationID) {
        this.$refs.snackbar.notifyError('No organization selected. Please select an organization first.')
        this.$router.push('/organization/setting')
        return
      }

      // Try to access the role list API to check permissions
      try {
        await this.listOrganizationRoleAPI(currentOrganizationID)
        // If successful, load the data
        this.refleshList('')
      } catch (err) {
        if (err.response?.status === 403) {
          this.$refs.snackbar.notifyError('Access denied: You do not have permission to view organization roles. Please contact your administrator.')
          this.$router.push('/organization/setting')
        } else if (err.response?.status === 401) {
          this.$refs.snackbar.notifyError('Authentication failed. Please log in again.')
          this.$router.push('/auth/signin')
        } else {
          this.$refs.snackbar.notifyError(`Failed to load organization roles: ${err.response?.data || err.message}`)
        }
      }
    },

    async refleshList(roleName) {
      const currentOrganizationID = this.getCurrentOrganizationID()
      if (!currentOrganizationID) {
        console.error('No current organization ID found')
        this.clearList()
        return
      }

      const roleData = await this.listOrganizationRoleAPI(currentOrganizationID).catch((err) => {
        if (err.response?.status === 403) {
          this.$refs.snackbar.notifyError('Access denied: You do not have permission to view organization roles.')
          this.clearList()
          return []
        }
        
        this.clearList()
        this.$refs.snackbar.notifyError(err.response?.data || 'Failed to load roles')
        return []
      })
      
      // Check if roleData is an array of IDs or objects
      let roleIDs = []
      if (Array.isArray(roleData)) {
        if (roleData.length > 0) {
          // If first element has role_id, extract IDs
          if (typeof roleData[0] === 'object' && roleData[0].role_id) {
            roleIDs = roleData.map(role => role.role_id)
          } else if (typeof roleData[0] === 'string' || typeof roleData[0] === 'number') {
            // Assume it's already an array of IDs
            roleIDs = roleData
          }
        }
      } else if (roleData && typeof roleData === 'object') {
        // Handle case where API returns an object with roles array
        if (roleData.roles && Array.isArray(roleData.roles)) {
          roleIDs = roleData.roles.map(role => 
            typeof role === 'object' ? role.role_id : role
          )
        } else if (roleData.data && Array.isArray(roleData.data)) {
          roleIDs = roleData.data.map(role => 
            typeof role === 'object' ? role.role_id : role
          )
        }
      }
      
      if (roleIDs.length == 0) {
        this.clearList()
        return
      }
      
      // Filter by role name if provided
      if (roleName) {
        const filteredRoles = []
        for (const id of roleIDs) {
          const role = await this.getOrganizationRoleAPI(currentOrganizationID, id).catch(() => null)
          if (role && role.name.toLowerCase().includes(roleName.toLowerCase())) {
            filteredRoles.push(id)
          }
        }
        this.table.total = filteredRoles.length
        this.roles = filteredRoles
      } else {
        this.table.total = roleIDs.length
        this.roles = roleIDs
      }
      
      this.loadList()
    },

    async loadList() {
      this.loading = true
      let items = []
      let roleNames = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.roles.slice(from, to)
      
      items = await Promise.all(
        ids.map(async (id) => {
          return await this.getRole(id)
        })
      )
      
      // Filter out null items and collect names
      items = items.filter(item => item !== null)
      items.forEach((item) => {
        if (item && item.name) {
          roleNames.push(item.name)
        }
      })
      
      this.table.items = items
      this.roleNameList = [...new Set(roleNames)]
      this.loading = false
    },

    async getRole(id) {
      const currentOrganizationID = this.getCurrentOrganizationID()
      const role = await this.getOrganizationRoleAPI(currentOrganizationID, id).catch((err) => {
        if (err.response?.status === 403) {
          return null
        }
        return null
      })
      
      if (!role) {
        return {
          role_id: id,
          name: 'Unknown Role',
          updated_at: Date.now() / 1000,
          policy_cnt: 0,
          policies: [],
        }
      }
      
      // Get policies for this role using organization policy API
      const policyData = await this.listOrganizationPolicyAPI(currentOrganizationID).catch(() => {
        // If policy API fails, just set policy count to 0
        return []
      })
      
      // Extract policy IDs from the response
      let allPolicyIDs = []
      if (Array.isArray(policyData)) {
        if (policyData.length > 0) {
          if (typeof policyData[0] === 'object' && policyData[0].policy_id) {
            allPolicyIDs = policyData.map(policy => policy.policy_id)
          } else if (typeof policyData[0] === 'string' || typeof policyData[0] === 'number') {
            allPolicyIDs = policyData
          }
        }
      } else if (policyData && typeof policyData === 'object') {
        if (policyData.policies && Array.isArray(policyData.policies)) {
          allPolicyIDs = policyData.policies.map(policy => 
            typeof policy === 'object' ? policy.policy_id : policy
          )
        } else if (policyData.data && Array.isArray(policyData.data)) {
          allPolicyIDs = policyData.data.map(policy => 
            typeof policy === 'object' ? policy.policy_id : policy
          )
        }
      }

      // Filter policies that belong to this role
      const rolePolicyIDs = role.policy_ids || []
      const rolePolicies = allPolicyIDs.filter(policyId => 
        rolePolicyIDs.includes(policyId)
      )
      
      const item = {
        role_id: role.role_id,
        name: role.name,
        updated_at: role.updated_at,
        policy_cnt: rolePolicies.length,
        policies: rolePolicies,
      }
      return item
    },

    clearList() {
      this.roles = []
      this.table.total = 0
      this.table.items = []
      this.roleNameList = []
    },

    async loadPolicyList() {
      this.loading = true
      const currentOrganizationID = this.getCurrentOrganizationID()
      
      try {
        const policyData = await this.listOrganizationPolicyAPI(currentOrganizationID)
        
        // Extract policy IDs from the response
        let policyIDs = []
        if (Array.isArray(policyData)) {
          if (policyData.length > 0) {
            // If first element has policy_id, extract IDs
            if (typeof policyData[0] === 'object' && policyData[0].policy_id) {
              policyIDs = policyData.map(policy => policy.policy_id)
            } else if (typeof policyData[0] === 'string' || typeof policyData[0] === 'number') {
              // Assume it's already an array of IDs
              policyIDs = policyData
            }
          }
        } else if (policyData && typeof policyData === 'object') {
          // Handle case where API returns an object with policies array
          if (policyData.policies && Array.isArray(policyData.policies)) {
            policyIDs = policyData.policies.map(policy => 
              typeof policy === 'object' ? policy.policy_id : policy
            )
          } else if (policyData.data && Array.isArray(policyData.data)) {
            policyIDs = policyData.data.map(policy => 
              typeof policy === 'object' ? policy.policy_id : policy
            )
          }
        }
        
        // Get detailed policy information
        let policyItems = []
        if (policyIDs.length > 0) {
          policyItems = await Promise.all(
            policyIDs.map(async (policyId) => {
              const policyDetail = await this.getOrganizationPolicyAPI(currentOrganizationID, policyId).catch(() => {
                return null
              })
              return policyDetail
            })
          )
          
          // Filter out null items
          policyItems = policyItems.filter(item => item !== null)
        }
        
        // Select policies that are currently attached to the role
        this.policyTable.selected = policyItems.filter(policy => 
          this.roleModel.policies && this.roleModel.policies.includes(policy.policy_id)
        )
        
        this.policyTable.items = policyItems
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || 'Failed to load policies')
      } finally {
        this.loading = false
      }
    },

    async deleteItem(roleID) {
      await this.deleteOrganizationRoleAPI(roleID).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.$refs.snackbar.notifySuccess('Success: Deleting role.')
      this.deleteDialog = false
      this.handleSearch()
    },

    async putItem() {
      const currentOrganizationID = this.getCurrentOrganizationID()
      
      try {
        // Create or update role
        await this.putOrganizationRoleAPI(currentOrganizationID, this.roleModel.name)
        
        // If not a new role, update policy attachments
        if (!this.roleForm.newRole) {
          // Get current policies attached to role  
          const currentPolicyIds = this.roleModel.policies || []
          
          // Get selected policy IDs
          const selectedPolicyIds = this.policyTable.selected.map(policy => policy.policy_id)
          
          // Policies to attach (selected but not currently attached)
          const policiesToAttach = selectedPolicyIds.filter(policyId => !currentPolicyIds.includes(policyId))
          
          // Policies to detach (currently attached but not selected)
          const policiesToDetach = currentPolicyIds.filter(policyId => !selectedPolicyIds.includes(policyId))
          
          // Attach new policies
          for (const policyId of policiesToAttach) {
            await this.attachOrganizationPolicyAPI(this.roleModel.role_id, policyId)
          }
          
          // Detach removed policies
          for (const policyId of policiesToDetach) {
            await this.detachOrganizationPolicyAPI(policyId, this.roleModel.role_id)
          }
        }
        
        this.$refs.snackbar.notifySuccess('Success: Updated role.')
        this.editDialog = false
        this.handleSearch()
      } catch (err) {
        this.$refs.snackbar.notifyError(err.response?.data || 'Failed to update role')
      }
    },



    getColorByCount(count) {
      if (count === 0) return 'grey'
      if (count <= 2) return 'green'
      if (count <= 5) return 'orange'
      return 'red'
    },

    handleNewItem() {
      this.roleModel = {
        role_id: '',
        name: '',
        policy_cnt: 0,
        policies: '',
        updated_at: '',
      }
      this.roleForm.newRole = true
      this.editDialog = true
    },

    handleRowClick(event, roles) {
      this.handleEditItem(roles.item)
    },

    handleEditItem(item) {
      this.assignDataModel(item.value)
      this.roleForm.newRole = false
      this.editDialog = true
      this.loadPolicyList()
    },

    handleDeleteItem(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true
    },

    handleSearch() {
      this.refleshList(this.searchModel.roleName)
    },

    updateOptions(options) {
      this.table.options.page = options.page
      this.table.options.itemsPerPage = options.itemsPerPage
      this.loadList()
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

    formatTime(time) {
      return Util.formatDate(new Date(time * 1000), 'yyyy/MM/dd HH:mm:ss')
    },
  },
}
</script> 