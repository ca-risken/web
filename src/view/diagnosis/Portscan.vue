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
              {{ $t(`submenu['Portscan']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              bg-color="white"
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
                item-key="portscan_setting_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3" size="48px">
                    <v-icon color="blue-darken-1" size="36px"
                      >mdi-bug-check-outline</v-icon
                    >
                  </v-avatar>
                </template>
                <template v-slot:[`item.scan_at`]="{ item }">
                  <v-chip v-if="item.scan_at">{{
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

    <v-dialog v-model="targetsDialog" max-width="80%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue-darken-1">mdi-bug-check-outline</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['Portscan Target']`) }}
          </span>
        </v-card-title>
        <v-row dense justify="center" align-content="center">
          <v-spacer />
          <v-btn
            text
            variant="outlined"
            class="mt-1 mr-4"
            color="blue-darken-1"
            @click="handleNewTarget"
          >
            {{ $t(`btn['ADD']`) }}
          </v-btn>
        </v-row>
        <v-card-text class="pa-0">
          <v-data-table
            v-model="tableTargets.selected"
            :search="tableTargets.search"
            :headers="headersTarget"
            :items="tableTargets.items"
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
            item-key="portscan_target_id"
            @click:row="handleEditTarget"
          >
            <template v-slot:[`item.avator`]>
              <v-avatar class="ma-3">
                <v-icon color="blue-darken-1" large
                  >mdi-bug-check-outline</v-icon
                >
              </v-avatar>
            </template>
            <template v-slot:[`item.scan_at`]="{ item }">
              <v-chip v-if="item.scan_at">{{
                formatTime(item.value.scan_at)
              }}</v-chip>
              <v-chip v-else>Not yet scan...</v-chip>
            </template>
            <template v-slot:[`item.status`]="{ item }">
              <v-chip
                v-if="item.value.portscan_target_id"
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
              <v-chip v-else color="grey" variant="flat">Not configured</v-chip>
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
                    v-for="action in tableTargets.actions"
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
          <v-card-actions>
            <v-btn
              text
              variant="outlined"
              color="blue-darken-1"
              v-if="!this.portscanSettingForm.newPortscanSetting"
              :loading="loading"
              @click="handleScan"
            >
              {{ $t(`btn['SCAN']`) }}
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" max-width="40%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue-darken-1">mdi-bug-check-outline</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['Portscan']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="portscanSettingForm.valid" ref="form">
            <v-text-field
              v-model="portscanSettingModel.portscan_setting_id"
              :label="
                $t(
                  `item['` +
                    portscanSettingForm.portscan_setting_id.label +
                    `']`
                )
              "
              :placeholder="portscanSettingForm.portscan_setting_id.placeholder"
              variant="outlined"
              filled
              disabled
            ></v-text-field>
            <v-text-field
              v-model="portscanSettingModel.name"
              :counter="200"
              :rules="portscanSettingForm.name.validator"
              :label="
                $t(`item['` + portscanSettingForm.name.label + `']`) + ' *'
              "
              :placeholder="portscanSettingForm.name.placeholder"
              variant="outlined"
              required
            ></v-text-field>
            <v-textarea
              v-model="portscanSettingModel.target"
              auto-grow
              :rules="portscanSettingForm.target.validator"
              :label="
                $t(`item['` + portscanSettingForm.target.label + `']`) + ' *'
              "
              :placeholder="portscanSettingForm.target.placeholder"
              variant="outlined"
              required
            ></v-textarea>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
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
                <template v-if="portscanTargetForm.newPortscanTarget">{{
                  $t(`btn['REGIST']`)
                }}</template>
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
              {{ portscanSettingModel.portscan_setting_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Portscan Setting ID']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ portscanSettingModel.name }}
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

    <v-dialog v-model="editTargetDialog" max-width="40%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue-darken-1">mdi-bug-check-outline</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['Portscan Target']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="portscanTargetForm.valid" ref="form">
            <v-text-field
              v-model="portscanTargetModel.portscan_setting_id"
              :label="
                $t(
                  `item['` + portscanTargetForm.portscan_setting_id.label + `']`
                )
              "
              :placeholder="portscanTargetForm.portscan_setting_id.placeholder"
              variant="outlined"
              filled
              disabled
            ></v-text-field>
            <v-text-field
              v-model="portscanTargetModel.portscan_target_id"
              :counter="200"
              :rules="portscanTargetForm.portscan_target_id.validator"
              :label="
                $t(
                  `item['` + portscanTargetForm.portscan_target_id.label + `']`
                ) + ' *'
              "
              :placeholder="portscanTargetForm.portscan_target_id.placeholder"
              variant="outlined"
              filled
              disabled
            ></v-text-field>
            <v-text-field
              v-model="portscanTargetModel.target"
              :counter="255"
              :rules="portscanTargetForm.target.validator"
              :label="
                $t(`item['` + portscanTargetForm.target.label + `']`) + ' *'
              "
              :placeholder="portscanTargetForm.target.placeholder"
              variant="outlined"
              required
            ></v-text-field>
            <v-textarea
              v-if="portscanTargetModel.status_detail"
              v-model="portscanTargetModel.status_detail"
              :label="
                $t(`item['` + portscanTargetForm.status_detail.label + `']`) +
                ' *'
              "
              :placeholder="portscanTargetForm.status_detail.placeholder"
              variant="outlined"
              disabled
            ></v-textarea>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                variant="outlined"
                color="grey-darken-1"
                @click="editTargetDialog = false"
              >
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                text
                variant="outlined"
                color="green-darken-1"
                :loading="loading"
                @click="handleEditTargetSubmit"
              >
                <template v-if="portscanTargetForm.newPortscanTarget">{{
                  $t(`btn['REGIST']`)
                }}</template>
                <template v-else>{{ $t(`btn['SAVE']`) }}</template>
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteTargetDialog" max-width="40%">
      <v-card>
        <v-card-title class="text-h5">
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-identifier">
            <v-list-item-title>
              {{ portscanTargetModel.portscan_target_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Portscan Target ID']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ portscanTargetModel.target }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Target']`)
            }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="deleteTargetDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red-darken-1"
            text
            variant="outlined"
            :loading="loading"
            @click="handleDeleteTargetSubmit"
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
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'DiagnosisPortscan',
  mixins: [mixin, diagnosis, project],
  components: {
    BottomSnackBar,
    ProjectTag,
    VDataTable,
  },
  data() {
    return {
      loading: false,
      portscanSettingForm: {
        newPortscanSetting: false,
        valid: false,
        portscan_setting_id: { label: 'ID', placeholder: '-' },
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
      },
      portscanTargetForm: {
        newPortscanTarget: false,
        valid: false,
        portscan_setting_id: { label: 'Portscan Setting ID', placeholder: '-' },
        portscan_target_id: { label: 'Portscan Target ID', placeholder: '-' },
        target: {
          label: 'Target',
          placeholder: 'something',
          validator: [
            (v) => !!v || 'Target is required',
            (v) =>
              !v || v.length <= 255 || 'Name must be less than 255 characters',
          ],
        },
        status_detail: { label: 'Status Detail', placeholder: '-' },
      },
      portscanSettingModel: {
        portscan_setting_id: 0,
        name: '',
        updated_at: '',
        target: '',
      },
      portscanTargetModel: {
        portscan_setting_id: 0,
        portscan_target_id: 0,
        target: '',
        scan_at: '',
        updated_at: '',
        status: '',
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 5, sortBy: ['portscan_setting_id'] },
        actions: [
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
        },
        items: [],
      },
      tableTargets: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 5, sortBy: ['portscan_target_id'] },
        actions: [
          {
            text: 'Edit Item',
            icon: 'mdi-pencil',
            click: this.handleEditTarget,
          },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteTarget,
          },
        ],
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: 20, title: '20' },
          ],
          showCurrentPage: true,
        },
        items: [],
      },
      deleteDialog: false,
      editDialog: false,
      deleteTargetDialog: false,
      editTargetDialog: false,
      targetsDialog: false,
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
          key: 'portscan_setting_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
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
    headersTarget() {
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
          key: 'portscan_target_id',
        },
        {
          title: this.$i18n.t('item["Target"]'),
          align: 'start',
          sortable: false,
          key: 'target',
        },
        {
          title: this.$i18n.t('item["Status"]'),
          align: 'start',
          sortable: false,
          key: 'status',
        },
        {
          title: this.$i18n.t('item["ScanAt"]'),
          align: 'start',
          sortable: false,
          key: 'scan_at',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'start',
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
  mounted() {
    this.loading = true
    this.refleshList('')
  },
  methods: {
    async refleshList() {
      const portscan_setting = await this.listPortscanSettingAPI().catch(
        (err) => {
          this.clearList()
          this.finishError(err.response.data)
          return Promise.reject(err)
        }
      )
      if (!portscan_setting) {
        this.clearList()
        return false
      }
      this.table.items = portscan_setting
      this.loading = false
    },
    async refleshTargetList(portscanSettingID) {
      const portscan_target = await this.listPortscanTargetAPI(
        portscanSettingID
      ).catch((err) => {
        this.clearTargetList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if (!portscan_target) {
        this.clearList()
        return false
      }
      this.tableTargets.items = portscan_target
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    clearTargetList() {
      this.tableTargets.items = []
      this.loading = false
    },
    async deleteItem(portscanSettingID, name) {
      await await this.untagProjectAPI('portscan:' + name)
      await this.deletePortscanSettingAPI(portscanSettingID).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Delete.')
    },
    async putItem() {
      await this.putPortscanSettingAPI(
        this.diagnosis_portscan_datasource_id,
        this.portscanSettingModel.portscan_setting_id,
        this.portscanSettingModel.name,
        this.portscanSettingModel.target
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      await this.tagProjectAPI(
        'portscan:' + this.portscanSettingModel.name,
        'cyan-darken-2'
      )
      let msg = 'Success: Updated PortscanSetting.'
      if (this.portscanSettingForm.newPortscanSetting) {
        msg = 'Success: Created new PortscanSetting.'
      }
      this.finish(msg)
    },
    async deleteTarget(portscanTargetID) {
      await this.deletePortscanTargetAPI(portscanTargetID).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Delete.')
    },
    async putTarget() {
      await this.putPortscanTargetAPI(
        this.portscanTargetModel.portscan_setting_id,
        this.portscanTargetModel.portscan_target_id,
        this.portscanTargetModel.target
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      let msg = 'Success: Updated PortscanSetting.'
      if (this.portscanSettingForm.newPortscanSetting) {
        msg = 'Success: Created new PortscanSetting.'
      }
      this.finish(msg)
    },
    async handleRowClick(event, portscan) {
      const item = portscan.item
      await this.assignDataModel(item.value)
      const portscan_targets = await this.listPortscanTargetAPI(
        item.value.portscan_setting_id
      ).catch((err) => {
        this.clearTargetList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if (!portscan_targets) {
        this.clearTargetList()
        return false
      }
      this.tableTargets.items = portscan_targets
      this.loading = false
      this.targetsDialog = true
    },
    handleNewItem() {
      this.portscanSettingModel = {
        portscan_setting_id: 0,
        name: '',
        updated_at: '',
        target: '',
      }
      this.portscanSettingForm.newPortscanSetting = true
      this.editDialog = true
    },
    async handleEditItem(item) {
      await this.assignDataModel(item.value)
      this.portscanSettingForm.newPortscanSetting = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      await this.putItem()
    },
    handleDeleteItem(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.deleteItem(
        this.portscanSettingModel.portscan_setting_id,
        this.portscanSettingModel.name
      )
    },
    handleNewTarget() {
      this.portscanTargetModel = {
        portscan_setting_id: this.portscanSettingModel.portscan_setting_id,
        portscan_target_id: 0,
        target: '',
        updated_at: '',
        status: '',
      }
      this.portscanTargetForm.newPortscanTarget = true
      this.editTargetDialog = true
    },
    async handleEditTarget(target) {
      await this.assignTargetDataModel(target.value)
      this.portscanTargetForm.newPortscanTarget = false
      this.editTargetDialog = true
    },
    async handleEditTargetSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      await this.putTarget()
      this.refleshTargetList(this.portscanTargetModel.portscan_setting_id)
    },
    handleDeleteTarget(target) {
      this.assignTargetDataModel(target.value)
      this.deleteTargetDialog = true
    },
    async handleDeleteTargetSubmit() {
      this.loading = true
      await this.deleteTarget(this.portscanTargetModel.portscan_target_id)
      this.refleshTargetList(this.portscanTargetModel.portscan_setting_id)
    },
    handleScanByAction(item) {
      this.handleScan(item.value)
    },
    handleScan(item) {
      this.loading = true
      if (item.portscan_setting_id) {
        this.assignDataModel(item)
      }
      this.scanPortscan()
      this.finish('Success: Invoke scan for Portscan.')
    },
    async scanPortscan() {
      await this.invokeDiagnosisScanAPI(
        this.portscanSettingModel.portscan_setting_id,
        this.diagnosis_portscan_datasource_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Invoke scan for Data Source.')
    },
    async assignDataModel(item) {
      this.portscanSettingModel = {}
      this.portscanSettingModel = Object.assign(this.portscanSettingModel, item)
      const portscan_targets = await this.getPortscanTargets(
        item.portscan_setting_id
      )
      this.portscanSettingModel.target = portscan_targets.join(',')
    },
    assignTargetDataModel(item) {
      this.portscanTargetModel = {}
      this.portscanTargetModel = Object.assign(this.portscanTargetModel, item)
    },
    async getPortscanTargets(portscanSettingID) {
      const portscan_target = await this.listPortscanTargetAPI(
        portscanSettingID
      ).catch((err) => {
        this.clearList()
        this.finishError(err.response.data)
        return []
      })
      if (!portscan_target) {
        return []
      }
      var targets = []
      portscan_target.forEach((target) => {
        targets.push(target.target)
      })
      return targets
    },
    async finish(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.editDialog = false
      this.deleteDialog = false
      this.editTargetDialog = false
      this.deleteTargetDialog = false
      this.refleshList()
    },
    async finishError(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyError(msg)
      this.loading = false
      this.editDialog = false
      this.deleteDialog = false
      this.editTargetDialog = false
      this.deleteTargetDialog = false
      this.refleshList()
    },
  },
}
</script>
