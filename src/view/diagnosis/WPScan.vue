<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue"
                >mdi-bug-check-outline</v-icon
              >
              {{ $t(`submenu['WPScan']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              outlined
              clearable
              dense
              background-color="white"
              prepend-icon="mdi-magnify"
              placeholder="Type something..."
              v-model="table.search"
              hide-details
              class="hidden-sm-and-down"
            />
          </v-col>

          <v-spacer />
          <v-btn
            text
            outlined
            class="mt-1 mr-4"
            color="blue darken-1"
            @click="handleNewProjectTag"
          >
            {{ $t(`btn['TAG']`) }}
          </v-btn>
          <project-tag
            :tagDialog="projectTagDialog"
            @projectTagCancel="projectTagDialog = false"
            @projectTagUpdated="handleProjectTagUpdated"
          />
          <v-btn
            class="mt-1 mr-4"
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
          <v-btn
            class="mt-1 mr-4"
            color="primary darken-3"
            fab
            dense
            small
            @click="handleNewItem"
          >
            <v-icon>mdi-new-box</v-icon>
          </v-btn>
        </v-row>
      </v-form>
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
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="diagnosis_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-3">
                    <v-icon color="blue darken-1" large>mdi-wordpress</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    v-if="item.status"
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

    <v-dialog v-model="editDialog" max-width="70%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue">mdi-wpscan</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['WPScan']`) }}
          </span>
        </v-card-title>
        <v-container fluid>
          <v-row dense>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Data Source ID']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ diagnosisModel.diagnosis_data_source_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Name']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ diagnosisModel.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Description']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ diagnosisModel.description }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="2">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['MAX Score']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip outlined>
                      {{ diagnosisModel.max_score }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="3" v-if="wpscanModel.wpscan_setting_id">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['WPScan Setting ID']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ wpscanModel.wpscan_setting_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="wpscanModel.status">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    <v-list-item-subtitle>
                      {{ $t(`item['Status']`) }}
                    </v-list-item-subtitle>
                    <v-chip
                      dark
                      :color="getDataSourceStatusColor(wpscanModel.status)"
                    >
                      {{ getDataSourceStatusText(wpscanModel.status) }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="wpscanModel.scan_at">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['ScanAt']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip color="grey lighten-3">
                      {{ wpscanModel.scan_at | formatTime }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" v-if="wpscanModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">
                    {{ $t(`item['Status Detail']`) }}
                  </span>
                </v-card-title>
                <v-card-text>
                  {{ wpscanModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-text>
          <v-form v-model="wpscanForm.valid" ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="wpscanModel.target_url"
                  :counter="255"
                  :rules="wpscanForm.target_url.validator"
                  :label="
                    $t(`item['` + wpscanForm.target_url.label + `']`) + ' *'
                  "
                  :placeholder="wpscanForm.target_url.placeholder"
                  :disabled="wpscanForm.readOnly"
                  :filled="wpscanForm.readOnly"
                ></v-text-field>
              </v-col>
              <v-checkbox
                v-model="wpscanModel.use_detail_setting"
                :label="
                  $t(`item['` + wpscanForm.use_detail_setting.label + `']`)
                "
                :disabled="wpscanForm.readOnly"
                :filled="wpscanForm.readOnly"
              ></v-checkbox>
            </v-row>
            <v-container v-if="wpscanModel.use_detail_setting">
              <v-divider></v-divider>
              <v-checkbox
                v-model="detailSettingModel.force"
                :label="$t(`item['` + detailSettingForm.force.label + `']`)"
                :disabled="detailSettingForm.readOnly"
                :filled="detailSettingForm.readOnly"
              ></v-checkbox>
              <v-checkbox
                v-model="detailSettingModel.random_user_agent"
                :label="
                  $t(
                    `item['` + detailSettingForm.random_user_agent.label + `']`
                  )
                "
                :disabled="detailSettingForm.readOnly"
                :filled="detailSettingForm.readOnly"
              ></v-checkbox>
              <v-text-field
                v-model.number="detailSettingModel.wp_content_dir"
                auto-grow
                clearable
                :rules="detailSettingForm.wp_content_dir.validator"
                :label="
                  $t(`item['` + detailSettingForm.wp_content_dir.label + `']`)
                "
                :placeholder="detailSettingForm.wp_content_dir.placeholder"
                :disabled="detailSettingForm.readOnly"
                :filled="detailSettingForm.readOnly"
                outlined
                required
              ></v-text-field>
            </v-container>

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-btn
                text
                outlined
                color="blue darken-1"
                v-if="wpscanForm.readOnly"
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
                v-if="wpscanForm.readOnly"
                :loading="loading"
                link
                :to="{
                  path: '/finding/finding/',
                  query: {
                    data_source: diagnosisModel.name,
                    tag: wpscanModel.target_url,
                  },
                }"
                risken-action-name="search-finding-by-datasource-from-wpscan"
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
                v-if="!wpscanForm.readOnly"
                :loading="loading"
                @click="handleEditSubmit"
              >
                {{ $t(`btn['EDIT']`) }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
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
                {{ wpscanModel.wpscan_setting_id }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['WPScan Setting ID']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ wpscanModel.target_url }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Target URL']`)
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
import diagnosis from '@/mixin/api/diagnosis'
import project from '@/mixin/api/project'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
import ProjectTag from '@/component/widget/tag/ProjectTag'
export default {
  name: 'DiagnosisWPScan',
  mixins: [mixin, diagnosis, project],
  components: {
    BottomSnackBar,
    ProjectTag,
  },
  data() {
    return {
      loading: false,
      wpscanForm: {
        readOnly: false,
        valid: false,
        target_url: {
          label: 'Target URL',
          placeholder: '-',
          validator: [
            (v) =>
              !v ||
              v.length <= 200 ||
              'WPScan Key must be less than 200 characters',
          ],
        },
        use_detail_setting: { label: 'Setting Detail' },
      },
      detailSettingForm: {
        readOnly: false,
        valid: false,
        force: { label: 'WPScan Force' },
        random_user_agent: { label: 'WPScan Random User Agent' },
        wp_content_dir: {
          label: 'WPScan WP Content Dir',
          placeholder: 'wp-content',
          validator: [
            (v) =>
              v.length <= 200 ||
              'WPScan Content Dir must be less than 200 characters',
          ],
        },
        use_detail_setting: { label: 'Setting Detail' },
      },
      diagnosisModel: {
        diagnosis_data_source_id: '',
        name: '',
        description: '',
        max_score: '',
        updated_at: '',
      },
      wpscanModel: {
        wpscan_setting_id: '',
        diagnosis_data_source_id: '',
        target_url: '',
        status: '',
        options: '',
        use_detail_setting: false,
        status_detail: '',
        scan_at: '',
        updated_at: '',
      },
      detailSettingModel: {
        force: false,
        random_user_agent: false,
        wp_content_dir: '',
      },
      table: {
        selected: [],
        search: '',
        options: {
          page: 1,
          itemsPerPage: 5,
          sortBy: ['diagnosis_data_source_id'],
        },
        actions: [
          { text: 'View Item', icon: 'mdi-eye', click: this.handleViewItem },
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteItem,
          },
          { text: 'Scan', icon: 'mdi-magnify-scan', click: this.handleScan },
        ],
        footer: {
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      deleteDialog: false,
      editDialog: false,
    }
  },
  created() {
    this.$setInterval(async () => {
      await this.listWPScanSetting()
    }, 3000)
  },
  computed: {
    headers() {
      return [
        {
          text: this.$i18n.t('item[""]'),
          align: 'center',
          width: '10%',
          sortable: false,
          value: 'avator',
        },
        {
          text: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          value: 'wpscan_setting_id',
        },
        {
          text: this.$i18n.t('item["Target URL"]'),
          align: 'start',
          sortable: true,
          value: 'target_url',
        },
        {
          text: this.$i18n.t('item["Status"]'),
          align: 'start',
          sortable: true,
          value: 'status',
        },
        {
          text: this.$i18n.t('item["ScanAt"]'),
          align: 'start',
          sortable: true,
          value: 'scan_at',
        },
        {
          text: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: true,
          value: 'updated_at',
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
    await this.getWPScanDataSource()
    await this.refleshList()
  },
  methods: {
    async refleshList() {
      this.loading = true
      this.listWPScanSetting().catch((err) => {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async getWPScanDataSource() {
      const wpscan_datasource = await this.getWPScanDataSourceAPI().catch(
        (err) => {
          return Promise.reject(err)
        }
      )
      if (!wpscan_datasource) {
        return false
      }
      this.diagnosisModel = wpscan_datasource
    },
    async listWPScanSetting() {
      const wpscan = await this.listWPScanSettingAPI().catch((err) => {
        return Promise.reject(err)
      })
      if (!wpscan) {
        return false
      }
      this.table.items = wpscan
    },
    async putItem() {
      let scan_at = 0
      if (this.wpscanModel.scan_at > 0) {
        scan_at = this.wpscanModel.scan_at
      }
      const scanOptions = this.setScanOptions()
      await this.putWPScanSettingAPI(
        this.wpscanModel.wpscan_setting_id,
        this.wpscanModel.target_url,
        JSON.stringify(scanOptions),
        scan_at
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Put WPScan.')
    },
    async deleteItem() {
      await this.deleteWPScanSettingAPI(
        this.wpscanModel.wpscan_setting_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Delete.')
    },
    setScanOptions() {
      let scanOptions = {}
      if (this.wpscanModel.use_detail_setting) {
        if (this.detailSettingModel.force) {
          scanOptions['force'] = true
        }
        if (this.detailSettingModel.random_user_agent) {
          scanOptions['random-user-agent'] = true
        }
        if (this.detailSettingModel.wp_content_dir) {
          scanOptions['wp-content-dir'] = this.detailSettingModel.wp_content_dir
        }
      }
      return scanOptions
    },
    // Handler
    async handleList() {
      this.loading = true
      await this.listWPScanSetting()
      this.finishInfo('Reflesh list')
    },
    handleRowClick(item) {
      this.handleViewItem(item)
    },
    handleViewItem(item) {
      this.assignDataModel(item)
      this.wpscanForm.readOnly = true
      this.detailSettingForm.readOnly = true
      this.editDialog = true
    },
    handleNewItem() {
      this.handleEditItem()
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.wpscanForm.readOnly = false
      this.detailSettingForm.readOnly = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      await this.putItem()
      await this.tagProjectAPI(
        'wpscan:' + this.wpscanModel.target_url,
        'indigo darken-1'
      )
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.untagProjectAPI('wpscan:' + this.wpscanModel.target_url)
      await this.deleteItem()
    },
    async handleScan(item) {
      this.loading = true
      if (item && item.wpscan_setting_id) {
        this.assignDataModel(item)
      }
      await this.invokeDiagnosisScanAPI(
        this.wpscanModel.wpscan_setting_id,
        this.wpscan_datasource_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Invoke scan for Data Source.')
    },

    assignDataModel(item) {
      this.wpscanModel = {}
      this.detailSettingModel = {
        force: false,
        random_user_agent: false,
        wp_content_dir: '',
      }
      this.wpscanModel = Object.assign(this.wpscanModel, item)
      if (item) {
        this.assignScanOptions(item.options)
      }
    },
    assignScanOptions(strScanOptions) {
      if (!strScanOptions) {
        return
      }
      let scanOptions = JSON.parse(strScanOptions)
      let isSetDetail = false
      if (scanOptions['force']) {
        this.detailSettingModel.force = true
        isSetDetail = true
      }
      if (scanOptions['random-user-agent']) {
        this.detailSettingModel.random_user_agent = true
        isSetDetail = true
      }
      if (scanOptions['wp-content-dir']) {
        this.detailSettingModel.wp_content_dir = scanOptions['wp-content-dir']
        isSetDetail = true
      }
      if (isSetDetail) {
        this.wpscanModel.use_detail_setting = true
      }
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
      this.editDialog = false
      this.deleteDialog = false
      if (reflesh) {
        this.listWPScanSetting()
      }
      this.loading = false
    },
  },
}
</script>
