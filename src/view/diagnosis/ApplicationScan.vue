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
              {{ $t(`submenu['Application Scan']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-spacer />
          <v-btn
            text
            variant="outlined"
            class="mr-4"
            color="blue-darken-1"
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
            class="mr-4"
            color="grey-darken-2"
            size="large"
            density="compact"
            icon="mdi-refresh"
            variant="outlined"
            :loading="loading"
            @click="refleshList"
          />
          <v-btn
            class="mr-4"
            color="primary-darken-3"
            size="large"
            density="compact"
            @click="handleNewItem"
            icon="mdi-new-box"
          />
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
                item-key="application_scan_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3" size="48px">
                    <v-icon color="blue-darken-1" size="36px"
                      >mdi-bug-check-outline</v-icon
                    >
                  </v-avatar>
                </template>
                <template v-slot:[`item.scan_type`]="{ item }">
                  <v-chip
                    variant="flat"
                    v-if="item.value.application_scan_id"
                    :color="getScanTypeColor(item.value.scan_type)"
                    dark
                  >
                    {{ getScanTypeText(item.value.scan_type) }}
                  </v-chip>
                  <v-chip v-else variant="flat" color="grey"
                    >Not configured</v-chip
                  >
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    variant="flat"
                    class="text-white"
                    v-if="item.value.application_scan_id"
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
                    <v-icon v-else small color="white" class="mr-2">{{
                      getDataSourceStatusIcon(item.value.status)
                    }}</v-icon>
                    {{ getDataSourceStatusText(item.value.status) }}
                  </v-chip>
                  <v-chip v-else variant="flat" color="grey"
                    >Not configured</v-chip
                  >
                </template>
                <template v-slot:[`item.scan_at`]="{ item }">
                  <v-chip v-if="item.value.scan_at">{{
                    formatTime(item.value.scan_at)
                  }}</v-chip>
                  <v-chip v-else>Not yet scan...</v-chip>
                </template>
                <template v-slot:[`item.updated_at`]="{ item }">
                  <v-chip>{{ formatTime(item.value.updated_at) }}</v-chip>
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

    <v-dialog v-model="editDialog" max-width="60%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue-darken-1">mdi-bug-check-outline</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['Application Scan']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="applicationScanForm.valid" ref="form">
            <template v-if="applicationScanModel.status_detail">
              <v-row dense>
                <v-col cols="12">
                  <v-card>
                    <v-card-title>
                      <v-icon left>mdi-pin-outline</v-icon>
                      <span class="font-weight-light">
                        {{
                          $t(
                            `item['` +
                              applicationScanForm.status_detail.label +
                              `']`
                          )
                        }}
                        <clip-board
                          :name="
                            $t(
                              `item['` +
                                applicationScanForm.status_detail.label +
                                `']`
                            )
                          "
                          :text="String(applicationScanModel.status_detail)"
                        />
                      </span>
                    </v-card-title>
                    <v-card-text>
                      {{ applicationScanModel.status_detail }}
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-divider class="mt-3 mb-3"></v-divider>
            </template>
            <v-text-field
              v-model="applicationScanModel.application_scan_id"
              :label="
                $t(
                  `item['` +
                    applicationScanForm.application_scan_id.label +
                    `']`
                )
              "
              :placeholder="applicationScanForm.application_scan_id.placeholder"
              variant="outlined"
              filled
              disabled
            ></v-text-field>
            <v-text-field
              v-model="applicationScanModel.name"
              :counter="200"
              :rules="applicationScanForm.name.validator"
              :label="
                $t(`item['` + applicationScanForm.name.label + `']`) + ' *'
              "
              :placeholder="applicationScanForm.name.placeholder"
              variant="outlined"
              required
            ></v-text-field>
            <v-text-field
              v-model="applicationScanBasicSettingModel.target"
              auto-grow
              :rules="applicationScanBasicSettingForm.target.validator"
              :label="
                $t(
                  `item['` + applicationScanBasicSettingForm.target.label + `']`
                ) + ' *'
              "
              :placeholder="applicationScanBasicSettingForm.target.placeholder"
              variant="outlined"
              required
            ></v-text-field>
            <v-checkbox
              v-model="applicationScanModel.detailBasicSetting"
              :label="
                $t(
                  `item['` + applicationScanForm.detailBasicSetting.label + `']`
                )
              "
            ></v-checkbox>
            <template v-if="applicationScanModel.detailBasicSetting">
              <v-text-field
                v-model.number="applicationScanBasicSettingModel.max_depth"
                :counter="200"
                :rules="applicationScanBasicSettingForm.max_depth.validator"
                :label="
                  $t(
                    `item['` +
                      applicationScanBasicSettingForm.max_depth.label +
                      `']`
                  ) + ' *'
                "
                :placeholder="
                  applicationScanBasicSettingForm.max_depth.placeholder
                "
                variant="outlined"
                required
              ></v-text-field>
              <v-text-field
                v-model.number="applicationScanBasicSettingModel.max_children"
                auto-grow
                :rules="applicationScanBasicSettingForm.max_children.validator"
                :label="
                  $t(
                    `item['` +
                      applicationScanBasicSettingForm.max_children.label +
                      `']`
                  ) + ' *'
                "
                :placeholder="
                  applicationScanBasicSettingForm.max_children.placeholder
                "
                variant="outlined"
                required
              ></v-text-field>
            </template>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-btn
                text
                variant="outlined"
                color="blue-darken-1"
                v-if="!this.applicationScanForm.newApplicationScan"
                :loading="loading"
                @click="handleScan"
              >
                <v-icon left>mdi-magnify-scan</v-icon>
                {{ $t(`btn['SCAN']`) }}
              </v-btn>
              <v-btn
                variant="outlined"
                color="cyan-darken-2"
                v-if="!this.applicationScanForm.newApplicationScan"
                :loading="loading"
                link
                :to="{
                  path: '/finding/finding/',
                  query: {
                    data_source: 'diagnosis:application-scan',
                    tag:
                      'application_scan_id:' +
                      applicationScanModel.application_scan_id,
                  },
                }"
                prepend-icon="mdi-magnify"
                risken-action-name="search-finding-by-datasource-from-appscan"
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
                :loading="loading"
                @click="handleEditSubmit"
              >
                <template
                  v-if="
                    applicationScanBasicSettingForm.newApplicationScanBasicSetting
                  "
                  >{{ $t(`btn['REGIST']`) }}</template
                >
                <template v-else>{{ $t(`btn['SAVE']`) }}</template>
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

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
              {{ applicationScanModel.application_scan_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Application Scan ID']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ applicationScanModel.name }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Name']`)
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
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ProjectTag from '@/component/widget/tag/ProjectTag.vue'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'DiagnosisApplicationScan',
  mixins: [mixin, diagnosis, project],
  components: {
    BottomSnackBar,
    ProjectTag,
    VDataTable,
    ClipBoard,
  },
  data() {
    return {
      loading: false,
      applicationScanForm: {
        newApplicationScan: false,
        valid: false,
        application_scan_id: { label: 'ID', placeholder: '-' },
        status_detail: { label: 'Status Detail' },
        name: {
          label: 'Name',
          placeholder: 'something',
          validator: [
            (v) => !!v || 'Name is required',
            (v) =>
              !v || v.length <= 200 || 'Name must be less than 200 characters',
          ],
        },
        target: {
          label: 'Target',
          placeholder: '127.0.0.1,localhost',
          validator: [(v) => !!v || 'Target is required'],
        },
        detailBasicSetting: { label: 'Setting Detail' },
      },
      applicationScanBasicSettingForm: {
        newApplicationScanBasicSetting: false,
        valid: false,
        application_scan_id: { label: 'Application Scan ID', placeholder: '-' },
        application_scan_basic_setting_id: {
          label: 'Application Scan Basic Setting ID',
          placeholder: '-',
        },
        target: {
          label: 'Target',
          placeholder: 'something',
          validator: [
            (v) => !!v || 'Target is required',
            (v) =>
              !v ||
              v.length <= 255 ||
              'Target must be less than 255 characters',
          ],
        },
        max_depth: {
          label: 'Max Depth',
          placeholder: '10',
          validator: [
            (v) =>
              !v ||
              v >= 0 ||
              v <= 100 ||
              'Max Depth must be more than 0 and less than 100 number',
          ],
        },
        max_children: {
          label: 'Max Children',
          placeholder: '10',
          validator: [
            (v) =>
              !v ||
              v >= 0 ||
              v <= 100 ||
              'Max Children must be more than 0 and less than 100 number',
          ],
        },
      },
      applicationScanModel: {
        application_scan_id: 0,
        name: '',
        status: '',
        scan_at: '',
        updated_at: '',
        target: '',
        detailBasicSetting: false,
      },
      applicationScanBasicSettingModel: {
        application_scan_id: 0,
        application_scan_basic_setting_id: 0,
        target: '',
        scan_at: '',
        max_depth: 0,
        max_children: 0,
        updated_at: '',
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 5, sortBy: ['application_scan_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteItem,
          },
          {
            text: 'Scan',
            icon: 'mdi-magnify-scan',
            click: this.handleScanByAction,
          },
        ],
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      deleteDialog: false,
      editDialog: false,
    }
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
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: false,
          key: 'application_scan_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["ScanType"]'),
          align: 'start',
          sortable: false,
          key: 'scan_type',
        },
        {
          title: this.$i18n.t('item["Status"]'),
          align: 'start',
          sortable: false,
          key: 'status',
        },
        {
          title: this.$i18n.t('item["ScanAt"]'),
          align: 'center',
          sortable: false,
          key: 'scan_at',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: false,
          key: 'updated_at',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          key: 'action',
        },
      ]
    },
  },
  created() {
    this.$setInterval(async () => {
      if (!this.deleteDialog && !this.editDialog) {
        await this.refleshList()
      }
    }, 3000)
  },
  mounted() {
    this.loading = true
    this.refleshList('')
  },
  methods: {
    async refleshList() {
      const application_scan = await this.listApplicationScanAPI().catch(
        (err) => {
          this.clearList()
          this.finishError(err.response.data)
          return Promise.reject(err)
        }
      )
      if (!application_scan) {
        this.clearList()
        return false
      }
      this.table.items = application_scan
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem(applicationScanID) {
      await this.deleteApplicationScanAPI(applicationScanID).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      await this.deleteApplicationScanBasicSettingAPI(
        this.applicationScanBasicSettingModel.application_scan_basic_setting_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Delete.')
    },
    async putItem() {
      const scan_type = 1 // BASIC
      const newApplicationScanID = await this.putApplicationScanAPI(
        this.diagnosis_application_scan_datasource_id,
        this.applicationScanModel.application_scan_id,
        this.applicationScanModel.name,
        scan_type
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      await this.putApplicationScanBasicSettingAPI(
        newApplicationScanID,
        this.applicationScanBasicSettingModel.application_scan_basic_setting_id,
        this.applicationScanBasicSettingModel.target,
        this.applicationScanBasicSettingModel.max_depth,
        this.applicationScanBasicSettingModel.max_children
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      let msg = 'Success: Updated ApplicationScan.'
      if (this.applicationScanForm.newApplicationScan) {
        msg = 'Success: Created new ApplicationScan.'
      }
      this.finish(msg)
    },
    getApplicationScanTag() {
      if (this.applicationScanBasicSettingModel.target !== '') {
        return 'applicationscan:' + this.applicationScanBasicSettingModel.target
      }
      return ''
    },
    async handleRowClick(event, applicationScan) {
      this.handleEditItem(applicationScan.item)
    },
    handleNewItem() {
      this.applicationScanModel = {
        application_scan_id: 0,
        name: '',
        updated_at: '',
        target: '',
      }
      this.applicationScanBasicSettingModel = {
        application_scan_id: 0,
        application_scan_basic_setting_id: 0,
        target: '',
        scan_at: '',
        max_depth: 0,
        max_children: 0,
        updated_at: '',
      }
      this.applicationScanForm.newApplicationScan = true
      this.editDialog = true
    },
    async handleEditItem(item) {
      await this.assignDataModel(item.value)
      this.applicationScanForm.newApplicationScan = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      await this.putItem()
      if (this.getApplicationScanTag() !== '') {
        await this.tagProjectAPI(
          this.getApplicationScanTag(),
          'indigo-darken-1'
        )
      }
    },
    handleDeleteItem(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.untagProjectAPI(this.getApplicationScanTag())
      await this.deleteItem(this.applicationScanModel.application_scan_id)
    },
    handleScanByAction(item) {
      this.handleScan(item.value)
    },
    handleScan(item) {
      this.loading = true
      if (item.application_scan_id) {
        this.assignDataModel(item)
      }
      this.scanApplicationScan()
      this.finish('Success: Invoke scan for ApplicationScan.')
    },
    async scanApplicationScan() {
      await this.invokeDiagnosisScanAPI(
        this.applicationScanModel.application_scan_id,
        this.diagnosis_application_scan_datasource_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Invoke scan for Data Source.')
    },
    async assignDataModel(item) {
      this.applicationScanModel = {}
      this.applicationScanModel = Object.assign(this.applicationScanModel, item)
      const setting = await this.getApplicationScanBasicSetting(
        item.application_scan_id
      )
      this.applicationScanBasicSettingModel = Object.assign(
        this.applicationScanBasicSettingModel,
        setting
      )
    },
    async getApplicationScanBasicSetting(applicationScanID) {
      const application_scan_basic_setting =
        await this.getApplicationScanBasicSettingAPI(applicationScanID).catch(
          (err) => {
            this.clearList()
            this.finishError(err.response.data)
            return null
          }
        )
      if (!application_scan_basic_setting) {
        return null
      }
      return application_scan_basic_setting
    },
    async finish(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.editDialog = false
      this.deleteDialog = false
      this.refleshList()
    },
    async finishError(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyError(msg)
      this.loading = false
      this.editDialog = false
      this.deleteDialog = false
      this.refleshList()
    },
    getScanTypeText: (status) => {
      switch (Number(status)) {
        case 1:
          return 'BASIC'
        default:
          return 'NotConfigured'
      }
    },
    getScanTypeColor: (status) => {
      switch (Number(status)) {
        case 1:
          return 'green'
        default:
          return 'grey'
      }
    },
  },
}
</script>
