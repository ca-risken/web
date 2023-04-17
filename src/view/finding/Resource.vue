<template>
  <div>
    <v-container>
      <v-row dense>
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue lighten-2"
                >mdi-file-find-outline</v-icon
              >
              {{ $t(`submenu['Resource']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense>
          <v-col cols="12" sm="2" md="2">
            <v-combobox
              outlined
              dense
              hide-details
              background-color="white"
              v-model="searchModel.namespace"
              :loading="loading"
              :label="$t(`item['` + searchForm.namespace.label + `']`)"
              :items="searchForm.namespace.items"
              @change="handleChangeNamespace"
            />
          </v-col>
          <v-col cols="12" sm="2" md="2">
            <v-combobox
              outlined
              dense
              hide-details
              background-color="white"
              v-model="searchModel.resourceType"
              :loading="loading"
              :label="$t(`item['` + searchForm.resourceType.label + `']`)"
              :items="searchForm.resourceType.items"
            />
          </v-col>
          <v-col cols="12" sm="4" md="4">
            <v-combobox
              multiple
              outlined
              dense
              clearable
              small-chips
              deletable-chips
              hide-details
              background-color="white"
              v-model="searchModel.resourceName"
              :loading="loading"
              :label="$t(`item['` + searchForm.resourceName.label + `']`)"
              :placeholder="searchForm.resourceName.placeholder"
              :items="resourceNameCombobox"
              @keydown="listResourceNameForCombobox"
              persistent-hint
              ref="refResourceName"
            />
          </v-col>
          <v-col cols="12" sm="3" md="3">
            <v-combobox
              multiple
              outlined
              dense
              clearable
              small-chips
              deletable-chips
              hide-details
              background-color="white"
              :label="$t(`item['` + searchForm.tag.label + `']`)"
              :placeholder="searchForm.tag.placeholder"
              :items="searchForm.tagList"
              :loading="loading"
              v-model="searchModel.tag"
              ref="refTag"
            />
          </v-col>
          <v-spacer />
          <v-btn
            class="mt-0 mr-4"
            fab
            dense
            small
            :loading="loading"
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
                item-key="resource_id"
                @click:row="handleViewItem"
                @update:page="loadList"
                v-model="table.selected"
              >
                <!-- Sortable Header -->
                <template v-slot:[`header.resource_id`]="{ header }"
                  ><a @click="handleSort(header.value)">{{
                    header.text
                  }}</a></template
                >
                <template v-slot:[`header.namespace`]="{ header }"
                  ><a @click="handleSort(header.value)">{{
                    header.text
                  }}</a></template
                >
                <template v-slot:[`header.resource_type`]="{ header }"
                  ><a @click="handleSort(header.value)">{{
                    header.text
                  }}</a></template
                >
                <template v-slot:[`header.resource_name`]="{ header }"
                  ><a @click="handleSort(header.value)">{{
                    header.text
                  }}</a></template
                >
                <template v-slot:[`header.updated_at`]="{ header }"
                  ><a @click="handleSort(header.value)">{{
                    header.text
                  }}</a></template
                >
                <template v-slot:[`item.resource_name`]="{ item }">
                  {{ cutLongText(item.resource_name, 80) }}
                </template>
                <template v-slot:[`item.namespace`]="{ item }">
                  <v-layout justify-center>
                    <v-avatar
                      v-if="item.data_source == 'RISKEN'"
                      tile
                      class="ma-0"
                      size="30px"
                    >
                      <img src="/static/m.png" :alt="item.data_source" />
                    </v-avatar>
                    <v-icon
                      v-else
                      :color="getDataSourceIconColor(item.namespace)"
                    >
                      {{ getDataSourceIcon(item.namespace) }}
                    </v-icon>
                  </v-layout>
                </template>
                <template v-slot:[`item.check_point`]="{ item }">
                  <v-card
                    v-if="item.check_point !== null"
                    dark
                    color="grey darken-1"
                    class="ma-1"
                  >
                    <v-card-text class="pa-0">
                      <json-viewer
                        :value="item.check_point"
                        :expand-depth="0"
                        preview-mode
                        theme="finding-json-theme"
                      ></json-viewer>
                    </v-card-text>
                  </v-card>
                </template>
                <template v-slot:[`item.tags`]="{ item }">
                  <v-chip
                    color="indigo lighten-2"
                    class="ma-1"
                    small
                    dark
                    v-for="t in shortenTags(item.tags, 5)"
                    :key="t.tag"
                    >{{ t.tag }}</v-chip
                  >
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
                        @click="action.click(item)"
                      >
                        <v-list-item-icon class="mr-2">
                          <v-icon small>{{ action.icon }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{
                          $t(`action['` + action.text + `']`)
                        }}</v-list-item-title>
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
          <span class="mx-4">{{ $t(`view.finding["ResourceMap"]`) }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row danse justify="center" align-content="center">
              <v-col cols="3">
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-subtitle>
                      <v-icon
                        left
                        :color="getDataSourceIconColor(resourceModel.namespace)"
                      >
                        {{ getDataSourceIcon(resourceModel.namespace) }}
                      </v-icon>
                      Namespace
                      <clip-board
                        name="Namespace"
                        :text="resourceModel.namespace"
                      />
                    </v-list-item-subtitle>
                    <v-list-item-title class="headline">
                      {{ resourceModel.namespace }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
              <v-col cols="9">
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-subtitle>
                      <v-icon left>mdi-file-find-outline</v-icon>
                      Resource Name
                      <clip-board
                        name="Resource Name"
                        :text="resourceModel.resource_name"
                      />
                    </v-list-item-subtitle>
                    <v-list-item-title class="headline">
                      {{ resourceModel.resource_name }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
            <v-row danse justify="center" align-content="center">
              <v-col cols="12">
                <v-card :loading="loading" height="60vh">
                  <d3-network
                    :net-nodes="resourceMap.nodes"
                    :net-links="resourceMap.links"
                    :options="resourceMapOptions"
                    @node-click="clickNode"
                  />
                </v-card>
              </v-col>
            </v-row>
            <!-- TAG -->
            <v-row danse justify="center" align-content="center">
              <v-col cols="12">
                <v-card-text>
                  <v-chip
                    v-for="t in resourceModel.tags"
                    :key="t.tag"
                    color="indigo lighten-2"
                    class="ma-2"
                    dark
                  >
                    {{ t.tag }}
                  </v-chip>
                </v-card-text>
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
                <v-btn
                  text
                  outlined
                  color="grey darken-1"
                  @click="resourceMapDialog = false"
                >
                  {{ $t(`btn['CANCEL']`) }}
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
                    <clip-board
                      name="Finding ID"
                      :text="String(findingModel.finding_id)"
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
                    <v-icon :color="getColorByScore(findingModel.score)"
                      >mdi-scoreboard</v-icon
                    >
                    Score
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip dark :color="getColorByScore(findingModel.score)">{{
                      findingModel.score | formatScore
                    }}</v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon
                      left
                      :color="getDataSourceIconColor(findingModel.data_source)"
                    >
                      {{ getDataSourceIcon(findingModel.data_source) }}
                    </v-icon>
                    Data Source
                    <clip-board
                      name="Data Source"
                      :text="findingModel.data_source"
                    />
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
                    <clip-board
                      name="Resource Name"
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
            <v-col cols="10">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <v-icon left>mdi-image-text</v-icon>
                    Description
                    <clip-board
                      name="Description"
                      :text="findingModel.description"
                    />
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
          <v-btn
            dark
            outlined
            color="light-blue darken-4"
            @click="handleViewFindingFromNode"
          >
            {{ $t(`btn['VIEW FINDING']`) }}
          </v-btn>
          <v-btn
            text
            outlined
            color="grey darken-1"
            @click="findingDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
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
            <v-list-item-avatar
              ><v-icon>mdi-identifier</v-icon></v-list-item-avatar
            >
            <v-list-item-content>
              <v-list-item-title>
                {{ resourceModel.resource_id }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Resource ID']`) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-file-find-outline</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ resourceModel.resource_name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Resource Name']`) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            outlined
            color="grey darken-1"
            @click="deleteDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            outlined
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
import checkpoint from '@/mixin/checkpoint'
import D3Network from 'vue-d3-network'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
import JsonViewer from 'vue-json-viewer'
export default {
  name: 'ResourceList',
  mixins: [mixin, finding, checkpoint],
  components: {
    BottomSnackBar,
    D3Network,
    ClipBoard,
    JsonViewer,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        namespace: '',
        resourceType: '',
        resourceName: '',
        dates: ['', ''],
        tag: [],
      },
      searchForm: {
        namespace: {
          label: 'Namespace',
          items: ['aws', 'google', 'diagnosis', 'code', 'osint'],
        },
        resourceName: {
          label: 'Resource Name',
          placeholder: 'Filter for resource name',
        },
        dates: {
          label: 'UpdatedAt Range',
          placeholder: 'Filter for dates range',
          menu: false,
        },
        resourceType: {
          label: 'ResourceType',
          items: [''],
        },
        tag: { label: 'Tag', placeholder: 'Filter tag' },
        tagList: [],
      },
      resourceNameList: [],
      search: '',
      table: {
        selected: [],
        options: {
          page: 1,
          itemsPerPage: 20,
          sortBy: ['id'],
        },
        sort: {
          key: 'resource_id',
          direction: 'asc',
        },
        actions: [
          {
            text: 'View Finding',
            icon: 'mdi-eye',
            click: this.handleViewFinding,
          },
          {
            text: 'Resource Map',
            icon: 'mdi-file-tree-outline',
            click: this.handleViewItem,
          },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteItem,
          },
        ],
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [20],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },

      resourceMapDialog: false,
      resourceMap: {
        nodes: [],
        links: [],
        options: {
          force: 20000,
          nodeSize: 25,
          size: { w: 1160, h: 560 },
          nodeLabels: true,
          linkLabels: true,
          linkWidth: 30,
          fontSize: 20,
        },
      },
      findingDialog: false,
      findingModel: {
        finding_id: '',
        status: '',
        score: '',
        original_score: '',
        data_source: '',
        resource_name: '',
        description: '',
        tags: [],
        data: '',
        created_at: '',
        updated_at: '',
        new_tag: '',
      },

      deleteDialog: false,
      resourceModel: {
        resource_id: '',
        namespace: '',
        resource_type: '',
        resource_name: '',
        check_point: '',
        tags: [],
        created_at: '',
        updated_at: '',
      },
    }
  },
  filters: {
    formatScore: (score) => {
      if (!Number.isInteger(score)) {
        return score
      }
      return score.toFixed(2)
    },
  },
  async mounted() {
    this.loading = true
    this.getTag()
    this.listResourceNameForCombobox()
    await this.refleshList()
  },
  computed: {
    headers() {
      return [
        {
          text: this.$i18n.t('item["ID"]'),
          align: 'center',
          width: '2%',
          value: 'resource_id',
        },
        {
          text: this.$i18n.t('item["Name space"]'),
          align: 'center',
          width: '4%',
          value: 'namespace',
          sortable: false,
        },
        {
          text: this.$i18n.t('item["Resource Type"]'),
          align: 'center',
          width: '4%',
          value: 'resource_type',
          sortable: false,
        },
        {
          text: this.$i18n.t('item["Resource"]'),
          align: 'start',
          width: '20%',
          value: 'resource_name',
        },
        {
          text: this.$i18n.t('item["CheckPoint"]'),
          align: 'start',
          width: '15%',
          value: 'check_point',
          sortable: false,
        },
        {
          text: this.$i18n.t('item["Tags"]'),
          align: 'start',
          width: '10%',
          value: 'tags',
          sortable: false,
        },
        {
          text: this.$i18n.t('item["Action"]'),
          align: 'center',
          width: '2%',
          value: 'action',
          sortable: false,
        },
      ]
    },
    dateRangeText() {
      if (
        this.searchModel.dates.length < 1 ||
        this.searchModel.dates[0] === '' ||
        this.searchModel.dates[1] === ''
      ) {
        return ''
      }
      return this.searchModel.dates.join(' ~ ')
    },
    resourceMapOptions() {
      return {
        force: this.resourceMap.options.force,
        size: {
          w: this.resourceMap.options.size.w,
          h: this.resourceMap.options.size.h,
        },
        nodeSize: this.resourceMap.options.nodeSize,
        nodeLabels: this.resourceMap.options.nodeLabels,
        linkLabels: this.resourceMap.options.linkLabels,
        linkWidth: this.resourceMap.options.linkWidth,
        fontSize: this.resourceMap.options.fontSize,
      }
    },
  },
  methods: {
    // Handler
    handleViewFinding(item) {
      this.$router.push(
        '/finding/finding?from_score=0&resource_name=' + item.resource_name
      )
    },
    handleViewFindingFromNode() {
      this.$router.push(
        '/finding/finding/' +
          '?resource_name=' +
          this.findingModel.resource_name +
          '&data_source=' +
          this.findingModel.data_source +
          '&from_score=' +
          this.findingModel.from_score +
          '&to_score=' +
          this.findingModel.to_score
      )
    },
    handleViewItem(item) {
      this.resourceMap.nodes = []
      this.resourceMap.links = []
      this.resourceModel = item
      this.loadResouceMap(item)
      this.resourceMapDialog = true
    },
    handleSearch() {
      this.$refs.refResourceName.blur()
      this.$refs.refTag.blur()
      this.$nextTick(() => {
        this.refleshList()
      })
      this.refleshList()
    },
    handleSort(newSortKey) {
      const oldKey = this.table.sort.key
      const oldDirection = this.table.sort.direction
      if (oldKey === newSortKey) {
        this.table.sort.direction = oldDirection === 'asc' ? 'desc' : 'asc' // reverse direction
      } else {
        this.table.sort.key = newSortKey
        this.table.sort.direction = 'asc'
      }
      this.refleshList()
    },
    // Delete
    handleDeleteItem(row) {
      this.resourceModel = Object.assign(this.resourceModel, row)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.deleteResourceAPI(this.resourceModel.resource_id).catch(
        (err) => {
          this.clearList()
          return Promise.reject(err)
        }
      )
      this.finishSuccess('Success: Delete.')
    },
    handleChangeNamespace() {
      this.searchForm.resourceType.items = []
      switch (this.searchModel.namespace.toLowerCase()) {
        case 'aws':
          this.searchForm.resourceType.items = Array.from(
            this.awsResourceTypeTagMap.keys()
          )
          return
        case 'google':
          this.searchForm.resourceType.items = Array.from(
            this.googleResourceTypeTagMap.keys()
          )
          return
        case 'diagnosis':
          this.searchForm.resourceType.items = Array.from(
            this.diagnosisResourceTypeTagMap.keys()
          )
          return
        case 'osint':
          this.searchForm.resourceType.items = Array.from(
            this.osintResourceTypeTagMap.keys()
          )
          return
        case 'code':
          this.searchForm.resourceType.items = Array.from(
            this.codeResourceTypeTagMap.keys()
          )
          return
        default:
          this.searchForm.resourceType.items = []
          return
      }
    },

    getSearchCondition() {
      let searchCond = ''
      if (this.searchModel.namespace) {
        searchCond +=
          '&namespace=' + encodeURIComponent(this.searchModel.namespace)
      }
      if (this.searchModel.resourceType) {
        searchCond +=
          '&resource_type=' + encodeURIComponent(this.searchModel.resourceType)
      }
      if (this.searchModel.tag) {
        searchCond += '&tag=' + encodeURIComponent(this.searchModel.tag)
      }
      if (this.searchModel.resourceName) {
        searchCond +=
          '&resource_name=' + encodeURIComponent(this.searchModel.resourceName)
      }
      if (this.searchModel.dates[0]) {
        searchCond +=
          '&from_at=' + Math.floor(Date.parse(this.searchModel.dates[0]) / 1000)
      }
      if (this.searchModel.dates[1]) {
        searchCond +=
          '&to_at=' + Math.floor(Date.parse(this.searchModel.dates[1]) / 1000)
      }
      const offset =
        (this.table.options.page - 1) * this.table.options.itemsPerPage
      const limit = this.table.options.itemsPerPage
      const sort = this.table.sort.key
      const direction = this.table.sort.direction
      searchCond +=
        '&offset=' +
        offset +
        '&limit=' +
        limit +
        '&sort=' +
        sort +
        '&direction=' +
        direction
      return searchCond
    },

    // Service
    async refleshList() {
      this.table.options.page = 1
      this.table.total = 0
      await this.loadList()
    },
    async loadList() {
      this.loading = true
      this.clearList()
      const list = await this.listResourceID(this.getSearchCondition())
      if (!list.resource_id || list.resource_id.length == 0) {
        this.loading = false
        return
      }
      this.table.total = list.total
      let resources = []
      for (const id of list.resource_id) {
        resources.push(this.getResourceDetail(id))
      }
      this.table.items = await Promise.all(resources) // Parallel API call
      this.loading = false
    },
    async getResourceDetail(id) {
      const resource = await this.getResource(id)
      const tags = await this.listResourceTag(id)
      const namespace = await this.getNamespaceByTags(tags)
      const resourceType = await this.getResourceTypeByTags(namespace, tags)
      const checkPoint = await this.getResourceCheckPoint(
        namespace,
        resourceType,
        resource.resource_name
      )

      this.resourceNameList.push(resource.resource_name)
      return {
        resource_id: resource.resource_id,
        namespace: namespace,
        resource_type: resourceType,
        resource_name: resource.resource_name,
        check_point: checkPoint,
        tags: tags,
        updated_at: resource.updated_at,
      }
    },
    shortenTags(tags, maxTags) {
      if (!tags) return []
      let shorten = []
      for (let i = 0; i < maxTags; i++) {
        if (!tags[i]) return shorten
        shorten.push(tags[i])
      }
      if (tags.length > maxTags) {
        shorten.push({ tag: '...' })
      }
      return shorten
    },

    async loadResouceMap(resource) {
      this.loading = true
      const findingIDs = await this.listFindingByResouceName(
        resource.resource_name
      )
      await this.setResourceMap(resource, findingIDs, this.resourceMap, 99999)
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.resourceNameList = []
    },
    async getTag() {
      this.loading = true
      this.searchForm.tagList = []
      const tag = await this.listResourceTagName()
      this.searchForm.tagList = tag
    },

    // finish
    async finishSuccess(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.finish(true)
    },
    async finishError(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyError(msg)
      this.finish(false)
    },
    async finish(reflesh) {
      this.loading = false
      this.viewDialog = false
      this.deleteDialog = false
      if (reflesh) {
        this.handleSearch()
      }
    },

    // ResourceMap
    async setResourceMap(resource, findingIDs, map, nodeLimits) {
      const srcID = 'r-' + resource.resource_id
      map.nodes.push({
        id: srcID,
        name: this.getShortName(resource.resource_name),
        svgSym: 'icons.gitHub',
      })
      let count = 0
      for (let id of findingIDs) {
        count++
        if (count > nodeLimits) {
          const targetID = srcID + '-more...'
          map.nodes.push({
            id: targetID,
            name: 'and more...',
            _color: '#616161',
          })
          map.links.push({
            sid: srcID,
            tid: targetID,
            _svgAttrs: { 'stroke-width': 3, opacity: 2 },
            _color: '#E0E0E0',
          })
          break // limit
        }
        const finding = await this.getFinding(id)
        const targetID = 'f-' + finding.finding_id
        map.nodes.push({
          id: targetID,
          name: finding.score + 'pt (' + finding.data_source + ')',
          finding: finding,
          _color: this.getColorRGBByScore(finding.score),
        })
        map.links.push({
          sid: srcID,
          tid: targetID,
          _svgAttrs: { 'stroke-width': 3, opacity: 2 },
          _color: '#E0E0E0',
        })
      }
    },
    clickNode(event, node) {
      if (!node.finding) return
      // console.log('event: ' + event)
      this.findingModel = Object.assign(this.findingModel, node.finding)
      this.findingDialog = true
    },
  },
}
</script>
<style lang="scss">
.node {
  stroke: rgba(18, 120, 98, 0.7);
  stroke-width: 4px;
  -webkit-transition: fill 0.5s ease;
  transition: fill 0.5s ease;
  fill: #e0e0e0;
}
.node.selected {
  stroke: #caa455;
}
.node.pinned {
  stroke: rgba(190, 56, 93, 0.6);
}
.link {
  stroke: rgba(18, 120, 98, 0.3);
}
.link,
.node {
  stroke-linecap: round;
}
.link:hover,
.node:hover {
  stroke: #be385d;
  stroke-width: 5px;
}
.link.selected {
  stroke: rgba(202, 164, 85, 0.6);
}
.curve {
  fill: none;
}
.link-label,
.node-label {
  fill: #616161;
}
.link-label {
  -webkit-transform: translateY(-0.5em);
  transform: translateY(-0.5em);
  text-anchor: middle;
}

.finding-json-theme {
  white-space: nowrap;
  color: rgb(160, 160, 160);
  font-size: 12px;
  .jv-ellipsis {
    color: #eee;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 2px 1px 2px;
    border-radius: 1px;
    vertical-align: 0px;
    cursor: pointer;
    user-select: none;
  }
  .jv-button {
    color: #49b3ff;
  }
  .jv-key {
    color: rgb(181, 216, 55);
  }
  .jv-link {
    color: #068cca;
  }
  .jv-item {
    &.jv-array {
      color: #eee;
    }
    &.jv-boolean {
      color: #b3e5fc;
    }
    &.jv-function {
      color: #068cca;
    }
    &.jv-number {
      color: #42b983;
    }
    &.jv-number-float {
      color: #42b983;
    }
    &.jv-number-integer {
      color: #42b983;
    }
    &.jv-object {
      color: #eee;
    }
    &.jv-undefined {
      color: #e08331;
    }
    &.jv-string {
      color: #eee;
      word-break: break-word;
      white-space: normal;
    }
  }
  .jv-code {
    padding: 1px;
    .jv-toggle {
      &:before {
        padding: 0px 0px;
        border-radius: 0px;
      }
      &:hover {
        &:before {
          background: #eee;
        }
      }
    }
  }
}
</style>
