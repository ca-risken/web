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
      <entity-search-form
        v-model="searchModel"
        :loading="loading"
        :id-field-items="userIDList"
        :name-field-items="userNameList"
        id-field-key="userID"
        name-field-key="userName"
        :show-id-field="true"
        :show-create-button="true"
        button-size="default"
        create-button-icon="mdi-new-box"
        :search-form-config="{
          idField: searchForm.userID,
          nameField: searchForm.userName,
        }"
        @search="handleSearch"
        @create="handleNew"
      />
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

    <!-- Invite User Dialog -->
    <v-dialog v-model="inviteUserDialog" max-width="40%">
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
                @click="inviteUserDialog = false"
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

    <!-- Disable Admin Dialog -->
    <v-dialog v-model="disableAdminDialog" max-width="40%">
      <v-card>
        <v-card-title>
          <span class="mx-4 text-h5">
            {{ $t(`message['Do you want to disable admin?']`) }}
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
            @click="disableAdminDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="red-darken-1"
            :loading="loading"
            @click="handleDisableAdminSubmit"
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
import EntitySearchForm from '@/component/dialog/EntitySearchForm.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

const ADMIN_STATUS = {
  ENABLED: true,
  DISABLED: false,
}

export default {
  name: 'AdminUser',
  mixins: [mixin, iam],
  components: {
    BottomSnackBar,
    UserList,
    EntitySearchForm,
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
        options: {
          page: 1,
          itemsPerPage: 10,
          sortBy: [{ key: 'user_id', order: 'asc' }],
        },
        actions: [
          {
            text: 'Disable Admin',
            icon: 'mdi-delete',
            click: this.handleDisableAdmin,
          },
        ],
        total: 0,
        footer: {
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      users: [],
      disableAdminDialog: false,
      inviteUserDialog: false,
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

      // Sort items by user_id in ascending order
      items.sort((a, b) => {
        if (a.user_id < b.user_id) return -1
        if (a.user_id > b.user_id) return 1
        return 0
      })

      this.table.items = items
      this.userIDList = userIDs.sort()
      this.userNameList = userNames.sort()
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
      this.disableAdminDialog = false
      this.inviteUserDialog = false
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
      this.inviteUserDialog = true
    },
    handleEdit(item) {
      this.userForm.clickNew = false
      this.assignDataModel(item.value)
      this.loadRoleList()
      this.inviteUserDialog = true
    },
    handleEditSubmit() {
      this.putItem(ADMIN_STATUS.ENABLED)
    },
    handleDisableAdmin(item) {
      this.assignDataModel(item.value)
      this.disableAdminDialog = true
    },
    async handleDisableAdminSubmit() {
      this.putItem(ADMIN_STATUS.DISABLED)
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
