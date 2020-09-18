<template>
  <div class="list-table">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-subheader>Finding</v-subheader>
        </v-col>
        <v-col cols="12">
          <v-card>
            <v-toolbar color="white">
              <v-text-field text solo flat
                prepend-icon="filter_list"
                placeholder="Not working this filter yet..."
                v-model="search"
                hide-details
                class="hidden-sm-and-down"
              ></v-text-field>
              <v-btn fab>
                <v-icon>search</v-icon>
              </v-btn>
            </v-toolbar>
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
                @update:page="loadList"
                v-model="table.selected"
              >
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
                        @click="action.click(item)"
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

    <v-dialog v-model="viewDialog" max-width="60vh">
      <v-card>
        <v-toolbar>Finding Detail</v-toolbar>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.finding_id"></v-list-item-title>
              <v-list-item-subtitle>Finding ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-file-find-outline</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.resource_name"></v-list-item-title>
              <v-list-item-subtitle>Resource Name</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-alpha-d-circle-outline</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.description"></v-list-item-title>
              <v-list-item-subtitle>Description</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-scoreboard</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.original_score"></v-list-item-title>
              <v-list-item-subtitle>Original Score</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-scoreboard-outline</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.score"></v-list-item-title>
              <v-list-item-subtitle>Score</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-card-account-details-outline</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-model="findingModel.data"></v-list-item-title>
              <pre>{{ findingModel.data | pretty }}</pre>
              <v-list-item-subtitle>JSON Data</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-clock-outline</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-model="findingModel.updated_at"></v-list-item-title>
              <pre>{{ findingModel.updated_at | formatTime }}</pre>
              <v-list-item-subtitle>Updated At</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import Util from '@/util'
export default {
  data() {
    return {
      findingModel: { finding_id:'', data_source:'', resource_name:'', description:'', original_score:'', score:'', updated_at:'' },
      viewDialog: false,
      search: '',
      table: {
        selected: [],
        headers: [
          { text: 'ID',  align: 'center', sortable: false, value: 'finding_id' },
          { text: 'DataSource', align: 'start', sortable: false, value: 'data_source' },
          { text: 'Resource', align: 'start', sortable: false, value: 'resource_name' },
          { text: 'Score', align: 'start', sortable: false, value: 'score' },
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
      findings: [],
    }
  },
  filters: {
    pretty: (v) => {
      if (!v){return false}
      return JSON.stringify(JSON.parse(v), null, 2)
    },
    formatTime: (unix) => {
      return Util.formatDate(new Date(unix * 1000), 'yyyy/MM/dd HH:mm')
    }
  },
  mounted() {
    this.refleshList()
  },
  methods: {
    async refleshList() {
      this.table.total = 0
      this.findings = []
      const res = await this.$axios.get('/finding/list-finding/?project_id=' + this.$store.state.project.project_id ).catch((err) =>  {
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.finding_id ) {
        return false
      }
      this.table.total = list.data.finding_id.length
      this.findings = list.data.finding_id
      this.loadList()
    },
    async loadList() {
      this.table.loading = true
      this.table.items = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.findings.slice(from, to)
      ids.forEach( async id => {
        const res = await this.$axios.get('/finding/get-finding/?project_id='+ this.$store.state.project.project_id +'&finding_id=' + id).catch((err) =>  {
          return Promise.reject(err)
        })
        this.table.items.push(res.data.data.finding)
      })
      this.table.loading = false
    },
    handleViewItem(row) {
      this.findingModel = Object.assign(this.findingModel, row)
      this.viewDialog = true
    },
  }
}
</script>
