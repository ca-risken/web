<template>
  <div>
    <v-container>
      <v-row dense>
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue lighten-2">mdi-file-find-outline</v-icon>Resource
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
      <v-row danse justify="center" align-content="center">
        <v-col cols="12">
          <v-card>
            <d3-network
              :net-nodes="map.nodes" 
              :net-links="map.links"
              :selection="map.selected" 
              :options="map.options"
              @node-click="clickNode"
            />
          </v-card>
        </v-col>
      </v-row>
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
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="resource_id"
                @click:row="handleViewItem"
                @update:page="loadList"
                v-model="table.selected"
              >
                <!-- Sortable Header -->
                <template v-slot:[`header.resource_id`]="{ header }"><a @click="handleSort(header.value)">{{ header.text }}</a></template>
                <template v-slot:[`header.resource_name`]="{ header }"><a @click="handleSort(header.value)">{{ header.text }}</a></template>
                <template v-slot:[`header.updated_at`]="{ header }"><a @click="handleSort(header.value)">{{ header.text }}</a></template>
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

    <v-dialog v-model="resourceMapDialog" max-width="80%">
      <v-card>
        <v-card-title class="headline">
          <v-icon large color="teal darken-2">mdi-file-tree-outline</v-icon>
          <span class="mx-4">Resource Map</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row danse justify="center" align-content="center">
              <v-col cols="12">
                <v-card :loading="loading"  height="60vh">
                  <d3-network
                    :net-nodes="resourceMap.nodes" 
                    :net-links="resourceMap.links" 
                    :options="resourceMapOptions" 
                    @node-click="clickNode"
                  />
                </v-card>
              </v-col>
            </v-row>
          </v-container>

        </v-card-text>
        <v-card-actions>
          <v-card-text>
            <v-row>
              <v-col cols="8">
                <v-slider
                  class="mx-6"
                  v-model="resourceMap.options.force"
                  label="MapSize"
                  min="1"
                  max="99999"
                  step="10"
                  append-icon="mdi-magnify-plus-outline"
                  prepend-icon="mdi-magnify-minus-outline"
                  thumb-color="teal"
                  thumb-label="always"
                  thumb-size="42"
                ></v-slider>
              </v-col>
              <v-col cols="3">
                <v-slider
                  class="mx-2"
                  v-model="resourceMap.options.nodeSize"
                  label="NodeSize"
                  min="1"
                  max="99"
                  step="1"
                  append-icon="mdi-magnify-plus-outline"
                  prepend-icon="mdi-magnify-minus-outline"
                  thumb-color="teal"
                  thumb-label="always"
                  thumb-size="42"
                ></v-slider>
              </v-col>
              <v-col cols="1">
                <v-btn text outlined color="grey darken-1" @click="resourceMapDialog = false">
                  CANCEL
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="findingDialog" max-width="60%">
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
                    <v-icon :color="getColorByScore(findingModel.score)">mdi-scoreboard</v-icon>
                    Score
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip dark :color="getColorByScore(findingModel.score)">{{ findingModel.score | formatScore }}</v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4">
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
          </v-row>
          <v-row dense class="mx-2">
            <v-col cols="10">
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
            <v-col cols="10">
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
          <v-btn dark outlined color="light-blue darken-4" @click="handleViewFindingFromNode">
            VIEW FINDING
          </v-btn>
          <v-btn text outlined color="grey darken-1" @click="findingDialog = false">
            CANCEL
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import mixin from '@/mixin'
import finding from '@/mixin/api/finding'
import D3Network from 'vue-d3-network'
export default {
  mixins: [mixin, finding],
  components: {
    D3Network,
  },
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
          { text: 'ID',       align: 'center', width: '5%',  value: 'resource_id' },
          { text: 'Resource', align: 'start',  width: '20%', value: 'resource_name' },
          { text: 'Findings', align: 'center', width: '5%',  value: 'findings', sortable: false },
          { text: 'Updated',  align: 'start',  width: '10%', value: 'updated_at' },
          { text: 'Action',   align: 'center', width: '10%', value: 'action', sortable: false }
        ],
        options: {
          page: 1,
          itemsPerPage: 5,
          sortBy: ['id'],
        },
        sort: {
          key: 'resource_id',
          direction: 'asc',
        },
        actions: [
          { text: 'View Finding', icon: 'mdi-eye', click: this.handleViewFinding },
          { text: 'Resource Map', icon: 'mdi-file-tree-outline', click: this.handleViewItem },
        ],
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [8],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
      // resourceIDs: [],
      map: {
        nodes: [],
        links: [],
        options: {
          force: 1200,
          nodeSize: 20,
          nodeLabels: true,
          linkLabels:true,
          linkWidth: 5,
        }
      },

      resourceMapDialog: false,
      resourceMap: {
        nodes: [],
        links: [],
        options: {
          force: 10000,
          nodeSize: 30,
          size: {w:1160, h:560},
          nodeLabels: true,
          linkLabels:true,
          linkWidth: 30,
          fontSize: 20,
        }
      },
      findingDialog: false,
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
    }
  },
  filters: {
    formatScore: (score) => {
      if (!Number.isInteger(score)){return score}
      return score.toFixed(2)
    },
  },
  async mounted() {
    await this.refleshList()
  },
  computed: {
    dateRangeText () {
      if ( this.searchModel.dates.length < 1 || this.searchModel.dates[0] === '' || this.searchModel.dates[1] === '' ) {
        return ''
      }
      return this.searchModel.dates.join(' ~ ')
    },
    resourceMapOptions(){
      return{
        force:      this.resourceMap.options.force,
        size:       {w:this.resourceMap.options.size.w, h:this.resourceMap.options.size.h},
        nodeSize:   this.resourceMap.options.nodeSize,
        nodeLabels: this.resourceMap.options.nodeLabels,
        linkLabels: this.resourceMap.options.linkLabels,
        linkWidth:  this.resourceMap.options.linkWidth,
        fontSize:   this.resourceMap.options.fontSize,
      }
    }
  },
  methods: {
    // Handler
    handleViewFinding(item) {
      this.$router.push('/finding/finding?resource_name=' + item.resource_name)
    },
    handleViewFindingFromNode() {
      this.$router.push('/finding/finding/' + 
        '?resource_name=' + this.findingModel.resource_name +
        '&data_source='   + this.findingModel.data_source +
        '&from_score='    + this.findingModel.from_score +
        '&to_score='      + this.findingModel.to_score)
    },
    handleViewItem(item) {
      this.resourceMap.nodes = []
      this.resourceMap.links = []
      this.loadResouceMap(item.resource_id)
      this.resourceMapDialog = true
    },
    handleSearch() {
      this.refleshList()
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

    getSearchCondition() {
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
      const offset = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const limit = this.table.options.itemsPerPage
      const sort = this.table.sort.key
      const direction = this.table.sort.direction
      searchCond += '&offset=' + offset + '&limit=' + limit + '&sort=' + sort + '&direction=' + direction
      return searchCond
    },

    // Service
    async refleshList() {
      this.table.options.page = 1
      await this.loadList()
    },
    async loadList() {
      this.loading = true
      this.clearList()
      const list = await this.listResourceID(this.getSearchCondition())
      if ( !list.resource_id || list.resource_id.length == 0 ) {
        this.loading = false
        return 
      }
      this.table.total = list.total
      for( const id of list.resource_id ) {
        const resource = await this.getResource(id)
        const findingIDs = await this.listFindingByResouceName(resource.resource_name)
        await this.setResourceMap(resource, findingIDs, this.map, 5)
        this.table.items.push({
          resource_id:   resource.resource_id,
          resource_name: resource.resource_name,
          updated_at:    resource.updated_at,
          findings:      findingIDs.length,
        })
        this.resourceNameList.push(resource.resource_name)
      }
      this.loading = false
    },
    async loadResouceMap( resourceID ) {
      this.loading = true
      const resource = await this.getResource(resourceID)
      const findingIDs = await this.listFindingByResouceName(resource.resource_name)
      await this.setResourceMap(resource, findingIDs, this.resourceMap, 99999)
      this.loading = false
    }, 
    clearList() {
      this.table.items = []
      this.resourceNameList = []
      this.map.nodes = []
      this.map.links = []
    },

    // ResourceMap
    async setResourceMap(resource, findingIDs, map, nodeLimits) {
      const srcID = 'r-' + resource.resource_id
      map.nodes.push({
        id :    srcID,
        name:   this.getShortName(resource.resource_name),
        svgSym: 'icons.gitHub',
      })
      let count = 0
      for( let id of findingIDs ) {
        count++
        if ( count > nodeLimits ) {
          const targetID = srcID + '-more...'
          map.nodes.push({
            id:     targetID,
            name:   'and more...',
            _color: '#616161',
          })
          map.links.push({
            sid: srcID,
            tid: targetID,
            _svgAttrs:{'stroke-width':3, opacity:2},
            _color: '#E0E0E0',
          })
          break // limit
        }
        const finding = await this.getFinding(id)
        const targetID = 'f-' + finding.finding_id
        map.nodes.push({
          id:      targetID,
          name:    finding.score + 'pt (' + finding.data_source + ')',
          finding: finding,
          _color: this.getColorRGBByScore(finding.score),
        })
        map.links.push({
          sid: srcID,
          tid: targetID,
          _svgAttrs:{'stroke-width':3, opacity:2},
          _color: '#E0E0E0',
        })
      }
    },
    clickNode(event, node) {
      if ( !node.finding ) return
      // console.log('event: ' + event)
      this.findingModel = Object.assign(this.findingModel, node.finding)
      this.findingDialog = true
    },
  }
}
</script>
<style>
.node {
  stroke: rgba(18,120,98,.7);
  stroke-width: 4px;
  -webkit-transition: fill .5s ease;
  transition: fill .5s ease;
  fill: #E0E0E0
}
.node.selected {
  stroke: #caa455
}
.node.pinned {
  stroke: rgba(190,56,93,.6)
}
.link {
  stroke: rgba(18,120,98,.3)
}
.link,.node {
  stroke-linecap: round
}
.link:hover,.node:hover {
  stroke: #be385d;
  stroke-width: 5px
}
.link.selected {
  stroke: rgba(202,164,85,.6)
}
.curve {
  fill: none
}
.link-label,.node-label {
  fill: #616161
}
.link-label {
  -webkit-transform: translateY(-.5em);
  transform: translateY(-.5em);
  text-anchor: middle
}
</style>