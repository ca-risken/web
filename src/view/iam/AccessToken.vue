<template>
  <div>
    <v-container>
      <page-header
        icon="mdi-shield-key-outline"
        :title="$t(`submenu['AccessToken']`)"
      />
      <search-toolbar
        v-model="searchModel"
        :loading="loading"
        :id-field-items="[]"
        :name-field-items="tokenNameList"
        name-field-key="keyword"
        :show-id-field="false"
        button-size="large"
        create-button-icon="mdi-new-box"
        create-button-color="primary-darken-3"
        :search-form-config="searchToolbarConfig"
        @search="handleSearch"
        @create="handleNewItem"
      />
      <v-row dense>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                :headers="headers"
                :items="table.items"
                :search="searchModel.keyword"
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
                item-key="access_token_id"
                @click:row="handleRowClick"
                @update:page="refleshList"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3" size="48px">
                    <v-icon size="x-large">mdi-alpha-r-circle</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.role_cnt`]="{ item }">
                  <v-chip
                    variant="flat"
                    :color="getColorByCount(item.value.role_cnt)"
                    >{{ item.value.role_cnt }}</v-chip
                  >
                </template>
                <template v-slot:[`item.expired_at`]="{ item }">
                  <v-chip
                    :color="getExpiredAtColor(item.value.expired_at)"
                    :dark="getExpiredAtColor(item.value.expired_at) != ''"
                    >{{ item.value.expired_at }}</v-chip
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
    <v-dialog v-model="editDialog" max-width="60%">
      <v-card>
        <v-card-title>
          <v-icon large>mdi-shield-key-outline</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['AccessToken']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.access_token_id"
              :label="$t(`item['` + form.access_token_id.label + `']`)"
              :placeholder="form.access_token_id.placeholder"
              filled
              disabled
            ></v-text-field>
            <template v-if="form.newToken">
              <v-text-field
                v-model="dataModel.name"
                :counter="64"
                :rules="form.name.validator"
                :label="$t(`item['` + form.name.label + `']`) + ' *'"
                :placeholder="form.name.placeholder"
                required
                variant="outlined"
              ></v-text-field>
            </template>
            <template v-else>
              <v-text-field
                v-model="dataModel.name"
                :counter="64"
                :rules="form.name.validator"
                :label="$t(`item['` + form.name.label + `']`) + ' *'"
                :placeholder="form.name.placeholder"
                filled
                disabled
                variant="outlined"
              ></v-text-field>
            </template>
            <v-text-field
              v-model="dataModel.description"
              :counter="255"
              :rules="form.description.validator"
              :label="$t(`item['` + form.description.label + `']`)"
              :placeholder="form.description.placeholder"
              required
              variant="outlined"
            ></v-text-field>
            <v-menu
              v-model="form.expired_at.datePicker"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-bind="props"
                  outlined
                  clearable
                  v-model="dataModel.expired_at"
                  :placeholder="form.expired_at.placeholder"
                  :label="$t(`item['` + form.expired_at.label + `']`)"
                  show-current
                  bg-color="white"
                ></v-text-field>
              </template>
              <datepicker
                inline
                :enable-time-picker="false"
                v-model="dataModel.expired_at"
                model-type="yyyy-MM-dd"
                :format="datePickerFormat"
                @update:model-value="form.expired_at.datePicker = false"
                :auto-apply="true"
              ></datepicker>
            </v-menu>

            <!-- Role List -->
            <v-toolbar flat color="white">
              <v-toolbar-title class="grey--text text--darken-4">
                <v-icon large>mdi-alpha-r-circle</v-icon>
                <span class="mx-4">
                  {{ $t(`submenu['Role']`) }}
                </span>
              </v-toolbar-title>
              <v-text-field
                density="compact"
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
              <template v-slot:[`item.action_ptn`]="{ item }">
                <v-card
                  label
                  outliend
                  elevation="0"
                  color="teal-lighten-5"
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
                  color="light-green-lighten-5"
                  class="my-1"
                >
                  <v-card-text class="font-weight-bold">
                    {{ item.resource_ptn }}
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>

            <v-container>
              <v-row class="ma-2" v-if="!form.newToken">
                <v-col cols="4">
                  <v-list-item-subtitle>
                    <v-icon left>mdi-clock-outline</v-icon>
                    {{ $t(`item['Created']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title>
                    <v-chip>{{ formatTime(dataModel.created_at) }}</v-chip>
                  </v-list-item-title>
                </v-col>
                <v-col cols="4">
                  <v-list-item-subtitle>
                    <v-icon left>mdi-clock-outline</v-icon>
                    {{ $t(`item['Updated']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title>
                    <v-chip>{{ formatTime(dataModel.updated_at) }}</v-chip>
                  </v-list-item-title>
                </v-col>
                <v-col cols="4">
                  <v-list-item-subtitle>
                    <v-icon left>mdi-account</v-icon>
                    {{ $t(`item['Last Updated User']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title>
                    <v-list-item-subtitle>
                      {{ dataModel.last_updated_user_name }} (
                      {{ dataModel.last_updated_user_id }} )
                    </v-list-item-subtitle>
                  </v-list-item-title>
                </v-col>
              </v-row>
            </v-container>

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
                <template v-if="form.newToken">Regist</template>
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
              {{ dataModel.access_token_id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['ID']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-alpha-r-circle">
            <v-list-item-title>
              {{ dataModel.name }}
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
            :loading="loading"
            color="red-darken-1"
            text
            variant="outlined"
            @click="deleteItem(dataModel.access_token_id)"
          >
            {{ $t(`btn['DELETE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Token Dialog -->
    <v-dialog v-model="tokenDialog" max-width="60%">
      <v-card>
        <v-card-title class="text-h6">
          <span class="mx-4">
            {{
              $t(
                `view.iam['Make sure to copy your access token now. You won’t be able to see it again!']`
              )
            }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-image-text">
            <v-list-item-title>
              {{ dataModel.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Name']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <clip-board
                name="Access Token"
                size="small"
                :text="String(dataModel.token_hash)"
              />
            </template>
            <v-list-item-title>
              <v-card dark color="grey-darken-3" class="ma-4">
                <v-card-text class="font-weight-bold text-wrap">
                  {{ dataModel.token_hash }}
                </v-card-text>
              </v-card>
            </v-list-item-title>
            <v-list-item-subtitle class="ml-7">
              {{ $t(`item['Token']`) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="tokenDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
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
import iam from '@/mixin/api/iam'
import organization_iam from '@/mixin/api/organization_iam'
import organization_helper from '@/mixin/helper/organization_helper'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
import PageHeader from '@/component/widget/toolbar/PageHeader.vue'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
export default {
  name: 'AccessTokenList',
  mixins: [mixin, iam, organization_iam, organization_helper],
  components: {
    BottomSnackBar,
    ClipBoard,
    PageHeader,
    SearchToolbar,
    VDataTable,
    Datepicker,
  },
  data() {
    return {
      loading: false,
      searchModel: { keyword: '' },
      tokenNameList: [],
      searchForm: {
        keyword: {
          label: 'Keyword',
          placeholder: 'Filter for access token',
        },
      },
      now: new Date(),
      form: {
        newToken: false,
        valid: false,
        access_token_id: {
          label: 'ID',
          placeholder: '-',
        },
        name: {
          label: 'Name',
          placeholder: 'something',
          validator: [
            (v) => !!v || 'Name is required',
            (v) =>
              !v || v.length <= 64 || 'Name must be less than 64 characters',
            (v) => !v || !this.duplicatedName(v) || 'Name is duplicated',
          ],
        },
        description: {
          label: 'Description',
          placeholder: 'note',
          validator: [
            (v) =>
              !v ||
              v.length <= 255 ||
              'Description must be less than 255 characters',
          ],
        },
        expired_at: {
          label: 'Expired At',
          placeholder: 'token exipired date',
          validator: [],
          datePicker: false,
        },
      },
      dataModel: {
        access_token_id: '',
        name: '',
        description: '',
        expired_at: '',
        last_updated_user_id: '',
        last_updated_user_name: '',
        created_at: '',
        updated_at: '',
        token_hash: '',
        role_cnt: 0,
        roles: [],
      },
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ['access_token_id'] },
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
    searchToolbarConfig() {
      return {
        idField: this.searchForm.keyword,
        nameField: this.searchForm.keyword,
      }
    },
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
          key: 'access_token_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Roles"]'),
          align: 'center',
          sortable: true,
          key: 'role_cnt',
        },
        {
          title: this.$i18n.t('item["Expired At"]'),
          align: 'center',
          sortable: true,
          key: 'expired_at',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: true,
          key: 'updated_at',
        },
        {
          title: this.$i18n.t('item["Last Updated User"]'),
          align: 'center',
          sortable: true,
          key: 'last_updated_user_name',
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
          value: 'role_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          key: 'name',
        },
      ]
    },
    isOrganizationMode() {
      return this.$route.path.startsWith('/organization-iam')
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      this.loading = true
      this.clearList()
      const query = searchCond || ''
      let tokens
      if (this.isOrganizationMode) {
        tokens = await this.listOrgAccessTokenAPI(query).catch((err) => {
          this.clearList()
          return Promise.reject(err)
        })
      } else {
        tokens = await this.listAccessTokenAPI(query).catch((err) => {
          this.clearList()
          return Promise.reject(err)
        })
      }

      if (!tokens || !tokens.length) {
        this.clearList()
        return
      }
      this.table.total = tokens.length

      for (const token of tokens) {
        let roles
        if (this.isOrganizationMode) {
          roles = await this.listOrganizationRoleAPI(
            '&access_token_id=' + token.access_token_id
          ).catch((err) => {
            this.clearList()
            return Promise.reject(err)
          })
        } else {
          roles = await this.listRoleAPI(
            '&access_token_id=' + token.access_token_id
          ).catch((err) => {
            this.clearList()
            return Promise.reject(err)
          })
        }
        const user = await this.getUserAPI(token.last_updated_user_id).catch(
          (err) => {
            console.log(err)
            return { name: token.last_updated_user_id }
          }
        )

        this.table.items.push({
          access_token_id: token.access_token_id,
          name: token.name,
          description: token.description,
          expired_at: Util.formatDate(
            new Date(token.expired_at * 1000),
            'yyyy-MM-dd'
          ),
          last_updated_user_id: token.last_updated_user_id,
          last_updated_user_name: user.name,
          created_at: token.created_at,
          updated_at: token.updated_at,
          role_cnt: roles.length,
          roles: roles,
        })
      }
      this.tokenNameList = [
        ...new Set(this.table.items.map((item) => item.name)),
      ]
      this.loading = false
    },
    clearList() {
      this.table.total = 0
      this.table.items = []
      this.tokenNameList = []
    },

    async loadRoleList() {
      this.loading = true
      this.clearRoleList()
      let roles
      if (this.isOrganizationMode) {
        roles = await this.listOrganizationRoleAPI('').catch((err) => {
          return Promise.reject(err)
        })
      } else {
        roles = await this.listRoleAPI('').catch((err) => {
          return Promise.reject(err)
        })
      }

      roles.forEach(async (id) => {
        let role
        if (this.isOrganizationMode) {
          role = await this.getOrganizationRoleAPI(id).catch((err) => {
            return Promise.reject(err)
          })
        } else {
          role = await this.getRoleAPI(id).catch((err) => {
            return Promise.reject(err)
          })
        }
        this.roleTable.items.push(role)

        if (this.dataModel.roles.indexOf(role.role_id) !== -1) {
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
      this.loading = true
      const expiredAt = this.convertToUnixTime(this.dataModel.expired_at)
      if (this.isOrganizationMode) {
        await this.upsertOrganizationToken(expiredAt)
      } else {
        await this.upsertProjectToken(expiredAt)
      }
      if (this.roleTable.items.length) {
        for (const item of this.roleTable.items) {
          let attachRole = false
          this.roleTable.selected.some((selected) => {
            if (item.role_id === selected.role_id) {
              attachRole = true
              return true
            }
          })
          if (attachRole) {
            await this.attachRoleToToken(item.role_id)
          } else {
            await this.detachRoleFromToken(item.role_id)
          }
        }
      }
      if (this.form.newToken) {
        await this.finishGenerateToken(this.dataModel.token_hash)
        return
      }
      await this.finishUpdated('Success: Updated token.')
    },
    async upsertProjectToken(expiredAt) {
      const param = {
        project_id: this.getCurrentProjectID(),
        access_token: {
          access_token_id: this.dataModel.access_token_id,
          project_id: this.getCurrentProjectID(),
          name: this.dataModel.name,
          description: this.dataModel.description,
          expired_at: expiredAt,
        },
      }
      if (this.form.newToken) {
        const newToken = await this.generateAccessTokenAPI(param).catch(
          (err) => {
            this.$refs.snackbar.notifyError(err?.response?.data)
            return Promise.reject(err)
          }
        )
        this.dataModel.access_token_id = newToken.access_token_id
        this.dataModel.token_hash = newToken.access_token
      } else {
        await this.updateAccessTokenAPI(param).catch((err) => {
          this.$refs.snackbar.notifyError(err?.response?.data)
          return Promise.reject(err)
        })
      }
    },
    async upsertOrganizationToken(expiredAt) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        access_token_id: this.dataModel.access_token_id,
        name: this.dataModel.name,
        description: this.dataModel.description,
        expired_at: expiredAt,
      }
      if (this.form.newToken) {
        delete param.access_token_id
        const newToken = await this.generateOrgAccessTokenAPI(param).catch(
          (err) => {
            this.$refs.snackbar.notifyError(err?.response?.data)
            return Promise.reject(err)
          }
        )
        this.dataModel.access_token_id = newToken.access_token_id
        this.dataModel.token_hash = newToken.access_token
      } else {
        await this.updateOrgAccessTokenAPI(param).catch((err) => {
          this.$refs.snackbar.notifyError(err?.response?.data)
          return Promise.reject(err)
        })
      }
    },
    async attachRoleToToken(roleID) {
      if (this.isOrganizationMode) {
        return this.attachOrgAccessTokenRoleAPI(
          this.dataModel.access_token_id,
          roleID
        ).catch((err) => {
          this.$refs.snackbar.notifyError(err?.response?.data)
          return Promise.reject(err)
        })
      }
      return this.attachTokenRoleAPI(
        this.dataModel.access_token_id,
        roleID
      ).catch((err) => {
        this.$refs.snackbar.notifyError(err?.response?.data)
        return Promise.reject(err)
      })
    },
    async detachRoleFromToken(roleID) {
      if (this.isOrganizationMode) {
        return this.detachOrgAccessTokenRoleAPI(
          this.dataModel.access_token_id,
          roleID
        ).catch((err) => {
          this.$refs.snackbar.notifyError(err?.response?.data)
          return Promise.reject(err)
        })
      }
      return this.detachTokenRoleAPI(
        this.dataModel.access_token_id,
        roleID
      ).catch((err) => {
        this.$refs.snackbar.notifyError(err?.response?.data)
        return Promise.reject(err)
      })
    },
    async deleteItem(accessTokenID) {
      this.loading = true
      if (this.isOrganizationMode) {
        await this.deleteOrgAccessTokenAPI(accessTokenID).catch((err) => {
          this.$refs.snackbar.notifyError(err?.response?.data)
          return Promise.reject(err)
        })
      } else {
        await this.deleteAccessTokenAPI(accessTokenID).catch((err) => {
          this.$refs.snackbar.notifyError(err?.response?.data)
          return Promise.reject(err)
        })
      }
      await this.finishUpdated('Success: Deleted access token.')
    },
    async finishUpdated(msg) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.deleteDialog = false
      this.editDialog = false
      this.handleSearch()
    },

    async finishGenerateToken(tokenHash) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      this.loading = false
      this.deleteDialog = false
      this.editDialog = false
      this.handleSearch()

      this.dataModel.token_hash = tokenHash
      this.tokenDialog = true
    },

    // validator
    duplicatedName(name) {
      for (const item of this.table.items) {
        if (item.name === name) return true
      }
      return false
    },

    // handler
    handleNewItem() {
      let threeMonthLaater = new Date()
      threeMonthLaater.setDate(threeMonthLaater.getDate() + 90)
      this.dataModel = {
        access_token_id: '',
        name: '',
        description: '',
        expired_at: Util.formatDate(threeMonthLaater, 'yyyy-MM-dd'),
        last_updated_user_id: '',
        last_updated_user_name: '',
        created_at: '',
        updated_at: '',
        token_hash: '',
        role_cnt: 0,
        roles: [],
      }
      this.loadRoleList()
      this.form.newToken = true
      this.editDialog = true
    },
    handleRowClick(event, tokens) {
      this.handleEditItem(tokens.item)
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
    handleSearch() {
      let searchCond = ''
      if (this.searchModel?.keyword) {
        searchCond += '&name=' + this.searchModel.keyword
      }
      this.refleshList(searchCond)
    },
    assignDataModel(item) {
      this.dataModel = {
        access_token_id: '',
        name: '',
        description: '',
        expired_at: '',
        last_updated_user_id: '',
        last_updated_user_name: '',
        created_at: '',
        updated_at: '',
        token_hash: '',
        role_cnt: 0,
        roles: [],
      }
      this.dataModel = Object.assign(this.dataModel, item)
    },
    datePickerFormat(date) {
      return Util.formatDate(date, 'yyyy-MM-dd')
    },
  },
}
</script>
