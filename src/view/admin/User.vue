<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-menu-open</v-icon>
              {{ $t(`submenu['Admin User']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="4" sm="3" md="3">
            <v-combobox
              variant="outlined"
              density="compact"
              clearable
              bg-color="white"
              :label="$t(`item['` + searchForm.userID.label + `']`)"
              :placeholder="searchForm.userID.placeholder"
              :items="userIDList"
              v-model="searchModel.userID"
            />
          </v-col>
          <v-col cols="8" sm="4" md="4">
            <v-combobox
              variant="outlined"
              density="compact"
              clearable
              bg-color="white"
              :label="$t(`item['` + searchForm.userName.label + `']`)"
              :placeholder="searchForm.userName.placeholder"
              :items="userNameList"
              v-model="searchModel.userName"
            />
          </v-col>
          <v-spacer />
          <v-btn
            class="mt-3 mr-4"
            density="compact"
            :loading="loading"
            @click="handleSearch"
            icon="mdi-magnify"
          />
          <v-btn
            class="mt-3 mr-4"
            color="primary-darken-3"
            density="compact"
            @click="handleNew"
            icon="mdi-new-box"
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
                :items="table.items"
                v-model:options="table.options"
                :items-length="table.total"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :showCurrentPage="table.footer.showCurrentPage"
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="user_id"
                @click:row="handleRowClick"
                @update:options="updateOptions"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-2">
                    <v-img src="/static/avatar/default.png" alt="avatar" />
                  </v-avatar>
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
                        <v-list-item-title>
                          {{ $t(`action['` + action.text + `']`) }}
                        </v-list-item-title>
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
    <v-dialog v-model="editDialog" max-width="40%">
      <v-card>
        <v-card-title>
          <v-icon large>mdi-account-multiple</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['User']`) }}
          </span>
          <v-spacer />
          <template v-if="userForm.clickNew">
            <v-btn
              variant="outlined"
              color="primary-darken-3"
              dark
              @click="userDialog = true"
            >
              Invite New User
            </v-btn>
            <user-list
              :userDialog="userDialog"
              @handleUserDialogResponse="handleUserDialogResponse"
            />
          </template>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="userModel.user_id"
            :label="$t(`item['` + userForm.user_id.label + `']`)"
            :placeholder="userForm.user_id.placeholder"
            filled
            disabled
          ></v-text-field>
          <v-text-field
            v-model="userModel.name"
            :counter="64"
            :rules="userForm.name.validator"
            :label="$t(`item['` + userForm.name.label + `']`) + ' *'"
            :placeholder="userForm.name.placeholder"
            filled
            disabled
          ></v-text-field>
          <div v-show="userModel.user_id">
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
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Disable Dialog -->
    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title>
          <span class="mx-4 text-h5">
            {{ $t(`message['Do you want to disable system admin?']`) }}
          </span>
        </v-card-title>

        <v-list two-line>
          <v-list-item prepend-icon="mdi-identifier">
            <v-list-item-title>
              {{ userModel.user_id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['ID']`) }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ userModel.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Name']`) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="disableDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="red-darken-1"
            :loading="loading"
            @click="handleDisableSubmit"
          >
            {{ $t(`btn['DISABLE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import iam from '@/mixin/api/iam'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import UserList from '@/component/widget/list/UserList.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
export default {
  name: 'AdminUser',
  mixins: [mixin, iam],
  components: {
    BottomSnackBar,
    UserList,
    VDataTableServer,
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
      },
      userIDList: [],
      userNameList: [],
      userModel: {
        user_id: '',
        name: '',
        updated_at: '',
      },
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['user_id'] },
        actions: [
          { text: 'Disable', icon: 'mdi-delete', click: this.handleDisable },
        ],
        total: 0,
        footer: {
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      users: [],
      deleteDialog: false,
      editDialog: false,
      userDialog: false,
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
          key: 'user_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
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
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      searchCond = '&admin=true' + searchCond
      const userIDs = await this.listUserAPI(searchCond).catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      if (!userIDs) {
        this.clearList()
        return false
      }
      this.table.total = userIDs.length
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
      await Promise.all(
        ids.map(async (id) => {
          const user = await this.getUserAPI(id).catch((err) => {
            this.clearList()
            return Promise.reject(err)
          })
          const item = {
            user_id: user.user_id,
            name: user.name,
            updated_at: user.updated_at,
          }
          items.push(item)
          userIDs.push(item.user_id)
          userNames.push(item.name)
        })
      )
      this.table.items = items
      this.userIDList = userIDs
      this.userNameList = userNames
      this.loading = false
    },
    clearList() {
      this.users = []
      this.table.total = 0
      this.table.items = []
      this.userNameList = []
    },

    async putItem(is_admin) {
      this.loading = true
      await this.updateUserAdminAPI(this.userModel.user_id, is_admin).catch(
        (err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        }
      )
      this.finishUpdated('Success: Updated role.')
    },
    async finishUpdated(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.deleteDialog = false
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
        updated_at: '',
      }
      this.editDialog = true
    },
    handleEdit(item) {
      this.userForm.clickNew = false
      this.assignDataModel(item.value)
      this.loadRoleList()
      this.editDialog = true
    },
    handleEditSubmit() {
      this.putItem(true)
    },
    handleDelete(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true    
    },
    async handleDeleteSubmit() {
      this.putItem(false)
    },
    handleSearch() {
      let searchCond = ''
      if (this.searchModel.userName) {
        searchCond += '&name=' + this.searchModel.userName
      }
      if (this.searchModel.userID) {
        searchCond += '&user_id=' + this.searchModel.userID
      }

      this.refleshList(searchCond)
    },
    updateOptions(options) {
      this.table.options.page = options.page
      this.refleshList('')
    },
    assignDataModel(item) {
      this.userModel = {
        user_id: item.user_id || '',
        name: item.name || '',
        updated_at: item.updated_at || '',
      }
      this.userModel = Object.assign(this.userModel, item)
    },
  },
}
</script>
