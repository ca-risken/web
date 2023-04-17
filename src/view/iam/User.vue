<template>
  <div>
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
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="8" sm="4" md="4">
            <v-combobox
              outlined
              dense
              clearable
              background-color="white"
              :label="$t(`item['User']`)"
              :placeholder="searchForm.userName.placeholder"
              :items="userNameList"
              v-model="searchModel.userName"
            />
          </v-col>
          <v-spacer />
          <v-btn
            class="mt-3 mr-4"
            fab
            dense
            small
            :loading="loading"
            @click="handleSearch"
          >
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn
            class="mt-3 mr-4"
            color="primary darken-3"
            fab
            dense
            small
            @click="handleNew"
          >
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
                :headers="headers"
                :items="table.items"
                :options.sync="table.options"
                :server-items-length="table.total"
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="user_id"
                @click:row="handleEdit"
                @update:page="loadList"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-2">
                    <img src="/static/avatar/default.png" alt="avatar" />
                  </v-avatar>
                </template>
                <template v-slot:[`item.role_cnt`]="{ item }">
                  <v-chip :color="getColorByCount(item.role_cnt)" dark>{{
                    item.role_cnt
                  }}</v-chip>
                </template>
                <template v-slot:[`item.reserved`]="{ item }">
                  <v-icon v-if="!item.reserved" color="success"
                    >mdi-check-circle</v-icon
                  >
                  <v-chip v-else color="grey lighten-1" dark>{{
                    $t("item['Reserved']")
                  }}</v-chip>
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
                        @click="action.click(item)"
                      >
                        <v-list-item-icon class="mr-2">
                          <v-icon small>{{ action.icon }}</v-icon>
                        </v-list-item-icon>
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
    <v-dialog v-model="editDialog" max-width="40%">
      <v-card>
        <v-card-title>
          <v-icon large>mdi-account-multiple</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['User']`) }}
          </span>
          <v-spacer />
          <template v-if="userForm.clickNew">
            <v-btn
              outlined
              color="primary darken-3"
              dark
              @click="userDialog = true"
            >
              Invite New User
            </v-btn>
            <user
              :userDialog="userDialog"
              @handleUserDialogResponse="handleUserDialogResponse"
            />
          </template>
        </v-card-title>
        <v-card-text>
          <v-row no-gutters>
            <v-col v-show="!userModel.reserved">
              <v-text-field
                v-model="userModel.user_id"
                :label="$t(`item['` + userForm.user_id.label + `']`)"
                :placeholder="userForm.user_id.placeholder"
                filled
                disabled
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters v-if="!userModel.reserved">
            <v-col>
              <v-text-field
                v-model="userModel.name"
                :counter="64"
                :rules="userForm.name.validator"
                :label="$t(`item['` + userForm.name.label + `']`) + ' *'"
                :placeholder="userForm.name.placeholder"
                filled
                disabled
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <v-text-field
                v-model="userModel.user_idp_key"
                :counter="255"
                :rules="userForm.user_idp_key.validator"
                :label="
                  $t(`item['` + userForm.user_idp_key.label + `']`) + ' *'
                "
                :placeholder="userForm.user_idp_key.placeholder"
                filled
                disabled
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <!-- Role List -->
          <div v-show="userModel.user_idp_key">
            <v-toolbar flat color="white" v-show="userModel.user_idp_key">
              <v-toolbar-title class="grey--text text--darken-4">
                <v-icon large>mdi-alpha-r-circle</v-icon>
                <span class="mx-4">
                  {{ $t(`submenu['Role']`) }}
                </span>
              </v-toolbar-title>
              <v-text-field
                text
                solo
                flat
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
              :footer-props="roleTable.footer"
              :items="roleTable.items"
              :options.sync="roleTable.options"
              :loading="loading"
              locale="ja-jp"
              loading-text="Loading..."
              no-data-text="No data."
              class="elevation-1"
              item-key="role_id"
              show-select
            >
              <template v-slot:[`item.action_ptn`]="{ item }">
                <v-card
                  label
                  outliend
                  elevation="0"
                  color="red lighten-5"
                  class="my-1"
                >
                  <v-card-text class="font-weight-bold">
                    {{ item.action_ptn }}
                  </v-card-text>
                </v-card>
              </template>
              <template v-slot:[`item.resource_ptn`]="{ item }">
                <v-card
                  label
                  outliend
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
            <v-alert
              v-if="roleTable.selected.length == 0"
              dense
              outlined
              type="error"
            >
              {{
                $t(
                  `view.iam['Please select one or more roles. If you do not select any role, the user will be ']`
                )
              }}
              <strong>{{ $t(`view.iam['removed']`) }}</strong>
              {{ $t(`view.iam['from the project.']`) }}
              <!-- The selected user will be <strong>removed</strong> from the project, if you do not select any <strong>role</strong>,  -->
            </v-alert>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                outlined
                color="grey darken-1"
                @click="editDialog = false"
              >
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                text
                outlined
                color="green darken-1"
                :loading="loading"
                @click="handleEditSubmit"
              >
                {{ $t(`btn['EDIT']`) }}
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
import mixin from '@/mixin'
import iam from '@/mixin/api/iam'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import User from '@/component/widget/list/User.vue'
export default {
  name: 'UserList',
  mixins: [mixin, iam],
  components: {
    BottomSnackBar,
    User,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        userID: null,
        userName: null,
      },
      searchForm: {
        userID: { label: 'ID', placeholder: 'Filter for user id' },
        userName: { label: 'Name', placeholder: 'Filter for user name' },
      },
      userForm: {
        clickNew: false,
        user_id: { label: 'ID', placeholder: '-' },
        name: { label: 'Name', placeholder: 'Please select user...' },
        user_idp_key: { label: 'User Key' },
      },
      userIDList: [],
      userNameList: [],
      userModel: {
        user_id: '',
        name: '',
        user_idp_key: '',
        role_cnt: 0,
        roles: '',
        reserved: false,
        updated_at: '',
      },
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['user_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEdit },
        ],
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      users: [],
      userReserved: [],
      deleteDialog: false,
      editDialog: false,
      userDialog: false,
      roleTable: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 5, sortBy: ['role_id'] },
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [5],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
    }
  },
  computed: {
    headers() {
      return [
        {
          text: this.$i18n.t('item[""]'),
          align: 'center',
          width: '10%',
          sortable: false,
          value: 'avator',
        },
        {
          text: this.$i18n.t('item["User Key"]'),
          align: 'start',
          sortable: false,
          value: 'user_idp_key',
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          value: 'name',
        },

        {
          text: this.$i18n.t('item["Status"]'),
          align: 'center',
          sortable: false,
          value: 'reserved',
        },
        {
          text: this.$i18n.t('item["Roles"]'),
          align: 'center',
          sortable: false,
          value: 'role_cnt',
        },
        {
          text: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: false,
          value: 'updated_at',
        },
        {
          text: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          value: 'action',
        },
      ]
    },
    roleHeaders() {
      return [
        {
          text: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          value: 'role_id',
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          value: 'name',
        },
      ]
    },
  },
  mounted() {
    this.refleshList('', '')
  },
  methods: {
    async refleshList(userName, userID) {
      let searchCond = '&project_id=' + this.getCurrentProjectID()
      if (userName) {
        searchCond += '&name=' + userName
      }
      if (userID) {
        searchCond += '&user_id=' + userID
      }
      const userIDs = await this.listUserAPI(searchCond).catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      this.userReserved = await this.listUserReserved(userName)
      if (userIDs.length + this.userReserved.length == 0) {
        return
      }
      this.table.total = userIDs.length + this.userReserved.length
      this.users = userIDs
      this.loadList()
    },
    async loadList() {
      this.loading = true
      let items = []
      let userIDs = []
      let userNames = []
      const from =
        (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.users.slice(from, to)
      items = await Promise.all(
        ids.map(async (id) => {
          return await this.getUser(id)
        })
      )
      items.forEach((item) => {
        userIDs.push(item.user_id)
        userNames.push(item.name)
      })
      items = items.concat(
        this.appendUserReserved(this.users.length - items.length, items.length)
      )
      this.table.items = items
      this.userIDList = userIDs
      this.userNameList = userNames
      this.loading = false
    },
    async getUser(id) {
      const user = await this.getUserAPI(id).catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      const roles = await this.listRoleAPI('&user_id=' + id).catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      const item = {
        user_id: user.user_id,
        name: user.name,
        user_idp_key: user.user_idp_key,
        updated_at: user.updated_at,
        role_cnt: roles.length,
        roles: roles,
        reserved: false,
      }
      return item
    },
    appendUserReserved(start, itemLength) {
      const displayRemain = this.table.options.itemsPerPage - itemLength
      if (displayRemain < 0) {
        return []
      }
      const userReserved = this.userReserved.slice(start, displayRemain)
      return userReserved
    },
    async listUserReserved(userIdpKey) {
      var searchCond = ''
      if (userIdpKey) {
        searchCond = '&user_idp_key=' + userIdpKey
      }
      const userReserved = await this.listUserReservedAPI(searchCond)
      let mapUserReserved = {}
      userReserved.forEach((ur) => {
        if (mapUserReserved[ur.user_idp_key]) {
          mapUserReserved[ur.user_idp_key].roles.push(ur.role_id)
          mapUserReserved[ur.user_idp_key].role_cnt =
            mapUserReserved[ur.user_idp_key].roles.length
        } else {
          mapUserReserved[ur.user_idp_key] = {
            name: '-',
            user_idp_key: ur.user_idp_key,
            updated_at: ur.updated_at,
            roles: [ur.role_id],
            role_cnt: 1,
            reserved: true,
          }
        }
      })
      return Object.values(mapUserReserved)
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
      const roles = await this.listRoleAPI('').catch((err) => {
        return Promise.reject(err)
      })
      roles.forEach(async (id) => {
        const role = await this.getRoleAPI(id).catch((err) => {
          return Promise.reject(err)
        })
        this.roleTable.items.push(role)

        if (this.userModel.roles.indexOf(role.role_id) !== -1) {
          this.roleTable.selected.push(role)
        }
      })
      this.loading = false
    },
    clearRoleList() {
      this.roleTable.items = []
      this.roleTable.selected = []
    },

    async putItem() {
      this.loading = true
      if (this.userModel.reserved) {
        await this.putUserReserved()
      } else {
        this.putUserRole()
      }
      this.finishUpdated('Success: Updated role.')
    },
    async putUserRole() {
      // Attach/Detach roles
      this.roleTable.items.forEach(async (item) => {
        let attachRole = false
        this.roleTable.selected.some((selected) => {
          if (item.role_id === selected.role_id) {
            attachRole = true
            return true
          }
        })
        if (attachRole) {
          await this.attachRoleAPI(this.userModel.user_id, item.role_id).catch(
            (err) => {
              this.$refs.snackbar.notifyError(err.response.data)
              return Promise.reject(err)
            }
          )
        } else {
          await this.detachRoleAPI(this.userModel.user_id, item.role_id).catch(
            (err) => {
              this.$refs.snackbar.notifyError(err.response.data)
              return Promise.reject(err)
            }
          )
        }
      })
    },
    async putUserReserved() {
      // Create/Delete User Reserved
      var searchCond = '&user_idp_key=' + this.userModel.user_idp_key
      const registeredUserReserveds = await this.listUserReservedAPI(searchCond)
      this.roleTable.items.forEach(async (item) => {
        let attachRole = false
        this.roleTable.selected.some((selected) => {
          if (item.role_id === selected.role_id) {
            attachRole = true
            return true
          }
        })
        const registered = registeredUserReserveds.find(
          (registered) => registered.role_id === item.role_id
        )
        if (attachRole) {
          // PutUserReserved
          if (registered) {
            return
          }
          const param = {
            project_id: this.getCurrentProjectID(),
            user_reserved: {
              role_id: item.role_id,
              user_idp_key: this.userModel.user_idp_key,
            },
          }
          await this.putUserReservedAPI(param).catch((err) => {
            this.$refs.snackbar.notifyError(err.response.data)
            return Promise.reject(err)
          })
          return
        }
        // deleteUserReserved
        if (!registered) {
          return
        }
        await this.deleteUserReservedAPI(registered.reserved_id).catch(
          (err) => {
            this.$refs.snackbar.notifyError(err.response.data)
            return Promise.reject(err)
          }
        )
      })
    },
    async finishUpdated(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.editDialog = false
      this.handleSearch()
    },

    handleUserDialogResponse(user) {
      this.userModel = user
      this.userDialog = false
    },
    handleNew() {
      this.userForm.clickNew = true
      this.userModel = {
        user_id: '',
        name: '',
        user_idp_key: '',
        role_cnt: 0,
        roles: '',
        reserved: false,
        updated_at: '',
      }
      this.loadRoleList()
      this.editDialog = true
    },
    handleEdit(item) {
      this.userForm.clickNew = false
      this.assignDataModel(item)
      this.loadRoleList()
      this.editDialog = true
    },
    handleEditSubmit() {
      this.putItem()
    },
    handleSearch() {
      this.refleshList(this.searchModel.userName, this.searchModel.userID)
    },
    assignDataModel(item) {
      this.userModel = {
        user_id: '',
        name: '',
        user_idp_key: '',
        role_cnt: 0,
        roles: '',
        reserved: false,
        updated_at: '',
      }
      this.userModel = Object.assign(this.userModel, item)
    },
  },
}
</script>
