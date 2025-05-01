<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="black">mdi-github</v-icon>
              {{ $t(`submenu['GitHub']`) }}
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
            color="grey-darken-2"
            size="large"
            density="compact"
            variant="outlined"
            :loading="loading"
            @click="handleList"
            icon="mdi-refresh"
          />
          <v-btn
            class="mr-4"
            color="primary-darken-3"
            size="large"
            density="compact"
            @click="handleNewGitHubSetting"
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
                item-key="diagnosis_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3" size="48px">
                    <v-icon color="black" size="36px" icon="mdi-github" />
                  </v-avatar>
                </template>
                <template v-slot:[`item.type_text`]="{ item }">
                  <v-chip label variant="outlined" color="blue-darken-2">{{
                    item.value.type_text
                  }}</v-chip>
                </template>
                <template v-slot:[`item.status_gitleaks`]="{ item }">
                  <scan-status
                    :status="getStatus(item.value.gitleaksSetting)"
                    v-if="getStatus(item.value.gitleaksSetting)"
                  >
                  </scan-status>
                  <v-chip variant="flat" color="grey" v-else> Disabled </v-chip>
                </template>
                <template v-slot:[`item.status_dependency`]="{ item }">
                  <scan-status
                    :status="getStatus(item.value.dependencySetting)"
                    v-if="getStatus(item.value.dependencySetting)"
                  >
                  </scan-status>
                  <v-chip variant="flat" color="grey" v-else> Disabled </v-chip>
                </template>
                <template v-slot:[`item.status_code_scan`]="{ item }">
                  <scan-status
                    :status="getStatus(item.value.codeScanSetting)"
                    v-if="getStatus(item.value.codeScanSetting)"
                  >
                  </scan-status>
                  <v-chip variant="flat" color="grey" v-else> Disabled </v-chip>
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
              {{ gitHubModel.github_setting_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['GitHub Setting ID']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ gitHubModel.name }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Name']`)
            }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-card-actions>
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
            @click="handleDeleteGitHubSettingSubmit"
          >
            {{ $t(`btn['DELETE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <setting-dialog
      v-if="settingDialog"
      :gitHubModel="gitHubModel"
      :settingDialog="settingDialog"
      :isReadOnly="isReadOnlyForm"
      :gitleaksDataSourceModel="gitleaksDataSourceModel"
      :dependencyDataSourceModel="dependencyDataSourceModel"
      :codeScanDataSourceModel="codeScanDataSourceModel"
      @closeDialog="closeDialogEdit"
      v-on:edit-notify="handleEditFinish"
    ></setting-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>
<script>
import mixin from '@/mixin'
import project from '@/mixin/api/project'
import code from '@/mixin/api/code'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ProjectTag from '@/component/widget/tag/ProjectTag.vue'
import ScanStatus from '@/component/widget/datasource/Status.vue'
import SettingDialog from './SettingDialog.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'GitHubSetting',
  mixins: [mixin, project, code],
  components: {
    BottomSnackBar,
    ProjectTag,
    ScanStatus,
    SettingDialog,
    VDataTable,
  },
  data() {
    return {
      loading: false,
      isReadOnlyForm: false,
      gitleaksDataSourceModel: {
        code_data_source_id: '',
        name: '',
        description: '',
        max_score: '',
        updated_at: '',
      },
      dependencyDataSourceModel: {
        code_data_source_id: '',
        name: '',
        description: '',
        max_score: '',
        updated_at: '',
      },
      codeScanDataSourceModel: {
        code_data_source_id: '',
        name: '',
        description: '',
        max_score: '',
        updated_at: '',
      },
      gitHubModel: {
        github_setting_id: '',
        code_data_source_id: '',
        name: '',
        type: '',
        base_url: '',
        type_text: '',
        target_resource: '',
        github_user: '',
        personal_access_token: '',
        updated_at: '',
        gitleaksSetting: {
          repository_pattern: '',
          scan_public: '',
          scan_internal: '',
          scan_private: '',
          status: '',
          status_detail: '',
          scan_at: '',
          updated_at: '',
        },
        dependencySetting: {
          repository_pattern: '',
          status: '',
          status_detail: '',
          scan_at: '',
          updated_at: '',
        },
        codeScanSetting: {
          repository_pattern: '',
          scan_public: '',
          scan_internal: '',
          scan_private: '',
          status: '',
          status_detail: '',
          scan_at: '',
          updated_at: '',
        },
        isEnabledGitleaks: false,
        isEnabledDependency: false,
        isEnabledCodeScan: false,
        isDeleteGitleaks: false,
        isDeleteDependency: false,
        isDeleteCodeScan: false,
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['github_setting_id'] },
        actions: [
          { text: 'View Item', icon: 'mdi-eye', click: this.handleViewItem },
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Scan',
            icon: 'mdi-magnify-scan',
            click: this.handleScan,
          },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteGitHubSetting,
          },
        ],
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      deleteDialog: false,
      deactivateDialog: false,
      deleteTarget: '',
      editDialog: false,
      editGitleaksDialog: false,
      editDependencyDialog: false,
      editCodeScanDialog: false,
      settingDialog: false,
    }
  },
  created() {
    this.$setInterval(async () => {
      await this.listGitHubSetting()
    }, 3000)
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
          sortable: true,
          key: 'github_setting_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Type"]'),
          align: 'start',
          sortable: true,
          key: 'type_text',
        },
        {
          title: this.$i18n.t('item["Target"]'),
          align: 'start',
          sortable: true,
          key: 'target_resource',
        },
        {
          title: this.$i18n.t('item["Gitleaks Status"]'),
          align: 'start',
          sortable: true,
          key: 'status_gitleaks',
        },
        {
          title: this.$i18n.t('item["Dependency Status"]'),
          align: 'start',
          sortable: true,
          key: 'status_dependency',
        },
        {
          title: this.$i18n.t('item["CodeScan Status"]'),
          align: 'start',
          sortable: true,
          key: 'status_code_scan',
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
  async mounted() {
    this.loading = true
    await this.getDataSource()
    await this.listGitHubSetting()
    this.loading = false
  },
  methods: {
    async getDataSource() {
      const datasources = await this.listCodeDataSourceAPI().catch((err) => {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if (!datasources) {
        this.clearList()
        return
      }
      datasources.forEach(async (datasource) => {
        switch (datasource.code_data_source_id) {
          case this.gitleaks_datasource_id:
            this.gitleaksDataSourceModel = datasource
            break
          case this.dependency_datasource_id:
            this.dependencyDataSourceModel = datasource
            break
          case this.code_scan_datasource_id:
            this.codeScanDataSourceModel = datasource
            break
          default:
            break
        }
      })
    },
    async listGitHubSetting() {
      const github_setting = await this.listGitHubSettingAPI().catch((err) => {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if (!github_setting) {
        this.clearList()
        return
      }
      let items = []
      github_setting.forEach(async (github_setting) => {
        const item = {
          github_setting_id: github_setting.github_setting_id,
          name: github_setting.name,
          type: github_setting.type,
          base_url: github_setting.base_url,
          type_text: this.getGitHubTypeText(github_setting.type),
          target_resource: github_setting.target_resource,
          github_user: github_setting.github_user,
          personal_access_token: github_setting.personal_access_token,
          updated_at: github_setting.updated_at,
        }
        if (github_setting.gitleaks_setting) {
          item.isEnabledGitleaks = true
          item.gitleaksSetting = {
            github_setting_id:
              github_setting.gitleaks_setting.github_setting_id,
            code_data_source_id:
              github_setting.gitleaks_setting.code_data_source_id,
            repository_pattern:
              github_setting.gitleaks_setting.repository_pattern,
            scan_public: github_setting.gitleaks_setting.scan_public,
            scan_internal: github_setting.gitleaks_setting.scan_internal,
            scan_private: github_setting.gitleaks_setting.scan_private,
            status: github_setting.gitleaks_setting.status,
            status_detail: github_setting.gitleaks_setting.status_detail,
            scan_at: github_setting.gitleaks_setting.scan_at,
            updated_at: github_setting.gitleaks_setting.updated_at,
          }
        }
        if (github_setting.dependency_setting) {
          item.isEnabledDependency = true
          item.dependencySetting = {
            github_setting_id:
              github_setting.dependency_setting.github_setting_id,
            code_data_source_id:
              github_setting.dependency_setting.code_data_source_id,
            repository_pattern:
              github_setting.dependency_setting.repository_pattern,
            status: github_setting.dependency_setting.status,
            status_detail: github_setting.dependency_setting.status_detail,
            scan_at: github_setting.dependency_setting.scan_at,
            updated_at: github_setting.dependency_setting.updated_at,
          }
        }
        if (github_setting.code_scan_setting) {
          item.isEnabledCodeScan = true
          item.codeScanSetting = {
            github_setting_id:
              github_setting.code_scan_setting.github_setting_id,
            code_data_source_id:
              github_setting.code_scan_setting.code_data_source_id,
            repository_pattern:
              github_setting.code_scan_setting.repository_pattern,
            scan_public: github_setting.code_scan_setting.scan_public,
            scan_internal: github_setting.code_scan_setting.scan_internal,
            scan_private: github_setting.code_scan_setting.scan_private,
            status: github_setting.code_scan_setting.status,
            status_detail: github_setting.code_scan_setting.status_detail,
            scan_at: github_setting.code_scan_setting.scan_at,
            updated_at: github_setting.code_scan_setting.updated_at,
          }
        }

        items.push(item)
      })
      this.table.items = items
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteGitHubSetting() {
      await this.deleteGitHubSettingAPI(
        this.gitHubModel.github_setting_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Deleted.')
    },
    getStatus(setting) {
      if (!setting) {
        return 0 // datasource is not configured
      }
      return setting.status
    },
    getStatusDetail(setting) {
      if (!setting) {
        return 0 // datasource is not configured
      }
      return setting.status_detail
    },
    getScanAt(setting) {
      if (!setting || !setting.scan_at) {
        return 0 // datasource is not configured
      }
      return setting.scan_at
    },
    getGitHubTypeText(typeCode) {
      switch (typeCode) {
        case 1:
          return 'Organization'
        case 2:
          return 'User'
        default:
          return 'Unknown' // Unknown
      }
    },
    // Handler
    async handleList() {
      this.loading = true
      this.finishInfo('Reflesh list')
    },
    handleRowClick(event, settings) {
      this.handleViewItem(settings.item)
    },
    handleViewItem(item) {
      this.assignDataModel(item.value)
      this.isReadOnlyForm = true
      this.settingDialog = true
    },
    handleNewGitHubSetting() {
      this.gitHubModel = {}
      this.newGitleaksSetting()
      this.newDependencySetting()
      this.newCodeScanSetting()
      this.isReadOnlyForm = false
      this.settingDialog = true
    },
    newGitleaksSetting() {
      this.gitHubModel.gitleaksSetting = {
        scan_public: true,
        scan_internal: true,
        scan_private: false,
      }
      this.gitHubModel.isEnabledGitleaks = true
    },
    newDependencySetting() {
      this.gitHubModel.dependencySetting = {}
      this.gitHubModel.isEnabledDependency = true
    },
    newCodeScanSetting() {
      this.gitHubModel.codeScanSetting = {
        scan_public: true,
        scan_internal: true,
        scan_private: false,
      }
      this.gitHubModel.isEnabledCodeScan = true
    },
    handleEditItem(item) {
      this.assignDataModel(item.value)
      this.isReadOnlyForm = false
      this.settingDialog = true
    },
    handleDeleteGitHubSetting(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true
    },
    async handleDeleteGitHubSettingSubmit() {
      this.loading = true
      await this.deleteGitHubSetting()
    },
    async handleScan(item) {
      if (item && item.value && item.value.github_setting_id) {
        this.assignDataModel(item.value)
      }
      this.loading = true
      if (this.gitHubModel.isEnabledGitleaks) {
        await this.invokeScanGitleaksAPI(item.value.github_setting_id).catch(
          (err) => {
            this.finishError(err.response.data)
            return Promise.reject(err)
          }
        )
      }
      if (this.gitHubModel.isEnabledDependency) {
        await this.invokeScanDependencyAPI(item.value.github_setting_id).catch(
          (err) => {
            this.finishError(err.response.data)
            return
          }
        )
      }
      if (this.gitHubModel.isEnabledCodeScan) {
        await this.invokeScanCodeScanAPI(item.value.github_setting_id).catch(
          (err) => {
            this.finishError(err.response.data)
            return Promise.reject(err)
          }
        )
      }

      this.finishSuccess('Success: Invoke scan for Data Source.')
    },
    assignDataModel(item) {
      this.gitHubModel = {}
      this.gitHubModel = Object.assign(this.gitHubModel, item)
      if (item.gitleaksSetting) {
        this.gitHubModel.gitleaksSetting = Object.assign(
          this.gitHubModel.gitleaksSetting,
          item.gitleaksSetting
        )
      } else {
        this.gitHubModel.gitleaksSetting = {}
      }
      if (item.dependencySetting) {
        this.gitHubModel.dependencySetting = Object.assign(
          this.gitHubModel.dependencySetting,
          item.dependencySetting
        )
      } else {
        this.gitHubModel.dependencySetting = {}
      }
      if (item.codeScanSetting) {
        this.gitHubModel.codeScanSetting = Object.assign(
          this.gitHubModel.codeScanSetting,
          item.codeScanSetting
        )
      } else {
        this.gitHubModel.codeScanSetting = {}
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
      this.loading = false
      this.editDialog = false
      this.deleteDialog = false
      if (reflesh) {
        this.listGitHubSetting()
      }
    },
    handleEditFinish(msg, err) {
      if (err) {
        this.finishError(err)
        return
      }
      this.finishSuccess(msg)
    },
    closeDialogEdit() {
      this.settingDialog = false
    },
  },
}
</script>
