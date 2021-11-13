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
            @click="projectTagDialog = true"
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
            @click="refleshList"
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
                item-key="application_scan_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-3">
                    <v-icon color="blue darken-1" large
                      >mdi-bug-check-outline</v-icon
                    >
                  </v-avatar>
                </template>
                <template v-slot:[`item.scan_type`]="{ item }">
                  <v-chip
                    v-if="item.application_scan_id"
                    :color="getScanTypeColor(item.scan_type)"
                    dark
                  >
                    {{ getScanTypeText(item.scan_type) }}
                  </v-chip>
                  <v-chip v-else color="grey" dark>Not configured</v-chip>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    v-if="item.application_scan_id"
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

    <v-dialog v-model="editDialog" max-width="40%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue darken-1">mdi-bug-check-outline</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['Application Scan']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="applicationScanForm.valid" ref="form">
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
              outlined
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
              outlined
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
              outlined
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
                outlined
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
                outlined
                required
              ></v-text-field>
            </template>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-btn
                text
                outlined
                color="blue darken-1"
                v-if="!this.applicationScanForm.newApplicationScan"
                :loading="loading"
                @click="handleScan"
              >
                {{ $t(`btn['SCAN']`) }}
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
                @click="handleEditSubmit"
              >
                <template
                  v-if="
                    applicationScanBasicSettingForm.newApplicationScanBasicSetting
                  "
                  >{{ $t(`btn['REGIST']`) }}</template
                >
                <template v-else>{{ $t(`btn['EDIT']`) }}</template>
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
              <v-list-item-title
                v-text="applicationScanModel.application_scan_id"
              ></v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Application Scan ID']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                v-text="applicationScanModel.name"
              ></v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Name']`)
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
  mixins: [mixin, diagnosis, project],
  components: {
    BottomSnackBar,
    ProjectTag,
  },
  data() {
    return {
      loading: false,
      applicationScanForm: {
        newApplicationScan: false,
        valid: false,
        application_scan_id: { label: 'ID', placeholder: '-' },
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
          sortable: false,
          value: 'application_scan_id',
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          value: 'name',
        },
        {
          text: this.$i18n.t('item["ScanType"]'),
          align: 'start',
          sortable: false,
          value: 'scan_type',
        },
        {
          text: this.$i18n.t('item["Status"]'),
          align: 'start',
          sortable: false,
          value: 'status',
        },
        {
          text: this.$i18n.t('item["ScanAt"]'),
          align: 'center',
          sortable: false,
          value: 'scan_at',
        },
        {
          text: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: false,
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
    async handleRowClick(item) {
      this.handleEditItem(item)
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
      await this.assignDataModel(item)
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
          'indigo darken-1'
        )
      }
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.deleteItem(this.applicationScanModel.application_scan_id)
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
