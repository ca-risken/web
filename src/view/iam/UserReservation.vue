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
              color="primary-darken-3"
              size="large"
              density="compact"
              @click="handleNewItem"
              icon="mdi-new-box"
            />
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
                item-key="reserved_id"
                @click:row="handleRowClick"
                @update:page="refleshList"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3" size="48px">
                    <v-icon size="x-large">mdi-account-clock</v-icon>
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
          <span class="mx-4 text-h5">
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
              variant="outlined"
            ></v-text-field>

            <!-- Role List -->
            <v-toolbar flat color="white">
              <v-icon large>mdi-alpha-r-circle</v-icon>
              <span class="mx-4">
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
              single-select
            >
            </v-data-table>

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                variant="outlined"
                color="grey-darken-1"
                @click="editDialog = false"
              >
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                text
                variant="outlined"
                color="green-darken-1"
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
        <v-card-title class="text-h5">
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-identifier">
            <v-list-item-title>
              {{ dataModel.reserved_id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['ID']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-alpha-r-circle">
            <v-list-item-title>
              {{ dataModel.role_name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Roles']`) }}
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
            :loading="loading"
            color="red-darken-1"
            text
            variant="outlined"
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
import organization_iam from '@/mixin/api/organization_iam'
import organization_helper from '@/mixin/helper/organization_helper'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'UserReservation',
  mixins: [mixin, iam, organization_iam, organization_helper],
  components: {
    BottomSnackBar,
    VDataTable,
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
        role_id: 0,
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
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
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
          sortable: true,
          key: 'reserved_id',
        },
        {
          title: this.$i18n.t('item["User Key"]'),
          align: 'start',
          sortable: true,
          key: 'user_idp_key',
        },
        {
          title: this.$i18n.t('item["Roles"]'),
          align: 'center',
          sortable: true,
          key: 'role_name',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: true,
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
      let userReserveds
      if (this.isOrganizationMode) {
        userReserveds = await this.listOrganizationUserReservedAPI('').catch(
          (err) => {
            this.clearList()
            return Promise.reject(err)
          }
        )
      } else {
        userReserveds = await this.listUserReservedAPI('').catch((err) => {
          this.clearList()
          return Promise.reject(err)
        })
      }
      if (!userReserveds) {
        this.clearList()
        return false
      }
      this.table.total = userReserveds.length
      userReserveds.forEach(async (userReserved) => {
        let role
        if (this.isOrganizationMode) {
          role = await this.getOrganizationRoleAPI(userReserved.role_id).catch(
            (err) => {
              return Promise.reject(err)
            }
          )
        } else {
          role = await this.getRoleAPI(userReserved.role_id).catch((err) => {
            return Promise.reject(err)
          })
        }
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
      let roles
      if (this.isOrganizationMode) {
        roles = await this.listOrganizationRoleAPI('').catch((err) => {
          this.loading = false
          return Promise.reject(err)
        })
      } else {
        roles = await this.listRoleAPI('').catch((err) => {
          this.loading = false
          return Promise.reject(err)
        })
      }

      roles.forEach(async (id) => {
        let role
        if (this.isOrganizationMode) {
          role = await this.getOrganizationRoleAPI(id).catch((err) => {
            this.loading = false
            return Promise.reject(err)
          })
        } else {
          role = await this.getRoleAPI(id).catch((err) => {
            this.loading = false
            return Promise.reject(err)
          })
        }
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
      if (this.isOrganizationMode) {
        await this.putOrganizationUserReservedAPI(
          this.dataModel.reserved_id,
          this.dataModel.user_idp_key,
          this.roleTable.selected[0].role_id
        ).catch((err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          this.loading = false
          return Promise.reject(err)
        })
      } else {
        const param = {
          project_id: this.getCurrentProjectID(),
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
      }
      this.finishUpdated('Success: Updated role.')
    },
    async deleteItem(reservedID) {
      this.loading = true
      if (this.isOrganizationMode) {
        await this.deleteOrganizationUserReservationAPI(reservedID).catch(
          (err) => {
            this.$refs.snackbar.notifyError(err.response.data)
            return Promise.reject(err)
          }
        )
      } else {
        await this.deleteUserReservedAPI(reservedID).catch((err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        })
      }
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
        role_id: 0,
        user_idp_key: '',
        created_at: '',
        updated_at: '',
      }
      this.loadRoleList()
      this.form.isNew = true
      this.editDialog = true
    },
    handleRowClick(event, reserves) {
      this.handleEditItem(reserves.item)
    },
    handleEditItem(item) {
      this.assignDataModel(item.value)
      this.loadRoleList()
      this.form.newToken = false
      this.editDialog = true
    },
    handleDeleteItem(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true
    },
    assignDataModel(item) {
      this.dataModel = {
        role_id: 0,
        user_idp_key: '',
      }
      this.dataModel = Object.assign(this.dataModel, item)
    },
  },
}
</script>
