<template>
  <v-dialog max-width="50%" v-model="userDialog" @click:outside="handleCancel">
    <v-card>
      <v-card-title>
          <v-combobox
            outlined dense clearable
            :label="searchForm.userName.label"
            :placeholder="searchForm.userName.placeholder"
            :items="userNameList"
            v-model="searchModel.userName"
            @change="handleSearch"
          />
        <v-spacer />
        <v-btn class="mt-3 mr-4" fab dense small :loading="loading" @click="handleSearch">
          <v-icon>search</v-icon>
        </v-btn>
      </v-card-title>
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
          @click:row="handleSelectItem"
          @update:page="loadList"
        >
          <template v-slot:[`item.updated_at`]="{ item }">
            <v-chip>{{ item.updated_at | formatTime }}</v-chip>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text outlined color="grey darken-1" @click="handleCancel">
          CANCEL
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>
import Util from '@/util'
export default {
  props: {
    userDialog: Boolean,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        userName: null,
      },
      searchForm: {
        userName: { label: 'User Name', placeholder: 'Filter for user name' },
      },
      userNameList: [],
      table: {
        headers: [
          { text: 'ID',  align: 'start', sortable: false, value: 'user_id' },
          { text: 'Name', align: 'start', sortable: false, value: 'name' },
          { text: 'Updated', align: 'center', sortable: false, value: 'updated_at' },
        ],
        options: { page: 1, itemsPerPage: 20, sortBy: ['user_id'] },
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [20],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
      users: [],
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
        '/iam/list-user/?activated=true' + searchCond
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
      let items = []
      let userNames = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.users.slice(from, to)
      ids.forEach( async id => {
        const res = await this.$axios.get('/iam/get-user/?user_id=' + id).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const item = {
          user_id:    res.data.data.user.user_id,
          name:       res.data.data.user.name,
          updated_at: res.data.data.user.updated_at,
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

    handleSearch() {
      let searchCond = ''
      if (this.searchModel.userName) {
        searchCond += '&name=' + this.searchModel.userName
      }
      this.refleshList(searchCond)
    },
    handleSelectItem(item) {
      this.$emit('handleUserDialogResponse', item)
    },
    handleCancel() {
      this.$emit('handleUserDialogResponse', {user_id:'', name:''})
    }
  }
}
</script>
