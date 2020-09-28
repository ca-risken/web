<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="white" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon class="pr-2">mdi-account-multiple</v-icon>
              User
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="4" md="4">
            <v-combobox
              outlined dense clearable
              :label="searchForm.userName.label"
              :placeholder="searchForm.userName.placeholder"
              :items="userNameList"
              v-model="searchModel.userName"
            />
          </v-col>

          <v-spacer />
          <v-btn class="mt-3 mr-4" fab dense small @click="handleSearch">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn class="mt-3 mr-4" color="primary darken-3" fab dense small @click="handleNewItem">
            <v-icon>mdi-new-box</v-icon>
          </v-btn>
        </v-row>
      </v-form>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                :headers="table.headers"
                :items="table.items"
                :options.sync="table.options"
                :server-items-length="table.total"
                :loading="table.loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="読込中"
                no-data-text="データがありません。"
                class="elevation-1"
                item-key="user_id"
                @click:row="handleViewItem"
                @update:page="loadList"
                v-model="table.selected"
              >
                <template v-slot:item.avator="">
                  <v-avatar class="ma-2">
                    <img src="/static/avatar/default.png" alt="avatar" />
                  </v-avatar>
                </template>
                <template v-slot:item.roles="{ item }">
                  <v-chip :color="getColorByRoles(item.roles)" dark>{{ item.roles }}</v-chip>
                </template>
                <template v-slot:item.updated_at="{ item }">
                  <v-chip>{{ item.updated_at | formatTime }}</v-chip>
                </template>
                <template v-slot:item.action="{ item }">
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
                        @click="action.click( item )"
                      >
                        <v-list-item-icon class="mr-2">
                          <v-icon small>{{ action.icon }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{ action.text }}</v-list-item-title>
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
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
export default {
  mixins: [mixin],
  data() {
    return {
      searchModel: {
        userName: null,
      },
      searchForm: {
        userName: { label: 'User Name', placeholder: 'Filter for user name' },
      },
      userNameList: [],
      userModel: { user_id:'', name:'', roles:'', updated_at:'' },
      search: '',
      table: {
        selected: [],
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: false, value: 'user_id' },
          { text: 'Name', align: 'start', sortable: false, value: 'name' },
          { text: 'Roles', align: 'center', sortable: false, value: 'roles' },
          { text: 'Updated', align: 'center', sortable: false, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: {
          page: 1,
          itemsPerPage: 20,
          sortBy: ['id'],
        },
        loading: false,
        actions: [
          { text: 'View Item', icon: 'mdi-eye', click: this.handleViewItem },
        ],
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
        '/iam/list-user/?activated=true&project_id=' + this.$store.state.project.project_id + searchCond
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
      this.table.loading = true
      var items = []
      var userNames = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.users.slice(from, to)
      ids.forEach( async id => {
        const res = await this.$axios.get('/iam/get-user/?project_id='+ this.$store.state.project.project_id +'&user_id=' + id).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const roles = await this.$axios.get('/iam/list-role/?project_id='+ this.$store.state.project.project_id +'&user_id=' + id).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const item = {
          user_id:    res.data.data.user.user_id,
          name:       res.data.data.user.name,
          updated_at: res.data.data.user.updated_at,
          roles:      roles.data.data.role_id.length,
        }
        items.push(item)
        userNames.push(item.name)
      })
      this.table.items = items
      this.userNameList = userNames
      this.table.loading = false
    },
    clearList() {
      this.users = []
      this.table.total = 0
      this.table.items = []
      this.userNameList = []
    },
    getColorByRoles(cnt) {
      if ( cnt < 1  ) {
        return 'grey'
      } else if ( cnt <= 3 ) {
        return 'success'
      } else if ( cnt < 10 ) {
        return 'yellow'
      } else {
        return 'red'
      }
    },
    handleViewItem(item) {
console.log(item)
    },
    handleSearch() {
      var searchCond = ''
      if (this.searchModel.userName) {
        searchCond += '&name=' + this.searchModel.userName
      }
      this.refleshList(searchCond)
    },
  }
}
</script>
