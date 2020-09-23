<template>
  <div class="list-table">
    <v-container>
      <v-row style="height: 60px;">
        <v-col cols="12">
          <v-subheader>Finding</v-subheader>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row  style="height: 60px;">
          <v-col cols="12" sm="4" md="4">
            <v-combobox
              outlined
              multiple
              :label="searchForm.dataSource.label"
              :placeholder="searchForm.dataSource.placeholder"
              :items="searchForm.dataSource.list"
              v-model="searchModel.dataSource"
            />
          </v-col>
          <v-col cols="12" sm="3" md="3">
            <v-text-field
              outlined
              :label="searchForm.resourceName.label"
              :placeholder="searchForm.resourceName.placeholder"
              v-model="searchModel.resourceName"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3" md="3">
            <v-range-slider
              outlined
              dense
              thumb-label
              min="0.0"
              max="1.0"
              step="0.01"
              :label="searchForm.score.label"
              :messages="searchForm.score.placeholder"
              v-model="searchModel.score"
            ></v-range-slider>
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
      <v-row class="mt-3">
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
                @update:page="loadList"
                v-model="table.selected"
              >
                <template v-slot:item.score="{ item }">
                  <v-progress-linear
                    :value="item.score * 100"
                    height="5"
                    :color="item.score | colorByScore"
                  />
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

    <v-dialog v-model="viewDialog" max-width="80vh">
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
            <v-list-item-avatar><v-icon>mdi-shape-outline</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.data_source"></v-list-item-title>
              <v-list-item-subtitle>Data Source</v-list-item-subtitle>
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
            <v-list-item-avatar><v-icon>mdi-image-text</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.description"></v-list-item-title>
              <v-list-item-subtitle>Description</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-scoreboard-outline</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.original_score"></v-list-item-title>
              <v-list-item-subtitle>Original Score</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-scoreboard</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.score"></v-list-item-title>
              <v-list-item-subtitle>Score</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-code-json</v-icon></v-list-item-avatar>
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
      searchModel: {
        dataSource: null,
        resourceName: null,
        score: [0.00, 1.00],
      },
      searchForm: {
        dataSource: { label: 'Data Source', placeholder: 'Filter for data_sources', list: [
            'aws:guard-duty',
            'aws:access-analyzer',
            'aws:iam-checker',
            'diagnosis:jira',
          ],
        },
        resourceName: { label: 'Resource Name', placeholder: 'Filter for resource name' },
        score: { label: 'Score', placeholder: 'Filter for score( from - to )' },
      },
      findingModel: { finding_id:'', data_source:'', resource_name:'', description:'', original_score:'', score:'', updated_at:'' },
      viewDialog: false,
      search: '',
      table: {
        selected: [],
        headers: [
          { text: 'ID',  align: 'center', sortable: false, value: 'finding_id' },
          { text: 'DataSource', align: 'start', sortable: false, value: 'data_source' },
          { text: 'Resource', align: 'start', sortable: false, value: 'resource_name' },
          { text: 'Serverity', align: 'start', sortable: false, value: 'score' },
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
    },
    colorByScore: (score) => {
      if ( score < 0.5 ) {
        return 'success'
      } else if ( 0.75 < score ) {
        return 'red'
      } else {
        return 'yellow'
      }
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      this.table.total = 0
      this.findings = []
      const res = await this.$axios.get(
        '/finding/list-finding/?project_id=' + this.$store.state.project.project_id + searchCond
      ).catch((err) =>  {
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
    handleSearch() {
      var searchCond = ''
      if (this.searchModel.dataSource) {
        searchCond += '&data_source=' + this.searchModel.dataSource
      }
      if (this.searchModel.resourceName) {
        searchCond += '&resource_name=' + this.searchModel.resourceName
      }
      if (this.searchModel.score[0]) {
        searchCond += '&from_score=' + this.searchModel.score[0]
      }
      if (this.searchModel.score[1]) {
        searchCond += '&to_score=' + this.searchModel.score[1]
      }
      this.refleshList(searchCond)
    }
  }
}
</script>
