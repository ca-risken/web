<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-account-clock</v-icon>
              {{ $t(`submenu['User Reservation']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row>
          <v-col offset="11">
            <v-btn
              class="mt-3 mr-4"
              color="primary darken-3"
              fab
              dense
              small
              @click="handleNewItem"
            >
              <v-icon>mdi-new-box</v-icon>
            </v-btn>
          </v-col>
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
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="reserved_id"
                @click:row="handleEditItem"
                @update:page="refleshList"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3">
                    <v-icon large>mdi-account-clock</v-icon>
                  </v-avatar>
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
      <v-row>
        <v-col>
          <div
            class="text-h5"
            v-text="$t(`view.iam['About User Reservation']`)"
          ></div>
          <div
            style="white-space: pre-line"
            v-text="$t(`view.iam['User Reservation Description']`)"
          ></div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="60%">
      <v-card>
        <v-card-title>
          <v-icon large>mdi-account-clock</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['User Reservation']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.reserved_id"
              :label="$t(`item['` + form.reserved_id.label + `']`)"
              :placeholder="form.reserved_id.placeholder"
              filled
              disabled
            ></v-text-field>
            <v-text-field
              v-model="dataModel.user_idp_key"
              :counter="256"
              :rules="form.user_idp_key.validator"
              :label="$t(`item['` + form.user_idp_key.label + `']`) + ' *'"
              :placeholder="form.user_idp_key.placeholder"
              required
              outlined
            ></v-text-field>

            <!-- Role List -->
            <v-toolbar flat color="white">
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
              single-select
            >
            </v-data-table>

            <v-divider class="mt-3 mb-3"></v-divider>
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
                @click="putItem"
              >
                <template v-if="form.isNew">
                  {{ $t(`btn['RESERVE']`) }}
                </template>
                <template v-else>Edit</template>
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar
              ><v-icon>mdi-identifier</v-icon></v-list-item-avatar
            >
            <v-list-item-content>
              <v-list-item-title
                v-text="dataModel.reserved_id"
              ></v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['ID']`) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-alpha-r-circle</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                v-text="dataModel.role_name"
              ></v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Roles']`) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            outlined
            color="grey darken-1"
            @click="deleteDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            :loading="loading"
            color="red darken-1"
            text
            outlined
            @click="deleteItem(dataModel.reserved_id)"
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
import iam from '@/mixin/api/iam'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  mixins: [mixin, iam],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      now: new Date(),
      form: {
        isNew: false,
        valid: false,
        reserved_id: {
          label: 'ID',
          placeholder: '-',
        },
        role_id: {
          label: 'Roles',
          placeholder: '',
          validator: [(v) => !!v || 'RoleID is required'],
        },
        user_idp_key: {
          label: 'User Key',
          placeholder: 'user key',
          validator: [
            (v) =>
              !v ||
              v.length <= 255 ||
              'User Key must be less than 255 characters',
          ],
        },
      },
      dataModel: {
        reserved_id: '',
        role_id: '',
        user_idp_key: '',
        created_at: '',
        updated_at: '',
      },
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['reserved_id'] },
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
          disableItemsPerPage: true,
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      deleteDialog: false,
      editDialog: false,
      tokenDialog: false,
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
          text: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          value: 'reserved_id',
        },
        {
          text: this.$i18n.t('item["User Key"]'),
          align: 'start',
          sortable: true,
          value: 'user_idp_key',
        },
        {
          text: this.$i18n.t('item["Roles"]'),
          align: 'center',
          sortable: true,
          value: 'role_name',
        },
        {
          text: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: true,
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
    this.refleshList()
  },
  methods: {
    async refleshList() {
      this.loading = true
      this.clearList()
      const userReserveds = await this.listUserReservedAPI().catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      if (!userReserveds) {
        this.clearList()
        return false
      }
      this.table.total = userReserveds.length
      userReserveds.forEach(async (userReserved) => {
        const role = await this.getRoleAPI(userReserved.role_id).catch(
          (err) => {
            return Promise.reject(err)
          }
        )
        const item = {
          reserved_id: userReserved.reserved_id,
          role_id: userReserved.role_id,
          role_name: role.name,
          user_idp_key: userReserved.user_idp_key,
          created_at: userReserved.created_at,
          updated_at: userReserved.updated_at,
        }
        this.table.items.push(item)
      })
      this.loading = false
    },
    clearList() {
      this.table.total = 0
      this.table.items = []
      this.accessTokens = []
      this.tokenNameList = []
    },

    async loadRoleList() {
      this.loading = true
      this.clearRoleList()
      const roles = await this.listRoleAPI('').catch((err) => {
        this.loading = false
        return Promise.reject(err)
      })

      roles.forEach(async (id) => {
        const role = await this.getRoleAPI(id).catch((err) => {
          this.loading = false
          return Promise.reject(err)
        })
        this.roleTable.items.push(role)

        if (this.dataModel.role_id == role.role_id) {
          this.roleTable.selected.push(role)
        }
      })
      this.loading = false
    },
    clearRoleList() {
      this.roleTable.items = []
      this.roleTable.selected = []
    },
    convertToUnixTime(timeString) {
      let date = new Date(timeString)
      date.setHours(23, 59, 59)
      return Math.floor(date.getTime() / 1000)
    },
    getExpiredAtColor(timeString) {
      const expiredAt = new Date(timeString)
      if (expiredAt.getTime() <= this.now.getTime()) {
        return 'red'
      }
      return ''
    },
    async putItem() {
      if (this.roleTable.selected.length == 0) {
        this.$refs.snackbar.notifyError('role: must be selected.')
        return
      }

      this.loading = true
      const param = {
        project_id: this.$store.state.project.project_id,
        user_reserved: {
          reserved_id: this.dataModel.reserved_id,
          role_id: this.roleTable.selected[0].role_id,
          user_idp_key: this.dataModel.user_idp_key,
        },
      }

      await this.putUserReservedAPI(param).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        this.loading = false
        return Promise.reject(err)
      })
      this.finishUpdated('Success: Updated role.')
    },
    async deleteItem(reservedID) {
      this.loading = true
      await this.deleteUserReservedAPI(reservedID).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finishUpdated('Success: Deleted user reservation.')
    },
    async finishUpdated(msg) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.deleteDialog = false
      this.editDialog = false
      this.refleshList()
    },

    // handler
    handleNewItem() {
      this.dataModel = {
        reserved_id: '',
        role_id: '',
        user_idp_key: '',
        created_at: '',
        updated_at: '',
      }
      this.loadRoleList()
      this.form.isNew = true
      this.editDialog = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.loadRoleList()
      this.form.newToken = false
      this.editDialog = true
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    assignDataModel(item) {
      this.dataModel = {
        reserved_id: '',
        role_id: '',
        user_idp_key: '',
      }
      this.dataModel = Object.assign(this.dataModel, item)
    },
  },
}
</script>
