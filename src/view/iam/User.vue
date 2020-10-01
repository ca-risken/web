<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="white" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-account-multiple</v-icon>
              User
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
            <v-combobox
              outlined dense clearable
              :label="searchForm.userName.label"
              :placeholder="searchForm.userName.placeholder"
              :items="userNameList"
              v-model="searchModel.userName"
            />
          </v-col>

          <v-spacer />
          <v-btn class="mt-3 mr-4" fab dense small :loading="loading" @click="handleSearch">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn class="mt-3 mr-4" color="primary darken-3" fab dense small @click="handleNew">
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
                item-key="user_id"
                @click:row="handleEdit"
                @update:page="loadList"
              >
                <template v-slot:item.avator="">
                  <v-avatar class="ma-2">
                    <img src="/static/avatar/default.png" alt="avatar" />
                  </v-avatar>
                </template>
                <template v-slot:item.role_cnt="{ item }">
                  <v-chip :color="getColorByRoleCnt(item.role_cnt)" dark>{{ item.role_cnt }}</v-chip>
                </template>
                <template v-slot:item.updated_at="{ item }">
                  <v-chip>{{ item.updated_at | formatTime }}</v-chip>
                </template>
                <template v-slot:item.action="{ item }">
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
          <v-icon large>mdi-account-multiple</v-icon>
          <span class="mx-4 headline">User</span>
          <v-spacer />
          <template v-if="userForm.clickNew">
            <v-btn text outlined @click="userDialog = true">
              Select user
            </v-btn>
            <user
              :userDialog="userDialog"
              @handleUserDialogResponse="handleUserDialogResponse"
            />
          </template>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="userModel.user_id"
            :label="userForm.user_id.label"
            :placeholder="userForm.user_id.placeholder"
            filled disabled
          ></v-text-field>
          <v-text-field
            v-model="userModel.name"
            :counter="64"
            :rules="userForm.name.validator"
            :label="userForm.name.label"
            :placeholder="userForm.name.placeholder"
            filled disabled
          ></v-text-field>
          <!-- Role List -->
          <div v-show="userModel.user_id">
            <v-toolbar flat color="white" v-show="userModel.user_id">
              <v-toolbar-title class="grey--text text--darken-4">
                <v-icon large>mdi-alpha-r-circle</v-icon>
                <span class="mx-4">Role</span>
              </v-toolbar-title>
              <v-text-field text solo flat
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
              :headers="roleTable.headers"
              :footer-props="roleTable.footer"
              :items="roleTable.items"
              :options.sync="roleTable.options"
              :loading="loading"
              locale="ja-jp"
              loading-text="読込中"
              no-data-text="データがありません。"
              class="elevation-1"
              item-key="role_id"
              show-select
            >
              <template v-slot:item.action_ptn="{ item }">
                <v-card
                  label outliend
                  elevation="0"
                  color="red lighten-5"
                  class="my-1"
                >
                  <v-card-text class="font-weight-bold">
                    {{ item.action_ptn }}
                  </v-card-text>
                </v-card>
              </template>
              <template v-slot:item.resource_ptn="{ item }">
                <v-card
                  label outliend
                  elevation="0"
                  color="red lighten-5"
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
              <v-btn text outlined color="green darken-1" :loading="loading" @click="handleEditSubmit">
                Edit
              </v-btn>
            </v-card-actions>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
import User from '@/component/widget/list/User'

export default {
  mixins: [mixin],
  components: {
    BottomSnackBar,
    User,
  },
  data() {
    return {
      loading: false,
      searchModel: { userName: null },
      searchForm: {
        userName: { label: 'User Name', placeholder: 'Filter for user name' },
      },
      userForm: {
        clickNew: false,
        user_id: { label: 'ID', placeholder: '-' },
        name: { label: 'Name', placeholder: '-'},
      },

      userNameList: [],
      userModel: { user_id:'', name:'', role_cnt:0, roles:'', updated_at:'' },
      table: {
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: false, value: 'user_id' },
          { text: 'Name', align: 'start', sortable: false, value: 'name' },
          { text: 'Roles', align: 'center', sortable: false, value: 'role_cnt' },
          { text: 'Updated', align: 'center', sortable: false, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['user_id'] },
        actions: [
          { text: 'Edit Item',  icon: 'mdi-pencil', click: this.handleEdit },
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
      users: [],
      deleteDialog: false,
      editDialog: false,
      userDialog: false,
      roleTable: {
        selected: [],
        search: '',
        headers: [
          { text: 'ID',  align: 'start', sortable: true, value: 'role_id' },
          { text: 'Name', align: 'start', sortable: true, value: 'name' },
        ],
        options: { page: 1, itemsPerPage: 5, sortBy: ['role_id'] },
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
        '/iam/list-user/?activated=true&project_id=' + this.$store.state.project.project_id + searchCond
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.user_id ) {
        this.clearList()
        return false
      }
      this.table.total = list.data.user_id.length
      this.users = list.data.user_id
      this.loadList()
    },
    async loadList() {
      this.loading = true
      var items = []
      var userNames = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.users.slice(from, to)
      ids.forEach( async id => {
        const res = await this.$axios.get('/iam/get-user/?project_id='+ this.$store.state.project.project_id +'&user_id=' + id).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const roles = await this.$axios.get('/iam/list-role/?project_id='+ this.$store.state.project.project_id +'&user_id=' + id).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const item = {
          user_id:    res.data.data.user.user_id,
          name:       res.data.data.user.name,
          updated_at: res.data.data.user.updated_at,
          role_cnt:   roles.data.data.role_id ? roles.data.data.role_id.length : 0,
          roles:      roles.data.data.role_id ? roles.data.data.role_id : [],
        }
        items.push(item)
        userNames.push(item.name)
      })
      this.table.items = items
      this.userNameList = userNames
      this.loading = false
    },
    clearList() {
      this.users = []
      this.table.total = 0
      this.table.items = []
      this.userNameList = []
    },
    async loadRoleList() {
      this.loading = true
      this.clearRoleList()
      const res = await this.$axios.get(
        '/iam/list-role/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.role_id ) {
        return false
      }

      list.data.role_id.forEach( async id => {
        const res = await this.$axios.get(
          '/iam/get-role/?project_id='+ this.$store.state.project.project_id +'&role_id=' + id
        ).catch((err) =>  {
          return Promise.reject(err)
        })
        const r = res.data.data.role
        this.roleTable.items.push(r)

        if (this.userModel.roles.indexOf(r.role_id) !== -1 ){
          this.roleTable.selected.push(r)
        }
      })
      this.loading = false
    },
    clearRoleList() {
      this.roleTable.items = []
      this.roleTable.selected = []
    },

    getColorByRoleCnt(cnt) {
      if ( cnt < 1  ) {
        return 'grey'
      } else if ( cnt <= 3 ) {
        return 'success'
      } else if ( cnt < 10 ) {
        return 'yellow'
      } else {
        return 'red'
      }
    },

    async putItem() {
      this.loading = true
      // Attach/Detach roles
      this.roleTable.items.forEach( async item => {
        const param = { 
          project_id: this.$store.state.project.project_id,
          user_id: this.userModel.user_id,
          role_id: item.role_id,
        }
        var uri = '/iam/detach-role/'
        this.roleTable.selected.some( selected => {
          if(item.role_id === selected.role_id){
            uri = '/iam/attach-role/'
            return true
          }
        })
        await this.$axios.post(uri, param).catch((err) =>  {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        })
      })

      this.finishUpdated('Success: Updated role.')
    },
    async finishUpdated(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.editDialog  = false
      this.handleSearch()
    },

    handleUserDialogResponse(user) {
      this.userModel = user
      this.userDialog = false
    },
    handleNew() {
      this.userForm.clickNew = true
      this.userModel = { user_id:'', name:'', role_cnt:0, roles:'', updated_at:'' }
      this.loadRoleList()
      this.editDialog  = true
    },
    handleEdit(item) {
      this.userForm.clickNew = false
      this.assignDataModel(item)
      this.loadRoleList()
      this.editDialog  = true
    },
    handleEditSubmit() {
      if( this.roleTable.selected.length < 1 ) {
        this.$refs.snackbar.notifyError('Error: Select one or more roles.')
        return false
      }
      this.putItem()
    },
    handleSearch() {
      var searchCond = ''
      if (this.searchModel.userName) {
        searchCond += '&name=' + this.searchModel.userName
      }
      this.refleshList(searchCond)
    },
    assignDataModel(item) {
      this.awsuserModelModel = { user_id:'', name:'', role_cnt:0, roles:'', updated_at:'' }
      this.userModel = Object.assign(this.userModel, item)
    },
  }
}
</script>
