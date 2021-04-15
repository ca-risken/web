<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="9">
          <v-toolbar color="background" flat>
            <v-toolbar-title  class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue lighten-2">mdi-file-find-outline</v-icon>
              {{ $t(`submenu['Finding']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
        <v-col cols="3" align-self="end" class="text-right">
          <v-slider
            outlined hide-details
            min="0.0"
            max="1.0"
            step="0.1"
            :label="$t(`item['`+searchForm.score.label+`']`)"
            v-model="searchModel.scoreFrom"
            thumb-label="always"
            :thumb-color="getColorByScore(searchModel.scoreFrom)"
          ></v-slider>
        </v-col>
      </v-row>
      <v-form ref="searchForm" >
        <v-row justify="center" align-content="center">
          <v-col cols="2" class="px-2">
            <v-text-field
              outlined dense clearable 
              background-color="white"
              :placeholder="searchForm.findingID.placeholder"
              v-model="searchModel.findingID"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="3" class="px-2">
            <v-combobox
              multiple outlined dense clearable small-chips deletable-chips hide-details
              background-color="white"
              v-model="searchModel.resourceName"
              :loading="loading"
              :label="$t(`item['`+searchForm.resourceName.label+`']`)"
              :placeholder="searchForm.resourceName.placeholder"
              :items="resourceNameCombobox"
              @keydown="listResourceNameForCombobox"
              persistent-hint
            />
          </v-col>
          <v-col cols="2" class="px-2">
            <v-combobox
              multiple outlined dense clearable small-chips deletable-chips hide-details
              background-color="white"
              :label="$t(`item['`+searchForm.tag.label+`']`)"
              :placeholder="searchForm.tag.placeholder"
              :items="searchForm.tagList"
              v-model="searchModel.tag"
            />
          </v-col>
          <v-col cols="3" class="px-2">
            <v-combobox
              multiple outlined dense clearable small-chips deletable-chips hide-details
              background-color="white"
              :label="$t(`item['`+searchForm.dataSource.label+`']`)"
              :placeholder="searchForm.dataSource.placeholder"
              :items="dataSourceList"
              v-model="searchModel.dataSource"
            />
          </v-col>
          <v-col cols="2" class="px-1 text-right">
            <v-btn fab small depressed outlined color="indigo darken-2" @click="handleSearch">
              <v-icon>search</v-icon>
            </v-btn>
            <v-menu :disabled="!table.selected || table.selected.length <= 0">
              <template v-slot:activator="{ attrs, on }">
                <v-btn class="ml-2" fab small depressed outlined color="green darken-2" v-bind="attrs" v-on="on">
                  <v-icon>mdi-format-list-bulleted-square</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item
                  v-for="action in table.selectedActions"
                  :key="action.text"
                  @click="action.click"
                >
                  <v-list-item-icon class="ml-1 mr-1">
                    <v-icon small>{{ action.icon }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title class="ma-1">{{ $t(`action['`+ action.text +`']`) }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-form>
      <v-row class="mt-2">
        <v-tabs
          v-model="searchModel.tab"
          background-color="background"
          color="cyan darken-3 accent-4"
          fixed-tabs
          @change="handleChangeStatus"
        >
          <v-tab class="mx-0 px-0">{{ $t(`view.finding['ACTIVE']`) }}</v-tab>
          <v-tab class="mx-0 px-0">{{ $t(`view.finding['PENDING']`) }}</v-tab>
          <v-tab class="mx-0 px-0">{{ $t(`view.finding['ALL']`) }}</v-tab>
        </v-tabs>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card>
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
                item-key="finding_id"
                @click:row="handleViewItem"
                @update:page="loadList"
                @update:options="loadList"
                v-model="table.selected"
                show-select
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
                  <v-icon v-if="item.status" :color="getColorByFindingStatus(item.status)">mdi-check-circle</v-icon>
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:[`item.score`]="{ item }">
                  <v-chip dark :color="getColorByScore(item.score)">{{ item.score | formatScore }}</v-chip>
                </template>
                <template v-slot:[`item.tags`]="{ item }">
                  <v-chip>
                    <v-tooltip top color="grey lighten-4">
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                          <v-icon>mdi-label</v-icon>
                        </v-btn>
                      </template>
                      <v-chip
                        v-for="t in item.tags"
                        :key="t.finding_tag_id"
                        class="ma-1"
                        color="grey darken-3"
                        dark
                      >
                        {{ t.tag }}
                      </v-chip>
                    </v-tooltip>
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
                        <v-list-item-title>{{ $t(`action['`+ action.text +`']`) }}</v-list-item-title>
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
          <v-card-title>{{ $t(`submenu['Finding']`) }}</v-card-title>
        </v-toolbar>
        <v-container fluid>
          <v-row dense class="mx-2">
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon color="black" dark left>mdi-identifier</v-icon>
                    Finding ID
                    <clip-board
                      name="Finding ID"
                      :text="findingModel.finding_id"
                    />
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
                    {{ $t(`item['Data Source']`) }}
                    <clip-board
                      :name="$t(`item['Data Source']`)"
                      :text="findingModel.data_source"
                    />
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
                    {{ $t(`item['Resource Name']`) }}
                    <clip-board
                      :name="$t(`item['Resource Name']`)"
                      :text="findingModel.resource_name"
                    />
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
                    {{ $t(`item['Description']`) }}
                    <clip-board
                      :name="$t(`item['Description']`)"
                      :text="findingModel.description"
                    />
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
                    {{ $t(`item['Score']`) }}
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
                    {{ $t(`item['Original Score']`) }}
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
                {{ $t(`item['Tag']`) }}
                <v-btn text outlined dense color="black lighten-1" class="ma-4" :loading="loading" @click="handleNewTag">
                  {{ $t(`btn['NEW TAG']`) }}
                </v-btn>
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
                <clip-board
                  name="JSON Data"
                  :text="findingModel.data | pretty"
                />
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
                {{ $t(`item['Created']`) }}
              </v-list-item-subtitle>
              <v-list-item-title>
                <v-chip>{{ findingModel.created_at | formatTime }}</v-chip>
              </v-list-item-title>
            </v-col>
            <v-col cols="4">
              <v-list-item-subtitle>
                <v-icon left>mdi-clock-outline</v-icon>
                {{ $t(`item['Updated']`) }}
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
            {{ $t(`btn['CANCEL']`) }}
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
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="blue darken-1"
            text outlined
            :loading="loading"
            @click="handleNewTagSubmit"
          >
            {{ $t(`btn['TAG']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.finding_id"></v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Finding ID']`) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-file-find-outline</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.resource_name"></v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Resource Name']`) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-image-text</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="findingModel.description"></v-list-item-title>
              <v-list-item-subtitle>{{ $t(`item['Description']`) }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined color="grey darken-1" @click="deleteDialog = false">
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red darken-1"
            text outlined
            :loading="loading"
            @click="handleDeleteSubmit"
          >
            {{ $t(`btn['DELETE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import finding from '@/mixin/api/finding'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
export default {
  mixins: [mixin, finding],
  components: {
    BottomSnackBar,
    ClipBoard,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        findingID: '',
        dataSource: [],
        resourceName: [],
        tag: [],
        // score: [0.0, 1.0],
        scoreFrom: 0.5,
        scoreTo: 1.0,
        tab: 0,
        status: 1,
      },
      searchForm: {
        findingID: { label: 'ID', placeholder: 'ID' },
        dataSource: { label: 'Data Source', placeholder: 'Filter data sources' },
        resourceName: { label: 'Resource Name', placeholder: 'Filter resource' },
        tag: { label: 'Tag', placeholder: 'Filter tag' },
        score: { label: 'Score', placeholder: 'Filter score' },
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
        options: {
          page: 1,
          itemsPerPage: 20,
        },
        sort: {
          key: 'finding_id',
          direction: 'asc',
        },
        selectedActions: [
          { text: 'Pend selected findings', icon: 'mdi-check-circle-outline', click: this.handlePendSelected },
          { text: 'Delete selected findings', icon: 'mdi-trash-can-outline', click: this.handleDeleteSelected },
        ],
        total: 0,
        footer: {
          disableItemsPerPage: false,
          itemsPerPageOptions: [20, 50, 100],
          itemsPerPageText: 'Rows/Page', 
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
    }
  },
  filters: {
    pretty: (v) => {
      if (!v){return false}
      return JSON.stringify(JSON.parse(v), null, 2)
    },
    formatScore: (score) => {
      if (!Number.isInteger(score)){return score}
      return score.toFixed(2)
    },
    itemCount: (items) => {
      if ( items && items.length ){
        return items.length
      }
      return 0
    },
  },
  computed: {
    headers() {
      return [
        { text: this.$i18n.t('item["ID"]'),          align: 'center', width: '5%',  value: 'finding_id' },
        { text: this.$i18n.t('item["Status"]'),      align: 'center', width: '10%',  value: 'status', sortable: false },
        { text: this.$i18n.t('item["Score"]'),       align: 'center', width: '5%',  value: 'score' },
        { text: this.$i18n.t('item["Data Source"]'), align: 'center', width: '10%', value: 'data_source' },
        { text: this.$i18n.t('item["Resource"]'),    align: 'start',  width: '30%', value: 'resource_name' },
        { text: this.$i18n.t('item["Description"]'), align: 'start',  width: '30%', value: 'description' },
        { text: this.$i18n.t('item["Tags"]'),        align: 'start',  width: '5%',  value: 'tags', sortable: false },
        { text: this.$i18n.t('item["Action"]'),      align: 'center', width: '5%',  value: 'action', sortable: false },
      ]
    },
  },
  mounted() {
    this.getTag()
    this.listResourceNameForCombobox()
    this.refleshList(true)
  },
  methods: {
    refleshList(parse) {
      this.table.options.page = 1
      this.loadList(parse)
    },
    async loadList(parse) {
      this.loading = true
      this.clearList()
      if (parse) {
        this.parseQuery()
      }
      const list = await this.listFinding(this.getSearchCondition())
      if ( !list.finding_id || list.finding_id.length == 0 ) {
        this.loading = false
        return 
      }

      this.table.total = list.total
      let findings = []
      for ( const id of list.finding_id) {
        findings.push(this.getFindingDetail(id))
      }
      this.table.items = await Promise.all(findings) // Parallel API call
      this.loading = false
    },
    async getFindingDetail(id) {
      const [finding, tag, pend ] = await Promise.all([
        this.getFinding(id),
        this.listFindingTag(id),
        this.getPendFinding(id),
      ])
      return {
        finding_id:     id,
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
      const query = this.$route.query
      if ( query.finding_id && query.finding_id != "") {
        this.searchModel.findingID = query.finding_id
      }
      if ( query.data_source && query.data_source != "") {
        this.searchModel.dataSource = String(query.data_source).split(',')
      }
      if ( query.tag && query.tag != "" ) {
        this.searchModel.tag = String(query.tag).split(',')
      }
      if ( query.resource_name && query.resource_name  != "" ) {
        this.searchModel.resourceName = String(query.resource_name).split(',')
      }
      this.searchModel.scoreFrom = 0.5
      this.searchModel.scoreTo = 1.0
      if ( query.from_score ) {
        this.searchModel.scoreFrom = query.from_score
      }
      // if ( query.to_score ) {
      //   this.searchModel.score[1] = query.to_score
      // }
      this.searchModel.status = this.getFindingStatus('ACTIVE')
      if ( query.status ) {
        this.searchModel.status = query.status
      }
      this.setStatusTab()
    },
    getSearchCondition() {
      let searchCond = ''
      let queryOld = this.$route.query
      let queryNew = {}
      if (this.searchModel.findingID) {
        searchCond += '&finding_id=' + this.searchModel.findingID
        queryNew.finding_id = this.searchModel.findingID
      }
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
      if (this.searchModel.scoreFrom) {
        searchCond += '&from_score=' + this.searchModel.scoreFrom
        queryNew.from_score = this.searchModel.scoreFrom
      }
      // if (this.searchModel.score[1]) {
      //   searchCond += '&to_score=' + this.searchModel.score[1]
      //   queryNew.to_score = this.searchModel.score[1]
      // }
      if (this.searchModel.status) {
        searchCond += '&status=' + this.searchModel.status
        queryNew.status = this.searchModel.status
      }
      const offset = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const limit = this.table.options.itemsPerPage
      const sort = this.table.sort.key
      const direction = this.table.sort.direction
      searchCond += '&offset=' + offset + '&limit=' + limit + '&sort=' + sort + '&direction=' + direction
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
    async handlePendSelected() {
      this.loading = true
      const count = this.table.selected.length
      this.table.selected.forEach(async item => {
        if (!item.finding_id) return
        await this.putPendFinding(item.finding_id)
      })
      this.finishSuccess('Success: Pend ' + count + ' findings.')
    },
    async handleDeleteSelected() {
      this.loading = true
      const count = this.table.selected.length
      this.table.selected.forEach(async item => {
        if (!item.finding_id) return
        await this.deleteFinding(item.finding_id)
      })
      this.finishSuccess('Success: Delete ' + count + ' findings.')
    },
    handleChangeStatus(tabNumber) {
      switch (tabNumber) {
        case 0:
          this.searchModel.status = this.getFindingStatus('ACTIVE')
          break
        case 1:
          this.searchModel.status = this.getFindingStatus('PENDING')
          break
        case 2:
          this.searchModel.status = this.getFindingStatus('ALL')
          break
        default:
          this.searchModel.status = this.getFindingStatus('ACTIVE')
      }
      this.loadList()
    },
    setStatusTab() {
      const status = this.getFindingStatusText(this.searchModel.status)
      switch (status) {
        case 'ACTIVE':
          this.searchModel.tab = 0
          break
        case 'PENDING':
          this.searchModel.tab = 1
          break
        case 'ALL':
          this.searchModel.tab = 2
          break
        default:
          this.searchModel.tab = 0
      }
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
