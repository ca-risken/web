<template>
  <div>
    <v-container>
      <v-row dense>
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title  class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-file-find-outline</v-icon>Finding
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense>
          <v-col cols="3">
            <v-combobox
              multiple outlined dense clearable small-chips deletable-chips
              background-color="white"
              :label="searchForm.resourceName.label"
              :placeholder="searchForm.resourceName.placeholder"
              :items="searchForm.resourceNameList"
              v-model="searchModel.resourceName"
            />
          </v-col>
          <v-col cols="3">
            <v-combobox
              multiple outlined dense clearable small-chips deletable-chips
              background-color="white"
              :label="searchForm.tag.label"
              :placeholder="searchForm.tag.placeholder"
              :items="searchForm.tagList"
              v-model="searchModel.tag"
            />
          </v-col>
          <v-col cols="3">
            <v-combobox
              multiple outlined dense clearable small-chips deletable-chips
              background-color="white"
              :label="searchForm.dataSource.label"
              :placeholder="searchForm.dataSource.placeholder"
              :items="dataSourceList"
              v-model="searchModel.dataSource"
            />
          </v-col>
          <v-col cols="2">
            <v-range-slider
              outlined
              dense
              thumb-label
              min="0.0"
              max="1.0"
              step="0.1"
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
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="finding_id"
                @click:row="handleViewItem"
                @update:page="loadList"
                @update:options="loadList"
                v-model="table.selected"
              >
                <!-- Sortable Header -->
                <template v-slot:[`header.finding_id`]="{ header }"><a @click="handleSort(header.value)">{{ header.text }}</a></template>
                <template v-slot:[`header.score`]="{ header }"><a @click="handleSort(header.value)">{{ header.text }}</a></template>
                <template v-slot:[`header.data_source`]="{ header }"><a @click="handleSort(header.value)">{{ header.text }}</a></template>
                <template v-slot:[`header.resource_name`]="{ header }"><a @click="handleSort(header.value)">{{ header.text }}</a></template>
                <template v-slot:[`header.description`]="{ header }"><a @click="handleSort(header.value)">{{ header.text }}</a></template>
                <template v-slot:[`header.updated_at`]="{ header }"><a @click="handleSort(header.value)">{{ header.text }}</a></template>
                <template v-slot:[`item.resource_name`]="{ item }">
                  {{ cutLongText(item.resource_name, 64) }}
                </template>
                <template v-slot:[`item.data_source`]="{ item }">
                  <v-layout justify-center>
                    <v-icon 
                      v-text="getDataSourceIcon(item.data_source)"
                      :color="getDataSourceIconColor(item.data_source)"
                    />
                  </v-layout>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-icon v-if="item.status === 'ACTIVE'" color="success">mdi-check-circle</v-icon>
                  <v-icon v-else-if="item.status === 'PENDING'" color="grey">mdi-check-circle</v-icon>
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:[`item.score`]="{ item }">
                  <v-chip dark :color="getColorByScore(item.score)">{{ item.score | formatScore }}</v-chip>
                </template>
                <template v-slot:[`item.tags`]="{ item }">
                  <v-chip>
                    <v-icon left>mdi-label</v-icon>
                    {{ item.tags | itemCount }}
                  </v-chip>
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
                        v-for="action in getActionList(item)"
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
          <v-row dense class="mx-2">
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon color="black" dark left>mdi-identifier</v-icon>
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
          <v-row dense class="mx-2">
            <v-col cols="6">
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
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon :color="getColorByScore(findingModel.score)">mdi-scoreboard</v-icon>
                    Score
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip dark :color="getColorByScore(findingModel.score)">{{ findingModel.score | formatScore }}</v-chip>
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
          </v-row>
          <v-row dense class="mx-4">
            <v-col cols="12">
              <v-list-item-subtitle>
                <v-icon left>mdi-label</v-icon>
                Tag
                <v-btn text outlined dense color="black lighten-1" class="ma-4" :loading="loading" @click="handleNewTag">New Tag</v-btn>
              </v-list-item-subtitle>
              <v-list-item-title>
                <v-chip
                  v-for="tag in findingModel.tags"
                  :key="tag.finding_tag_id"
                  @update:active="handleUntag(tag)"
                  class="mx-1" close
                >
                  {{ tag.tag }}
                </v-chip>
              </v-list-item-title>
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
          <v-row class="ma-2">
            <v-col cols="4">
              <v-list-item-subtitle>
                <v-icon left>mdi-clock-outline</v-icon>
                Created At
              </v-list-item-subtitle>
              <v-list-item-title>
                <v-chip>{{ findingModel.created_at | formatTime }}</v-chip>
              </v-list-item-title>
            </v-col>
            <v-col cols="4">
              <v-list-item-subtitle>
                <v-icon left>mdi-clock-outline</v-icon>
                Updated At
              </v-list-item-subtitle>
              <v-list-item-title>
                <v-chip>{{ findingModel.updated_at | formatTime }}</v-chip>
              </v-list-item-title>
            </v-col>
          </v-row>        
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined  color="grey darken-1" @click="viewDialog = false">
            CANCEL
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="tagDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">New tag</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="findingModel.new_tag"
            label="tag"
            placeholder="key:value"
            outlined
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined color="grey darken-1" @click="tagDialog = false">
            CANCEL
          </v-btn>
          <v-btn
            color="blue darken-1"
            text outlined
            :loading="loading"
            @click="handleNewTagSubmit"
          >
            TAG
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">Do you really want to delete this?</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.finding_id"></v-list-item-title>
              <v-list-item-subtitle>Finding ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-file-find-outline</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.resource_name"></v-list-item-title>
              <v-list-item-subtitle>Resource</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-image-text</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.description"></v-list-item-title>
              <v-list-item-subtitle>Description</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined color="grey darken-1" @click="deleteDialog = false">
            CANCEL
          </v-btn>
          <v-btn
            color="red darken-1"
            text outlined
            :loading="loading"
            @click="handleDeleteSubmit"
          >
            DELETE
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import finding from '@/mixin/api/finding'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  mixins: [mixin, finding],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        dataSource: [],
        resourceName: [],
        tag: [],
        score: [0.0, 1.0],
      },
      searchForm: {
        dataSource: { label: 'Data Source', placeholder: 'Filter data sources' },
        resourceName: { label: 'Resource Name', placeholder: 'Filter resource' },
        tag: { label: 'Tag', placeholder: 'Filter tag' },
        score: { label: 'Score', placeholder: 'Filter score( from - to )' },
        resourceNameList: [],
        tagList: [],
      },
      findingModel: {
        finding_id:'',
        status: '',
        score:'',
        original_score:'',
        data_source:'',
        resource_name:'',
        description:'',
        tags: [],
        data: '',
        created_at:'',
        updated_at:'',
        new_tag: '',
      },
      viewDialog: false,
      tagDialog: false,
      deleteDialog: false,
      table: {
        selected: [],
        headers: [
          { text: 'ID',          align: 'center', width: '5%',  value: 'finding_id' },
          { text: 'Active',      align: 'center', width: '5%',  value: 'status', sortable: false },
          { text: 'Score',       align: 'center', width: '5%',  value: 'score' },
          { text: 'Data Source', align: 'center', width: '10%', value: 'data_source' },
          { text: 'Resource',    align: 'start',  width: '10%', value: 'resource_name' },
          { text: 'Description', align: 'start',  width: '30%', value: 'description' },
          { text: 'Tags',        align: 'start',  width: '5%',  value: 'tags', sortable: false },
          { text: 'Action',      align: 'center', width: '5%',  value: 'action', sortable: false },
        ],
        options: {
          page: 1,
          itemsPerPage: 20,
        },
        sort: {
          key: 'finding_id',
          direction: 'asc',
        },
        total: 0,
        footer: {
          disableItemsPerPage: false,
          itemsPerPageOptions: [20, 50, 100],
          itemsPerPageText: 'Rows/Page', 
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
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
    formatScore: (score) => {
      if (!Number.isInteger(score)){return score}
      return score.toFixed(2)
    },
    itemCount: (items) => {
      if (!items){return 0}
      return items.length
    },
  },
  async mounted() {
    this.getTag()
    await this.parseQuery()
    this.handleSearch()
  },
  methods: {
    async refleshList() {
      this.table.options.page = 1
      this.loadList()
    },
    async loadList() {
      this.loading = true
      this.clearList()
      let items = []
      let resources = []
      const list = await this.listFinding(this.getSearchCondition())
      this.table.total = list.total
      for ( const id of list.finding_id) {
        // parallel API call
        const [finding, tag, pend ] = await Promise.all([
          this.getFinding(id),
          this.listFindingTag(id),
          this.getPendFinding(id),
        ])
        const item = {
          finding_id:     finding.finding_id,
          status:         !pend.finding_id ? 'ACTIVE' : 'PENDING',
          score:          finding.score,
          original_score: finding.original_score,
          data_source:    finding.data_source,
          resource_name:  finding.resource_name,
          description:    finding.description,
          tags:           tag,
          data:           finding.data,
          updated_at:     finding.updated_at,
          created_at:     finding.created_at,
        }
        items.push(item)
        resources.push(finding.resource_name)
      }
      this.table.items = items
      this.searchForm.resourceNameList = resources
      this.loading = false
    },
    clearList() {
      this.findings = []
      this.table.total = 0
      this.table.items = []
      this.searchForm.resourceNameList = []
    },

    async getTag() {
      this.searchForm.tagList = []
      const tag = await this.listFindingTagName()
      this.searchForm.tagList = tag
    },
    getActionList( item ) {
      let list = [
          { text: 'View Finding', icon: 'mdi-eye', click: this.handleViewItem },
      ]
      if ( !item.status ) return list
      if ( item.status === 'ACTIVE' ) {
        list.push({ text: 'Pend Finding', icon: 'mdi-check-circle-outline', click: this.handlePendItem })
      } else {
        list.push({ text: 'Activate Finding', icon: 'mdi-check-circle', click: this.handleActivateItem })
      }
      list.push({ text: 'Delete Finding', icon: 'mdi-trash-can-outline', click: this.handleDeleteItem })
      return list
    },

    // handler
    handleViewItem(row) {
      this.findingModel = Object.assign(this.findingModel, row)
      this.viewDialog = true
    },
    parseQuery() {
      if (!this.$route.query) return
      if ( this.$route.query.data_source ) {
        this.searchModel.dataSource = this.$route.query.data_source.split(',')
      }
      if ( this.$route.query.tag ) {
        this.searchModel.tag = this.$route.query.tag.split(',')
      }
      if ( this.$route.query.resource_name ) {
        this.searchModel.resourceName = this.$route.query.resource_name.split(',')
      }
      this.searchModel.score[0] = 0.0
      this.searchModel.score[1] = 1.0
      if ( this.$route.query.from_score ) {
        this.searchModel.score[0] = this.$route.query.from_score
      }
      if ( this.$route.query.to_score ) {
        this.searchModel.score[1] = this.$route.query.to_score
      }
    },
    getSearchCondition() {
      let searchCond = ''
      let queryOld = this.$route.query
      let queryNew = {}
      if (this.searchModel.dataSource) {
        searchCond += '&data_source=' + this.searchModel.dataSource
        queryNew.data_source = this.searchModel.dataSource
      }
      if (this.searchModel.tag) {
        searchCond += '&tag=' + this.searchModel.tag
        queryNew.tag = this.searchModel.tag
      }
      if (this.searchModel.resourceName) {
        searchCond += '&resource_name=' + this.searchModel.resourceName
        queryNew.resource_name = this.searchModel.resourceName
      }
      if (this.searchModel.score[0]) {
        searchCond += '&from_score=' + this.searchModel.score[0]
        queryNew.from_score = this.searchModel.score[0]
      }
      if (this.searchModel.score[1]) {
        searchCond += '&to_score=' + this.searchModel.score[1]
        queryNew.to_score = this.searchModel.score[1]
      }
      const offset = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const limit = this.table.options.itemsPerPage
      searchCond += '&offset=' + offset + '&limit=' + limit
      const sort = this.table.sort.key
      const direction = this.table.sort.direction
      searchCond += '&sort=' + sort + '&direction=' + direction
      if (Object.entries(queryNew).sort().toString() != Object.entries(queryOld).sort().toString() ){
        this.$router.push({query: queryNew})
      }
      return searchCond
    },
    handleSort(newSortKey) {
      const oldKey =this.table.sort.key
      const oldDirection = this.table.sort.direction
      if (oldKey === newSortKey) {
        this.table.sort.direction = oldDirection === 'asc' ? 'desc' : 'asc' // reverse direction
      } else {
        this.table.sort.key = newSortKey
        this.table.sort.direction = 'asc'
      }
      this.refleshList()
    },
    handleSearch() {
      this.refleshList()
    },
    handleDeleteItem(row) {
      this.findingModel = Object.assign(this.findingModel, row)
      this.deleteDialog  = true
    },
    async handleActivateItem(row) {
      this.loading = true
      await this.deletePendFinding(this.$store.state.project.project_id, row.finding_id)
      this.finishSuccess('Success: Activated.')
    },
    async handlePendItem(row) {
      this.loading = true
      await this.putPendFinding(row.finding_id)
      this.finishSuccess('Success: Pending.')
    },
    handleNewTag(){
      this.findingModel.new_tag = '' // clear
      this.tagDialog = true
    },
    async handleNewTagSubmit(){
      this.loading = true
      if ( this.findingModel.finding_id && this.findingModel.new_tag ) {
        await this.tagFinding( this.findingModel.finding_id, this.findingModel.new_tag)
        this.finishSuccess('Success: New Tag `' + this.findingModel.new_tag + '`.')
      }
      this.tagDialog = false
      this.loading = false
    },
    async handleUntag(item) {
      this.loading = true
      if ( item.finding_tag_id ) {
        await this.untagFinding(item.finding_tag_id)
        this.finishSuccess('Success: Untag `' + item.tag + '`.')
      }
      this.viewDialog = false
      this.loading = false
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.deleteFinding(this.findingModel.finding_id)
      this.finishSuccess('Success: Delete.')
    },

    // finish
    async finishSuccess(msg) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.finish(true)
    },
    async finishError(msg) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyError(msg)
      this.finish(false)
    },
    async finish(reflesh) {
      this.loading = false
      this.viewDialog  = false
      this.deleteDialog  = false
      this.tagDialog = false
      if ( reflesh ) {
        this.handleSearch()
      }
    },
  },
}
</script>
