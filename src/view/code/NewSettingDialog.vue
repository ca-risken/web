<template>
  <v-container>
    <v-dialog v-model="showDialog" max-width="70%">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          <v-icon large color="black">mdi-github</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['GitHub']`) }}
          </span>
        </v-card-title>
        <v-stepper v-model="e6" non-linear vertical>
          <v-stepper-step :complete="e6 > 1" step="1" editable>
            {{ $t(`item['GitHub Setting']`) }}
          </v-stepper-step>
          <v-stepper-content step="1">
            <v-card tile class="mb-4" outlined>
              <v-card-text class="pb-0">
                <v-form v-model="gitHubForm.valid" ref="formGitHub">
                  <v-row>
                    <v-col cols="2" v-if="gitHubSetting.github_setting_id">
                      <v-text-field
                        dense
                        outlined
                        v-model="gitHubSetting.github_setting_id"
                        :label="
                          $t(
                            `item['` + gitHubForm.github_setting_id.label + `']`
                          )
                        "
                        readonly
                        filled
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3">
                      <v-text-field
                        dense
                        outlined
                        v-model="gitHubSetting.name"
                        :counter="64"
                        :rules="gitHubForm.name.validator"
                        :label="
                          $t(`item['` + gitHubForm.name.label + `']`) + ' *'
                        "
                        :placeholder="gitHubForm.name.placeholder"
                        :disabled="
                          isReadOnly || gitHubSetting.github_setting_id
                        "
                        :filled="isReadOnly || gitHubSetting.github_setting_id"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="5">
                      <v-text-field
                        dense
                        outlined
                        v-model="gitHubSetting.base_url"
                        :counter="128"
                        :rules="gitHubForm.base_url.validator"
                        :label="$t(`item['` + gitHubForm.base_url.label + `']`)"
                        :placeholder="gitHubForm.base_url.placeholder"
                        :disabled="isReadOnly"
                        :filled="isReadOnly"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="2">
                      <v-combobox
                        dense
                        required
                        clearable
                        outlined
                        v-model="gitHubSetting.type_text"
                        :rules="gitHubForm.type.validator"
                        :label="
                          $t(`item['` + gitHubForm.type.label + `']`) + ' *'
                        "
                        :placeholder="gitHubForm.type.placeholder"
                        :items="gitHubForm.type.list"
                        :disabled="isReadOnly"
                        :filled="isReadOnly"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        dense
                        required
                        outlined
                        v-model="gitHubSetting.target_resource"
                        :counter="128"
                        :rules="gitHubForm.target_resource.validator"
                        :label="
                          $t(
                            `item['` + gitHubForm.target_resource.label + `']`
                          ) + ' *'
                        "
                        :placeholder="gitHubForm.target_resource.placeholder"
                        :disabled="isReadOnly"
                        :filled="isReadOnly"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="3">
                      <v-text-field
                        dense
                        outlined
                        v-model="gitHubSetting.github_user"
                        :counter="64"
                        :rules="gitHubForm.github_user.validator"
                        :label="
                          $t(`item['` + gitHubForm.github_user.label + `']`)
                        "
                        :placeholder="gitHubForm.github_user.placeholder"
                        :disabled="isReadOnly"
                        :filled="isReadOnly"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="5">
                      <v-text-field
                        dense
                        outlined
                        v-model="gitHubSetting.personal_access_token"
                        :counter="255"
                        :rules="gitHubForm.personal_access_token.validator"
                        :label="
                          $t(
                            `item['` +
                              gitHubForm.personal_access_token.label +
                              `']`
                          )
                        "
                        :placeholder="
                          gitHubForm.personal_access_token.placeholder
                        "
                        :disabled="isReadOnly"
                        :filled="isReadOnly"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
            <v-row>
              <v-col class="text-right">
                <v-btn
                  outlined
                  color="blue darken-1"
                  @click="handleGitHubEditSubmit"
                  v-if="!isReadOnly"
                  :loading="loading"
                >
                  {{ $t(`btn['EDIT']`) }}
                </v-btn>
                <v-btn
                  outlined
                  color="grey darken-1"
                  class="ml-2"
                  @click="$emit('closeDialog')"
                  :loading="loading"
                >
                  {{ $t(`btn['CANCEL']`) }}
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-step :complete="e6 > 2" step="2" editable>
            {{ gitleaksDataSourceModel.name }}
            <small>{{ gitleaksDataSourceModel.description }} </small>
          </v-stepper-step>

          <v-stepper-content step="2">
            <v-card outlined class="mb-4">
              <v-card-text class="py-0">
                <v-row>
                  <v-list-item two-line>
                    <v-col cols="3">
                      <v-list-item-content>
                        <v-list-item-subtitle>
                          {{ $t(`item['Data Source ID']`) }}
                        </v-list-item-subtitle>
                        <v-list-item-title class="headline">
                          {{ gitleaksDataSourceModel.code_data_source_id }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-col>
                    <v-col cols="3">
                      <v-list-item-content>
                        <v-list-item-title class="headline">
                          <v-list-item-subtitle>
                            {{ $t(`item['MAX Score']`) }}
                          </v-list-item-subtitle>
                          <v-chip outlined>
                            {{ gitleaksDataSourceModel.max_score }}
                          </v-chip>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-col>
                    <v-col cols="3">
                      <v-list-item-content>
                        <v-list-item-title class="headline">
                          <v-list-item-subtitle>
                            {{ $t(`item['Status']`) }}
                          </v-list-item-subtitle>
                          <v-chip
                            dark
                            :color="
                              getDataSourceStatusColor(gitleaksSetting.status)
                            "
                            v-if="getStatus(gitleaksSetting)"
                          >
                            {{
                              getDataSourceStatusText(gitleaksSetting.status)
                            }}
                          </v-chip>
                          <v-chip
                            dark
                            :color="
                              getDataSourceStatusColor(gitleaksSetting.status)
                            "
                            v-else
                          >
                            Disabled
                          </v-chip>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-col>
                    <v-col cols="3" v-if="getStatus(gitleaksSetting)">
                      <v-list-item-content>
                        <v-list-item-title class="headline">
                          <v-list-item-subtitle>
                            {{ $t(`item['ScanAt']`) }}
                          </v-list-item-subtitle>
                          <v-chip
                            color="grey lighten-3"
                            v-if="gitleaksSetting.scan_at"
                          >
                            {{ gitleaksSetting.scan_at | formatTime }}
                          </v-chip>
                          <v-chip v-else>Not yet scan...</v-chip>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-col>
                  </v-list-item>
                </v-row>
                <v-row dense v-if="getStatusDetail(gitleaksSetting)">
                  <v-col>
                    <v-list-item two-line>
                      <v-list-item-content>
                        <v-list-item-subtitle>
                          {{ $t(`item['Status Detail']`) }}
                        </v-list-item-subtitle>
                        <v-list-item-title class="wrap-text">
                          {{ getStatusDetail(gitleaksSetting) }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col>
                    <v-switch
                      class="ml-2"
                      v-model="isEnabledGitleaks"
                      :label="$t(`action['Enable Gitleaks']`)"
                      color="info"
                      :disabled="isReadOnly"
                      :filled="isReadOnly"
                    ></v-switch>
                  </v-col>
                </v-row>
                <v-card outlined class="mb-4" v-if="isEnabledGitleaks">
                  <v-card-text class="pb-0">
                    <v-form v-model="gitleaksForm.valid" ref="formGitleaks">
                      <v-row>
                        <v-col cols="4" class="mb-0 pb-0">
                          <v-text-field
                            dense
                            outlined
                            v-model="gitleaksSetting.repository_pattern"
                            :counter="128"
                            :rules="gitleaksForm.repository_pattern.validator"
                            :label="
                              $t(
                                `item['` +
                                  gitleaksForm.repository_pattern.label +
                                  `']`
                              )
                            "
                            :placeholder="
                              gitleaksForm.repository_pattern.placeholder
                            "
                            :disabled="isReadOnly"
                            :filled="isReadOnly"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row class="my-0">
                        <v-col cols="3" class="py-0">
                          <v-switch
                            v-model="gitleaksSetting.scan_public"
                            :label="
                              $t(
                                `item['` + gitleaksForm.scan_public.label + `']`
                              )
                            "
                            color="info"
                            :disabled="isReadOnly"
                            :filled="isReadOnly"
                          ></v-switch>
                        </v-col>
                        <v-col cols="3" class="py-0">
                          <v-switch
                            v-model="gitleaksSetting.scan_internal"
                            :label="
                              $t(
                                `item['` +
                                  gitleaksForm.scan_internal.label +
                                  `']`
                              )
                            "
                            color="info"
                            :disabled="isReadOnly"
                            :filled="isReadOnly"
                          ></v-switch>
                        </v-col>
                        <v-col cols="3" class="py-0">
                          <v-switch
                            v-model="gitleaksSetting.scan_private"
                            :label="
                              $t(
                                `item['` +
                                  gitleaksForm.scan_private.label +
                                  `']`
                              )
                            "
                            color="info"
                            :disabled="isReadOnly"
                            :filled="isReadOnly"
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-card-text>
            </v-card>
            <v-row>
              <v-col class="text-right">
                <v-btn
                  class="mr-2"
                  outlined
                  color="blue darken-1"
                  @click="handleScanGitleaks(false)"
                  v-if="isReadOnly"
                  :disabled="!isEnabledGitleaks"
                  :loading="loading"
                >
                  <v-icon left>mdi-magnify-scan</v-icon>
                  {{ $t(`btn['SCAN']`) }}
                </v-btn>
                <v-btn
                  class="mr-2"
                  outlined
                  color="blue darken-1"
                  @click="handleScanGitleaks(true)"
                  v-if="isReadOnly"
                  :disabled="!isEnabledGitleaks"
                  :loading="loading"
                >
                  <v-icon left>mdi-magnify-scan</v-icon>
                  {{ $t(`btn['FULL SCAN']`) }}
                </v-btn>
                <v-btn
                  class="mr-2"
                  outlined
                  color="cyan darken-2"
                  v-if="isReadOnly"
                  :loading="loading"
                  link
                  :to="{
                    path: '/finding/finding/',
                    query: {
                      data_source: gitleaksDataSourceModel.name,
                    },
                  }"
                  risken-action-name="search-finding-by-datasource-from-gitleaks"
                >
                  <v-icon left>mdi-magnify</v-icon>
                  {{ $t(`btn['SHOW SCAN RESULT']`) }}
                </v-btn>

                <v-btn
                  outlined
                  color="blue darken-1"
                  @click="handleGitleaksEditSubmit"
                  :disabled="!gitHubSetting.github_setting_id"
                  :loading="loading"
                  v-else
                  >{{ $t(`btn['EDIT']`) }}
                </v-btn>
                <v-btn
                  class="ml-2"
                  outlined
                  color="grey darken-1"
                  @click="$emit('closeDialog')"
                  :loading="loading"
                >
                  {{ $t(`btn['CANCEL']`) }}
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>
          <v-stepper-step :complete="e6 > 3" step="3" editable>
            {{ dependencyDataSourceModel.name }}
            <small>{{ dependencyDataSourceModel.description }} </small>
          </v-stepper-step>
          <!-- dependency -->
          <v-stepper-content step="3">
            <v-card outlined class="mb-4">
              <v-card-text class="py-0">
                <v-row>
                  <v-col>
                    <v-row dense>
                      <v-list-item two-line>
                        <v-col cols="3">
                          <v-list-item-content>
                            <v-list-item-subtitle>
                              {{ $t(`item['Data Source ID']`) }}
                            </v-list-item-subtitle>
                            <v-list-item-title class="headline">
                              {{
                                dependencyDataSourceModel.code_data_source_id
                              }}
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-col>
                        <v-col cols="3">
                          <v-list-item-content>
                            <v-list-item-title class="headline">
                              <v-list-item-subtitle>
                                {{ $t(`item['MAX Score']`) }}
                              </v-list-item-subtitle>
                              <v-chip outlined>
                                {{ dependencyDataSourceModel.max_score }}
                              </v-chip>
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-col>
                        <v-col cols="3">
                          <v-list-item-content>
                            <v-list-item-title class="headline">
                              <v-list-item-subtitle>
                                {{ $t(`item['Status']`) }}
                              </v-list-item-subtitle>
                              <v-chip
                                dark
                                :color="
                                  getDataSourceStatusColor(
                                    dependencySetting.status
                                  )
                                "
                                v-if="getStatus(dependencySetting)"
                              >
                                {{
                                  getDataSourceStatusText(
                                    dependencySetting.status
                                  )
                                }}
                              </v-chip>
                              <v-chip
                                dark
                                :color="
                                  getDataSourceStatusColor(
                                    dependencySetting.status
                                  )
                                "
                                v-else
                              >
                                Disabled
                              </v-chip>
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-col>
                        <v-col cols="3" v-if="getStatus(dependencySetting)">
                          <v-list-item-content>
                            <v-list-item-title class="headline">
                              <v-list-item-subtitle>
                                {{ $t(`item['ScanAt']`) }}
                              </v-list-item-subtitle>
                              <v-chip
                                color="grey lighten-3"
                                v-if="dependencySetting.scan_at"
                              >
                                {{ dependencySetting.scan_at | formatTime }}
                              </v-chip>
                              <v-chip v-else>Not yet scan...</v-chip>
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-col>
                      </v-list-item>
                    </v-row>
                    <v-row dense v-if="getStatusDetail(dependencySetting)">
                      <v-col>
                        <v-list-item two-line>
                          <v-list-item-content>
                            <v-list-item-subtitle>
                              {{ $t(`item['Status Detail']`) }}
                            </v-list-item-subtitle>
                            <v-list-item-title class="wrap-text">
                              {{ getStatusDetail(dependencySetting) }}
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col>
                    <v-switch
                      class="ml-2"
                      v-model="isEnabledDependency"
                      :label="$t(`action['Enable Dependency']`)"
                      color="info"
                      :disabled="isReadOnly"
                      :filled="isReadOnly"
                    ></v-switch>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-row class="text-right mx-2">
              <v-col>
                <v-btn
                  class="mr-2"
                  outlined
                  color="blue darken-1"
                  @click="handleScanDependency"
                  v-if="isReadOnly"
                  :disabled="!isEnabledDependency"
                  :loading="loading"
                >
                  <v-icon left>mdi-magnify-scan</v-icon>
                  {{ $t(`btn['SCAN']`) }}
                </v-btn>
                <v-btn
                  class="mr-2"
                  outlined
                  color="cyan darken-2"
                  v-if="isReadOnly"
                  :loading="loading"
                  link
                  :to="{
                    path: '/finding/finding/',
                    query: {
                      data_source: dependencyDataSourceModel.name,
                      tag: '',
                    },
                  }"
                  risken-action-name="search-finding-by-datasource-from-dependency"
                >
                  <v-icon left>mdi-magnify</v-icon>
                  {{ $t(`btn['SHOW SCAN RESULT']`) }}
                </v-btn>
                <v-btn
                  outlined
                  color="blue darken-1"
                  @click="handleDependencyEditSubmit"
                  :disabled="!gitHubSetting.github_setting_id"
                  :loading="loading"
                  v-else
                  >{{ $t(`btn['EDIT']`) }}
                </v-btn>
                <v-btn
                  outlined
                  color="grey darken-1"
                  class="ml-2"
                  @click="$emit('closeDialog')"
                  :loading="loading"
                >
                  {{ $t(`btn['CANCEL']`) }}
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>
        </v-stepper>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style lang="scss">
.wrap-text {
  white-space: normal;
}
</style>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import project from '@/mixin/api/project'
import code from '@/mixin/api/code'
export default {
  mixins: [mixin, project, code],
  props: {
    isReadOnly: {
      type: Boolean,
      default: null,
    },
    gitHubModel: {
      type: Object,
      default: null,
    },
    gitleaksDataSourceModel: {
      type: Object,
      default: null,
    },
    dependencyDataSourceModel: {
      type: Object,
      default: null,
    },
    settingDialog: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    showDialog: {
      get() {
        return this.settingDialog
      },
      set() {
        this.$emit('closeDialog')
      },
    },
  },
  watch: {
    isEnabledGitleaks: function () {
      if (this.isEnabledGitleaks) {
        this.newGitleaksSetting()
        this.isDeleteGitleaks = false
        return
      }
      this.isDeleteGitleaks = true
      return
    },
    isEnabledDependency: function () {
      if (this.isEnabledDependency) {
        this.newDependencySetting()
        this.isDeleteDependency = false
        return
      }
      this.isDeleteDependency = true
      return
    },
  },
  data() {
    return {
      e6: 1,
      gitHubSetting: this.gitHubModel,
      gitleaksSetting: this.gitHubModel.gitleaksSetting,
      dependencySetting: this.gitHubModel.dependencySetting,
      isEnabledGitleaks: this.gitHubModel.isEnabledGitleaks,
      isEnabledDependency: this.gitHubModel.isEnabledDependency,
      isDeleteGitleaks: false,
      isDeleteDependency: false,
      loading: false,
      gitHubForm: {
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
        github_setting_id: {
          label: 'GitHub Setting ID',
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
      },
      gitleaksForm: {
        valid: false,
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
    }
  },
  methods: {
    getStatus(setting) {
      if (!setting) {
        return 0 // datasource is not configured
      }
      return setting.status
    },
    getStatusDetail(setting) {
      if (!setting) {
        return '' // datasource is not configured
      }
      return setting.status_detail
    },
    async refreshDialogDataSource(github_setting_id) {
      this.loading = true
      const github_setting = await this.listGitHubSettingAPI(github_setting_id)
        .catch((err) => {
          this.$emit('edit-notify', '', err.response.data)
          return
        })
        .finally(() => {
          this.loading = false
        })
      if (!github_setting) {
        this.$emit('edit-notify', '', 'github_setting is not found.')
        return
      }
      this.gitleaksSetting = github_setting[0].gitleaks_setting
      this.dependencySetting = github_setting[0].dependency_setting
    },
    async editGitHubSetting() {
      const github_setting = {
        github_setting_id: this.gitHubSetting.github_setting_id,
        name: this.gitHubSetting.name,
        project_id: this.$store.state.project.project_id,
        type: this.getGitHubTypeCode(this.gitHubSetting.type_text),
        base_url: this.gitHubSetting.base_url,
        target_resource: this.gitHubSetting.target_resource,
        github_user: this.gitHubSetting.github_user,
        personal_access_token: this.gitHubSetting.personal_access_token,
      }
      const gitHubSetting = await this.putGitHubSettingAPI(
        github_setting
      ).catch((err) => {
        return Promise.reject(err)
      })
      await this.tagProjectAPI(
        'github:' + this.gitHubSetting.target_resource,
        'black'
      ).catch((err) => {
        return Promise.reject(err)
      })
      return gitHubSetting
    },
    async editGitleaksSetting(gitHubSettingID) {
      if (this.isDeleteGitleaks) {
        await this.deleteGitleaksSettingAPI(gitHubSettingID).catch((err) => {
          return Promise.reject(err)
        })
        return
      }
      if (!this.isEnabledGitleaks) {
        return
      }
      let scan_at = 0
      if (this.gitleaksSetting.scan_at) {
        scan_at = this.gitleaksSetting.scan_at
      }
      const paramGitleaksSetting = {
        github_setting_id: gitHubSettingID,
        code_data_source_id: this.gitleaks_datasource_id,
        project_id: this.$store.state.project.project_id,
        repository_pattern: this.gitleaksSetting.repository_pattern,
        scan_public: Boolean(this.gitleaksSetting.scan_public),
        scan_internal: Boolean(this.gitleaksSetting.scan_internal),
        scan_private: Boolean(this.gitleaksSetting.scan_private),
        status: 2, // CONFIGURED
        status_detail:
          'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
        scan_at: scan_at,
      }
      const gitleaksSetting = await this.putGitleaksSettingAPI(
        paramGitleaksSetting
      ).catch((err) => {
        return Promise.reject(err)
      })
      return gitleaksSetting
    },
    async editDependencySetting(gitHubSettingID) {
      if (this.isDeleteDependency) {
        await this.deleteDependencySettingAPI(gitHubSettingID).catch((err) => {
          return Promise.reject(err)
        })
        return
      }
      if (!this.isEnabledDependency) {
        return
      }
      let scan_at = 0
      if (this.dependencySetting.scan_at) {
        scan_at = this.gitleaksSetting.scan_at
      }
      const paramDependencySetting = {
        github_setting_id: gitHubSettingID,
        code_data_source_id: this.dependency_datasource_id,
        project_id: this.$store.state.project.project_id,
        status: 2, // CONFIGURED
        status_detail:
          'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
        scan_at: scan_at,
      }
      const dependencySetting = await this.putDependencySettingAPI(
        paramDependencySetting
      ).catch((err) => {
        return Promise.reject(err)
      })
      return dependencySetting
    },
    async handleGitHubEditSubmit() {
      if (!this.$refs.formGitHub.validate()) {
        return
      }
      this.loading = true
      const gitHubSetting = await this.editGitHubSetting()
        .catch((err) => {
          this.$emit('edit-notify', err)
          return
        })
        .finally(() => {
          this.loading = false
        })
      this.gitHubSetting.github_setting_id = gitHubSetting.github_setting_id
      this.e6 = 2
    },
    async handleGitleaksEditSubmit() {
      if (this.isEnabledGitleaks && !this.$refs.formGitleaks.validate()) {
        return
      }
      this.loading = true
      const gitleaksSetting = await this.editGitleaksSetting(
        this.gitHubSetting.github_setting_id
      )
        .catch((err) => {
          this.$emit('edit-notify', err)
          return
        })
        .finally(() => {
          this.loading = false
        })
      if (gitleaksSetting) {
        this.gitleaksSetting = gitleaksSetting
      }
      this.e6 = 3
    },
    async handleDependencyEditSubmit() {
      this.loading = true
      const dependencySetting = await this.editDependencySetting(
        this.gitHubSetting.github_setting_id
      )
        .catch((err) => {
          this.$emit('edit-notify', err)
          return
        })
        .finally(() => {
          this.loading = false
        })
      if (dependencySetting) {
        this.dependencySetting = dependencySetting
      }
      this.$emit('edit-notify', 'Success: Updated.')
      this.$emit('closeDialog')
    },
    async handleScanGitleaks(fullscan) {
      this.loading = true
      if (!this.isEnabledGitleaks) {
        this.$emit('edit-notify', '', 'Gitleaks is not enabled.')
        this.loading = false
        return
      }
      await this.invokeScanGitleaksAPI(
        this.gitHubSetting.github_setting_id,
        fullscan
      )
        .catch((err) => {
          this.$emit('edit-notify', '', err.response.data)
        })
        .finally(() => {
          this.loading = false
        })
      this.$emit('edit-notify', 'Success: Invoke scan for Gitleaks.')
      this.refreshDialogDataSource(this.gitHubSetting.github_setting_id)
    },
    async handleScanDependency() {
      this.loading = true
      if (!this.isEnabledDependency) {
        this.$emit('edit-notify', '', 'Dependency is not enabled.')
        return
      }
      await this.invokeScanDependencyAPI(this.gitHubSetting.github_setting_id)
        .catch((err) => {
          this.$emit('edit-notify', '', err.response.data)
        })
        .finally(() => {
          this.loading = false
        })
      this.$emit('edit-notify', 'Success: Invoke scan for Dependency.')
      this.refreshDialogDataSource(this.gitHubSetting.github_setting_id)
    },
    newGitleaksSetting() {
      this.gitleaksSetting = {
        scan_public: true,
        scan_internal: true,
        scan_private: false,
      }
    },
    newDependencySetting() {
      this.dependencySetting = {}
    },
    getGitHubTypeCode(typeText) {
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
  },
}
</script>
