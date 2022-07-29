<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="black">mdi-github</v-icon>
              {{ $t(`submenu['Gitleaks']`) }}
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
                    <v-icon color="black" large>mdi-github</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.type_text`]="{ item }">
                  <v-chip dark label outlined color="blue darken-2">{{
                    item.type_text
                  }}</v-chip>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <scan-status :status="getStatus(item.gitleaksSetting)">
                  </scan-status>
                </template>
                <template v-slot:[`item.scan_at`]="{ item }">
                  <v-chip v-if="getScanAt(item.gitleaksSetting)">{{
                    getScanAt(item.gitleaksSetting) | formatTime
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
          <v-icon large color="black">mdi-github</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['Gitleaks']`) }}
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
                    {{ codeDataSourceModel.code_data_source_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Data Source']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ codeDataSourceModel.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Description']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ codeDataSourceModel.description }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="3" v-if="gitHubModel.github_setting_id">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['GitHub Setting ID']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ gitHubModel.github_setting_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="gitHubModel.status">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    <v-list-item-subtitle>
                      {{ $t(`item['Status']`) }}
                    </v-list-item-subtitle>
                    <v-chip
                      dark
                      :color="getDataSourceStatusColor(gitHubModel.status)"
                    >
                      {{ getDataSourceStatusText(gitHubModel.status) }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="gitHubModel.scan_at">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['ScanAt']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip color="grey lighten-3">
                      {{ gitHubModel.scan_at | formatTime }}
                    </v-chip>
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
                      {{ codeDataSourceModel.max_score }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" v-if="gitHubModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">
                    {{ $t(`item['Status Detail']`) }}
                  </span>
                </v-card-title>
                <v-card-text>
                  {{ gitHubModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-text>
          <v-form v-model="gitHubForm.valid" ref="form">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  outlined
                  v-model="gitHubModel.name"
                  :counter="64"
                  :rules="gitHubForm.name.validator"
                  :label="$t(`item['` + gitHubForm.name.label + `']`) + ' *'"
                  :placeholder="gitHubForm.name.placeholder"
                  :disabled="gitHubForm.readOnly || !gitHubForm.isNew"
                  :filled="gitHubForm.readOnly || !gitHubForm.isNew"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-combobox
                  required
                  clearable
                  outlined
                  v-model="gitHubModel.type_text"
                  :rules="gitHubForm.type.validator"
                  :label="$t(`item['` + gitHubForm.type.label + `']`) + ' *'"
                  :placeholder="gitHubForm.type.placeholder"
                  :items="gitHubForm.type.list"
                  :disabled="gitHubForm.readOnly"
                  :filled="gitHubForm.readOnly"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  outlined
                  v-model="gitHubModel.base_url"
                  :counter="128"
                  :rules="gitHubForm.base_url.validator"
                  :label="$t(`item['` + gitHubForm.base_url.label + `']`)"
                  :placeholder="gitHubForm.base_url.placeholder"
                  :disabled="gitHubForm.readOnly"
                  :filled="gitHubForm.readOnly"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  required
                  outlined
                  v-model="gitHubModel.target_resource"
                  :counter="128"
                  :rules="gitHubForm.target_resource.validator"
                  :label="
                    $t(`item['` + gitHubForm.target_resource.label + `']`) +
                    ' *'
                  "
                  :placeholder="gitHubForm.target_resource.placeholder"
                  :disabled="gitHubForm.readOnly"
                  :filled="gitHubForm.readOnly"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  outlined
                  v-model="gitHubModel.gitleaksSetting.repository_pattern"
                  :counter="128"
                  :rules="gitHubForm.repository_pattern.validator"
                  :label="
                    $t(`item['` + gitHubForm.repository_pattern.label + `']`)
                  "
                  :placeholder="gitHubForm.repository_pattern.placeholder"
                  :disabled="gitHubForm.readOnly"
                  :filled="gitHubForm.readOnly"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  outlined
                  v-model="gitHubModel.github_user"
                  :counter="64"
                  :rules="gitHubForm.github_user.validator"
                  :label="$t(`item['` + gitHubForm.github_user.label + `']`)"
                  :placeholder="gitHubForm.github_user.placeholder"
                  :disabled="gitHubForm.readOnly"
                  :filled="gitHubForm.readOnly"
                ></v-text-field>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  outlined
                  v-model="gitHubModel.personal_access_token"
                  :counter="255"
                  :rules="gitHubForm.personal_access_token.validator"
                  :label="
                    $t(`item['` + gitHubForm.personal_access_token.label + `']`)
                  "
                  :placeholder="gitHubForm.personal_access_token.placeholder"
                  :disabled="gitHubForm.readOnly"
                  :filled="gitHubForm.readOnly"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="3">
                <v-checkbox
                  v-model="gitHubModel.gitleaksSetting.scan_public"
                  :label="$t(`item['` + gitHubForm.scan_public.label + `']`)"
                  :placeholder="gitHubForm.scan_public.placeholder"
                  :disabled="gitHubForm.readOnly"
                  :filled="gitHubForm.readOnly"
                ></v-checkbox>
              </v-col>
              <v-col cols="3">
                <v-checkbox
                  v-model="gitHubModel.gitleaksSetting.scan_internal"
                  :label="$t(`item['` + gitHubForm.scan_internal.label + `']`)"
                  :placeholder="gitHubForm.scan_internal.placeholder"
                  :disabled="gitHubForm.readOnly"
                  :filled="gitHubForm.readOnly"
                ></v-checkbox>
              </v-col>
              <v-col cols="3">
                <v-checkbox
                  v-model="gitHubModel.gitleaksSetting.scan_private"
                  :label="$t(`item['` + gitHubForm.scan_private.label + `']`)"
                  :placeholder="gitHubForm.scan_private.placeholder"
                  :disabled="gitHubForm.readOnly"
                  :filled="gitHubForm.readOnly"
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-btn
                text
                outlined
                color="blue darken-1"
                v-if="gitHubForm.readOnly"
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
                v-if="!gitHubForm.readOnly"
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
          <span class="mx-4" v-if="isDeleteGitHubSetting">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
          <span class="mx-4" v-else>
            {{ $t(`message['Do you really want to detach this?']`) }}
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
            <v-list-item-content v-if="isDeleteGitHubSetting">
              <v-list-item-title v-text="gitHubModel.name"></v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Name']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-content v-else>
              <v-list-item-title>Gitleaks</v-list-item-title>
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
            @click="handleDeleteGitHubSettingSubmit"
            v-if="isDeleteGitHubSetting"
          >
            {{ $t(`btn['DELETE']`) }}
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            outlined
            :loading="loading"
            @click="handleDeleteGitleaksSettingSubmit"
            v-else
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
import project from '@/mixin/api/project'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
import ProjectTag from '@/component/widget/tag/ProjectTag'
import ScanStatus from '@/component/widget/datasource/Status'
export default {
  mixins: [mixin, project],
  components: {
    BottomSnackBar,
    ProjectTag,
    ScanStatus,
  },
  data() {
    return {
      loading: false,
      gitHubForm: {
        readOnly: false,
        isNew: false,
        valid: false,
        name: {
          label: 'Name',
          placeholder: 'Gitleaks setting name',
          validator: [
            (v) => !!v || 'Name is required',
            (v) =>
              !v || v.length <= 64 || 'Name must be less than 64 characters',
          ],
        },
        type: {
          label: 'Type',
          placeholder: '-',
          list: ['Organization', 'User'],
          validator: [
            (v) => !!v || 'Type is required',
            (v) =>
              !v || v === 'Organization' || v === 'User' || 'Type is invalid',
          ],
        },
        base_url: {
          label: 'Base URL',
          placeholder: '[Optional] https://hostname/api/v3/',
          validator: [
            (v) =>
              !v ||
              v.length <= 128 ||
              'TargetResource must be less than 128 characters',
          ],
        },
        target_resource: {
          label: 'TargetResource',
          placeholder: 'OrganizationName or UserName',
          validator: [
            (v) => !!v || 'TargetResource is required',
            (v) =>
              !v ||
              v.length <= 128 ||
              'TargetResource must be less than 128 characters',
          ],
        },
        repository_pattern: {
          label: 'RepositoryPattern',
          placeholder: '-',
          validator: [
            (v) =>
              !v ||
              v.length <= 128 ||
              'RepositoryPattern must be less than 128 characters',
          ],
        },
        github_user: {
          label: 'GitHubUser',
          placeholder: '-',
          validator: [
            (v) =>
              !v ||
              v.length <= 64 ||
              'GitHubUser must be less than 64 characters',
          ],
        },
        personal_access_token: {
          label: 'PersonalAccessToken',
          placeholder: '-',
          validator: [
            (v) =>
              !v ||
              v.length <= 255 ||
              'PersonalAccessToken must be less than 255 characters',
          ],
        },
        scan_public: {
          label: 'Scan Public Repository',
          placeholder: '-',
          validator: [],
        },
        scan_internal: {
          label: 'Scan Internal Repository',
          placeholder: '-',
          validator: [],
        },
        scan_private: {
          label: 'Scan Private Repository',
          placeholder: '-',
          validator: [],
        },
      },
      codeDataSourceModel: {
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
        isEnabledGitleaks: false,
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['github_setting_id'] },
        actions: [
          { text: 'View Item', icon: 'mdi-eye', click: this.handleViewItem },
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteGitHubSetting,
          },
          {
            text: 'Deactivate Gitleaks',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteGitleaksSetting,
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
      isDeleteGitHubSetting: false,
      deleteDialog: false,
      editDialog: false,
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
        // {
        //   text: this.$i18n.t('item["Base URL"]'),
        //   align: "start",
        //   sortable: true,
        //   value: "base_url",
        // },
        {
          text: this.$i18n.t('item["Target"]'),
          align: 'start',
          sortable: true,
          value: 'target_resource',
        },
        {
          text: this.$i18n.t('item["Repository"]'),
          align: 'start',
          sortable: true,
          value: 'repository_pattern',
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
    await this.getGitleaksDataSource()
    await this.listGitHubSetting()
  },
  methods: {
    async getGitleaksDataSource() {
      const res = await this.$axios
        .get(
          '/code/list-datasource/' +
            '?code_data_source_id=' +
            this.gitleaks_datasource_id
        )
        .catch((err) => {
          this.clearList()
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.code_data_source) {
        this.clearList()
        return false
      }
      this.codeDataSourceModel = res.data.data.code_data_source[0]
      this.loading = false
    },
    async listGitHubSetting() {
      const res = await this.$axios
        .get(
          '/code/list-github-setting/' +
            '?code_data_source_id=' +
            this.gitleaks_datasource_id +
            '&project_id=' +
            this.$store.state.project.project_id
        )
        .catch((err) => {
          this.clearList()
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.github_setting) {
        this.clearList()
        return false
      }
      let items = []
      res.data.data.github_setting.forEach(async (github_setting) => {
        const item = {
          github_setting_id: github_setting.github_setting_id,
          name: github_setting.name,
          type: github_setting.type,
          base_url: github_setting.base_url,
          type_text: this.getGitleaksTypeText(github_setting.type),
          target_resource: github_setting.target_resource,
          github_user: github_setting.github_user,
          personal_access_token: github_setting.personal_access_token,
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
        items.push(item)
      })
      this.table.items = items
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteGitHubSetting() {
      const param = {
        project_id: this.$store.state.project.project_id,
        github_setting_id: this.gitHubModel.github_setting_id,
      }
      await this.$axios
        .post('/code/delete-github-setting/', param)
        .catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      this.finishSuccess('Success: Deleted.')
    },
    async deleteGitleaksSetting() {
      const param = {
        project_id: this.$store.state.project.project_id,
        github_setting_id: this.gitHubModel.github_setting_id,
      }
      await this.$axios
        .post('/code/delete-gitleaks-setting/', param)
        .catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      this.finishSuccess('Success: Deleted.')
    },
    async putItem() {
      const paramGitHubSetting = {
        project_id: this.$store.state.project.project_id,
        github_setting: {
          github_setting_id: this.gitHubModel.github_setting_id,
          name: this.gitHubModel.name,
          project_id: this.$store.state.project.project_id,
          type: this.getGitleaksTypeCode(this.gitHubModel.type_text),
          base_url: this.gitHubModel.base_url,
          target_resource: this.gitHubModel.target_resource,
          github_user: this.gitHubModel.github_user,
          personal_access_token: this.gitHubModel.personal_access_token,
        },
      }
      const res = await this.$axios
        .post('/code/put-github-setting/', paramGitHubSetting)
        .catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.github_setting) {
        this.finishError('failed to put github setting.')
      }
      const gitHubSettingID = res.data.data.github_setting.github_setting_id
      let scan_at = 0
      if (this.gitHubModel.gitleaksSetting.scan_at) {
        scan_at = this.gitHubModel.gitleaksSetting.scan_at
      }
      const paramGitleaksSetting = {
        project_id: this.$store.state.project.project_id,
        gitleaks_setting: {
          github_setting_id: gitHubSettingID,
          code_data_source_id: this.gitleaks_datasource_id,
          project_id: this.$store.state.project.project_id,
          repository_pattern:
            this.gitHubModel.gitleaksSetting.repository_pattern,
          scan_public: Boolean(this.gitHubModel.gitleaksSetting.scan_public),
          scan_internal: Boolean(
            this.gitHubModel.gitleaksSetting.scan_internal
          ),
          scan_private: Boolean(this.gitHubModel.gitleaksSetting.scan_private),
          status: 2, // CONFIGURED
          status_detail:
            'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      await this.$axios
        .post('/code/put-gitleaks-setting/', paramGitleaksSetting)
        .catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      this.finishSuccess('Success: Updated.')
    },
    getStatus(setting) {
      if (!setting) {
        return 0 // datasource is not configured
      }
      return setting.status
    },
    getScanAt(setting) {
      if (!setting || !setting.scan_at) {
        return 0 // datasource is not configured
      }
      return setting.scan_at
    },
    getGitleaksTypeCode(typeText) {
      switch (typeText) {
        case 'Enterprise':
          return 1
        case 'Organization':
          return 2
        case 'User':
          return 3
        default:
          return 0 // Unknown
      }
    },
    getGitleaksTypeText(typeCode) {
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
    async scanDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        github_setting_id: this.gitHubModel.github_setting_id,
      }
      await this.$axios
        .post('/code/invoke-scan-gitleaks/', param)
        .catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      this.finishSuccess('Success: Invoke scan for Data Source.')
    },

    // Handler
    async handleList() {
      this.loading = true
      await this.listGitHubSetting()
      this.finishInfo('Reflesh list')
    },
    handleRowClick(item) {
      this.handleViewItem(item)
    },
    handleViewItem(item) {
      this.assignDataModel(item)
      this.isReadOnlyForm = true
      this.editDialog = true
    },
    handleNewItem() {
      this.gitHubModel = {}
      this.gitHubModel.gitleaksSetting = {
        scan_public: true,
        scan_internal: true,
        scan_private: false,
      }
      this.gitHubForm.isNew = true
      this.gitHubForm.ReadOnly = false
      this.editDialog = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.gitHubForm.isNew = false
      this.gitHubForm.ReadOnly = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      await this.putItem()
      await this.tagProjectAPI(
        'github:' + this.gitHubModel.target_resource,
        'black'
      )
    },
    handleDeleteGitHubSetting(item) {
      this.assignDataModel(item)
      this.isDeleteGitHubSetting = true
      this.deleteDialog = true
    },
    async handleDeleteGitHubSettingSubmit() {
      this.loading = true
      await this.untagProjectAPI('github:' + this.gitHubModel.target_resource)
      await this.deleteGitHubSetting()
    },
    handleDeleteGitleaksSetting(item) {
      this.assignDataModel(item)
      this.isDeleteGitHubSetting = false
      this.deleteDialog = true
    },
    async handleDeleteGitleaksSettingSubmit() {
      this.loading = true
      await this.deleteGitleaksSetting()
    },
    handleScan(item) {
      this.loading = true
      if (!item.isEnabledGitleaks) {
        this.finishError('gitleaks setting is not configured.')
        return
      }
      if (item && item.github_setting_id) {
        this.assignDataModel(item)
      }
      this.scanDataSource()
    },

    assignDataModel(item) {
      this.gitHubModel = {}
      this.gitHubModel = Object.assign(this.gitHubModel, item)
      if (this.gitHubModel.gitleaksSetting) {
        this.gitHubModel.gitleaksSetting = Object.assign(
          this.gitHubModel.gitleaksSetting,
          item.gitleaksSetting
        )
      } else {
        this.gitHubModel.gitleaksSetting = {}
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
  },
}
</script>
