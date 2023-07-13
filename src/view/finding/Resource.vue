<template>
  <div>
    <v-container>
      <v-row dense>
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue-lighten-2"
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
              variant="outlined"
              density="compact"
              hide-details
              bg-color="white"
              v-model="searchModel.namespace"
              :loading="loading"
              :label="$t(`item['` + searchForm.namespace.label + `']`)"
              :items="searchForm.namespace.items"
              @update:modelValue="handleChangeNamespace"
            />
          </v-col>
          <v-col cols="12" sm="2" md="2">
            <v-combobox
              variant="outlined"
              density="compact"
              hide-details
              bg-color="white"
              v-model="searchModel.resourceType"
              :loading="loading"
              :label="$t(`item['` + searchForm.resourceType.label + `']`)"
              :items="searchForm.resourceType.items"
            />
          </v-col>
          <v-col cols="12" sm="4" md="4">
            <v-combobox
              multiple
              variant="outlined"
              density="compact"
              clearable
              hide-details
              bg-color="white"
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
              variant="outlined"
              density="compact"
              clearable
              hide-details
              bg-color="white"
              :label="$t(`item['` + searchForm.tag.label + `']`)"
              :placeholder="searchForm.tag.placeholder"
              :items="searchForm.tagList"
              :loading="loading"
              v-model="searchModel.tag"
              persistent-hint
              ref="refTag"
            />
          </v-col>
          <v-spacer />
          <v-btn
            class="mt-0 mr-4"
            size="large"
            density="compact"
            :loading="loading"
            @click="handleSearch"
            icon="mdi-magnify"
          >
          </v-btn>
        </v-row>
      </v-form>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table-server
                v-model:page="table.options.page"
                :headers="headers"
                :items="table.items"
                :items-length="table.total"
                :loading="loading"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :items-per-page-text="table.footer.itemsPerPageText"
                :showCurrentPage="table.footer.showCurrentPage"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="resource_id"
                @update:page="loadList"
                @update:sort-by="handleSort($event)"
                v-model="table.selected"
              >
                <template v-slot:[`item.resource_name`]="{ item }">
                  {{ cutLongText(item.value.resource_name, 80) }}
                </template>
                <template v-slot:[`item.namespace`]="{ item }">
                  <v-avatar
                    v-if="item.value.data_source == 'RISKEN'"
                    tile
                    class="ma-0"
                    size="30px"
                  >
                    <img src="/static/m.png" :alt="item.data_source" />
                  </v-avatar>
                  <v-icon
                    v-else
                    :color="getDataSourceIconColor(item.value.namespace)"
                  >
                    {{ getDataSourceIcon(item.value.namespace) }}
                  </v-icon>
                </template>
                <template v-slot:[`item.check_point`]="{ item }">
                  <v-card
                    v-if="item.value.check_point !== null"
                    dark
                    color="grey-darken-1"
                    class="ma-1"
                  >
                    <v-card-text class="pa-0">
                      <json-viewer
                        :value="item.value.check_point"
                        :expand-depth="0"
                        preview-mode
                        theme="finding-json-theme"
                      ></json-viewer>
                    </v-card-text>
                  </v-card>
                </template>
                <template v-slot:[`item.tags`]="{ item }">
                  <v-chip
                    color="indigo-lighten-2"
                    class="ma-1"
                    size="small"
                    variant="flat"
                    v-for="t in shortenTags(item.value.tags, 5)"
                    :key="t.tag"
                    >{{ t.tag }}</v-chip
                  >
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-menu location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-dots-vertical"></v-icon>
                    </template>
                    <v-list class="pa-0" dense>
                      <v-list-item
                        v-for="action in getActionList(item)"
                        :key="action.text"
                        @click="action.click(item)"
                        :prepend-icon="action.icon"
                        :title="$t(`action['` + action.text + `']`)"
                      >
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table-server>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="text-h5">
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-identifier">
            <v-list-item-title>
              {{ resourceModel.resource_id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Resource ID']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-file-find-outline">
            <v-list-item-title>
              {{ resourceModel.resource_name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Resource Name']`) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="deleteDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red-darken-1"
            text
            variant="outlined"
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
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import JsonViewer from 'vue-json-viewer'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
export default {
  name: 'ResourceList',
  mixins: [mixin, finding, checkpoint],
  components: {
    BottomSnackBar,
    JsonViewer,
    VDataTableServer,
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
          placeholder: 'Filter for namespace',
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
          placeholder: 'Filter for resource type',
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
        total: 0,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 20, title: '20' }],
          showCurrentPage: true,
        },
        items: [],
      },
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
          title: this.$i18n.t('item["ID"]'),
          align: 'center',
          width: '2%',
          key: 'resource_id',
        },
        {
          title: this.$i18n.t('item["Name space"]'),
          align: 'center',
          width: '4%',
          key: 'namespace',
          sortable: false,
        },
        {
          title: this.$i18n.t('item["Resource Type"]'),
          align: 'center',
          width: '4%',
          key: 'resource_type',
          sortable: false,
        },
        {
          title: this.$i18n.t('item["Resource"]'),
          align: 'start',
          width: '20%',
          key: 'resource_name',
        },
        {
          title: this.$i18n.t('item["CheckPoint"]'),
          align: 'start',
          width: '15%',
          key: 'check_point',
          sortable: false,
        },
        {
          title: this.$i18n.t('item["Tags"]'),
          align: 'start',
          width: '10%',
          key: 'tags',
          sortable: false,
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          width: '2%',
          key: 'action',
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
  },
  methods: {
    // Handler
    handleViewFinding(item) {
      this.$router.push(
        '/finding/finding?from_score=0&resource_name=' +
          item.value.resource_name
      )
    },
    handleAttackFlow(item) {
      this.$router.push(
        '/analysis/attack-flow?resource_name=' + item.value.resource_name
      )
    },
    handleSearch() {
      this.$refs.refResourceName.blur()
      this.$refs.refTag.blur()
      this.$nextTick(() => {
        this.refleshList()
      })
      this.refleshList()
    },
    handleSort(newSort) {
      const newSortKey = newSort[0].key
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
      this.resourceModel = Object.assign(this.resourceModel, row.value)
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
    getActionList(item) {
      let list = []
      list.push({
        text: 'View Finding',
        icon: 'mdi-eye',
        click: this.handleViewFinding,
      })
      if (this.canAttackFlowAnalyze(item.value.resource_name)) {
        list.push({
          text: 'Analyze Attack Flow',
          icon: 'mdi-sitemap-outline',
          click: this.handleAttackFlow,
        })
      }
      list.push({
        text: 'Delete Item',
        icon: 'mdi-trash-can-outline',
        click: this.handleDeleteItem,
      })
      return list
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
