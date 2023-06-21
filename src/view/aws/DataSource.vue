<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="orange">mdi-aws</v-icon>
              {{ $t(`submenu['AWS DataSource']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense align-content="center">
        <v-col cols="12" sm="6" md="6">
          <v-select
            v-model="awsModel"
            bg-color="white"
            :items="awsList"
            item-title="name"
            item-value="aws_id"
            label="Select your AWS"
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
          size="large"
          density="compact"
          icon="mdi-refresh"
          variant="outlined"
          :loading="loading"
          @click="handleList"
        />
        <v-btn
          class="mt-3 mr-4"
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
                item-key="aws_data_source_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="{ item }">
                  <v-avatar class="ma-3" size="36px">
                    <v-img
                      :src="getAWSDataSourceIcon(item.value.data_source)"
                      :alt="item.value.data_source"
                    />
                  </v-avatar>
                </template>
                <template v-slot:[`item.max_score`]="{ item }">
                  <v-chip variant="outlined">{{ item.value.max_score }}</v-chip>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    variant="flat"
                    class="text-white"
                    v-if="item.value.aws_id"
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
                    <v-icon v-else class="mr-2">{{
                      getDataSourceStatusIcon(item.value.status)
                    }}</v-icon>
                    {{ getDataSourceStatusText(item.value.status) }}
                  </v-chip>
                  <v-chip v-else variant="flat" color="grey" dark
                    >Not configured</v-chip
                  >
                  <v-icon
                    v-if="hasDataSourceWarning(item.value)"
                    color="yellow-darken-4"
                    >mdi-alert</v-icon
                  >
                </template>
                <template v-slot:[`item.specific_version`]="{ item }">
                  <template v-if="item.value.specific_version">
                    {{ $t(`version["old"]`) }} ({{ item.specific_version }})
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
                        v-for="action in getActionList(item.data_source)"
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

    <v-dialog v-model="editDialog" max-width="58%">
      <v-card>
        <v-card-title>
          <v-icon large color="orange-darken-1">mdi-aws</v-icon>
          <span class="mx-4 text-h5">{{
            $t(`submenu['AWS DataSource']`)
          }}</span>
        </v-card-title>
        <v-container fluid>
          <v-row dense>
            <v-col cols="2">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + awsForm.aws_id.label + `']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['` + awsForm.aws_id.label + `']`)"
                    :text="String(awsModel.aws_id)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ awsModel.aws_id }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + awsForm.aws_account_id.label + `']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['` + awsForm.aws_account_id.label + `']`)"
                    :text="awsModel.aws_account_id"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ awsModel.aws_account_id }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="!awsForm.setupAll">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + awsForm.aws_data_source_id.label + `']`) }}
                  <clip-board
                    size="large"
                    :name="
                      $t(`item['` + awsForm.aws_data_source_id.label + `']`)
                    "
                    :text="String(awsModel.aws_data_source_id)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ awsModel.aws_data_source_id }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="!awsForm.setupAll">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + awsForm.data_source.label + `']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['` + awsForm.data_source.label + `']`)"
                    :text="awsModel.data_source"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ awsModel.data_source }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense v-if="!awsForm.setupAll">
            <v-col cols="3" v-if="awsModel.status">
              <v-list-item two-line>
                <v-list-item-title class="text-h5">
                  <v-list-item-subtitle>
                    {{ $t(`item['` + awsForm.status.label + `']`) }}
                  </v-list-item-subtitle>
                  <v-chip
                    variant="flat"
                    class="text-white"
                    :color="getDataSourceStatusColor(awsModel.status)"
                  >
                    {{ getDataSourceStatusText(awsModel.status) }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="awsModel.scan_at">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + awsForm.scan_at.label + `']`) }}
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  <v-chip>
                    {{ formatTime(awsModel.scan_at) }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`item['` + awsForm.max_score.label + `']`) }}
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  <v-chip variant="outlined">
                    {{ awsModel.max_score }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-col>
          </v-row>

          <v-row dense v-if="!awsForm.setupAll">
            <v-col cols="8">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  {{ $t(`version['version']`) }}
                </v-list-item-subtitle>
                <v-list-item-title
                  class="text-h5"
                  v-if="awsModel.specific_version"
                >
                  {{ $t(`version['old']`) }} ({{ awsModel.specific_version }})
                  <v-btn
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
            <v-col cols="12" v-if="awsModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">
                    {{ $t(`item['` + awsForm.status_detail.label + `']`) }}
                    <clip-board
                      :name="$t(`item['` + awsForm.status_detail.label + `']`)"
                      :text="String(awsModel.status_detail)"
                    />
                  </span>
                </v-card-title>
                <v-card-text class="wrap">
                  {{ awsModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-text>
          <v-form v-model="awsForm.valid" ref="form">
            <v-row class="mt-1">
              <v-col cols="1">
                <clip-board
                  class="pl-6"
                  size="large"
                  :name="$t(`item['` + awsForm.assume_role_arn.label + `']`)"
                  :text="String(awsModel.assume_role_arn)"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-model="awsModel.assume_role_arn"
                  :counter="255"
                  :rules="awsForm.assume_role_arn.validator"
                  :label="$t(`item['` + awsForm.assume_role_arn.label + `']`)"
                  :placeholder="awsForm.assume_role_arn.placeholder"
                  :disabled="awsForm.readOnly"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="1">
                <clip-board
                  size="large"
                  class="pl-6"
                  :name="$t(`item['` + awsForm.external_id.label + `']`)"
                  :text="String(awsModel.external_id)"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-model="awsModel.external_id"
                  :counter="255"
                  :rules="awsForm.external_id.validator"
                  :label="$t(`item['` + awsForm.external_id.label + `']`)"
                  :placeholder="awsForm.external_id.placeholder"
                  :disabled="awsForm.readOnly"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense class="my-0">
              <v-col cols="1" />
              <v-col cols="2">
                <v-btn
                  variant="text"
                  color="purple-darken-2"
                  :disabled="awsForm.readOnly"
                  @click="handleGenerateID"
                >
                  {{ $t(`btn['AUTO GENERATE EXTERNAL ID']`) }}
                </v-btn>
              </v-col>
            </v-row>
            <v-data-table
              v-model="setupAllTable.selected"
              show-select
              :headers="setupAllHeaders"
              :items="setupAllTable.items"
              :loading="loading"
              locale="ja-jp"
              loading-text="Loading..."
              no-data-text="No data."
              class="elevation-1"
              item-key="aws_data_source_id"
              v-if="awsForm.setupAll"
            >
              <template v-slot:[`item.avatar`]="{ item }">
                <v-avatar class="ma-3" size="48px">
                  <v-img
                    height="36px"
                    width="36px"
                    :src="getAWSDataSourceIcon(item.value.data_source)"
                    :alt="item.value.data_source"
                  />
                </v-avatar>
              </template>
              <template v-slot:[`item.status`]="{ item }">
                <v-chip
                  v-if="item.value.aws_id"
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
                  <v-icon v-else small color="white" class="mr-2">{{
                    getDataSourceStatusIcon(item.value.status)
                  }}</v-icon>
                  {{ getDataSourceStatusText(item.value.status) }}
                </v-chip>
                <v-chip v-else variant="flat" color="grey"
                  >Not configured</v-chip
                >
              </template>
            </v-data-table>
            <v-checkbox
              v-if="awsForm.setupAll"
              v-model="awsModel.overrideDataSource"
              label="Override the already attaced datasources"
            ></v-checkbox>

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-btn
                text
                variant="outlined"
                color="blue-darken-1"
                v-if="awsForm.readOnly"
                :loading="loading"
                @click="handleScan"
              >
                <v-icon left>mdi-magnify-scan</v-icon>
                {{ $t(`btn['SCAN']`) }}
              </v-btn>
              <v-btn
                variant="outlined"
                color="cyan-darken-2"
                v-if="awsForm.readOnly"
                :loading="loading"
                link
                :to="{
                  path: '/finding/finding/',
                  query: {
                    data_source: awsModel.data_source,
                    tag: awsModel.aws_account_id,
                  },
                }"
                prepend-icon="mdi-magnify"
                risken-action-name="search-finding-by-datasource-from-aws"
              >
                {{ $t(`btn['SHOW SCAN RESULT']`) }}
              </v-btn>
              <v-spacer />
              <v-btn
                text
                variant="outlined"
                color="grey-darken-1"
                @click="editDialog = false"
              >
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                text
                variant="outlined"
                color="green-darken-1"
                v-if="!awsForm.readOnly && !awsForm.setupAll"
                :loading="loading"
                @click="handleAttachSubmit"
              >
                {{ $t(`btn['ATTACH']`) }}
              </v-btn>
              <v-btn
                text
                variant="outlined"
                color="green-darken-1"
                v-if="awsForm.setupAll"
                :loading="loading"
                @click="handleAttachAll"
              >
                {{ $t(`btn['ATTACH ALL']`) }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="text-h5">
          <span class="mx-4">{{
            $t(`message['Do you really want to detach this?']`)
          }}</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-identifier">
            <v-list-item-title>
              {{ awsModel.aws_id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['AWS ID']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-aws">
            <v-list-item-title>
              {{ awsModel.data_source }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Data Source']`) }}
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
import aws from '@/mixin/api/aws'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'AWSDataSource',
  mixins: [mixin, aws],
  components: {
    BottomSnackBar,
    ClipBoard,
    VDataTable,
  },
  data() {
    return {
      loading: false,
      awsList: [],
      awsForm: {
        readOnly: false,
        setupAll: false,
        valid: false,
        aws_data_source_id: {
          label: 'Data Source ID',
          placeholder: '-',
          validator: [],
        },
        data_source: { label: 'Data Source', placeholder: '-', validator: [] },
        max_score: { label: 'MAX Score', placeholder: '-', validator: [] },
        aws_id: { label: 'AWS ID', placeholder: '-', validator: [] },
        aws_account_id: {
          label: 'AWS Account ID',
          placeholder: '-',
          validator: [],
        },
        assume_role_arn: {
          label: 'Assume Role',
          placeholder: '-',
          validator: [
            (v) => !!v || 'Assume Role is required',
            (v) =>
              !v ||
              v.length <= 255 ||
              'Assume Role must be less than 255 characters',
          ],
        },
        external_id: {
          label: 'External ID',
          placeholder: '-',
          validator: [
            (v) => !!v || 'External ID is required',
            (v) =>
              !v ||
              (v.length >= 8 && v.length <= 255) ||
              'External ID must be between 8 and 255 characters',
          ],
        },
        status: { label: 'Status', placeholder: '-', validator: [] },
        status_detail: {
          label: 'Status Detail',
          placeholder: '-',
          validator: [],
        },
        scan_at: { label: 'ScanAt', placeholder: '-', validator: [] },
      },
      awsModel: {
        aws_id: '',
        aws_account_id: '',
        aws_data_source_id: '',
        data_source: '',
        name: '',
        max_score: '',
        assume_role_arn: '',
        external_id: '',
        status: 0,
        status_detail: '',
        scan_at: 0,
        specific_version: '',
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['aws_id'] },
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
      await this.refleshList()
    }, 3000)
  },
  async mounted() {
    this.loading = true
    await this.listAWS()
    if (this.awsList.length < 1) {
      this.loading = false
      return false
    }
    this.awsModel = this.awsList[0]
    this.awsList.forEach(async (aws) => {
      if (aws.aws_id == Number(this.$route.query.aws_id)) {
        this.awsModel = aws
        return
      }
    })
    this.refleshList()
    this.loading = false
  },
  computed: {
    headers() {
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
          sortable: false,
          key: 'data_source',
        },
        {
          title: this.$i18n.t('item["MAX Score"]'),
          align: 'center',
          sortable: false,
          key: 'max_score',
        },
        {
          title: this.$i18n.t('item["Status"]'),
          align: 'start',
          width: '14%',
          sortable: false,
          key: 'status',
        },
        {
          title: this.$i18n.t('item["Assume Role"]'),
          align: 'start',
          sortable: false,
          key: 'assume_role_arn',
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
          sortable: false,
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
          sortable: false,
          key: 'data_source',
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
  methods: {
    async listAWS() {
      const aws = await this.listAWSAPI().catch((err) => {
        return Promise.reject(err)
      })
      if (!aws) {
        return false
      }
      this.awsList = aws
      this.loading = false
    },
    async refleshList() {
      if (!this.awsModel.aws_id) {
        this.clearList()
        return
      }
      const ds = await this.listAWSDataSourceAPI(
        this.awsModel.aws_id,
        ''
      ).catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      if (!ds) {
        this.clearList()
        return false
      }
      this.table.total = ds.length
      this.table.items = ds
    },
    clearList() {
      this.table.total = 0
      this.table.items = []
      this.loading = false
    },
    getAWSDataSourceIcon(dataSource) {
      switch (dataSource) {
        case 'aws:guard-duty':
          return '/static/aws/guard-duty.png'
        case 'aws:access-analyzer':
          return '/static/aws/s3.webp'
        case 'aws:admin-checker':
          return '/static/aws/iam.png'
        case 'aws:cloudsploit':
          return '/static/aws/cloudsploit.png'
        case 'aws:portscan':
          return '/static/aws/nmap.png'
        default:
          return '/static/aws/default.png'
      }
    },
    async detachDataSource() {
      await this.detachAWSDataSourceAPI(
        this.awsModel.aws_id,
        this.awsModel.aws_data_source_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Detach AWS Data Source.')
    },
    async attachDataSource() {
      await this.execAttachDataSource()
      this.finishSuccess('Success: Attach AWS Data Source.')
    },
    async attachAllDataSource() {
      this.finishSuccess('Success: Attach AWS Data Source.')
      this.setupAllTable.selected.forEach(async (ds) => {
        if (
          this.awsModel.overrideDataSource ||
          ds.assume_role_arn == undefined ||
          ds.assume_role_arn == ''
        ) {
          this.awsModel.aws_data_source_id = ds.aws_data_source_id
          await this.execAttachDataSource()
        }
      })
      this.finishSuccess('Success: Attach all AWS Data Source.')
    },
    async execAttachDataSource() {
      let scan_at = 0
      if (this.awsModel.scan_at > 0) {
        scan_at = this.awsModel.scan_at
      }
      const param = {
        project_id: this.getCurrentProjectID(),
        attach_data_source: {
          aws_id: this.awsModel.aws_id,
          aws_data_source_id: this.awsModel.aws_data_source_id,
          project_id: this.getCurrentProjectID(),
          assume_role_arn: this.awsModel.assume_role_arn,
          external_id: this.awsModel.external_id,
          status: 2, // CONFIGURED
          status_detail:
            'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      await this.attachAWSDataSourceAPI(param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
    },
    async scanDataSource() {
      await this.invokeAWSScanAPI(
        this.awsModel.aws_id,
        this.awsModel.aws_data_source_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Invoke scan for Data Source.')
    },

    getActionList() {
      let actions = [
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
      ]
      return actions
    },

    // handler method
    async handleList() {
      this.loading = true
      await this.refleshList()
      this.finishInfo('Reflesh list')
    },
    handleSetupAll() {
      this.awsModel = {
        aws_id: this.awsModel.aws_id,
        aws_account_id: this.awsModel.aws_account_id,
        aws_data_source_id: '',
        name: this.awsModel.name,
        data_source: '',
        max_score: '',
        assume_role_arn: '',
        external_id: '',
      }
      this.awsForm.readOnly = false
      this.awsForm.setupAll = true
      this.setupAllTable.items = [...this.table.items]
      this.setupAllTable.selected = [...this.table.items]
      this.editDialog = true
    },
    handleRowClick(event, datasources) {
      this.handleViewItem(datasources.item)
    },
    handleViewItem(item) {
      this.assignDataModel(item.value)
      this.awsForm.readOnly = true
      this.awsForm.setupAll = false
      this.editDialog = true
    },
    handleAttachItem(item) {
      this.assignDataModel(item.value)
      this.awsForm.readOnly = false
      this.awsForm.setupAll = false
      this.editDialog = true
    },
    handleAttachSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      this.attachDataSource()
    },
    handleAttachAll() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      this.attachAllDataSource()
    },
    handleDetachItem(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true
    },
    handleDetachSubmit() {
      if (!this.awsModel.aws_id) {
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
      if (item.value.aws_data_source_id) {
        this.assignDataModel(item.value)
      }
      this.scanDataSource()
    },
    handleGenerateID() {
      this.awsModel.external_id = Util.generateExternalID()
    },
    assignDataModel(item) {
      this.awsModel = {
        aws_id: this.awsModel.aws_id,
        aws_account_id: this.awsModel.aws_account_id,
        aws_data_source_id: '',
        name: this.awsModel.name,
        data_source: '',
        max_score: '',
        assume_role_arn: '',
        external_id: '',
      }
      this.awsModel = Object.assign(this.awsModel, item)
    },
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
        this.refleshList()
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
