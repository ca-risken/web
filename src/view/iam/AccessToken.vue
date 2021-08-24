<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-shield-key-outline</v-icon>
              {{ $t(`submenu['AccessToken']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              outlined
              dense
              clearable
              background-color="white"
              :label="$t(`item['` + searchForm.keyword.label + `']`)"
              :placeholder="searchForm.keyword.placeholder"
              v-model="searchModel.keyword"
            />
          </v-col>

          <v-spacer />
          <v-btn class="mt-3 mr-4" fab dense small @click="handleSearch">
            <v-icon>search</v-icon>
          </v-btn>
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
                :search="searchModel.keyword"
                :options.sync="table.options"
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="access_token_id"
                @click:row="handleEditItem"
                @update:page="refleshList"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-3">
                    <v-icon large>mdi-alpha-r-circle</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.role_cnt`]="{ item }">
                  <v-chip :color="getColorByCount(item.role_cnt)" dark>{{
                    item.role_cnt
                  }}</v-chip>
                </template>
                <template v-slot:[`item.expired_at`]="{ item }">
                  <v-chip
                    :color="getExpiredAtColor(item.expired_at)"
                    :dark="getExpiredAtColor(item.expired_at) != ''"
                    >{{ item.expired_at }}</v-chip
                  >
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
    <v-dialog v-model="editDialog" max-width="70%">
      <v-card>
        <v-card-title>
          <v-icon large>mdi-shield-key-outline</v-icon>
          <span class="mx-4 headline">
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
                outlined
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
                outlined
              ></v-text-field>
            </template>
            <v-text-field
              v-model="dataModel.description"
              :counter="255"
              :rules="form.description.validator"
              :label="$t(`item['` + form.description.label + `']`)"
              :placeholder="form.description.placeholder"
              required
              outlined
            ></v-text-field>
            <v-menu
              v-model="form.expired_at.datePicker"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  outlined
                  clearable
                  v-model="dataModel.expired_at"
                  :placeholder="form.expired_at.placeholder"
                  :label="$t(`item['` + form.expired_at.label + `']`)"
                  show-current
                  background-color="white"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dataModel.expired_at"
                @input="form.expired_at.datePicker = false"
              ></v-date-picker>
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
                  label
                  outliend
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

            <v-container>
              <v-row class="ma-2">
                <v-col cols="4">
                  <v-list-item-subtitle>
                    <v-icon left>mdi-clock-outline</v-icon>
                    {{ $t(`item['Created']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title>
                    <v-chip>{{ dataModel.created_at | formatTime }}</v-chip>
                  </v-list-item-title>
                </v-col>
                <v-col cols="4">
                  <v-list-item-subtitle>
                    <v-icon left>mdi-clock-outline</v-icon>
                    {{ $t(`item['Updated']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title>
                    <v-chip>{{ dataModel.updated_at | formatTime }}</v-chip>
                  </v-list-item-title>
                </v-col>
                <v-col cols="4" v-if="dataModel.last_updated_user_id">
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
                v-text="dataModel.access_token_id"
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
              <v-list-item-title v-text="dataModel.name"></v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Name']`) }}
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
          <v-list-item>
            <v-list-item-avatar>
              <clip-board
                name="Access Token"
                :text="String(dataModel.token_hash)"
              />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="text-body-2">
                <v-card dark color="grey darken-3" class="ma-4">
                  <v-card-text
                    class="font-weight-bold"
                    style="text-overflow: clip; word-break: break-all"
                  >
                    {{ dataModel.token_hash }}
                  </v-card-text>
                </v-card>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Token']`) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-image-text</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="dataModel.name" />
              <v-list-item-subtitle>
                {{ $t(`item['Name']`) }}
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
        </v-card-actions>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from "@/util"
import mixin from "@/mixin"
import iam from "@/mixin/api/iam"
import BottomSnackBar from "@/component/widget/snackbar/BottomSnackBar"
import ClipBoard from "@/component/widget/clipboard/ClipBoard.vue"
export default {
  mixins: [mixin, iam],
  components: {
    BottomSnackBar,
    ClipBoard,
  },
  data() {
    return {
      loading: false,
      searchModel: { keyword: "" },
      searchForm: {
        keyword: {
          label: "Keyword",
          placeholder: "Filter for access token",
        },
      },
      now: new Date(),
      form: {
        newToken: false,
        valid: false,
        access_token_id: {
          label: "ID",
          placeholder: "-",
        },
        name: {
          label: "Name",
          placeholder: "something",
          validator: [
            (v) => !!v || "Name is required",
            (v) => v.length <= 64 || "Name must be less than 64 characters",
          ],
        },
        description: {
          label: "Description",
          placeholder: "note",
          validator: [
            (v) =>
              !v ||
              v.length <= 255 ||
              "Description must be less than 255 characters",
          ],
        },
        expired_at: {
          label: "Expired At",
          placeholder: "token exipired date",
          validator: [],
          datePicker: false,
        },
      },
      dataModel: {
        access_token_id: "",
        name: "",
        description: "",
        expired_at: "",
        last_updated_user_id: "",
        last_updated_user_name: "",
        created_at: "",
        updated_at: "",
        token_hash: "",
        role_cnt: 0,
        roles: [],
      },
      table: {
        options: { page: 1, itemsPerPage: 10, sortBy: ["access_token_id"] },
        actions: [
          { text: "Edit Item", icon: "mdi-pencil", click: this.handleEditItem },
          {
            text: "Delete Item",
            icon: "mdi-trash-can-outline",
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
        search: "",
        options: { page: 1, itemsPerPage: 5, sortBy: ["role_id"] },
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
          align: "center",
          width: "10%",
          sortable: false,
          value: "avator",
        },
        {
          text: this.$i18n.t('item["ID"]'),
          align: "start",
          sortable: true,
          value: "access_token_id",
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: this.$i18n.t('item["Roles"]'),
          align: "center",
          sortable: true,
          value: "role_cnt",
        },
        {
          text: this.$i18n.t('item["Expired At"]'),
          align: "center",
          sortable: true,
          value: "expired_at",
        },
        {
          text: this.$i18n.t('item["Updated"]'),
          align: "center",
          sortable: true,
          value: "updated_at",
        },
        {
          text: this.$i18n.t('item["Last Updated User"]'),
          align: "center",
          sortable: true,
          value: "last_updated_user_name",
        },
        {
          text: this.$i18n.t('item["Action"]'),
          align: "center",
          sortable: false,
          value: "action",
        },
      ]
    },
    roleHeaders() {
      return [
        {
          text: this.$i18n.t('item["ID"]'),
          align: "start",
          sortable: true,
          value: "role_id",
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: "start",
          sortable: true,
          value: "name",
        },
      ]
    },
  },
  mounted() {
    this.refleshList("")
  },
  methods: {
    async refleshList(searchCond) {
      this.loading = true
      this.clearList()
      const tokens = await this.listAccessTokenAPI(searchCond).catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      if (!tokens) {
        this.clearList()
        return false
      }
      this.table.total = tokens.length
      tokens.forEach(async (token) => {
        const roles = await this.listRoleAPI(
          "&access_token_id=" + token.access_token_id
        ).catch((err) => {
          this.clearList()
          return Promise.reject(err)
        })
        const user = await this.getUserAPI(token.last_updated_user_id).catch(
          (err) => {
            console.log(err)
          }
        )

        const item = {
          access_token_id: token.access_token_id,
          name: token.name,
          description: token.description,
          expired_at: Util.formatDate(
            new Date(token.expired_at * 1000),
            "yyyy-MM-dd"
          ),
          last_updated_user_id: token.last_updated_user_id,
          last_updated_user_name: user.name,
          created_at: token.created_at,
          updated_at: token.updated_at,
          role_cnt: roles.length,
          roles: roles,
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
      const roles = await this.listRoleAPI("").catch((err) => {
        return Promise.reject(err)
      })

      roles.forEach(async (id) => {
        const role = await this.getRoleAPI(id).catch((err) => {
          return Promise.reject(err)
        })
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
        return "red"
      }
      return ""
    },
    async putItem() {
      this.loading = true
      const param = {
        project_id: this.$store.state.project.project_id,
        access_token: {
          access_token_id: this.dataModel.access_token_id,
          project_id: this.$store.state.project.project_id,
          name: this.dataModel.name,
          description: this.dataModel.description,
          expired_at: this.convertToUnixTime(this.dataModel.expired_at),

          // server side update.
          // plainTextToken: '',
          // last_updated_user_id: '',
        },
      }
      if (this.form.newToken) {
        const newToken = await this.generateAccessTokenAPI(param).catch(
          (err) => {
            this.$refs.snackbar.notifyError(err.response.data)
            return Promise.reject(err)
          }
        )
        this.dataModel.access_token_id = newToken.access_token_id
        this.dataModel.token_hash = newToken.access_token
      } else {
        await this.updateAccessTokenAPI(param).catch((err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        })
      }

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
          await this.attachTokenRoleAPI(
            this.dataModel.access_token_id,
            item.role_id
          ).catch((err) => {
            this.$refs.snackbar.notifyError(err.response.data)
            return Promise.reject(err)
          })
        } else {
          await this.detachTokenRoleAPI(
            this.dataModel.access_token_id,
            item.role_id
          ).catch((err) => {
            this.$refs.snackbar.notifyError(err.response.data)
            return Promise.reject(err)
          })
        }
      })

      if (this.form.newToken) {
        this.finishGenerateToken(this.dataModel.token_hash)
        return
      }
      this.finishUpdated("Success: Updated role.")
    },
    async deleteItem(accessTokenID) {
      this.loading = true
      await this.deleteAccessTokenAPI(accessTokenID).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finishUpdated("Success: Deleted access token.")
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
    handleNewItem() {
      let threeMonthLaater = new Date()
      threeMonthLaater.setDate(threeMonthLaater.getDate() + 90)
      this.dataModel = {
        access_token_id: "",
        name: "",
        description: "",
        expired_at: Util.formatDate(threeMonthLaater, "yyyy-MM-dd"),
        last_updated_user_id: "",
        last_updated_user_name: "",
        created_at: "",
        updated_at: "",
        role_cnt: 0,
        roles: [],
      }
      this.loadRoleList()
      this.form.newToken = true
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
    handleSearch() {
      let searchCond = ""
      if (this.searchModel.tokenName) {
        searchCond += "&name=" + this.searchModel.tokenName
      }
      this.refleshList(searchCond)
    },
    assignDataModel(item) {
      this.dataModel = {
        role_id: "",
        name: "",
        role_cnt: 0,
        roles: "",
        updated_at: "",
      }
      this.dataModel = Object.assign(this.dataModel, item)
    },
  },
}
</script>
