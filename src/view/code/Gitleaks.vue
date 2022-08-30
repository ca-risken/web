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
                  <scan-status :status="getStatus(item.gitleaksSetting)">
                  </scan-status>
                </template>
                <template v-slot:[`item.status_dependency`]="{ item }">
                  <scan-status :status="getStatus(item.dependencySetting)">
                  </scan-status>
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

    <v-dialog v-model="editDialog" width="70%">
      <v-card tile>
        <v-card-title class="text-h5 grey lighten-2">
          <v-icon large color="black">mdi-github</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['GitHub']`) }}
          </span>
        </v-card-title>
        <v-container fluid>
          <v-card-title>{{ $t(`item['GitHub Setting']`) }}</v-card-title>
          <v-card-text>
            <v-form v-model="gitHubForm.valid" ref="formGitHub">
              <v-row>
                <v-col cols="2" v-if="gitHubModel.github_setting_id">
                  <v-text-field
                    outlined
                    v-model="gitHubModel.github_setting_id"
                    :label="
                      $t(`item['` + gitHubForm.github_setting_id.label + `']`)
                    "
                    readonly
                    filled
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    outlined
                    v-model="gitHubModel.name"
                    :counter="64"
                    :rules="gitHubForm.name.validator"
                    :label="$t(`item['` + gitHubForm.name.label + `']`) + ' *'"
                    :placeholder="gitHubForm.name.placeholder"
                    :disabled="isReadOnlyForm || !gitHubForm.isNew"
                    :filled="isReadOnlyForm || !gitHubForm.isNew"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
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
                    :disabled="isReadOnlyForm"
                    :filled="isReadOnlyForm"
                  />
                </v-col>
                <v-col cols="5">
                  <v-text-field
                    outlined
                    v-model="gitHubModel.base_url"
                    :counter="128"
                    :rules="gitHubForm.base_url.validator"
                    :label="$t(`item['` + gitHubForm.base_url.label + `']`)"
                    :placeholder="gitHubForm.base_url.placeholder"
                    :disabled="isReadOnlyForm"
                    :filled="isReadOnlyForm"
                  ></v-text-field>
                </v-col>
                <v-col cols="5">
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
                    :disabled="isReadOnlyForm"
                    :filled="isReadOnlyForm"
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
                    :disabled="isReadOnlyForm"
                    :filled="isReadOnlyForm"
                  ></v-text-field>
                </v-col>
                <v-col cols="8">
                  <v-text-field
                    outlined
                    v-model="gitHubModel.personal_access_token"
                    :counter="255"
                    :rules="gitHubForm.personal_access_token.validator"
                    :label="
                      $t(
                        `item['` + gitHubForm.personal_access_token.label + `']`
                      )
                    "
                    :placeholder="gitHubForm.personal_access_token.placeholder"
                    :disabled="isReadOnlyForm"
                    :filled="isReadOnlyForm"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <!-- gitleaks -->
          <v-row>
            <v-col cols="4">
              <v-card-title>{{ gitleaksDataSourceModel.name }}</v-card-title>
              <v-card-subtitle>
                {{ gitleaksDataSourceModel.description }}</v-card-subtitle
              >
            </v-col>
            <v-col cols="8">
              <v-list-item two-line>
                <v-row>
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
                  <v-col cols="3" v-if="getStatus(gitHubModel.gitleaksSetting)">
                    <v-list-item-content>
                      <v-list-item-title class="headline">
                        <v-list-item-subtitle>
                          {{ $t(`item['Status']`) }}
                        </v-list-item-subtitle>
                        <v-chip
                          dark
                          :color="
                            getDataSourceStatusColor(
                              gitHubModel.gitleaksSetting.status
                            )
                          "
                        >
                          {{
                            getDataSourceStatusText(
                              gitHubModel.gitleaksSetting.status
                            )
                          }}
                        </v-chip>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-col>
                  <v-col cols="3" v-if="getStatus(gitHubModel.gitleaksSetting)">
                    <v-list-item-content>
                      <v-list-item-title class="headline">
                        <v-list-item-subtitle>
                          {{ $t(`item['ScanAt']`) }}
                        </v-list-item-subtitle>
                        <v-chip
                          color="grey lighten-3"
                          v-if="gitHubModel.gitleaksSetting.scan_at"
                        >
                          {{ gitHubModel.gitleaksSetting.scan_at | formatTime }}
                        </v-chip>
                        <v-chip v-else>Not yet scan...</v-chip>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense v-if="getStatusDetail(gitHubModel.gitleaksSetting)">
            <v-col>
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">
                    {{ $t(`item['Status Detail']`) }}
                  </span>
                </v-card-title>
                <v-card-text>
                  {{ getStatusDetail(gitHubModel.gitleaksSetting) }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-checkbox
              v-model="gitHubModel.isEnabledGitleaks"
              :label="$t(`action['Activate Gitleaks']`)"
              @change="
                handleChangeFlagGitleaksSetting(gitleaksDataSourceModel.name)
              "
              :disabled="isReadOnlyForm"
            ></v-checkbox>
          </v-card-actions>
          <v-card-text v-if="gitHubModel.isEnabledGitleaks">
            <v-form v-model="gitleaksForm.valid" ref="formGitleaks">
              <v-row>
                <v-col cols="4">
                  <v-text-field
                    outlined
                    v-model="gitHubModel.gitleaksSetting.repository_pattern"
                    :counter="128"
                    :rules="gitleaksForm.repository_pattern.validator"
                    :label="
                      $t(
                        `item['` + gitleaksForm.repository_pattern.label + `']`
                      )
                    "
                    :placeholder="gitleaksForm.repository_pattern.placeholder"
                    :disabled="isReadOnlyForm"
                    :filled="isReadOnlyForm"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="3">
                  <v-switch
                    v-model="gitHubModel.gitleaksSetting.scan_public"
                    :label="
                      $t(`item['` + gitleaksForm.scan_public.label + `']`)
                    "
                    color="info"
                    :disabled="isReadOnlyForm"
                    :filled="isReadOnlyForm"
                  ></v-switch>
                </v-col>
                <v-col cols="3">
                  <v-switch
                    v-model="gitHubModel.gitleaksSetting.scan_internal"
                    :label="
                      $t(`item['` + gitleaksForm.scan_internal.label + `']`)
                    "
                    color="info"
                    :disabled="isReadOnlyForm"
                    :filled="isReadOnlyForm"
                  ></v-switch>
                </v-col>
                <v-col cols="3">
                  <v-switch
                    v-model="gitHubModel.gitleaksSetting.scan_private"
                    :label="
                      $t(`item['` + gitleaksForm.scan_private.label + `']`)
                    "
                    color="info"
                    :disabled="isReadOnlyForm"
                    :filled="isReadOnlyForm"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              text
              outlined
              color="blue darken-1"
              :loading="loading"
              :disabled="!isReadOnlyForm || !gitHubModel.isEnabledGitleaks"
              @click="handleScanGitleaks"
            >
              {{ $t(`btn['SCAN']`) }}
            </v-btn>
          </v-card-actions>
          <v-divider />
          <!-- dependency -->
          <v-row>
            <v-col cols="4">
              <v-card-title>{{ dependencyDataSourceModel.name }}</v-card-title>
              <v-card-subtitle>
                {{ dependencyDataSourceModel.description }}</v-card-subtitle
              >
            </v-col>
            <v-col cols="8">
              <v-list-item two-line>
                <v-col cols="3">
                  <v-list-item-content>
                    <v-list-item-subtitle>
                      {{ $t(`item['Data Source ID']`) }}
                    </v-list-item-subtitle>
                    <v-list-item-title class="headline">
                      {{ dependencyDataSourceModel.code_data_source_id }}
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
                <v-col cols="3" v-if="getStatus(gitHubModel.dependencySetting)">
                  <v-list-item-content>
                    <v-list-item-title class="headline">
                      <v-list-item-subtitle>
                        {{ $t(`item['Status']`) }}
                      </v-list-item-subtitle>
                      <v-chip
                        dark
                        :color="
                          getDataSourceStatusColor(
                            gitHubModel.dependencySetting.status
                          )
                        "
                      >
                        {{
                          getDataSourceStatusText(
                            gitHubModel.dependencySetting.status
                          )
                        }}
                      </v-chip>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-col>
                <v-col cols="3" v-if="getStatus(gitHubModel.dependencySetting)">
                  <v-list-item-content>
                    <v-list-item-title class="headline">
                      <v-list-item-subtitle>
                        {{ $t(`item['ScanAt']`) }}
                      </v-list-item-subtitle>
                      <v-chip
                        color="grey lighten-3"
                        v-if="gitHubModel.gitleaksSetting.scan_at"
                      >
                        {{ gitHubModel.dependencySetting.scan_at | formatTime }}
                      </v-chip>
                      <v-chip v-else>Not yet scan...</v-chip>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-col>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense v-if="getStatusDetail(gitHubModel.dependencySetting)">
            <v-col>
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">
                    {{ $t(`item['Status Detail']`) }}
                  </span>
                </v-card-title>
                <v-card-text>
                  {{ getStatusDetail(gitHubModel.dependencySetting) }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-checkbox
              v-model="gitHubModel.isEnabledDependency"
              :label="$t(`action['Activate Dependency']`)"
              @change="
                handleChangeFlagDependencySetting(
                  dependencyDataSourceModel.name
                )
              "
              :disabled="isReadOnlyForm"
            ></v-checkbox>
          </v-card-actions>
          <v-card-actions>
            <v-btn
              text
              outlined
              color="blue darken-1"
              :loading="loading"
              :disabled="!isReadOnlyForm || !gitHubModel.isEnabledDependency"
              @click="handleScanDependency"
            >
              {{ $t(`btn['SCAN']`) }}
            </v-btn>
          </v-card-actions>
        </v-container>
        <v-divider />
        <v-card-actions>
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
            v-if="!isReadOnlyForm"
            :loading="loading"
            @click="handleEditSubmit"
          >
            {{ $t(`btn['EDIT']`) }}
          </v-btn>
        </v-card-actions>
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

    <v-dialog v-model="deactivateDialog" max-width="40%" persistent>
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">
            {{
              $t(
                `message['Disabling DataSource will cause your unsaved configuration to be lost. Do you want to continue?']`
              )
            }}
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
              <v-list-item-title v-text="deleteTarget"></v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Data Source']`) }}</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            outlined
            color="grey darken-1"
            @click="handleCancelDeactivate(deleteTarget)"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            outlined
            :loading="loading"
            @click="handleSubmitDeactivate(deleteTarget)"
          >
            {{ $t(`btn['DEACTIVATE']`) }}
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
      isReadOnlyForm: false,
      gitHubForm: {
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
      gitleaksForm: {
        isNew: false,
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
      dependencyForm: {
        isNew: false,
        valid: false,
      },
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
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteGitHubSetting,
          },
          {
            text: 'Scan Gitleaks',
            icon: 'mdi-magnify-scan',
            click: this.handleScanGitleaks,
          },
          {
            text: 'Scan Dependency',
            icon: 'mdi-magnify-scan',
            click: this.handleScanDependency,
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
    }
  },
  watch: {
    editDialog(visible) {
      if (visible) {
        this.isDeleteGitleaks = false
        this.isDeleteDependency = false
        if (this.$refs.formGitHub) {
          this.$refs.formGitHub.resetValidation()
        }
        if (this.$refs.formGitleaks) {
          this.$refs.formGitleaks.resetValidation()
        }
      }
    },
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
  },
  methods: {
    // API
    async getGitleaksDataSourceAPI() {
      const res = await this.$axios
        .get('/code/list-datasource/')
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.code_data_source) {
        return []
      }
      return res.data.data.code_data_source
    },
    async listGitHubSettingAPI() {
      const res = await this.$axios
        .get(
          '/code/list-github-setting/' +
            '?project_id=' +
            this.$store.state.project.project_id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.github_setting) {
        return []
      }
      return res.data.data.github_setting
    },
    async putGitHubSettingAPI(github_setting) {
      const paramGitHubSetting = {
        project_id: this.$store.state.project.project_id,
        github_setting: github_setting,
      }
      const res = await this.$axios
        .post('/code/put-github-setting/', paramGitHubSetting)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.github_setting) {
        return {}
      }
      return res.data.data.github_setting
    },
    async deleteGitHubSettingAPI(github_setting_id) {
      const param = {
        project_id: this.$store.state.project.project_id,
        github_setting_id: github_setting_id,
      }
      await this.$axios
        .post('/code/delete-github-setting/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async putGitleaksSettingAPI(gitleaks_setting) {
      const paramGitleaksSetting = {
        project_id: this.$store.state.project.project_id,
        gitleaks_setting: gitleaks_setting,
      }
      const res = await this.$axios
        .post('/code/put-gitleaks-setting/', paramGitleaksSetting)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.gitleaks_setting) {
        return {}
      }
      return res.data.data.gitleaks_setting
    },
    async deleteGitleaksSettingAPI(github_setting_id) {
      const param = {
        project_id: this.$store.state.project.project_id,
        github_setting_id: github_setting_id,
      }
      await this.$axios
        .post('/code/delete-gitleaks-setting/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async putDependencySettingAPI(dependency_setting) {
      const paramDependencySetting = {
        project_id: this.$store.state.project.project_id,
        dependency_setting: dependency_setting,
      }
      const res = await this.$axios
        .post('/code/put-dependency-setting/', paramDependencySetting)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.dependency_setting) {
        return {}
      }
      return res.data.data.dependency_setting
    },
    async deleteDependencySettingAPI(github_setting_id) {
      const param = {
        project_id: this.$store.state.project.project_id,
        github_setting_id: github_setting_id,
      }
      await this.$axios
        .post('/code/delete-dependency-setting/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async invokeScanGitleaksAPI(github_setting_id) {
      const param = {
        project_id: this.$store.state.project.project_id,
        github_setting_id: github_setting_id,
      }
      await this.$axios
        .post('/code/invoke-scan-gitleaks/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async invokeScanDependencyAPI(github_setting_id) {
      const param = {
        project_id: this.$store.state.project.project_id,
        github_setting_id: github_setting_id,
      }
      await this.$axios
        .post('/code/invoke-scan-dependency/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
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
      this.loading = false
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
    async deleteGitleaksSetting() {
      await this.deleteGitleaksSettingAPI(
        this.gitHubModel.github_setting_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Deleted.')
    },
    async deleteDependencySetting() {
      await this.deleteGitleaksSettingAPI(
        this.gitHubModel.github_setting_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Deleted.')
    },
    async editItem() {
      const gitHubSetting = await this.editGitHubSetting().catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      const gitHubSettingID = gitHubSetting.github_setting_id
      await this.editGitleaksSetting(gitHubSettingID).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      await this.editDependencySetting(gitHubSettingID).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      await this.tagProjectAPI(
        'github:' + this.gitHubModel.target_resource,
        'black'
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
    },
    async editGitHubSetting() {
      const github_setting = {
        github_setting_id: this.gitHubModel.github_setting_id,
        name: this.gitHubModel.name,
        project_id: this.$store.state.project.project_id,
        type: this.getGitHubTypeCode(this.gitHubModel.type_text),
        base_url: this.gitHubModel.base_url,
        target_resource: this.gitHubModel.target_resource,
        github_user: this.gitHubModel.github_user,
        personal_access_token: this.gitHubModel.personal_access_token,
      }
      const gitHubSetting = await this.putGitHubSettingAPI(
        github_setting
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
      if (!this.gitHubModel.isEnabledGitleaks) {
        return
      }
      let scan_at = 0
      if (this.gitHubModel.gitleaksSetting.scan_at) {
        scan_at = this.gitHubModel.gitleaksSetting.scan_at
      }
      const paramGitleaksSetting = {
        github_setting_id: gitHubSettingID,
        code_data_source_id: this.gitleaks_datasource_id,
        project_id: this.$store.state.project.project_id,
        repository_pattern: this.gitHubModel.gitleaksSetting.repository_pattern,
        scan_public: Boolean(this.gitHubModel.gitleaksSetting.scan_public),
        scan_internal: Boolean(this.gitHubModel.gitleaksSetting.scan_internal),
        scan_private: Boolean(this.gitHubModel.gitleaksSetting.scan_private),
        status: 2, // CONFIGURED
        status_detail:
          'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
        scan_at: scan_at,
      }
      await this.putGitleaksSettingAPI(paramGitleaksSetting).catch((err) => {
        return Promise.reject(err)
      })
    },
    async editDependencySetting(gitHubSettingID) {
      if (this.isDeleteDependency) {
        await this.deleteDependencySettingAPI(gitHubSettingID).catch((err) => {
          return Promise.reject(err)
        })
        return
      }
      if (!this.gitHubModel.isEnabledDependency) {
        return
      }
      let scan_at = 0
      if (this.gitHubModel.dependencySetting.scan_at) {
        scan_at = this.gitHubModel.gitleaksSetting.scan_at
      }
      const paramDependencySetting = {
        github_setting_id: gitHubSettingID,
        code_data_source_id: this.gitleaks_datasource_id,
        project_id: this.$store.state.project.project_id,
        status: 2, // CONFIGURED
        status_detail:
          'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
        scan_at: scan_at,
      }
      await this.putDependencySettingAPI(paramDependencySetting).catch(
        (err) => {
          return Promise.reject(err)
        }
      )
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
    async scanGitleaks(github_setting_id) {
      await this.invokeScanGitleaksAPI(github_setting_id).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Invoke scan for Data Source.')
    },
    async scanDependency(github_setting_id) {
      await this.invokeScanDependencyAPI(github_setting_id).catch((err) => {
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
    handleNewGitHubSetting() {
      this.gitHubModel = {}
      this.gitHubForm.isNew = true
      this.newGitleaksSetting()
      this.newDependencySetting()
      this.isReadOnlyForm = false
      this.editDialog = true
    },
    newGitleaksSetting() {
      this.gitHubModel.gitleaksSetting = {
        scan_public: true,
        scan_internal: true,
        scan_private: false,
      }
      this.gitleaksForm.isNew = true
    },
    newDependencySetting() {
      this.gitHubModel.dependencySetting = {}
      this.dependencyForm.isNew = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.isReadOnlyForm = false
      this.gitHubForm.isNew = false
      this.gitleaksForm.isNew = false
      this.dependencyForm.isNew = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.formGitHub.validate()) {
        return
      }
      if (this.isEnabledGitleaks && !this.$refs.formGitleaks.validate()) {
        return
      }
      this.loading = true
      await this.editItem()
      this.finishSuccess('Success: Updated.')
    },
    handleDeleteGitHubSetting(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    async handleDeleteGitHubSettingSubmit() {
      this.loading = true
      await this.deleteGitHubSetting()
    },
    handleScanGitleaks(item) {
      if (item && item.github_setting_id) {
        this.assignDataModel(item)
      }
      this.loading = true
      if (!this.gitHubModel.isEnabledGitleaks) {
        this.finishError('gitleaks setting is not configured.')
        return
      }
      this.scanGitleaks(this.gitHubModel.github_setting_id)
    },
    handleScanDependency(item) {
      this.loading = true
      if (item && item.github_setting_id) {
        this.assignDataModel(item)
      }
      if (!this.gitHubModel.isEnabledDependency) {
        this.finishError('dependency setting is not configured.')
        return
      }
      this.scanDependency(this.gitHubModel.github_setting_id)
    },
    handleChangeFlagGitleaksSetting(dataSourceName) {
      // 有効化された場合には、削除フラグを無効化
      if (this.gitHubModel.isEnabledGitleaks) {
        this.newGitleaksSetting()
        this.isDeleteGitleaks = false
        return
      }
      // 無効化されて、既存のデータが存在する場合に既存データの削除フラグを立てる
      if (!this.gitleaksForm.isNew) {
        this.deleteTarget = dataSourceName
        this.deactivateDialog = true
      }
    },
    handleChangeFlagDependencySetting(dataSourceName) {
      // 有効化された場合には、削除フラグを無効化
      if (this.gitHubModel.isEnabledDependency) {
        this.newDependencySetting()
        this.isDeleteDependency = false
        return
      }
      // 無効化されて、既存のデータが存在する場合に既存データの削除フラグを立てる
      if (!this.dependencyForm.isNew) {
        this.deleteTarget = dataSourceName
        this.deactivateDialog = true
      }
    },
    handleCancelDeactivate(dataSourceName) {
      if (dataSourceName == this.gitleaksDataSourceModel.name) {
        this.gitHubModel.isEnabledGitleaks = true
      } else {
        this.gitHubModel.isEnabledDependency = true
      }
      this.deactivateDialog = false
    },
    handleSubmitDeactivate(dataSourceName) {
      if (dataSourceName == this.gitleaksDataSourceModel.name) {
        this.isDeleteGitleaks = true
        this.gitHubModel.gitleaksSetting = {}
      } else {
        this.isDeleteDependency = true
        this.gitHubModel.dependencySetting = {}
      }
      this.deactivateDialog = false
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
  },
}
</script>
