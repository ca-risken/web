<template>
  <div class="list-table">
    <v-container>
      <v-row dense>
        <v-col cols="12">
          <v-toolbar color="white" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-file-find-outline</v-icon>Finding
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense>
          <v-col cols="12" sm="4" md="4">
            <v-combobox
              multiple outlined dense clearable small-chips deletable-chips
              :label="searchForm.resourceName.label"
              :placeholder="searchForm.resourceName.placeholder"
              :items="resourceNameList"
              v-model="searchModel.resourceName"
            />
          </v-col>
          <v-col cols="12" sm="4" md="4">
            <v-combobox
              multiple outlined dense clearable small-chips deletable-chips
              :label="searchForm.dataSource.label"
              :placeholder="searchForm.dataSource.placeholder"
              :items="dataSourceList"
              v-model="searchModel.dataSource"
            />
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
          <v-btn class="mt-3 mr-4" fab dense small @click="handleSearch">
            <v-icon>search</v-icon>
          </v-btn>
        </v-row>
      </v-form>
      <v-row dense>
        <v-col cols="12">
          <v-card>
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
                item-key="finding_id"
                @click:row="handleViewItem"
                @update:page="loadList"
                v-model="table.selected"
              >
                <template v-slot:item.data_source="{ item }">
                  <v-layout justify-center>
                    <v-icon 
                      v-text="getDataSourceIcon(item.data_source)"
                      :color="getDataSourceIconColor(item.data_source)"
                    />
                  </v-layout>
                </template>
                <template v-slot:item.score="{ item }">
                  <!-- <v-progress-linear
                    :value="item.score * 100"
                    height="5"
                    :color="getColorByScore(item.score)"
                  /> -->
                  <v-chip :color="getColorByScore(item.score)" dark>{{ item.score }}</v-chip>
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

    <v-dialog v-model="viewDialog" max-width="70%">
      <v-card>
        <v-toolbar>
          <v-card-title>Finding Detail</v-card-title>
        </v-toolbar>
        <v-container fluid>
          <v-row dense>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon left>mdi-identifier</v-icon>
                    Finding ID
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ findingModel.finding_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon left
                      v-text="getDataSourceIcon(findingModel.data_source)"
                      :color="getDataSourceIconColor(findingModel.data_source)"
                    />
                    Data Source
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ findingModel.data_source }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon left>mdi-file-find-outline</v-icon>
                    Resource Name
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ findingModel.resource_name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="2">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon :color="getColorByScore(findingModel.score)">mdi-scoreboard</v-icon>
                    Score
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ findingModel.score }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon outlined>mdi-scoreboard</v-icon>
                    Original Score
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ findingModel.original_score }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="7">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon left>mdi-image-text</v-icon>
                    Description
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ findingModel.description }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row class="ma-2">
            <v-col cols="12">
              <v-list-item-subtitle>
                <v-icon left>mdi-code-json</v-icon>
                JSON Data
              </v-list-item-subtitle>
              <v-card dark color="grey darken-3" class="ma-4">
                <v-card-text class="title font-weight-bold">
                <pre>{{ findingModel.data | pretty }}</pre>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="4">
              <v-list-item-subtitle>
                <v-icon left>mdi-clock-outline</v-icon>
                Updated At
              </v-list-item-subtitle>
              <v-list-item-title class="headline">
                <v-chip>{{ findingModel.updated_at | formatTime }}</v-chip>
              </v-list-item-title>
            </v-col>
          </v-row>        
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined color="grey darken-1" @click="viewDialog = false">
            CANCEL
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
export default {
  mixins: [mixin],
  data() {
    return {
      loading: false,
      searchModel: {
        dataSource: [],
        resourceName: [],
        score: [0.00, 1.00],
      },
      searchForm: {
        dataSource: { label: 'Data Source', placeholder: 'Filter for data_sources' },
        resourceName: { label: 'Resource Name', placeholder: 'Filter for resource name' },
        score: { label: 'Score', placeholder: 'Filter for score( from - to )' },
      },
      resourceNameList: [],
      findingModel: { finding_id:'', data_source:'', resource_name:'', description:'', original_score:'', score:'', updated_at:'' },
      viewDialog: false,
      table: {
        selected: [],
        headers: [
          { text: 'ID',  align: 'center', sortable: false, value: 'finding_id' },
          { text: 'Score', align: 'center', sortable: false, value: 'score' },
          { text: 'Data Source', align: 'center', sortable: false, value: 'data_source' },
          { text: 'Resource', align: 'start', sortable: false, value: 'resource_name' },
          { text: 'Description', align: 'start', sortable: false, value: 'description' },
          { text: 'Update', align: 'start', sortable: false, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' },
        ],
        options: {
          page: 1,
          itemsPerPage: 20,
          sortBy: ['id'],
        },
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
  },
  mounted() {
    if ( this.$route.query.resource_name ) {
      this.searchModel.resourceName[0] = this.$route.query.resource_name
      this.handleSearch()
      return false
    }
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      const res = await this.$axios.get(
        '/finding/list-finding/?project_id=' + this.$store.state.project.project_id + searchCond
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.finding_id ) {
        this.clearList()
        return false
      }
      this.table.total = list.data.finding_id.length
      this.findings = list.data.finding_id
      this.loadList()
    },
    async loadList() {
      this.loading = true
      var items = []
      var resources = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.findings.slice(from, to)
      ids.forEach( async id => {
        const res = await this.$axios.get('/finding/get-finding/?project_id='+ this.$store.state.project.project_id +'&finding_id=' + id).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        items.push(res.data.data.finding)
        resources.push(res.data.data.finding.resource_name)
      })
      this.table.items = items
      this.resourceNameList = resources
      this.loading = false
    },
    clearList() {
      this.findings = []
      this.table.total = 0
      this.table.items = []
      this.resourceNameList = []
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
    },
  }
}
</script>
