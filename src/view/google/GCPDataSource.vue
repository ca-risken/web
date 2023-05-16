<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue-darken-1"
                >mdi-google-cloud</v-icon
              >
              {{ $t(`submenu['GCP DataSource']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="6" md="6">
          <v-select
            v-model="gcpModel"
            bg-color="white"
            :items="gcpList"
            item-title="name"
            item-value="gcp_id"
            label="Select your GCP"
            @update:modelValue="handleList"
            return-object
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-spacer />
        <v-btn
          class="mt-3 mr-4"
          color="grey-darken-2"
          density="compact"
          size="large"
          variant="outlined"
          :loading="loading"
          @click="handleList"
          icon="mdi-refresh"
        />
        <v-btn
          class="mt-3 mr-4"
          medium
          :loading="loading"
          color="light-blue-darken-2"
          @click="handleSetupAll"
        >
          Setup all
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
                item-key="google_data_source_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="{ item }">
                  <v-avatar tile class="ma-3" size="36px">
                    <v-img
                      :src="getGCPDataSourceIcon(item.value.name)"
                      :alt="item.value.name"
                    />
                  </v-avatar>
                </template>
                <template v-slot:[`item.max_score`]="{ item }">
                  <v-chip variant="outlined">{{ item.value.max_score }}</v-chip>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    v-if="item.value.gcp_id"
                    variant="flat"
                    class="text-white"
                    :color="getDataSourceStatusColor(item.value.status)"
                  >
                    <v-progress-circular
                      v-if="isInProgressDataSourceStatus(item.value.status)"
                      indeterminate
                      size="20"
                      width="2"
                      color="white"
                      class="mr-2"
                    ></v-progress-circular>
                    <v-icon
                      v-else-if="item.value.status"
                      small
                      color="white"
                      class="mr-2"
                      >{{ getDataSourceStatusIcon(item.value.status) }}</v-icon
                    >
                    {{ getDataSourceStatusText(item.value.status) }}
                  </v-chip>
                  <v-chip v-else color="grey" variant="flat"
                    >Not configured</v-chip
                  >
                  <v-icon
                    v-if="hasDataSourceWarning(item)"
                    color="yellow-darken-4"
                    >mdi-alert</v-icon
                  >
                </template>
                <template v-slot:[`item.specific_version`]="{ item }">
                  <template v-if="item.value.specific_version">
                    {{ $t(`version["old"]`) }} ({{
                      item.value.specific_version
                    }})
                  </template>
                  <template v-else> {{ $t(`version["latest"]`) }} </template>
                </template>
                <template v-slot:[`item.scan_at`]="{ item }">
                  <v-chip v-if="item.value.scan_at">{{
                    formatTime(item.value.scan_at)
                  }}</v-chip>
                  <v-chip v-else>Not yet scan...</v-chip>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-dots-vertical"></v-icon>
                    </template>
                    <v-list class="pa-0" dense>
                      <v-list-item
                        v-for="action in table.actions"
                        :key="action.text"
                        @click="action.click(item)"
                        :prepend-icon="action.icon"
                      >
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

    <v-dialog v-model="editDialog" max-width="70%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue-darken-1">mdi-google-cloud</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['GCP DataSource']`) }}
          </span>
        </v-card-title>
        <v-container fluid>
          <v-row dense>
            <v-col cols="2">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + gcpForm.gcp_id.label + `']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['` + gcpForm.gcp_id.label + `']`)"
                    :text="String(gcpDataSourceModel.gcp_id)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ gcpDataSourceModel.gcp_id }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="!gcpForm.setupAll">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{
                    $t(`item['` + gcpForm.google_data_source_id.label + `']`)
                  }}
                  <clip-board
                    size="large"
                    :name="
                      $t(`item['` + gcpForm.google_data_source_id.label + `']`)
                    "
                    :text="String(gcpDataSourceModel.google_data_source_id)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ gcpDataSourceModel.google_data_source_id }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="!gcpForm.setupAll">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + gcpForm.name.label + `']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['` + gcpForm.name.label + `']`)"
                    :text="String(gcpDataSourceModel.name)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ gcpDataSourceModel.name }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="!gcpForm.setupAll">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + gcpForm.max_score.label + `']`) }}
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  <v-chip variant="outlined">
                    {{ gcpDataSourceModel.max_score }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense v-if="!gcpForm.setupAll">
            <v-col cols="2" v-if="gcpDataSourceModel.status">
              <v-list-item two-line>
                <v-list-item-title class="text-h5">
                  <v-list-item-subtitle>
                    {{ $t(`item['` + gcpForm.status.label + `']`) }}
                  </v-list-item-subtitle>
                  <v-chip
                    variant="flat"
                    class="text-white"
                    :color="getDataSourceStatusColor(gcpDataSourceModel.status)"
                  >
                    {{ getDataSourceStatusText(gcpDataSourceModel.status) }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="4">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + gcpForm.gcp_project_id.label + `']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['` + gcpForm.gcp_project_id.label + `']`)"
                    :text="String(gcpDataSourceModel.gcp_project_id)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ gcpDataSourceModel.gcp_project_id }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="gcpDataSourceModel.scan_at">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + gcpForm.scan_at.label + `']`) }}
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  <v-chip>
                    {{ formatTime(gcpDataSourceModel.scan_at) }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense v-if="!gcpForm.setupAll">
            <v-col cols="8">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`version['version']`) }}
                </v-list-item-subtitle>
                <v-list-item-title
                  class="text-h5"
                  v-if="gcpDataSourceModel.specific_version"
                >
                  {{ $t(`version['old']`) }} ({{
                    gcpDataSourceModel.specific_version
                  }})
                  <v-btn
                    text
                    variant="outlined"
                    color="blue-darken-1"
                    :loading="loading"
                    @click="handleAttachSubmit"
                  >
                    <v-icon left>mdi-update</v-icon>
                    {{ $t(`btn['Upgrade']`) }}
                  </v-btn>
                </v-list-item-title>
                <v-list-item-title class="text-h5" v-else>
                  {{ $t(`version['latest']`) }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" v-if="gcpDataSourceModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">
                    {{ $t(`item['` + gcpForm.status_detail.label + `']`) }}
                    <clip-board
                      :name="$t(`item['` + gcpForm.status_detail.label + `']`)"
                      :text="String(gcpDataSourceModel.status_detail)"
                    />
                  </span>
                </v-card-title>
                <v-card-text class="wrap">
                  {{ gcpDataSourceModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-text>
          <v-data-table
            v-model="setupAllTable.selected"
            show-select
            :headers="setupAllHeaders"
            :items="setupAllTable.items"
            :server-items-length="setupAllTable.total"
            :loading="loading"
            :hide-default-footer="true"
            locale="ja-jp"
            loading-text="Loading..."
            no-data-text="No data."
            class="elevation-1"
            item-key="google_data_source_id"
            v-if="gcpForm.setupAll"
          >
            <template v-slot:[`item.avator`]="{ item }">
              <v-avatar tile class="ma-3" size="40px">
                <v-img
                  :src="getGCPDataSourceIcon(item.value.name)"
                  :alt="item.value.name"
                />
              </v-avatar>
            </template>
            <template v-slot:[`item.status`]="{ item }">
              <v-chip
                v-if="item.value.gcp_id"
                :color="getDataSourceStatusColor(item.value.status)"
                variant="flat"
                class="text-white"
              >
                <v-progress-circular
                  v-if="isInProgressDataSourceStatus(item.value.status)"
                  indeterminate
                  size="20"
                  width="2"
                  color="white"
                  class="mr-2"
                ></v-progress-circular>
                <v-icon
                  v-else-if="item.value.status"
                  color="white"
                  class="mr-2"
                  >{{ getDataSourceStatusIcon(item.value.status) }}</v-icon
                >
                {{ getDataSourceStatusText(item.value.status) }}
              </v-chip>
              <v-chip v-else color="grey" variant="flat">Not configured</v-chip>
            </template>
          </v-data-table>
        </v-card-text>
        <v-divider class="mt-3 mb-3"></v-divider>
        <v-card-actions>
          <v-btn
            text
            variant="outlined"
            color="blue-darken-1"
            v-if="gcpDataSourceModel.status && gcpForm.readOnly"
            :loading="loading"
            @click="handleScan"
          >
            <v-icon left>mdi-magnify-scan</v-icon>
            {{ $t(`btn['SCAN']`) }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="cyan-darken-2"
            v-if="gcpDataSourceModel.status && gcpForm.readOnly"
            :loading="loading"
            link
            :to="{
              path: '/finding/finding/',
              query: {
                data_source: gcpDataSourceModel.name,
                tag: gcpDataSourceModel.gcp_project_id,
              },
            }"
            prepend-icon="mdi-magnify"
            risken-action-name="search-finding-by-datasource-from-google"
          >
            {{ $t(`btn['SHOW SCAN RESULT']`) }}
          </v-btn>
          <v-spacer />
          <v-btn
            text
            variant="outlined"
            color="green-darken-1"
            v-if="!gcpDataSourceModel.status && !gcpForm.setupAll"
            :loading="loading"
            @click="handleAttachSubmit"
          >
            {{ $t(`btn['ATTACH']`) }}
          </v-btn>
          <v-btn
            text
            variant="outlined"
            color="green-darken-1"
            v-if="gcpForm.setupAll"
            :loading="loading"
            @click="handleAttachAll"
          >
            {{ $t(`btn['ATTACH ALL']`) }}
          </v-btn>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="editDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="text-h5">
          <span class="mx-4">
            {{ $t(`message['Do you really want to detach this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-google-cloud">
            <v-list-item-title>
              {{ gcpDataSourceModel.google_data_source_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Data Source ID']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ gcpDataSourceModel.gcp_project_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['GCP ProjectID']`)
            }}</v-list-item-subtitle>
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
import Util from '@/util'
import mixin from '@/mixin'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'GCPDataSource',
  mixins: [mixin],
  components: {
    BottomSnackBar,
    ClipBoard,
    VDataTable,
  },
  data() {
    return {
      loading: false,
      gcpList: [],
      googleDataSourceList: [],
      gcpForm: {
        readOnly: false,
        setupAll: false,
        valid: false,
        google_data_source_id: {
          label: 'Google Data Source ID',
          placeholder: '-',
          validator: [],
        },
        name: { label: 'Data Source', placeholder: '-', validator: [] },
        max_score: { label: 'MAX Score', placeholder: '-', validator: [] },
        gcp_id: { label: 'GCP ID', placeholder: '-', validator: [] },
        gcp_project_id: {
          label: 'GCP ProjectID',
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
      },
      gcpModel: {
        gcp_id: '',
        name: '',
      },
      gcpDataSourceModel: {
        gcp_id: '',
        gcp_project_id: '',
        google_data_source_id: '',
        name: '',
        max_score: '',
        status: 0,
        status_detail: '',
        scan_at: 0,
        specific_version: '',
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['gcp_id'] },
        actions: [
          {
            text: 'View DataSource',
            icon: 'mdi-eye',
            click: this.handleViewItem,
          },
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
          {
            text: 'Scan',
            icon: 'mdi-magnify-scan',
            click: this.handleScanByAction,
          },
        ],
        total: 0,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      setupAllTable: {
        selected: [],
        items: [],
      },
      deleteDialog: false,
      editDialog: false,
    }
  },
  created() {
    this.$setInterval(async () => {
      if (!this.deleteDialog && !this.editDialog) {
        await this.refleshList()
      }
    }, 6000)
  },
  computed: {
    headers() {
      return [
        {
          title: this.$i18n.t('item[""]'),
          align: 'center',
          width: '8%',
          sortable: false,
          key: 'avator',
        },
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          key: 'google_data_source_id',
        },
        {
          title: this.$i18n.t('item["Google Data Source"]'),
          align: 'start',
          sortable: true,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["MAX Score"]'),
          align: 'center',
          sortable: true,
          key: 'max_score',
        },
        {
          title: this.$i18n.t('item["Status"]'),
          align: 'start',
          width: '14%',
          sortable: true,
          key: 'status',
        },
        {
          title: this.$i18n.t('item["GCP Project"]'),
          align: 'start',
          sortable: true,
          key: 'gcp_project_id',
        },
        {
          title: this.$i18n.t('version["version"]'),
          align: 'start',
          sortable: true,
          key: 'specific_version',
        },
        {
          title: this.$i18n.t('item["ScanAt"]'),
          align: 'center',
          sortable: true,
          key: 'scan_at',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          key: 'action',
        },
      ]
    },
    setupAllHeaders() {
      return [
        {
          title: this.$i18n.t('item[""]'),
          align: 'center',
          width: '10%',
          sortable: false,
          key: 'avator',
        },
        {
          title: this.$i18n.t('item["Google Data Source"]'),
          align: 'start',
          sortable: true,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Status"]'),
          align: 'start',
          width: '14%',
          sortable: false,
          key: 'status',
        },
      ]
    },
  },
  async mounted() {
    this.loading = true
    await this.listGoogleDataSource()
    await this.listGCP()
    if (this.gcpList.length < 1) {
      this.loading = false
      return false
    }
    this.gcpModel = this.gcpList[0]
    this.gcpList.forEach(async (gcp) => {
      if (gcp.gcp_id == Number(this.$route.query.gcp_id)) {
        this.gcpModel = gcp
        return
      }
    })
    await this.refleshList()
    this.loading = false
  },
  methods: {
    async listGoogleDataSource() {
      const res = await this.$axios
        .get('/google/list-google-datasource/')
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.google_data_source) {
        return false
      }
      this.googleDataSourceList = res.data.data.google_data_source
      this.loading = false
    },
    async listGCP() {
      const res = await this.$axios
        .get('/google/list-gcp/?project_id=' + this.getCurrentProjectID())
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.gcp) {
        return false
      }
      this.gcpList = res.data.data.gcp
      this.loading = false
    },
    async refleshList() {
      if (!this.gcpModel.gcp_id) {
        this.clearList()
        return
      }
      let items = []
      for (const ds of this.googleDataSourceList) {
        // this.googleDataSourceList.forEach(async (ds) => {
        const res = await this.$axios
          .get(
            '/google/get-gcp-datasource/?project_id=' +
              this.getCurrentProjectID() +
              '&gcp_id=' +
              this.gcpModel.gcp_id +
              '&google_data_source_id=' +
              ds.google_data_source_id
          )
          .catch((err) => {
            this.clearList()
            return Promise.reject(err)
          })
        let item = {
          google_data_source_id: ds.google_data_source_id,
          name: ds.name,
          description: ds.description,
          max_score: ds.max_score,
          gcp_id: this.gcpModel.gcp_id,
          gcp_project_id: '',
          status: 0,
          status_detail: '',
          scan_at: 0,
          specific_version: '',
        }
        if (
          res.data.data.gcp_data_source &&
          res.data.data.gcp_data_source.google_data_source_id
        ) {
          item.gcp_id = res.data.data.gcp_data_source.gcp_id
          item.gcp_project_id = res.data.data.gcp_data_source.gcp_project_id
          item.status = res.data.data.gcp_data_source.status
          item.status_detail = res.data.data.gcp_data_source.status_detail
          item.scan_at = res.data.data.gcp_data_source.scan_at
          item.specific_version = res.data.data.gcp_data_source.specific_version
        }
        items.push(item)
      }
      this.table.items = items
      this.table.total = this.googleDataSourceList.length
    },
    clearList() {
      this.table.total = 0
      this.table.items = []
      this.loading = false
    },
    getGCPDataSourceIcon(dataSource) {
      switch (dataSource) {
        case 'google:asset':
          return '/static/google/asset.png'
        case 'google:cloudsploit':
          return '/static/google/cloudsploit.png'
        case 'google:scc':
          return '/static/google/scc.png'
        case 'google:portscan':
          return '/static/google/nmap.png'
        default:
          return '/static/google/default.png'
      }
    },
    async detachDataSource() {
      const param = {
        project_id: this.getCurrentProjectID(),
        gcp_id: this.gcpDataSourceModel.gcp_id,
        google_data_source_id: this.gcpDataSourceModel.google_data_source_id,
      }
      await this.$axios
        .post('/google/detach-gcp-datasource/', param)
        .catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      this.finishSuccess('Success: Detach GCP Data Source.')
    },
    async attachDataSource() {
      await this.execAttachDataSource()
      this.finishSuccess('Success: Attach GCP Data Source.')
    },
    async attachAllDataSource() {
      this.setupAllTable.selected.forEach(async (ds) => {
        this.gcpDataSourceModel.google_data_source_id = ds.google_data_source_id
        await this.execAttachDataSource()
      })
      this.finishSuccess('Success: Attach all GCP Data Source.')
    },
    async execAttachDataSource() {
      let scan_at = 0
      if (this.gcpDataSourceModel.scan_at > 0) {
        scan_at = this.gcpDataSourceModel.scan_at
      }
      const param = {
        project_id: this.getCurrentProjectID(),
        gcp_data_source: {
          gcp_id: this.gcpDataSourceModel.gcp_id,
          google_data_source_id: this.gcpDataSourceModel.google_data_source_id,
          project_id: this.getCurrentProjectID(),
          status: 2, // CONFIGURED
          status_detail:
            'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      await this.$axios
        .post('/google/attach-gcp-datasource/', param)
        .catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
    },
    async scanDataSource() {
      const param = {
        project_id: this.getCurrentProjectID(),
        gcp_id: this.gcpDataSourceModel.gcp_id,
        google_data_source_id: this.gcpDataSourceModel.google_data_source_id,
        scan_only: false, // option
      }
      await this.$axios.post('/google/invoke-scan-gcp/', param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Invoke scan for GCP Data Source.')
    },

    // handler method
    async handleList() {
      this.loading = true
      await this.refleshList()
      await this.finishInfo('Reflesh list')
    },
    handleRowClick(event, datasources) {
      this.handleViewItem(datasources.item)
    },
    handleViewItem(item) {
      this.assignDataModel(item.value)
      this.gcpForm.readOnly = true
      this.gcpForm.setupAll = false
      this.editDialog = true
    },
    handleSetupAll() {
      this.gcpDataSourceModel = { gcp_id: this.gcpModel.gcp_id }
      this.gcpForm.readOnly = false
      this.gcpForm.setupAll = true
      this.setupAllTable.items = [...this.table.items]
      this.setupAllTable.selected = [...this.table.items]
      this.editDialog = true
    },
    handleAttachItem(item) {
      this.assignDataModel(item.value)
      this.gcpForm.readOnly = false
      this.gcpForm.setupAll = false
      this.editDialog = true
    },
    handleAttachSubmit() {
      this.loading = true
      this.attachDataSource()
    },
    handleAttachAll() {
      this.loading = true
      this.attachAllDataSource()
    },
    handleDetachItem(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true
    },
    handleDetachSubmit() {
      if (!this.gcpDataSourceModel.gcp_id) {
        this.$refs.snackbar.notifyError('Error: Not configred.')
        this.deleteDialog = false
        return
      }
      this.loading = true
      this.detachDataSource()
    },
    handleScan() {
      this.scanDataSource()
    },
    handleScanByAction(item) {
      this.loading = true
      if (item.value.google_data_source_id) {
        this.assignDataModel(item.value)
      }
      this.scanDataSource()
    },
    assignDataModel(item) {
      const gcp = this.gcpDataSourceModel
      this.gcpDataSourceModel = Object.assign(this.gcpDataSourceModel, item)
      this.gcpDataSourceModel.gcp_id = gcp.gcp_id // override
      // this.gcpDataSourceModel.name = gcp.name // override
    },
    async finishInfo(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await this.finish(false)
      this.$refs.snackbar.notifyInfo(msg)
    },
    async finishSuccess(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await this.finish(true)
      this.$refs.snackbar.notifySuccess(msg)
    },
    async finishError(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await this.finish(false)
      this.$refs.snackbar.notifyError(msg)
    },
    async finish(reflesh) {
      this.loading = false
      this.editDialog = false
      this.deleteDialog = false
      if (reflesh) {
        await this.refleshList()
      }
    },
  },
}
</script>
<style lang="scss">
.wrap {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
