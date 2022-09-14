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
            :projectTagModel="projectTagModel"
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
            @click="handleNewGitHubSetting"
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
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3">
                    <v-icon color="black" large>mdi-github</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.type_text`]="{ item }">
                  <v-chip dark label outlined color="blue darken-2">{{
                    item.type_text
                  }}</v-chip>
                </template>
                <template v-slot:[`item.status_gitleaks`]="{ item }">
                  <scan-status
                    :status="getStatus(item.gitleaksSetting)"
                    v-if="getStatus(item.gitleaksSetting)"
                  >
                  </scan-status>
                  <v-chip dark color="grey" v-else> Disabled </v-chip>
                </template>
                <template v-slot:[`item.status_dependency`]="{ item }">
                  <scan-status
                    :status="getStatus(item.dependencySetting)"
                    v-if="getStatus(item.gitleaksSetting)"
                  >
                  </scan-status>
                  <v-chip dark color="grey" v-else> Disabled </v-chip>
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
                v-text="gitHubModel.github_setting_id"
              ></v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['GitHub Setting ID']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="gitHubModel.name"></v-list-item-title>
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
            @click="handleDeleteGitHubSettingSubmit"
          >
            {{ $t(`btn['DELETE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <new-setting-dialog
      v-if="settingDialog"
      :gitHubModel="gitHubModel"
      :settingDialog="settingDialog"
      :isReadOnly="isReadOnlyForm"
      :gitleaksDataSourceModel="gitleaksDataSourceModel"
      :dependencyDataSourceModel="dependencyDataSourceModel"
      @closeDialog="closeDialogEdit"
      v-on:edit-notify="handleEditFinish"
    ></new-setting-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>
<script>
import mixin from '@/mixin'
import project from '@/mixin/api/project'
import code from '@/mixin/api/code'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
import ProjectTag from '@/component/widget/tag/ProjectTag'
import ScanStatus from '@/component/widget/datasource/Status'
import NewSettingDialog from './NewSettingDialog.vue'
export default {
  mixins: [mixin, project, code],
  components: {
    BottomSnackBar,
    ProjectTag,
    ScanStatus,
    NewSettingDialog,
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
          status: '',
          status_detail: '',
          scan_at: '',
          updated_at: '',
        },
        isEnabledGitleaks: false,
        isEnabledDependency: false,
        isDeleteGitleaks: false,
        isDeleteDependency: false,
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
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      deleteDialog: false,
      deactivateDialog: false,
      deleteTarget: '',
      editDialog: false,
      editGitleaksDialog: false,
      editDependencyDialog: false,
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
          value: 'github_setting_id',
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          value: 'name',
        },
        {
          text: this.$i18n.t('item["Type"]'),
          align: 'start',
          sortable: true,
          value: 'type_text',
        },
        {
          text: this.$i18n.t('item["Target"]'),
          align: 'start',
          sortable: true,
          value: 'target_resource',
        },
        {
          text: this.$i18n.t('item["Gitleaks Status"]'),
          align: 'start',
          sortable: true,
          value: 'status_gitleaks',
        },
        {
          text: this.$i18n.t('item["Dependency Status"]'),
          align: 'start',
          sortable: true,
          value: 'status_dependency',
        },
        {
          text: this.$i18n.t('item["Updated"]'),
          align: 'start',
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
    this.loading = true
    await this.getDataSource()
    await this.listGitHubSetting()
    this.loading = false
  },
  methods: {
    async getDataSource() {
      const datasources = await this.getGitleaksDataSourceAPI().catch((err) => {
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
            status: github_setting.dependency_setting.status,
            status_detail: github_setting.dependency_setting.status_detail,
            scan_at: github_setting.dependency_setting.scan_at,
            updated_at: github_setting.dependency_setting.updated_at,
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
          return 'Enterprise'
        case 2:
          return 'Organization'
        case 3:
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
    handleRowClick(item) {
      this.handleViewItem(item)
    },
    handleViewItem(item) {
      this.assignDataModel(item)
      this.isReadOnlyForm = true
      this.settingDialog = true
    },
    handleNewGitHubSetting() {
      this.gitHubModel = {}
      this.newGitleaksSetting()
      this.newDependencySetting()
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
    handleEditItem(item) {
      this.assignDataModel(item)
      this.isReadOnlyForm = false
      this.settingDialog = true
    },
    handleDeleteGitHubSetting(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    async handleDeleteGitHubSettingSubmit() {
      this.loading = true
      await this.deleteGitHubSetting()
    },
    async handleScan(item) {
      if (item && item.github_setting_id) {
        this.assignDataModel(item)
      }
      this.loading = true
      if (this.gitHubModel.isEnabledGitleaks) {
        await this.invokeScanGitleaksAPI(item.github_setting_id).catch(
          (err) => {
            this.finishError(err.response.data)
            return Promise.reject(err)
          }
        )
      }
      if (this.gitHubModel.isEnabledDependency) {
        await this.invokeScanDependencyAPI(item.github_setting_id).catch(
          (err) => {
            this.finishError(err.response.data)
            return
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
