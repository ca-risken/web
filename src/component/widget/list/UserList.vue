<template>
  <v-dialog
    max-width="50%"
    :model-value="userDialog"
    @click:outside="handleCancel"
  >
    <v-card>
      <v-card-title>
        <v-row justify="center" align="center">
          <v-col cols="4">
            <v-text-field
              density="compact"
              variant="outlined"
              clearable
              :label="searchForm.userID.label"
              :placeholder="searchForm.userID.placeholder"
              :rules="searchForm.userID.validator"
              v-model="searchModel.userID"
            />
          </v-col>
          <v-col cols="6">
            <v-combobox
              density="compact"
              variant="outlined"
              clearable
              :label="searchForm.userName.label"
              :placeholder="searchForm.userName.placeholder"
              :items="userNameList"
              v-model="searchModel.userName"
              @update:modelValue="handleSearch"
            />
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn
              :loading="loading"
              @click="handleSearch"
              icon="mdi-magnify"
            />
          </v-col>
        </v-row>
        <v-spacer />
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0" v-if="!noUser">
        <v-data-table
          :headers="headers"
          :items="table.items"
          v-model:options="table.options"
          :server-items-length="table.total"
          :loading="loading"
          :footer-props="table.footer"
          locale="ja-jp"
          loading-text="Loading..."
          no-data-text="No data."
          class="elevation-1"
          item-key="user_id"
          @click:row="handleSelectItem"
          @update:page="refleshList"
        >
          <template v-slot:[`item.updated_at`]="{ item }">
            <v-chip>{{ formatTime(item.value.updated_at) }}</v-chip>
          </template>
        </v-data-table>
      </v-card-text>
      <template v-if="noUser">
        <v-alert
          >{{ $t("view.iam['No users found for your search condition.']")
          }}<br />
          {{
            $t(
              "view.iam['To reserve a user with a user key in the search condition, press the RESERVE button.']"
            )
          }}
        </v-alert>
        <v-card-actions class="justify-center">
          <v-btn
            variant="outlined"
            color="teal-darken-1"
            risken-action-name="`click-handle-user-reserve"
            @click="handleUserReserve"
          >
            {{ $t(`btn['RESERVE']`) }}
          </v-btn>
        </v-card-actions>
      </template>
      <v-card-actions>
        <v-spacer />
        <v-btn text outlined color="grey-darken-1" @click="handleCancel">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import iam from '@/mixin/api/iam'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  mixins: [mixin, iam],
  components: {
    VDataTable,
  },
  name: 'UserList',
  props: {
    userDialog: Boolean,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        userName: null,
        userID: null,
      },
      searchForm: {
        userID: {
          label: 'User ID',
          placeholder: 'Filter for user id',
          validator: [
            (v) => !v || Util.isNumber(v) || 'UserID must be a number',
          ],
        },
        userName: { label: 'User Name', placeholder: 'Filter for user name' },
      },
      userNameList: [],
      table: {
        options: { page: 1, itemsPerPage: 20, sortBy: ['user_id'] },
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [20],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      users: [],
      noUser: false,
    }
  },
  computed: {
    headers() {
      return [
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
          title: this.$i18n.t('item["User Key"]'),
          align: 'start',
          sortable: false,
          key: 'user_idp_key',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: false,
          key: 'updated_at',
        },
      ]
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      this.loading = true
      this.noUser = false
      this.table.options.page = 1
      this.clearList()

      const userIDs = await this.listUserAPI(searchCond).catch((err) => {
        return Promise.reject(err)
      })
      if (!userIDs) {
        return false
      }
      this.table.total = userIDs.length
      this.users = userIDs
      const from =
        (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.users.slice(from, to)

      let userList = []
      for (const id of ids) {
        userList.push(this.getUserDetail(id))
      }
      this.table.items = await Promise.all(userList) // Parallel API call
      if (
        !this.searchModel.userID &&
        this.searchModel.userName &&
        userIDs.length == 0
      ) {
        this.noUser = true
      }

      this.loading = false
    },
    async getUserDetail(id) {
      const [user] = await Promise.all([this.getUserAPI(id)])
      this.userNameList.push(user.name)
      return {
        user_id: user.user_id,
        name: user.name,
        user_idp_key: user.user_idp_key,
        updated_at: user.updated_at,
      }
    },
    clearList() {
      this.users = []
      this.table.total = 0
      this.table.items = []
      this.userNameList = []
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
    handleSelectItem(event, users) {
      this.$emit('handleUserDialogResponse', users.item.value)
    },
    handleUserReserve() {
      this.$emit('handleUserDialogResponse', {
        user_idp_key: this.searchModel.userName,
        reserved: true,
      })
    },
    handleCancel() {
      this.$emit('handleUserDialogResponse', { user_id: '', name: '' })
    },
  },
}
</script>
