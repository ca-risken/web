<template>
  <div class="list-table">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar color="white" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon class="pr-2">mdi-account-multiple</v-icon>
              Role
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row>
          <v-col cols="12" sm="4" md="4">
            <v-combobox
              outlined dense clearable
              :label="searchForm.roleName.label"
              :placeholder="searchForm.roleName.placeholder"
              :items="roleNameList"
              v-model="searchModel.roleName"
            />
          </v-col>

          <v-spacer />
          <v-btn
            fab
            class="mt-3 mr-4"
            @click="handleSearch"
          >
            <v-icon>search</v-icon>
          </v-btn>
        </v-row>
      </v-form>
      <v-row>
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
                item-key="id"
                @click:row="handleViewItem"
                @update:page="loadList"
                v-model="table.selected"
              >
                <template v-slot:item.avator="">
                  <v-avatar class="ma-3">
                    <v-icon>mdi-alpha-r-circle</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:item.policies="{ item }">
                  <v-chip :color="getColorByPolicies(item.policies)" dark>{{ item.policies }}</v-chip>
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
        roleName: null,
      },
      searchForm: {
        roleName: { label: 'Role Name', placeholder: 'Filter for role name' },
      },
      roleNameList: [],
      roleModel: { role_id:'', name:'', policies:'', updated_at:'' },
      search: '',
      table: {
        selected: [],
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: false, value: 'role_id' },
          { text: 'Name', align: 'start', sortable: false, value: 'name' },
          { text: 'Policies', align: 'center', sortable: false, value: 'policies' },
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
      roles: [],
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
        '/iam/list-role/?project_id=' + this.$store.state.project.project_id + searchCond
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.role_id ) {
        this.clearList()
        return false
      }
      this.table.total = list.data.role_id.length
      this.roles = list.data.role_id
      this.loadList()
    },
    async loadList() {
      this.table.loading = true
      var items = []
      var roleNames = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.roles.slice(from, to)
      ids.forEach( async id => {
        const res = await this.$axios.get(
          '/iam/get-role/?project_id='+ this.$store.state.project.project_id +'&role_id=' + id
        ).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const policies = await this.$axios.get(
          '/iam/list-policy/?project_id='+ this.$store.state.project.project_id +'&role_id=' + id
        ).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const item = {
          role_id:    res.data.data.role.role_id,
          name:       res.data.data.role.name,
          updated_at: res.data.data.role.updated_at,
          policies:   policies.data.data.policy_id.length,
        }
        items.push(item)
        roleNames.push(item.name)
      })
      this.table.items = items
      this.roleNameList = roleNames
      this.table.loading = false
    },
    clearList() {
      this.roles = []
      this.table.total = 0
      this.table.items = []
      this.roleNameList = []
    },
    getColorByPolicies(cnt) {
      if ( cnt <= 1 ) {
        return 'success'
      } else if ( 3 < cnt ) {
        return 'red'
      } else {
        return 'yellow'
      }
    },
    handleViewItem(item) {
console.log(item)
    },
    handleSearch() {
      var searchCond = ''
      if (this.searchModel.roleName) {
        searchCond += '&name=' + this.searchModel.roleName
      }
      this.refleshList(searchCond)
    },
  }
}
</script>
