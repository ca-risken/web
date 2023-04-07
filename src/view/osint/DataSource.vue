<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="green">http</v-icon>
              {{ $t(`submenu['OSINT DataSource']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="6" md="6">
          <v-select
            return-object
            outlined
            dense
            background-color="white"
            v-model="dataModel"
            :items="osintList"
            item-text="resource_name"
            item-value="osint_id"
            label="Select your OSINT"
            @change="handleList"
          ></v-select>
        </v-col>
        <v-spacer />
        <v-btn
          class="mt-3 mr-4"
          color="grey darken-2"
          dense
          small
          icon
          fab
          outlined
          :loading="loading"
          @click="handleList"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                v-model="table.selected"
                :search="table.search"
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
                item-key="osint_data_source_id"
                @click:row="handleAttachItem"
              >
                <template v-slot:[`item.resource_type`]="{ item }">
                  <span class="font-weight-black"
                    ><v-chip outlined>{{ item.resource_type }}</v-chip></span
                  >
                </template>
                <template v-slot:[`item.max_score`]="{ item }">
                  <v-chip outlined>{{ item.max_score }}</v-chip>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    v-if="item.osint_id"
                    :color="getDataSourceStatusColor(item.status)"
                    dark
                  >
                    <v-progress-circular
                      v-if="isInProgressDataSourceStatus(item.status)"
                      indeterminate
                      size="20"
                      width="2"
                      color="white"
                      class="mr-2"
                    ></v-progress-circular>
                    <v-icon v-else small color="white" class="mr-2">{{
                      getDataSourceStatusIcon(item.status)
                    }}</v-icon>
                    {{ getDataSourceStatusText(item.status) }}
                  </v-chip>
                  <v-chip v-else color="grey" dark>Not configured</v-chip>
                </template>
                <template v-slot:[`item.scan_at`]="{ item }">
                  <v-chip v-if="item.scan_at">{{
                    item.scan_at | formatTime
                  }}</v-chip>
                  <v-chip v-else>Not yet scan...</v-chip>
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

    <v-dialog v-model="editDialog" max-width="60%">
      <v-card>
        <v-card-title>
          <v-icon large color="green">http</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['OSINT DataSource']`) }}
          </span>
        </v-card-title>
        <v-container fluid>
          <!-- osint -->
          <v-row dense>
            <v-col cols="2">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['` + form.osint_id.label + `']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ dataModel.osint_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['` + form.resource_type.label + `']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ dataModel.resource_type }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="7">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['` + form.resource_name.label + `']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ dataModel.resource_name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <!-- osint_data_source -->
          <v-row dense>
            <v-col cols="2">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['` + form.max_score.label + `']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip outlined>
                      {{ dataModel.max_score }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['` + form.name.label + `']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ dataModel.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['` + form.description.label + `']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ dataModel.description }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <!-- rel_osint_data_source -->
          <v-row dense>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{
                      $t(`item['` + form.rel_osint_data_source_id.label + `']`)
                    }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ dataModel.rel_osint_data_source_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="dataModel.status">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    <v-list-item-subtitle>
                      {{ $t(`item['` + form.status.label + `']`) }}
                    </v-list-item-subtitle>
                    <v-chip
                      dark
                      :color="getDataSourceStatusColor(dataModel.status)"
                    >
                      {{ getDataSourceStatusText(dataModel.status) }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="dataModel.scan_at">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['` + form.scan_at.label + `']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip color="grey lighten-3">
                      {{ dataModel.scan_at | formatTime }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" v-if="dataModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">
                    {{ $t(`item['` + form.status_detail.label + `']`) }}
                  </span>
                </v-card-title>
                <v-card-text>
                  {{ dataModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <!-- detect words -->
          <v-divider v-if="dataModel.rel_osint_data_source_id" />
          <v-row v-if="dataModel.rel_osint_data_source_id" class="mx-4 my-2">
            <v-col cols="6">
              <v-list-item-title>
                <v-icon left>mdi-label</v-icon>
                {{ $t(`item['Detect Word']`) }}
              </v-list-item-title>
            </v-col>
            <v-spacer />
            <v-col cals="3">
              <v-btn
                text
                outlined
                color="black lighten-1"
                @click="handleNewWord"
              >
                {{ $t(`btn['NEW WORD']`) }}
              </v-btn>
            </v-col>
          </v-row>
          <v-row class="mx-4" v-if="dataModel.detectWords">
            <v-col cols="12">
              <v-list-item-title>
                <v-chip
                  class="mx-1"
                  close
                  v-for="(word, idx) in dataModel.detectWords"
                  :key="idx"
                  @update:active="handleDeleteWord(word)"
                >
                  <v-avatar left>
                    <v-icon>mdi-filter-outline</v-icon>
                  </v-avatar>
                  {{ word.word }}
                </v-chip>
              </v-list-item-title>
            </v-col>
          </v-row>
        </v-container>
        <v-divider />
        <v-card-text>
          <v-card-actions>
            <v-btn
              text
              outlined
              color="blue darken-1"
              v-if="dataModel.rel_osint_data_source_id"
              :loading="loading"
              @click="handleScan"
            >
              <v-icon left>mdi-magnify-scan</v-icon>
              {{ $t(`btn['SCAN']`) }}
            </v-btn>
            <v-btn
              text
              outlined
              color="cyan darken-2"
              v-if="dataModel.rel_osint_data_source_id"
              :loading="loading"
              link
              :to="{
                path: '/finding/finding/',
                query: {
                  data_source: dataModel.name,
                  tag: getScanIdentifyTag(dataModel),
                },
              }"
              risken-action-name="search-finding-by-datasource-from-osint"
            >
              <v-icon left>mdi-magnify</v-icon>
              {{ $t(`btn['SHOW SCAN RESULT']`) }}
            </v-btn>
            <v-spacer />
            <v-btn
              text
              outlined
              color="grey darken-1"
              @click="editDialog = false"
            >
              {{ $t(`btn['CANCEL']`) }}
            </v-btn>
            <v-btn
              text
              outlined
              color="green darken-1"
              :loading="loading"
              @click="handleAttachSubmit"
            >
              {{ $t(`btn['ATTACH']`) }}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="detectWordDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">{{ $t(`item['Detect Word']`) }}</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="dataModel.new_word"
            :label="$t(`item['` + form.detect_word.label + `']`) + ' *'"
            :placeholder="form.detect_word.placeholder"
            outlined
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            outlined
            color="grey darken-1"
            @click="detectWordDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            outlined
            :loading="loading"
            @click="handleNewWordSubmit"
          >
            {{ $t(`btn['REGIST']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">
            {{ $t(`message['Do you really want to detach this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>http</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ dataModel.resource_name }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Resource Name']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar
              ><v-icon>mdi-dns-outline</v-icon></v-list-item-avatar
            >
            <v-list-item-content>
              <v-list-item-title>
                {{ dataModel.name }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Data Source']`)
              }}</v-list-item-subtitle>
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
            @click="handleDetachSubmit"
          >
            {{ $t(`btn['DETACH']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>
<script>
import mixin from '@/mixin'
import osint from '@/mixin/api/osint'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  name: 'OSINTDataSource',
  mixins: [mixin, osint],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      osintList: [],
      detectWordDefault: ['dev', 'stg', 'jenkins', 'admin'],
      form: {
        valid: false,
        osint_id: { label: 'OSINT ID', placeholder: '-', validator: [] },
        resource_type: {
          label: 'ResourceType',
          placeholder: '-',
          validator: [],
        },
        resource_name: {
          label: 'ResourceName',
          placeholder: '-',
          validator: [],
        },

        osint_data_source_id: {
          label: 'Data Source ID',
          placeholder: '-',
          validator: [],
        },
        name: { label: 'Data Source', placeholder: '-', validator: [] },
        description: { label: 'Description', placeholder: '-', validator: [] },
        max_score: { label: 'MAX Score', placeholder: '-', validator: [] },

        rel_osint_data_source_id: {
          label: 'OSINT Relation ID',
          placeholder: '-',
          validator: [],
        },
        status: { label: 'Status', placeholder: '-', validator: [] },
        status_detail: {
          label: 'Status Detail',
          placeholder: '-',
          validator: [],
        },
        scan_at: { label: 'ScanAt', placeholder: '-', validator: [] },

        detect_word: { label: 'Detect Word', placeholder: '-', validator: [] },
      },
      dataModel: {
        osint_id: '', // osint
        resource_type: '', // osint
        resource_name: '', // osint
        osint_data_source_id: '', // osint_data_source
        name: '', // osint_data_source
        description: '', // osint_data_source
        max_score: '', // osint_data_source
        rel_osint_data_source_id: '', // rel_osint_data_source
        status: 0, // rel_osint_data_source
        status_detail: '', // rel_osint_data_source
        scan_at: 0, // rel_osint_data_source
        new_word: '', // osint_detect_word
        detectWords: [], // osint_detect_word
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['osint_id'] },
        actions: [
          {
            text: 'Attach DataSource',
            icon: 'mdi-pencil',
            click: this.handleAttachItem,
          },
          {
            text: 'Detach DataSource',
            icon: 'mdi-trash-can-outline',
            click: this.handleDetachItem,
          },
          { text: 'Scan', icon: 'mdi-magnify-scan', click: this.handleScan },
        ],
        total: 0,
        footer: {
          disableItemsPerPage: false,
          itemsPerPageOptions: [10, 50, 100],
          itemsPerPageText: 'Rows/Page',
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      deleteDialog: false,
      editDialog: false,
      detectWordDialog: false,
    }
  },
  created() {
    this.$setInterval(async () => {
      this.listDataSource()
      this.listWord()
    }, 5000)
  },
  computed: {
    headers() {
      return [
        {
          text: this.$i18n.t('item["ResourceType"]'),
          align: 'center',
          width: '10%',
          sortable: false,
          value: 'resource_type',
        },
        {
          text: this.$i18n.t('item["Data Source"]'),
          align: 'start',
          sortable: false,
          value: 'name',
        },
        {
          text: this.$i18n.t('item["Description"]'),
          align: 'start',
          sortable: false,
          value: 'description',
        },
        {
          text: this.$i18n.t('item["MAX Score"]'),
          align: 'center',
          sortable: false,
          value: 'max_score',
        },
        {
          text: this.$i18n.t('item["Status"]'),
          align: 'start',
          width: '12%',
          sortable: false,
          value: 'status',
        },
        {
          text: this.$i18n.t('item["ScanAt"]'),
          align: 'center',
          sortable: true,
          value: 'scan_at',
        },
        {
          text: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          value: 'action',
        },
      ]
    },
  },
  async mounted() {
    this.loading = true
    await this.displayOSINT()
    if (this.osintList.length < 1) {
      this.loading = false
      return
    }
    this.dataModel = this.osintList[0]
    this.osintList.forEach(async (osint) => {
      if (osint.osint_id == Number(this.$route.query.osint_id)) {
        this.dataModel = osint
        return
      }
    })
    await this.listDataSource()
    this.loading = false
  },
  methods: {
    async displayOSINT() {
      var isSuccess = true
      const list = await this.listOSINT(this.getCurrentProjectID()).catch(
        (err) => {
          this.finishError(err.response.data)
          this.clearList()
          isSuccess = false
        }
      )
      if (!isSuccess || !list.osint) {
        this.osintList = []
        return
      }
      this.osintList = list.osint
    },
    async listDataSource() {
      var isSuccess = true
      this.dataModel.detectWords = []
      if (!this.dataModel.osint_id) {
        this.clearList()
        return
      }
      const resOsint = await this.getOSINT(
        this.getCurrentProjectID(),
        this.dataModel.osint_id
      ).catch((err) => {
        this.finishError(err.response.data)
        isSuccess = false
      })
      const osint = resOsint.osint
      if (!isSuccess || !osint) {
        this.clearList()
        return
      }
      const resListDS = await this.listOSINTDataSource(
        this.getCurrentProjectID(),
        this.dataModel.osint_id
      ).catch((err) => {
        this.finishError(err.response.data)
        isSuccess = false
      })
      const listDS = resListDS.osint_data_source
      if (!isSuccess || !listDS) {
        this.clearList()
        return
      }
      this.table.total = resListDS.length
      let items = []
      listDS.forEach(async (ds) => {
        let item = {
          osint_id: osint.osint_id,
          resource_type: osint.resource_type,
          resource_name: osint.resource_name,
          osint_data_source_id: ds.osint_data_source_id,
          name: ds.name,
          description: ds.description,
          max_score: ds.max_score,
        }
        const rel = await this.listRelOSINTDataSource(
          this.getCurrentProjectID(),
          this.dataModel.osint_id,
          ds.osint_data_source_id
        ).catch((err) => {
          this.finishError(err.response.data)
          isSuccess = false
        })
        if (!this.matchResourceType(ds.name, osint.resource_type)) {
          return
        }
        if (!isSuccess) {
          return
        }
        if (rel.rel_osint_data_source && rel.rel_osint_data_source[0]) {
          item.rel_osint_data_source_id =
            rel.rel_osint_data_source[0].rel_osint_data_source_id
          item.status = rel.rel_osint_data_source[0].status
          item.status_detail = rel.rel_osint_data_source[0].status_detail
          item.scan_at = rel.rel_osint_data_source[0].scan_at
        }
        items.push(item)
      })
      this.table.items = items
    },
    clearList() {
      this.table.total = 0
      this.table.items = []
      this.loading = false
    },
    async detachDataSource() {
      var isSuccess = true
      await this.deleteRelOSINTDataSource(
        this.getCurrentProjectID(),
        this.dataModel.rel_osint_data_source_id
      ).catch((err) => {
        this.finishError(err.response.data)
        isSuccess = false
      })
      if (!isSuccess) {
        return
      }
      await this.deleteDetectWordByRelOsintDataSourceID(
        this.getCurrentProjectID(),
        this.dataModel.rel_osint_data_source_id
      ).catch((err) => {
        this.finishError(err.response)
        isSuccess = false
      })
      if (!isSuccess) {
        return
      }
      this.finishSuccess('Success: Detach Data Source.')
    },
    async attachDataSource() {
      let isNew = false
      if (
        !this.dataModel.rel_osint_data_source_id ||
        this.dataModel.rel_osint_data_source_id == 0 ||
        this.dataModel.rel_osint_data_source_id == ''
      ) {
        isNew = true
      }
      let scan_at = 0
      if (this.dataModel.scan_at > 0) {
        scan_at = this.dataModel.scan_at
      }
      var isSuccess = true
      var isPutDetectWord = false
      if (this.dataModel.resource_type == 'Domain') {
        isPutDetectWord = true
      }
      await this.attachRelOSINTDataSource(
        this.getCurrentProjectID(),
        this.dataModel.rel_osint_data_source_id,
        this.dataModel.osint_data_source_id,
        this.dataModel.osint_id,
        scan_at,
        isNew,
        isPutDetectWord
      ).catch((err) => {
        this.finishError(err.response.data)
        isSuccess = false
      })
      if (!isSuccess) {
        return
      }

      this.finishSuccess('Success: Attach Data Source.')
    },

    // Detect Word
    async listWord() {
      var isSuccess = true
      this.dataModel.detectWords = []
      const detectWords = await this.listDetectWord(
        this.getCurrentProjectID(),
        this.dataModel.rel_osint_data_source_id
      ).catch((err) => {
        this.finishError(err.response.data)
        isSuccess = false
      })
      const word = detectWords.osint_detect_word
      if (!isSuccess || !word) {
        return
      }
      this.dataModel.detectWords = word
    },
    async putWord(rel_osint_data_source_id, word) {
      await this.putDetectWord(
        this.getCurrentProjectID(),
        rel_osint_data_source_id,
        word
      ).catch((err) => {
        this.finishError(err.response.data)
      })
    },
    async deleteWord(osint_detect_word_id) {
      await this.deleteDetectWord(
        this.getCurrentProjectID(),
        osint_detect_word_id
      ).catch((err) => {
        this.finishError(err.response.data)
      })
    },

    // Scan
    async scanDataSource() {
      const param = {
        project_id: this.getCurrentProjectID(),
        rel_osint_data_source_id: this.dataModel.rel_osint_data_source_id,
      }
      await this.$axios.post('/osint/invoke-scan/', param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Invoke scan for Data Source.')
    },
    getScanIdentifyTag(dataModel) {
      if (dataModel.resource_type === 'Domain') {
        return dataModel.resource_name
      } else if (dataModel.resource_type === 'Website') {
        return 'osint_id:' + dataModel.osint_id
      }
      return ''
    },

    // Handler
    handleList() {
      this.loading = true
      this.listDataSource()
      this.loading = false
    },
    async handleAttachItem(item) {
      this.assignDataModel(item)
      if (this.dataModel.rel_osint_data_source_id) {
        await this.listWord()
      }
      this.editDialog = true
    },
    handleAttachSubmit() {
      this.loading = true
      this.attachDataSource()
      this.loading = false
    },
    handleDetachItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    handleDetachSubmit() {
      if (!this.dataModel.osint_id) {
        this.$refs.snackbar.notifyError('Error: Not configred.')
        this.deleteDialog = false
        return
      }
      this.loading = true
      this.detachDataSource()
      this.loading = false
    },
    handleNewWord() {
      this.detectWordDialog = true
    },
    async handleNewWordSubmit() {
      if (this.dataModel.rel_osint_data_source_id && this.dataModel.new_word) {
        await this.putWord(
          this.dataModel.rel_osint_data_source_id,
          this.dataModel.new_word
        )
        this.finishSuccess('Success: Put new detect word.')
      }
      this.detectWordDialog = false
    },
    async handleDeleteWord(item) {
      if (item.osint_detect_word_id) {
        await this.deleteWord(item.osint_detect_word_id)
        await this.listWord()
      }
      this.finishSuccess('Success: Deleted.')
    },
    handleScan(item) {
      this.loading = true
      if (item.osint_data_source_id) {
        this.assignDataModel(item)
      }
      this.scanDataSource()
    },
    assignDataModel(item) {
      this.dataModel = {}
      this.dataModel = Object.assign(this.dataModel, item)
    },

    // finish
    async finishInfo(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyInfo(msg)
      this.finish(true)
    },
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
      this.editDialog = false
      this.deleteDialog = false
      if (reflesh) {
        this.listDataSource()
      }
    },
  },
}
</script>
