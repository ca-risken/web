<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-account-multiple</v-icon>
              Role
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
            <v-combobox
              outlined dense clearable
              background-color="white"
              :label="searchForm.roleName.label"
              :placeholder="searchForm.roleName.placeholder"
              :items="roleNameList"
              v-model="searchModel.roleName"
            />
          </v-col>

          <v-spacer />
          <v-btn class="mt-3 mr-4" fab dense small @click="handleSearch">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn class="mt-3 mr-4" color="primary darken-3" fab dense small @click="handleNewItem">
            <v-icon>mdi-new-box</v-icon>
          </v-btn>
        </v-row>
      </v-form>
      <v-row dense>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                :headers="table.headers"
                :items="table.items"
                :options.sync="table.options"
                :server-items-length="table.total"
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="読込中"
                no-data-text="データがありません。"
                class="elevation-1"
                item-key="role_id"
                @click:row="handleEditItem"
                @update:page="loadList"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-3">
                    <v-icon large>mdi-alpha-r-circle</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.policy_cnt`]="{ item }">
                  <v-chip :color="getColorByCount(item.policy_cnt)" dark>{{ item.policy_cnt }}</v-chip>
                </template>
                <template v-slot:[`item.updated_at`]="{ item }">
                  <v-chip>{{ item.updated_at | formatTime }}</v-chip>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ on: menu }">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on: tooltip }">
                          <v-btn icon v-on="{ ...menu, tooltip }">
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <span>Action</span>
                      </v-tooltip>
                    </template>
                    <v-list class="pa-0" dense>
                      <v-list-item
                        v-for="action in table.actions"
                        :key="action.text"
                        @click="action.click( item )"
                      >
                        <v-list-item-icon class="mr-2">
                          <v-icon small>{{ action.icon }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{ action.text }}</v-list-item-title>
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
          <v-icon large>mdi-alpha-r-circle</v-icon>
          <span class="mx-4 headline">Role</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="roleForm.valid" ref="form">
            <v-text-field
              v-model="roleModel.role_id"
              :label="roleForm.role_id.label"
              :placeholder="roleForm.role_id.placeholder"
              filled disabled
            ></v-text-field>
            <template v-if="roleForm.newRole">
              <v-text-field
                v-model="roleModel.name"
                :counter="64"
                :rules="roleForm.name.validator"
                :label="roleForm.name.label"
                :placeholder="roleForm.name.placeholder"
                required
              ></v-text-field>
            </template>
            <template v-else>
              <v-text-field
                v-model="roleModel.name"
                :counter="64"
                :rules="roleForm.name.validator"
                :label="roleForm.name.label"
                :placeholder="roleForm.name.placeholder"
                filled disabled
              ></v-text-field>   
            </template>
            <!-- Policy List -->
            <v-toolbar flat color="white">
              <v-toolbar-title class="grey--text text--darken-4">
                <v-icon large>mdi-certificate-outline</v-icon>
                <span class="mx-4">Policy</span>
              </v-toolbar-title>
              <v-text-field text solo flat
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
              :headers="policyTable.headers"
              :footer-props="policyTable.footer"
              :items="policyTable.items"
              :options.sync="policyTable.options"
              :loading="loading"
              locale="ja-jp"
              loading-text="読込中"
              no-data-text="データがありません。"
              class="elevation-1"
              item-key="policy_id"
              show-select
            >
              <template v-slot:[`item.action_ptn`]="{ item }">
                <v-card
                  label outliend
                  elevation="0"
                  color="teal lighten-5"
                  class="my-1"
                >
                  <v-card-text class="font-weight-bold">
                    {{ item.action_ptn }}
                  </v-card-text>
                </v-card>
              </template>
              <template v-slot:[`item.resource_ptn`]="{ item }">
                <v-card
                  label outliend
                  elevation="0"
                  color="light-green lighten-5"
                  class="my-1"
                >
                  <v-card-text class="font-weight-bold">
                    {{ item.resource_ptn }}
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn text outlined color="grey darken-1" @click="editDialog = false">
                CANCEL
              </v-btn>
              <v-btn text outlined color="green darken-1" :loading="loading" @click="putItem">
                <template v-if="roleForm.newRole">Regist</template>
                <template v-else>Edit</template>
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="300px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">Do you really want to delete this?</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="roleModel.role_id"></v-list-item-title>
              <v-list-item-subtitle>Role ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-alpha-r-circle</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="roleModel.name"></v-list-item-title>
              <v-list-item-subtitle>Role Name</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined color="grey darken-1" @click="deleteDialog = false">
            CANCEL
          </v-btn>
          <v-btn
            :loading="loading"
            color="red darken-1"
            text outlined
            @click="deleteItem(roleModel.role_id)"
          >
            DELETE
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'

export default {
  mixins: [mixin],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      searchModel: { roleName: null },
      searchForm: {
        roleName: { label: 'Role Name', placeholder: 'Filter for role name' },
      },
      roleForm: {
        newRole: false,
        valid: false,
        role_id: { label: 'ID', placeholder: '-' },
        name: { label: 'Name *', placeholder: 'something-policy', validator:[
            v => !!v || 'Name is required',
            v => v.length <= 64 || 'Name must be less than 64 characters',
          ]
        },
      },

      roleNameList: [],
      roleModel: { role_id:'', name:'', policy_cnt:0, policies:'', updated_at:'' },
      table: {
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: false, value: 'role_id' },
          { text: 'Name', align: 'start', sortable: false, value: 'name' },
          { text: 'Policies', align: 'center', sortable: false, value: 'policy_cnt' },
          { text: 'Updated', align: 'center', sortable: false, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['role_id'] },
        actions: [
          { text: 'Edit Item',  icon: 'mdi-pencil', click: this.handleEditItem },
          { text: 'Delete Item', icon: 'mdi-trash-can-outline', click: this.handleDeleteItem },
        ],
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
      roles: [],
      deleteDialog: false,
      editDialog: false,
      policyTable: {
        selected: [],
        search: '',
        headers: [
          { text: 'ID',  align: 'start', sortable: true, value: 'policy_id' },
          { text: 'Name', align: 'start', sortable: true, value: 'name' },
          { text: 'Action Pattern', align: 'start', sortable: true, value: 'action_ptn' },
          { text: 'Resource Pattern', align: 'start', sortable: true, value: 'resource_ptn' },
        ],
        options: { page: 1, itemsPerPage: 5, sortBy: ['policy_id'] },
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [5],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
    }
  },
  filters: {
    formatTime: (unix) => {
      return Util.formatDate(new Date(unix * 1000), 'yyyy/MM/dd HH:mm')
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      const res = await this.$axios.get(
        '/iam/list-role/?project_id=' + this.$store.state.project.project_id + searchCond
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      if ( !res.data.data.role_id ) {
        this.clearList()
        return false
      }
      this.table.total = res.data.data.role_id.length
      this.roles = res.data.data.role_id
      this.loadList()
    },
    async loadList() {
      this.loading = true
      let items = []
      let roleNames = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.roles.slice(from, to)
      ids.forEach( async id => {
        const res = await this.$axios.get(
          '/iam/get-role/?project_id='+ this.$store.state.project.project_id +'&role_id=' + id
        ).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const policies = await this.$axios.get(
          '/iam/list-policy/?project_id='+ this.$store.state.project.project_id +'&role_id=' + id
        ).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const item = {
          role_id:    res.data.data.role.role_id,
          name:       res.data.data.role.name,
          updated_at: res.data.data.role.updated_at,
          policy_cnt:  policies.data.data.policy_id ? policies.data.data.policy_id.length : 0,
          policies:   policies.data.data.policy_id ? policies.data.data.policy_id : [],
        }
        items.push(item)
        roleNames.push(item.name)
      })
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
      const res = await this.$axios.get(
        '/iam/list-policy/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.policy_id ) {
        return false
      }
      res.data.data.policy_id.forEach( async id => {
        const res = await this.$axios.get(
          '/iam/get-policy/?project_id='+ this.$store.state.project.project_id +'&policy_id=' + id
        ).catch((err) =>  {
          return Promise.reject(err)
        })
        const p = res.data.data.policy
        this.policyTable.items.push(p)

        if (this.roleModel.policies.indexOf(p.policy_id) !== -1 ){
          this.policyTable.selected.push(p)
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
      const roleParam = { 
        project_id: this.$store.state.project.project_id,
        role: {
          name: this.roleModel.name,
          project_id: this.$store.state.project.project_id,
        },
      }
      await this.$axios.post('/iam/put-role/', roleParam).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })

      if ( this.roleForm.newRole) {
        this.finishUpdated('Success: Created role.')
        return
      }
      // Attach/Detach policies
      this.policyTable.items.forEach( async item => {
        const policyParam = { 
          project_id: this.$store.state.project.project_id,
          role_id: this.roleModel.role_id,
          policy_id: item.policy_id,
        }
        let uri = '/iam/detach-policy/'
        this.policyTable.selected.some( selected => {
          if(item.policy_id === selected.policy_id){
            uri = '/iam/attach-policy/'
            return true
          }
        })
        await this.$axios.post(uri, policyParam).catch((err) =>  {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        })
      })

      this.finishUpdated('Success: Updated role.')
    },
    async deleteItem(roleID) {
      this.loading = true
      const param = {
          project_id: this.$store.state.project.project_id,
          role_id: roleID,
      }
      await this.$axios.post('/iam/delete-role/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finishUpdated('Success: Deleted role.')
    },
    async finishUpdated(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.deleteDialog  = false
      this.editDialog  = false
      this.handleSearch()
    },

    handleNewItem() {
      this.roleModel = { role_id:'', name:'', policy_cnt:0, policies:'', updated_at:'' }
      this.loadPolicyList()
      this.roleForm.newRole = true
      this.editDialog  = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.loadPolicyList()
      this.roleForm.newRole = false
      this.editDialog  = true
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog  = true
    },
    handleSearch() {
      let searchCond = ''
      if (this.searchModel.roleName) {
        searchCond += '&name=' + this.searchModel.roleName
      }
      this.refleshList(searchCond)
    },
    assignDataModel(item) {
      this.roleModel = { role_id:'', name:'', policy_cnt:0, policies:'', updated_at:'' }
      this.roleModel = Object.assign(this.roleModel, item)
    },
  }
}
</script>
