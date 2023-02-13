<template>
  <v-dialog max-width="50%" v-model="userDialog" @click:outside="handleCancel">
    <v-card>
      <v-card-title>
        <v-row justify="center" align="center">
          <v-col cols="4">
            <v-text-field
              outlined
              dense
              clearable
              :label="searchForm.userID.label"
              :placeholder="searchForm.userID.placeholder"
              v-model="searchModel.userID"
            />
          </v-col>
          <v-col cols="6">
            <v-combobox
              outlined
              dense
              clearable
              :label="searchForm.userName.label"
              :placeholder="searchForm.userName.placeholder"
              :items="userNameList"
              v-model="searchModel.userName"
              @change="handleSearch"
            />
          </v-col>
          <v-col cols="1" offset="1">
            <v-btn fab small :loading="loading" @click="handleSearch">
              <v-icon>search</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer />
      </v-card-title>
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
          @click:row="handleSelectItem"
          @update:page="refleshList"
        >
          <template v-slot:[`item.updated_at`]="{ item }">
            <v-chip>{{ item.updated_at | formatTime }}</v-chip>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text outlined color="grey darken-1" @click="handleCancel">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import mixin from '@/mixin'
import iam from '@/mixin/api/iam'
export default {
  mixins: [mixin, iam],
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
        userID: { label: 'User ID', placeholder: 'Filter for user id' },
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
    }
  },
  computed: {
    headers() {
      return [
        {
          text: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: false,
          value: 'user_id',
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          value: 'name',
        },
        {
          text: this.$i18n.t('item["User Key"]'),
          align: 'start',
          sortable: false,
          value: 'user_idp_key',
        },
        {
          text: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: false,
          value: 'updated_at',
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
    handleSelectItem(item) {
      this.$emit('handleUserDialogResponse', item)
    },
    handleCancel() {
      this.$emit('handleUserDialogResponse', { user_id: '', name: '' })
    },
  },
}
</script>
