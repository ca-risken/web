<template>
  <div class="list-table">
    <v-container>
      <v-row dense>
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-file-find-outline</v-icon>Resource
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense>
          <v-col cols="12" sm="4" md="4">
            <v-combobox
              multiple outlined dense clearable small-chips deletable-chips
              background-color="white"
              :label="searchForm.resourceName.label"
              :placeholder="searchForm.resourceName.placeholder"
              :items="resourceNameList"
              v-model="searchModel.resourceName"
            />
          </v-col>
          <v-col cols="12" sm="4" md="4">
            <v-menu
              ref="menu"
              v-model="searchForm.menu"
              :close-on-content-click="false"
              :return-value.sync="searchModel.dates"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  outlined dense readonly
                  background-color="white"
                  v-model="dateRangeText"
                  :label="searchForm.dates.label"
                  prepend-icon="event"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                range no-title scrollable
                v-model="searchModel.dates"
              >
                <v-btn text color="accent" @click="searchModel.dates = ['', '']">Clear</v-btn>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="searchForm.menu = false">Cancel</v-btn>
                <v-btn text color="primary" @click="$refs.menu.save(searchModel.dates)">OK</v-btn>
              </v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" sm="3" md="3">
            <v-range-slider
              outlined
              dense
              thumb-label
              min="0.0"
              max="100.0"
              step="0.1"
              :label="searchForm.score.label"
              :messages="searchForm.score.placeholder"
              v-model="searchModel.score"
            ></v-range-slider>
          </v-col>

          <v-spacer />
          <v-btn class="mt-3 mr-4" fab dense small :loading="loading" @click="handleSearch">
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
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="読込中"
                no-data-text="データがありません。"
                class="elevation-1"
                item-key="resource_id"
                @click:row="handleViewItem"
                @update:page="loadList"
                v-model="table.selected"
              >
                <template v-slot:[`item.resource_name`]="{ item }">
                  {{ cutLongText(item.resource_name, 80) }}
                </template>
                <template v-slot:[`item.findings`]="{ item }">
                  <v-chip :color="getColorByCount(item.findings)" dark>{{ item.findings }}</v-chip>
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
      loading: false,
      searchModel: {
        resourceName: null,
        dates: ['', ''],
        score: [0.0, 100.0],
      },
      searchForm: {
        resourceName: { label: 'Resource Name', placeholder: 'Filter for resource name' },
        dates: { label: 'UpdatedAt Range', placeholder: 'Filter for dates range', menu: false },
        score: { label: 'Sum Score', placeholder: 'Filter for score( from - to )' },
      },
      resourceNameList: [],
      search: '',
      table: {
        selected: [],
        headers: [
          { text: 'ID',  align: 'center', width: '5%', sortable: false, value: 'resource_id' },
          { text: 'Resource', align: 'start', width: '20%', sortable: false, value: 'resource_name' },
          { text: 'Findings', align: 'center', width: '5%', sortable: false, value: 'findings' },
          { text: 'Updated', align: 'start', width: '10%', sortable: false, value: 'updated_at' },
          { text: 'Action', align: 'center', width: '10%', sortable: false, value: 'action' }
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
      resources: [],
    }
  },
  filters: {
    formatTime: (unix) => {
      return Util.formatDate(new Date(unix * 1000), 'yyyy/MM/dd HH:mm')
    },
  },
  async mounted() {
    await this.refleshList('')
  },
  computed: {
    dateRangeText () {
      if ( this.searchModel.dates.length < 1 || this.searchModel.dates[0] === '' || this.searchModel.dates[1] === '' ) {
        return ''
      }
      return this.searchModel.dates.join(' ~ ')
    },
  },
  methods: {
    async refleshList(searchCond) {
      const res = await this.$axios.get(
        '/finding/list-resource/?project_id=' + this.$store.state.project.project_id + searchCond
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.resource_id ) {
        this.clearList()
        return false
      }
      this.table.total = list.data.resource_id.length
      this.resources = list.data.resource_id
      await this.loadList()
    },
    async loadList() {
      this.loading = true
      this.table.items = []
      this.resourceNameList = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.resources.slice(from, to)
      ids.forEach( async id => {
        const res = await this.$axios.get('/finding/get-resource/?project_id='+ this.$store.state.project.project_id +'&resource_id=' + id).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const findings = await this.$axios.get('/finding/list-finding/?project_id='+ this.$store.state.project.project_id +'&resource_name=' + res.data.data.resource.resource_name).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        let finding_cnt = 0
        if (findings.data.data.finding_id) {
           finding_cnt = findings.data.data.finding_id.length
        }
        const item = {
          resource_id: res.data.data.resource.resource_id,
          resource_name: res.data.data.resource.resource_name,
          findings: finding_cnt,
          updated_at: res.data.data.resource.updated_at,
        }
        this.table.items.push(item)
        this.resourceNameList.push(item.resource_name)
      })
      this.loading = false
    },
    clearList() {
      this.table.total = 0
      this.table.items = []
      this.resources = []
      this.resourceNameList = []
    },

    handleViewItem(item) {
      this.$router.push('/finding/finding?resource_name=' + item.resource_name)
    },
    handleSearch() {
      let searchCond = ''
      if (this.searchModel.resourceName) {
        searchCond += '&resource_name=' + this.searchModel.resourceName
      }
      if (this.searchModel.dates[0]) {
        searchCond += '&from_at=' + Math.floor(Date.parse(this.searchModel.dates[0]) / 1000 )
      }
      if (this.searchModel.dates[1]) {
        searchCond += '&to_at=' + Math.floor(Date.parse(this.searchModel.dates[1]) / 1000 )
      }
      if (this.searchModel.score[0]) {
        searchCond += '&from_sum_score=' + this.searchModel.score[0]
      }
      if (this.searchModel.score[1]) {
        searchCond += '&to_sum_score=' + this.searchModel.score[1]
      }
      this.refleshList(searchCond)
    },
  }
}
</script>
