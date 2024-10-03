<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue-darken-1"
                >mdi-microsoft-azure</v-icon
              >
              {{ $t(`submenu['Azure DataSource']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="6" md="6">
          <v-select
            v-model="azureModel"
            bg-color="white"
            :items="azureList"
            item-title="name"
            item-value="azure_id"
            label="Select your Azure"
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
                item-key="azure_data_source_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="{ item }">
                  <v-avatar tile class="ma-3" size="36px">
                    <v-img
                      :src="getAzureDataSourceIcon(item.value.name)"
                      :alt="item.value.name"
                    />
                  </v-avatar>
                </template>
                <template v-slot:[`item.max_score`]="{ item }">
                  <v-chip variant="outlined">{{ item.value.max_score }}</v-chip>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    v-if="item.value.azure_id"
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
          <v-icon large color="blue-darken-1">mdi-microsoft-azure</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['Azure DataSource']`) }}
          </span>
        </v-card-title>
        <v-container fluid>
          <v-row dense>
            <v-col cols="2">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + azureForm.azure_id.label + `']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['` + azureForm.azure_id.label + `']`)"
                    :text="String(azureDataSourceModel.azure_id)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ azureDataSourceModel.azure_id }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="!azureForm.setupAll">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{
                    $t(`item['` + azureForm.azure_data_source_id.label + `']`)
                  }}
                  <clip-board
                    size="large"
                    :name="
                      $t(`item['` + azureForm.azure_data_source_id.label + `']`)
                    "
                    :text="String(azureDataSourceModel.azure_data_source_id)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ azureDataSourceModel.azure_data_source_id }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="!azureForm.setupAll">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + azureForm.name.label + `']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['` + azureForm.name.label + `']`)"
                    :text="String(azureDataSourceModel.name)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ azureDataSourceModel.name }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="!azureForm.setupAll">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + azureForm.max_score.label + `']`) }}
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  <v-chip variant="outlined">
                    {{ azureDataSourceModel.max_score }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense v-if="!azureForm.setupAll">
            <v-col cols="2" v-if="azureDataSourceModel.status">
              <v-list-item two-line>
                <v-list-item-title class="text-h5">
                  <v-list-item-subtitle>
                    {{ $t(`item['` + azureForm.status.label + `']`) }}
                  </v-list-item-subtitle>
                  <v-chip
                    variant="flat"
                    class="text-white"
                    :color="
                      getDataSourceStatusColor(azureDataSourceModel.status)
                    "
                  >
                    {{ getDataSourceStatusText(azureDataSourceModel.status) }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="4">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + azureForm.subscription_id.label + `']`) }}
                  <clip-board
                    size="large"
                    :name="
                      $t(`item['` + azureForm.subscription_id.label + `']`)
                    "
                    :text="String(azureDataSourceModel.subscription_id)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ azureDataSourceModel.subscription_id }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="azureDataSourceModel.scan_at">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + azureForm.scan_at.label + `']`) }}
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  <v-chip>
                    {{ formatTime(azureDataSourceModel.scan_at) }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" v-if="azureDataSourceModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">
                    {{ $t(`item['` + azureForm.status_detail.label + `']`) }}
                    <clip-board
                      :name="
                        $t(`item['` + azureForm.status_detail.label + `']`)
                      "
                      :text="String(azureDataSourceModel.status_detail)"
                    />
                  </span>
                </v-card-title>
                <v-card-text class="wrap">
                  {{ azureDataSourceModel.status_detail }}
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
            item-key="azure_data_source_id"
            v-if="azureForm.setupAll"
          >
            <template v-slot:[`item.avator`]="{ item }">
              <v-avatar tile class="ma-3" size="40px">
                <v-img
                  :src="getAzureDataSourceIcon(item.value.name)"
                  :alt="item.value.name"
                />
              </v-avatar>
            </template>
            <template v-slot:[`item.status`]="{ item }">
              <v-chip
                v-if="item.value.azure_id"
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
            v-if="azureDataSourceModel.status && azureForm.readOnly"
            :loading="loading"
            @click="handleScan"
          >
            <v-icon left>mdi-magnify-scan</v-icon>
            {{ $t(`btn['SCAN']`) }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="cyan-darken-2"
            v-if="azureDataSourceModel.status && azureForm.readOnly"
            :loading="loading"
            link
            :to="{
              path: '/finding/finding/',
              query: {
                data_source: azureDataSourceModel.name,
                tag: azureDataSourceModel.subscription_id,
              },
            }"
            prepend-icon="mdi-magnify"
            risken-action-name="search-finding-by-datasource-from-azure"
          >
            {{ $t(`btn['SHOW SCAN RESULT']`) }}
          </v-btn>
          <v-spacer />
          <v-btn
            text
            variant="outlined"
            color="green-darken-1"
            v-if="!azureDataSourceModel.status && !azureForm.setupAll"
            :loading="loading"
            @click="handleAttachSubmit"
          >
            {{ $t(`btn['ATTACH']`) }}
          </v-btn>
          <v-btn
            text
            variant="outlined"
            color="green-darken-1"
            v-if="azureForm.setupAll"
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
          <v-list-item prepend-icon="mdi-microsoft-azure">
            <v-list-item-title>
              {{ azureDataSourceModel.azure_data_source_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Data Source ID']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ azureDataSourceModel.subscription_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Subscription ID']`)
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
import azure from '@/mixin/api/azure'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'AzureDataSource',
  mixins: [mixin, azure],
  components: {
    BottomSnackBar,
    ClipBoard,
    VDataTable,
  },
  data() {
    return {
      loading: false,
      azureList: [],
      azureDataSourceList: [],
      azureForm: {
        readOnly: false,
        setupAll: false,
        valid: false,
        azure_data_source_id: {
          label: 'Data Source ID',
          placeholder: '-',
          validator: [],
        },
        name: { label: 'Data Source', placeholder: '-', validator: [] },
        max_score: { label: 'MAX Score', placeholder: '-', validator: [] },
        azure_id: { label: 'Azure ID', placeholder: '-', validator: [] },
        subscription_id: {
          label: 'Subscription ID',
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
      azureModel: {
        azure_id: '',
        name: '',
      },
      azureDataSourceModel: {
        azure_id: '',
        subscription_id: '',
        azure_data_source_id: '',
        name: '',
        max_score: '',
        status: 0,
        status_detail: '',
        scan_at: 0,
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['azure_id'] },
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
          key: 'azure_data_source_id',
        },
        {
          title: this.$i18n.t('item["Data Source"]'),
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
          title: this.$i18n.t('item["Subscription ID"]'),
          align: 'start',
          sortable: true,
          key: 'subscription_id',
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
          title: this.$i18n.t('item["Data Source"]'),
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
    await this.listAzureDataSource()
    await this.listAzure()
    if (this.azureList.length < 1) {
      this.loading = false
      return false
    }
    this.azureModel = this.azureList[0]
    this.azureList.forEach(async (azure) => {
      if (azure.azure_id == Number(this.$route.query.azure_id)) {
        this.azureModel = azure
        return
      }
    })
    await this.refleshList()
    this.loading = false
  },
  methods: {
    async listAzureDataSource() {
      const azureDataSources = await this.listAzureDataSourceAPI().catch(
        (err) => {
          return Promise.reject(err)
        }
      )
      if (!azureDataSources) {
        return false
      }
      this.azureDataSourceList = azureDataSources
      this.loading = false
    },
    async listAzure() {
      const azure = await this.listAzureAPI().catch((err) => {
        return Promise.reject(err)
      })
      if (!azure) {
        return false
      }
      this.azureList = azure
      this.loading = false
    },
    async refleshList() {
      if (!this.azureModel.azure_id) {
        this.clearList()
        return
      }
      let items = []
      const dataSources = await this.listAzureDataSourceAPI().catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      if (!dataSources) {
        this.clearList()
        return
      }
      for (const ds of dataSources) {
        if (!ds || !ds.azure_data_source_id) {
          continue
        }
        const res = await this.getRelAzureDataSourceAPI(
          this.azureModel.azure_id,
          ds.azure_data_source_id
        ).catch((err) => {
          this.clearList()
          return Promise.reject(err)
        })
        if (!res || !res.data.data || !res.data.data.rel_azure_data_source) {
          this.clearList()
          return
        }
        const rads = res.data.data.rel_azure_data_source
        let item = {
          azure_data_source_id: ds.azure_data_source_id,
          name: ds.name,
          description: ds.description,
          max_score: ds.max_score,
          azure_id: this.azureModel.azure_id,
          subscription_id: rads.subscription_id,
          status: rads.status,
          status_detail: rads.status_detail,
          scan_at: rads.scan_at,
        }
        items.push(item)
      }
      this.table.items = items
      this.table.total = this.azureDataSourceList.length
    },
    clearList() {
      this.table.total = 0
      this.table.items = []
      this.loading = false
    },
    getAzureDataSourceIcon(dataSource) {
      switch (dataSource) {
        case 'azure:prowler':
          return '/static/azure/prowler.jpeg'
        default:
          return '/static/azure/default.png'
      }
    },
    async detachDataSource() {
      const param = {
        project_id: this.getCurrentProjectID(),
        azure_id: this.azureDataSourceModel.azure_id,
        azure_data_source_id: this.azureDataSourceModel.azure_data_source_id,
      }
      await this.detachAzureDataSourceAPI(param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Detach Azure Data Source.')
    },
    async attachDataSource() {
      await this.execAttachDataSource()
      this.finishSuccess('Success: Attach Azure Data Source.')
    },
    async attachAllDataSource() {
      this.setupAllTable.selected.forEach(async (ds) => {
        this.azureDataSourceModel.azure_data_source_id = ds.azure_data_source_id
        await this.execAttachDataSource()
      })
      this.finishSuccess('Success: Attach all Azure Data Source.')
    },
    async execAttachDataSource() {
      let scan_at = 0
      if (this.azureDataSourceModel.scan_at > 0) {
        scan_at = this.azureDataSourceModel.scan_at
      }
      const param = {
        project_id: this.getCurrentProjectID(),
        rel_azure_data_source: {
          azure_id: this.azureDataSourceModel.azure_id,
          azure_data_source_id: this.azureDataSourceModel.azure_data_source_id,
          project_id: this.getCurrentProjectID(),
          status: 2, // CONFIGURED
          status_detail:
            'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      await this.attachAzureDataSourceAPI(param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Attach Azure Data Source.')
    },
    async scanDataSource() {
      const param = {
        project_id: this.getCurrentProjectID(),
        azure_id: this.azureDataSourceModel.azure_id,
        azure_data_source_id: this.azureDataSourceModel.azure_data_source_id,
        scan_only: false, // option
      }
      await this.invokeScanAzureAPI(param).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Invoke scan for Azure Data Source.')
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
      this.azureForm.readOnly = true
      this.azureForm.setupAll = false
      this.editDialog = true
    },
    handleSetupAll() {
      this.azureDataSourceModel = { azure_id: this.azureModel.azure_id }
      this.azureForm.readOnly = false
      this.azureForm.setupAll = true
      console.log('this.table.items', this.table)
      this.setupAllTable.items = [...this.table.items]
      this.setupAllTable.selected = [...this.table.items]
      this.editDialog = true
    },
    handleAttachItem(item) {
      this.assignDataModel(item.value)
      this.azureForm.readOnly = false
      this.azureForm.setupAll = false
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
      if (!this.azureDataSourceModel.azure_id) {
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
      if (item.value.azure_data_source_id) {
        this.assignDataModel(item.value)
      }
      this.scanDataSource()
    },
    assignDataModel(item) {
      const azure = this.azureDataSourceModel
      this.azureDataSourceModel = Object.assign(this.azureDataSourceModel, item)
      this.azureDataSourceModel.azure_id = azure.azure_id // override
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
