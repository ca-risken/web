<template>
  <v-container>
    <v-dialog v-model="showDialog" max-width="70%">
      <v-card>
        <v-card-title class="text-h5 grey-lighten-2">
          <v-icon large color="black">mdi-github</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['GitHub']`) }}
          </span>
        </v-card-title>
        <v-tabs
          v-model="e6"
          bg-color="white"
          color="cyan-darken-3-accent-4"
          fixed-tabs
        >
          <v-tab class="mx-0 px-0" :value="1">{{
            $t(`item['GitHub Setting']`)
          }}</v-tab>
          <v-tab
            class="mx-0 px-0"
            :value="2"
            :disabled="!isReadyGitHubSetting"
            >{{ $t(`item['Gitleaks Setting']`) }}</v-tab
          >
          <v-tab
            class="mx-0 px-0"
            :value="3"
            :disabled="!isReadyGitHubSetting"
            >{{ $t(`item['Dependency Setting']`) }}</v-tab
          >
          <v-tab
            class="mx-0 px-0"
            :value="4"
            :disabled="!isReadyGitHubSetting"
            >{{ $t(`item['CodeScan Setting']`) }}</v-tab
          >
        </v-tabs>
        <v-window v-model="e6">
          <v-window-item :value="1">
            <v-card variant="flat" class="pb-4">
              <v-card-text>
                <v-form v-model="gitHubForm.valid" ref="formGitHub">
                  <v-row>
                    <v-col>
                      <v-list-item two-line>
                        <v-list-item-title class="text-h5">
                          {{ $t(`item['GitHub Setting']`) }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="2" v-if="isConfiguredGitHubSetting">
                      <v-text-field
                        density="compact"
                        v-model="gitHubSetting.github_setting_id"
                        :label="
                          $t(
                            `item['` + gitHubForm.github_setting_id.label + `']`
                          )
                        "
                        disabled
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3">
                      <v-text-field
                        density="compact"
                        v-model="gitHubSetting.name"
                        :counter="64"
                        :rules="gitHubForm.name.validator"
                        :label="
                          $t(`item['` + gitHubForm.name.label + `']`) + ' *'
                        "
                        :placeholder="gitHubForm.name.placeholder"
                        :disabled="isReadOnly || isConfiguredGitHubSetting"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="5">
                      <v-text-field
                        density="compact"
                        v-model="gitHubSetting.base_url"
                        :counter="128"
                        :rules="gitHubForm.base_url.validator"
                        :label="$t(`item['` + gitHubForm.base_url.label + `']`)"
                        :placeholder="gitHubForm.base_url.placeholder"
                        :disabled="isReadOnly"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="2">
                      <v-combobox
                        density="compact"
                        required
                        clearable
                        v-model="gitHubSetting.type_text"
                        :rules="gitHubForm.type.validator"
                        :label="
                          $t(`item['` + gitHubForm.type.label + `']`) + ' *'
                        "
                        :placeholder="gitHubForm.type.placeholder"
                        :items="gitHubForm.type.list"
                        :disabled="isReadOnly"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        density="compact"
                        required
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
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="3">
                      <v-select
                        density="compact"
                        required
                        clearable
                        v-model="gitHubSetting.auth_mode_text"
                        :rules="gitHubForm.auth_mode.validator"
                        :label="
                          $t(`item['` + gitHubForm.auth_mode.label + `']`) +
                          ' *'
                        "
                        :placeholder="gitHubForm.auth_mode.placeholder"
                        :items="gitHubForm.auth_mode.list"
                        :disabled="isReadOnly"
                      />
                    </v-col>
                    <v-col cols="3">
                      <v-text-field
                        density="compact"
                        v-model="gitHubSetting.github_user"
                        :counter="64"
                        :rules="gitHubForm.github_user.validator"
                        :label="
                          $t(`item['` + gitHubForm.github_user.label + `']`)
                        "
                        :placeholder="gitHubForm.github_user.placeholder"
                        :disabled="isReadOnly"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="5" v-if="!isGitHubAppAuth">
                      <v-text-field
                        density="compact"
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
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row v-if="isGitHubAppAuth && githubAppInstallationStatus">
                    <v-col cols="12">
                      <v-alert
                        density="compact"
                        :type="githubAppInstallationStatusAlertType"
                        :class="githubAppInstallationStatusAlertClass"
                        variant="tonal"
                      >
                        <div class="font-weight-medium">
                          {{ githubAppInstallationStatusTitle }}
                        </div>
                        <div>
                          {{ githubAppInstallationStatusMessage }}
                        </div>
                        <div
                          v-if="shouldShowGitHubAppInstallPageLink"
                          class="mt-2"
                        >
                          <router-link
                            class="github-app-installation-warning-link"
                            :to="githubAppInstallPageTo"
                          >
                            {{
                              $t(
                                `item['GitHub App Installation Open Install Page']`
                              )
                            }}
                          </router-link>
                        </div>
                        <div v-if="shouldShowGitHubAppLink" class="mt-2">
                          <a
                            href="#"
                            @click.prevent="handleGitHubAppLinkFromDetail"
                          >
                            {{ $t(`btn['VERIFY GITHUB USER']`) }}
                          </a>
                        </div>
                      </v-alert>
                    </v-col>
                  </v-row>
                  <v-row v-if="shouldShowGitHubAppLinkPendingInfo">
                    <v-col cols="12">
                      <v-alert density="compact" type="info" variant="tonal">
                        <div class="font-weight-medium">
                          <span>{{
                            $t(`item['GitHub App Link Pending Action Prefix']`)
                          }}</span
                          ><a
                            href="#"
                            @click.prevent="$emit('editGitHubSetting')"
                            >{{
                              $t(`item['GitHub App Link Pending Action Link']`)
                            }}</a
                          ><span>{{
                            $t(`item['GitHub App Link Pending Action Suffix']`)
                          }}</span>
                        </div>
                      </v-alert>
                    </v-col>
                  </v-row>
                  <v-row v-if="isGitHubAppAuth">
                    <v-col cols="3" v-if="isConfiguredGitHubSetting">
                      <v-list-item two-line>
                        <v-list-item-subtitle>
                          {{ $t(`item['GitHub App Status']`) }}
                        </v-list-item-subtitle>
                        <v-list-item-title>
                          <v-chip
                            label
                            variant="flat"
                            :color="
                              getGitHubVerificationColor(
                                gitHubSetting.verification_status
                              )
                            "
                          >
                            {{
                              getGitHubVerificationText(
                                gitHubSetting.verification_status
                              )
                            }}
                          </v-chip>
                        </v-list-item-title>
                      </v-list-item>
                    </v-col>
                    <v-col cols="3" v-if="isConfiguredGitHubSetting">
                      <v-list-item two-line>
                        <v-list-item-subtitle>
                          {{ $t(`item['GitHub Setting User']`) }}
                        </v-list-item-subtitle>
                        <v-list-item-title>
                          {{ gitHubSetting.verified_github_user || '-' }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-col>
                    <v-col cols="3" v-if="isGitHubAppLinked">
                      <v-list-item two-line>
                        <v-list-item-subtitle>
                          {{ $t(`item['Target Repository List']`) }}
                        </v-list-item-subtitle>
                        <v-list-item-title>
                          <v-btn
                            color="cyan-darken-2"
                            density="comfortable"
                            size="small"
                            variant="outlined"
                            @click="githubAppRepositoryDialog = true"
                          >
                            {{ $t(`btn['CHECK']`) }}
                          </v-btn>
                        </v-list-item-title>
                      </v-list-item>
                    </v-col>
                    <v-col cols="3" v-if="isConfiguredGitHubSetting">
                      <v-list-item two-line>
                        <v-list-item-subtitle>
                          {{ $t(`item['Verified At']`) }}
                        </v-list-item-subtitle>
                        <v-list-item-title>
                          {{
                            gitHubSetting.verified_at
                              ? formatTime(gitHubSetting.verified_at)
                              : '-'
                          }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-row>
                  <v-col class="text-right">
                    <v-tooltip
                      v-if="!isReadOnly && isGitHubAppAuth"
                      location="top"
                      max-width="360"
                    >
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          class="mr-1"
                          color="grey-darken-1"
                          icon="mdi-help-circle-outline"
                          size="small"
                          variant="text"
                        ></v-btn>
                      </template>
                      <span>
                        {{ $t(`help['GITHUB APP AUTH FLOW']`) }}
                      </span>
                    </v-tooltip>
                    <v-btn
                      variant="outlined"
                      color="green-darken-1"
                      class="mr-2"
                      @click="handleGitHubAppUserVerification"
                      v-if="
                        !isReadOnly &&
                        isGitHubAppAuth &&
                        isConfiguredGitHubSetting
                      "
                      :loading="loading"
                    >
                      {{ $t(`btn['VERIFY GITHUB USER']`) }}
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="blue-darken-1"
                      class="mr-2"
                      @click="handleGitHubAppResync"
                      v-if="
                        !isReadOnly &&
                        isGitHubAppAuth &&
                        isConfiguredGitHubSetting
                      "
                      :loading="loading"
                    >
                      {{ $t(`btn['RESYNC']`) }}
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="blue-darken-1"
                      @click="handleGitHubEditSubmit"
                      v-if="!isReadOnly"
                      :loading="loading"
                    >
                      {{ $t(`btn['SAVE']`) }}
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="grey-darken-1"
                      class="ml-2"
                      @click="$emit('closeDialog')"
                      :loading="loading"
                    >
                      {{ $t(`btn['CANCEL']`) }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-window-item>
          <v-window-item :value="2">
            <v-card variant="flat" class="pb-4">
              <v-card-text>
                <v-row>
                  <v-col>
                    <v-list-item two-line>
                      <v-list-item-subtitle>
                        {{ $t(`item['Data Source']`) }}
                      </v-list-item-subtitle>
                      <v-list-item-title class="text-h5">
                        {{ gitleaksDataSourceModel.name }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="2">
                    <v-list-item two-line>
                      <v-list-item-subtitle>
                        {{ $t(`item['Data Source ID']`) }}
                      </v-list-item-subtitle>
                      <v-list-item-title class="text-h5">
                        {{ gitleaksDataSourceModel.code_data_source_id }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                  <v-col cols="2">
                    <v-list-item>
                      <v-list-item-title class="text-h5">
                        <v-list-item-subtitle>
                          {{ $t(`item['MAX Score']`) }}
                        </v-list-item-subtitle>
                        <v-chip outlined>
                          {{ gitleaksDataSourceModel.max_score }}
                        </v-chip>
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                  <v-col cols="2">
                    <v-list-item>
                      <v-list-item-title class="text-h5">
                        <v-list-item-subtitle>
                          {{ $t(`item['Status']`) }}
                        </v-list-item-subtitle>
                        <v-chip
                          variant="flat"
                          class="text-white"
                          :color="
                            getDataSourceStatusColor(gitleaksSetting.status)
                          "
                          v-if="getStatus(gitleaksSetting)"
                        >
                          {{ getDataSourceStatusText(gitleaksSetting.status) }}
                        </v-chip>
                        <v-chip
                          variant="flat"
                          class="text-white"
                          :color="
                            getDataSourceStatusColor(gitleaksSetting.status)
                          "
                          v-else
                        >
                          Disabled
                        </v-chip>
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                  <v-col cols="3" v-if="getStatus(gitleaksSetting)">
                    <v-list-item>
                      <v-list-item-title class="text-h5">
                        <v-list-item-subtitle>
                          {{ $t(`item['ScanAt']`) }}
                        </v-list-item-subtitle>
                        <v-chip v-if="gitleaksSetting.scan_at">
                          {{ formatTime(gitleaksSetting.scan_at) }}
                        </v-chip>
                        <v-chip v-else>Not yet scan...</v-chip>
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                  <v-col cols="3" v-if="getStatus(gitleaksSetting) == 1">
                    <v-list-item>
                      <v-list-item-title>
                        <v-list-item-subtitle>
                          {{ $t(`view.code['Repository List']`) }}
                        </v-list-item-subtitle>
                        <v-btn
                          @click="openGitleaksCacheDialog()"
                          density="comfortable"
                          variant="outlined"
                          color="cyan-darken-2"
                        >
                          {{ $t(`btn['CHECK']`) }}
                        </v-btn>
                        <gitleaks-cache
                          v-if="gitleaksCacheDialog"
                          :gitleaksCacheDialog="gitleaksCacheDialog"
                          :githubSettingID="githubSettingID"
                          @handleGitleaksCacheResponse="
                            this.gitleaksCacheDialog = false
                          "
                        />
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                </v-row>
                <v-row dense v-if="getStatusDetail(gitleaksSetting)">
                  <v-col>
                    <v-list-item two-line>
                      <v-list-item-subtitle>
                        {{ $t(`item['Status Detail']`) }}
                      </v-list-item-subtitle>
                      <v-list-item-title class="wrap-text">
                        {{ getStatusDetail(gitleaksSetting) }}
                      </v-list-item-title>
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
                    ></v-switch>
                  </v-col>
                </v-row>
                <v-card variant="flat" class="mb-4" v-if="isEnabledGitleaks">
                  <v-card-text class="pb-0">
                    <v-form v-model="gitleaksForm.valid" ref="formGitleaks">
                      <v-row>
                        <v-col cols="4" class="mb-0 pb-0">
                          <v-text-field
                            density="compact"
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
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-card-text>
              <v-card-actions>
                <v-row>
                  <v-col class="text-right">
                    <v-btn
                      class="mr-2"
                      variant="outlined"
                      color="blue-darken-1"
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
                      variant="outlined"
                      color="blue-darken-1"
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
                      variant="outlined"
                      color="cyan-darken-2"
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
                      variant="outlined"
                      color="blue-darken-1"
                      @click="handleGitleaksEditSubmit"
                      :disabled="!isReadyGitHubSetting"
                      :loading="loading"
                      v-else
                      >{{ $t(`btn['SAVE']`) }}
                    </v-btn>
                    <v-btn
                      class="ml-2"
                      variant="outlined"
                      color="grey-darken-1"
                      @click="$emit('closeDialog')"
                      :loading="loading"
                    >
                      {{ $t(`btn['CANCEL']`) }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-window-item>
          <v-window-item :value="3">
            <v-card class="pb-4">
              <v-card-text>
                <v-row>
                  <v-col>
                    <v-list-item two-line>
                      <v-list-item-subtitle>
                        {{ $t(`item['Data Source']`) }}
                      </v-list-item-subtitle>
                      <v-list-item-title class="text-h5">
                        {{ dependencyDataSourceModel.name }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-row dense>
                      <v-col cols="3">
                        <v-list-item two-line>
                          <v-list-item-subtitle>
                            {{ $t(`item['Data Source ID']`) }}
                          </v-list-item-subtitle>
                          <v-list-item-title class="text-h5">
                            {{ dependencyDataSourceModel.code_data_source_id }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-col>
                      <v-col cols="3">
                        <v-list-item two-line>
                          <v-list-item-title class="text-h5">
                            <v-list-item-subtitle>
                              {{ $t(`item['MAX Score']`) }}
                            </v-list-item-subtitle>
                            <v-chip outlined>
                              {{ dependencyDataSourceModel.max_score }}
                            </v-chip>
                          </v-list-item-title>
                        </v-list-item>
                      </v-col>
                      <v-col cols="3">
                        <v-list-item two-line>
                          <v-list-item-title class="text-h5">
                            <v-list-item-subtitle>
                              {{ $t(`item['Status']`) }}
                            </v-list-item-subtitle>
                            <v-chip
                              variant="flat"
                              class="text-white"
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
                              variant="flat"
                              class="text-white"
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
                        </v-list-item>
                      </v-col>
                      <v-col cols="3" v-if="getStatus(dependencySetting)">
                        <v-list-item two-line>
                          <v-list-item-title class="text-h5">
                            <v-list-item-subtitle>
                              {{ $t(`item['ScanAt']`) }}
                            </v-list-item-subtitle>
                            <v-chip v-if="dependencySetting.scan_at">
                              {{ formatTime(dependencySetting.scan_at) }}
                            </v-chip>
                            <v-chip v-else>Not yet scan...</v-chip>
                          </v-list-item-title>
                        </v-list-item>
                      </v-col>
                    </v-row>
                    <v-row dense v-if="getStatusDetail(dependencySetting)">
                      <v-col>
                        <v-list-item two-line>
                          <v-list-item-subtitle>
                            {{ $t(`item['Status Detail']`) }}
                          </v-list-item-subtitle>
                          <v-list-item-title class="wrap-text">
                            {{ getStatusDetail(dependencySetting) }}
                          </v-list-item-title>
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
                    ></v-switch>
                  </v-col>
                </v-row>
                <v-card variant="flat" class="mb-4" v-if="isEnabledDependency">
                  <v-card-text class="pb-0">
                    <v-form v-model="dependencyForm.valid" ref="formDependency">
                      <v-row>
                        <v-col cols="4" class="mb-0 pb-0">
                          <v-text-field
                            density="compact"
                            v-model="dependencySetting.repository_pattern"
                            :counter="128"
                            :rules="dependencyForm.repository_pattern.validator"
                            :label="
                              $t(
                                `item['` +
                                  dependencyForm.repository_pattern.label +
                                  `']`
                              )
                            "
                            :placeholder="
                              dependencyForm.repository_pattern.placeholder
                            "
                            :disabled="isReadOnly"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-card-text>
              <v-card-actions>
                <v-row class="text-right mx-2">
                  <v-col>
                    <v-btn
                      class="mr-2"
                      variant="outlined"
                      color="blue-darken-1"
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
                      variant="outlined"
                      color="cyan-darken-2"
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
                      variant="outlined"
                      color="blue-darken-1"
                      @click="handleDependencyEditSubmit"
                      :disabled="!isReadyGitHubSetting"
                      :loading="loading"
                      v-else
                      >{{ $t(`btn['SAVE']`) }}
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="grey-darken-1"
                      class="ml-2"
                      @click="$emit('closeDialog')"
                      :loading="loading"
                    >
                      {{ $t(`btn['CANCEL']`) }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-window-item>
          <v-window-item :value="4">
            <v-card variant="flat" class="pb-4">
              <v-card-text>
                <v-row>
                  <v-col>
                    <v-list-item two-line>
                      <v-list-item-subtitle>
                        {{ $t(`item['Data Source']`) }}
                      </v-list-item-subtitle>
                      <v-list-item-title class="text-h5">
                        {{ codeScanDataSourceModel.name }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="2">
                    <v-list-item two-line>
                      <v-list-item-subtitle>
                        {{ $t(`item['Data Source ID']`) }}
                      </v-list-item-subtitle>
                      <v-list-item-title class="text-h5">
                        {{ codeScanDataSourceModel.code_data_source_id }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                  <v-col cols="2">
                    <v-list-item>
                      <v-list-item-title class="text-h5">
                        <v-list-item-subtitle>
                          {{ $t(`item['MAX Score']`) }}
                        </v-list-item-subtitle>
                        <v-chip outlined>
                          {{ codeScanDataSourceModel.max_score }}
                        </v-chip>
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                  <v-col cols="2">
                    <v-list-item>
                      <v-list-item-title class="text-h5">
                        <v-list-item-subtitle>
                          {{ $t(`item['Status']`) }}
                        </v-list-item-subtitle>
                        <v-chip
                          variant="flat"
                          class="text-white"
                          :color="
                            getDataSourceStatusColor(codeScanSetting.status)
                          "
                          v-if="getStatus(codeScanSetting)"
                        >
                          {{ getDataSourceStatusText(codeScanSetting.status) }}
                        </v-chip>
                        <v-chip
                          variant="flat"
                          class="text-white"
                          :color="
                            getDataSourceStatusColor(codeScanSetting.status)
                          "
                          v-else
                        >
                          Disabled
                        </v-chip>
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                  <v-col cols="3" v-if="getStatus(codeScanSetting)">
                    <v-list-item>
                      <v-list-item-title class="text-h5">
                        <v-list-item-subtitle>
                          {{ $t(`item['ScanAt']`) }}
                        </v-list-item-subtitle>
                        <v-chip v-if="codeScanSetting.scan_at">
                          {{ formatTime(codeScanSetting.scan_at) }}
                        </v-chip>
                        <v-chip v-else>Not yet scan...</v-chip>
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                </v-row>
                <v-row dense v-if="getStatusDetail(codeScanSetting)">
                  <v-col>
                    <v-list-item two-line>
                      <v-list-item-subtitle>
                        {{ $t(`item['Status Detail']`) }}
                      </v-list-item-subtitle>
                      <v-list-item-title class="wrap-text">
                        {{ getStatusDetail(codeScanSetting) }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col>
                    <v-switch
                      class="ml-2"
                      v-model="isEnabledCodeScan"
                      :label="$t(`action['Enable CodeScan']`)"
                      color="info"
                      :disabled="isReadOnly"
                    ></v-switch>
                  </v-col>
                </v-row>
                <v-card variant="flat" class="mb-4" v-if="isEnabledCodeScan">
                  <v-card-text class="pb-0">
                    <v-form v-model="codeScanForm.valid" ref="formCodeScan">
                      <v-row>
                        <v-col cols="4" class="mb-0 pb-0">
                          <v-text-field
                            density="compact"
                            v-model="codeScanSetting.repository_pattern"
                            :counter="128"
                            :rules="codeScanForm.repository_pattern.validator"
                            :label="
                              $t(
                                `item['` +
                                  codeScanForm.repository_pattern.label +
                                  `']`
                              )
                            "
                            :placeholder="
                              codeScanForm.repository_pattern.placeholder
                            "
                            :disabled="isReadOnly"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row class="my-0">
                        <v-col cols="3" class="py-0">
                          <v-switch
                            v-model="codeScanSetting.scan_public"
                            :label="
                              $t(
                                `item['` + codeScanForm.scan_public.label + `']`
                              )
                            "
                            color="info"
                            :disabled="isReadOnly"
                          ></v-switch>
                        </v-col>
                        <v-col cols="3" class="py-0">
                          <v-switch
                            v-model="codeScanSetting.scan_internal"
                            :label="
                              $t(
                                `item['` +
                                  codeScanForm.scan_internal.label +
                                  `']`
                              )
                            "
                            color="info"
                            :disabled="isReadOnly"
                          ></v-switch>
                        </v-col>
                        <v-col cols="3" class="py-0">
                          <v-switch
                            v-model="codeScanSetting.scan_private"
                            :label="
                              $t(
                                `item['` +
                                  codeScanForm.scan_private.label +
                                  `']`
                              )
                            "
                            color="info"
                            :disabled="isReadOnly"
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-card-text>
              <v-card-actions>
                <v-row>
                  <v-col class="text-right">
                    <v-btn
                      class="mr-2"
                      variant="outlined"
                      color="blue-darken-1"
                      @click="handleScanCodeScan(false)"
                      v-if="isReadOnly"
                      :disabled="!isEnabledCodeScan"
                      :loading="loading"
                    >
                      <v-icon left>mdi-magnify-scan</v-icon>
                      {{ $t(`btn['SCAN']`) }}
                    </v-btn>
                    <v-btn
                      class="mr-2"
                      variant="outlined"
                      color="cyan-darken-2"
                      v-if="isReadOnly"
                      :loading="loading"
                      link
                      :to="{
                        path: '/finding/finding/',
                        query: {
                          data_source: codeScanDataSourceModel.name,
                        },
                      }"
                      risken-action-name="search-finding-by-datasource-from-codescan"
                    >
                      <v-icon left>mdi-magnify</v-icon>
                      {{ $t(`btn['SHOW SCAN RESULT']`) }}
                    </v-btn>

                    <v-btn
                      variant="outlined"
                      color="blue-darken-1"
                      @click="handleCodeScanEditSubmit"
                      :disabled="!isReadyGitHubSetting"
                      :loading="loading"
                      v-else
                      >{{ $t(`btn['SAVE']`) }}
                    </v-btn>
                    <v-btn
                      class="ml-2"
                      variant="outlined"
                      color="grey-darken-1"
                      @click="$emit('closeDialog')"
                      :loading="loading"
                    >
                      {{ $t(`btn['CANCEL']`) }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-window-item>
        </v-window>
        <!-- dependency -->
      </v-card>
    </v-dialog>
    <v-dialog v-model="githubAppRepositoryDialog" max-width="900">
      <v-card>
        <v-card-title class="text-h6">
          {{ $t(`item['Target Repository List']`) }}
        </v-card-title>
        <v-card-text>
          <v-data-table
            density="compact"
            :headers="githubAppRepositoryHeaders"
            :items="githubAppRepositoryItems"
            :items-per-page="10"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            @click="githubAppRepositoryDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
        </v-card-actions>
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
import GitleaksCache from './GitleaksCache.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'SettingDialog',
  mixins: [mixin, project, code],
  components: {
    GitleaksCache,
    VDataTable,
  },
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
    codeScanDataSourceModel: {
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
    isConfiguredGitHubSetting() {
      if (
        this.gitHubSetting != null &&
        this.gitHubSetting.github_setting_id != null &&
        this.gitHubSetting.github_setting_id != 0
      ) {
        return true
      }
      return false
    },
    isGitHubAppAuth() {
      return (
        this.getGitHubAuthModeCode(this.gitHubSetting.auth_mode_text) ===
        'GITHUB_APP'
      )
    },
    isReadyGitHubSetting() {
      if (!this.isConfiguredGitHubSetting) {
        return false
      }
      return true
    },
    isGitHubAppLinked() {
      return (
        this.isGitHubAppAuth &&
        this.gitHubSetting.verification_status === 'SUCCESS'
      )
    },
    isGitHubAppLinkPending() {
      return (
        this.isGitHubAppAuth &&
        (!this.gitHubSetting.verification_status ||
          this.gitHubSetting.verification_status ===
            'PENDING_USER_VERIFICATION' ||
          this.gitHubSetting.verification_status === 'PENDING')
      )
    },
    shouldShowGitHubAppLinkPendingInfo() {
      return (
        this.isReadOnly &&
        this.isConfiguredGitHubSetting &&
        this.isGitHubAppLinkPending
      )
    },
    githubAppRepositoryHeaders() {
      return [
        { title: '#', key: 'index', width: '80px' },
        {
          title: this.$t(`item['Repository']`),
          key: 'repository_full_name',
        },
      ]
    },
    githubAppRepositoryItems() {
      const repositories =
        this.gitHubSetting.github_app_setting_repository || []
      return repositories.map((repository, index) => ({
        index: index + 1,
        repository_full_name:
          repository.repository_full_name ||
          repository.github_repository_full_name ||
          repository.full_name ||
          repository.name ||
          '-',
      }))
    },
    githubAppInstallationStatusAlertType() {
      if (!this.githubAppInstallationStatus) {
        return 'info'
      }
      if (this.githubAppInstallationStatus.installed) {
        return 'success'
      }
      if (this.githubAppInstallationStatus.reason === 'NOT_INSTALLED') {
        return 'warning'
      }
      return 'error'
    },
    githubAppInstallationStatusAlertClass() {
      if (this.githubAppInstallationStatus?.reason === 'NOT_INSTALLED') {
        return 'github-app-installation-warning'
      }
      return ''
    },
    shouldShowGitHubAppInstallPageLink() {
      return this.githubAppInstallationStatus?.reason === 'NOT_INSTALLED'
    },
    shouldShowGitHubAppLink() {
      return (
        this.githubAppInstallationStatus?.installed &&
        this.gitHubSetting.verification_status !== 'SUCCESS'
      )
    },
    githubAppInstallPageTo() {
      const query = {}
      if (this.$route.query.project_id) {
        query.project_id = this.$route.query.project_id
      }
      return {
        path: '/settings/github-app',
        query,
      }
    },
    githubAppInstallationStatusTitle() {
      return this.getGitHubAppInstallationStatusTitle(
        this.githubAppInstallationStatus
      )
    },
    githubAppInstallationStatusMessage() {
      return this.getGitHubAppInstallationStatusMessage(
        this.githubAppInstallationStatus
      )
    },
  },
  mounted() {
    this.refreshGitHubAppInstallationStatusForReadOnly()
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
    isEnabledCodeScan: function () {
      if (this.isEnabledCodeScan) {
        this.newCodeScanSetting()
        this.isDeleteCodeScan = false
        return
      }
      this.isDeleteCodeScan = true
      return
    },
  },
  data() {
    return {
      e6: 1,
      gitHubSetting: Object.assign(
        {
          auth_mode: 'PERSONAL_ACCESS_TOKEN',
          auth_mode_text: 'Personal Access Token',
          github_app_setting_repository: [],
        },
        this.gitHubModel,
        {
          auth_mode_text: this.getGitHubAuthModeText(
            this.gitHubModel.auth_mode
          ),
        }
      ),
      gitleaksSetting: this.gitHubModel.gitleaksSetting,
      dependencySetting: this.gitHubModel.dependencySetting,
      codeScanSetting: this.gitHubModel.codeScanSetting,
      isEnabledGitleaks: this.gitHubModel.isEnabledGitleaks,
      isEnabledDependency: this.gitHubModel.isEnabledDependency,
      isEnabledCodeScan: this.gitHubModel.isEnabledCodeScan,
      isDeleteGitleaks: false,
      isDeleteDependency: false,
      isDeleteCodeScan: false,
      gitleaksCacheDialog: false,
      githubAppRepositoryDialog: false,
      githubAppInstallationStatus: null,
      githubSettingID: 0,
      loading: false,
      gitHubForm: {
        valid: false,
        auth_mode: {
          label: 'Auth Mode',
          placeholder: '-',
          list: ['Personal Access Token', 'GitHub App'],
          validator: [
            (v) => !!v || 'AuthMode is required',
            (v) =>
              !v ||
              v === 'Personal Access Token' ||
              v === 'GitHub App' ||
              'AuthMode is invalid',
          ],
        },
        name: {
          label: 'Name',
          placeholder: 'GitHub setting name',
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
      dependencyForm: {
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
      },
      codeScanForm: {
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
    getGitHubAuthModeCode(authModeText) {
      switch (authModeText) {
        case 'GitHub App':
        case 'GITHUB_APP':
          return 'GITHUB_APP'
        case 'Personal Access Token':
        case 'PERSONAL_ACCESS_TOKEN':
        case '':
        case undefined:
        case null:
          return 'PERSONAL_ACCESS_TOKEN'
        default:
          return ''
      }
    },
    getGitHubAuthModeText(authModeCode) {
      switch (authModeCode) {
        case 'GITHUB_APP':
          return 'GitHub App'
        case 'PERSONAL_ACCESS_TOKEN':
        case '':
        case undefined:
        case null:
          return 'Personal Access Token'
        default:
          return authModeCode
      }
    },
    getGitHubVerificationColor(status) {
      switch (status) {
        case 'SUCCESS':
          return 'green'
        case 'FAILED':
          return 'red'
        case 'PENDING_USER_VERIFICATION':
        case 'PENDING':
          return 'orange'
        default:
          return 'grey'
      }
    },
    getGitHubVerificationText(status) {
      if (!status) {
        return this.$t(`item['GitHub App Link Pending']`)
      }
      switch (status) {
        case 'SUCCESS':
          return this.$t(`item['GitHub App Link Success']`)
        case 'FAILED':
          return this.$t(`item['GitHub App Link Failed']`)
        case 'PENDING_USER_VERIFICATION':
        case 'PENDING':
          return this.$t(`item['GitHub App Link Pending']`)
        default:
          return status
      }
    },
    getGitHubAppInstallationStatusTitle(status) {
      if (!status) {
        return ''
      }
      if (status.installed) {
        return this.$t(`item['GitHub App Installation Installed']`)
      }
      switch (status.reason) {
        case 'NOT_INSTALLED':
          return this.$t(`item['GitHub App Installation Not Installed']`)
        default:
          return this.$t(`item['GitHub App Installation Check Failed']`)
      }
    },
    getGitHubAppInstallationStatusMessage(status) {
      if (!status) {
        return ''
      }
      if (status.installed) {
        return this.$t(`item['GitHub App Installation Installed Message']`, {
          target: status.target_resource || this.gitHubSetting.target_resource,
        })
      }
      if (status.reason === 'NOT_INSTALLED') {
        return this.$t(`item['GitHub App Installation Not Installed Message']`)
      }
      return this.$t(`item['GitHub App Installation Check Failed Message']`)
    },
    getErrorMessage(err) {
      if (err && err.response) {
        return this.$t(`item['Request Failed Please Check Setting']`)
      }
      if (err && err.message) {
        return err.message
      }
      return this.$t(`item['Unexpected Error Occurred']`)
    },
    isAllowedGitHubAppOAuthURL(rawURL) {
      try {
        const url = new URL(rawURL)
        const allowedHosts = ['github.com']
        const baseURL = new URL(
          this.gitHubSetting.base_url || 'https://api.github.com'
        )
        if (baseURL.hostname !== 'api.github.com') {
          allowedHosts.push(baseURL.hostname)
        }
        return (
          url.protocol === 'https:' &&
          allowedHosts.includes(url.hostname) &&
          url.pathname === '/login/oauth/authorize'
        )
      } catch {
        return false
      }
    },
    applyGitHubSetting(gitHubSetting) {
      if (!gitHubSetting || !gitHubSetting.github_setting_id) {
        return false
      }
      this.gitHubSetting = Object.assign(this.gitHubSetting, gitHubSetting, {
        auth_mode:
          gitHubSetting.auth_mode == ''
            ? 'PERSONAL_ACCESS_TOKEN'
            : gitHubSetting.auth_mode,
        auth_mode_text: this.getGitHubAuthModeText(gitHubSetting.auth_mode),
        github_app_setting_repository:
          gitHubSetting.github_app_setting_repository || [],
      })
      return true
    },
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
          this.$emit('edit-notify', '', this.getErrorMessage(err))
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
      this.codeScanSetting = github_setting[0].code_scan_setting
    },
    async editGitHubSetting() {
      const github_setting = {
        github_setting_id: this.gitHubSetting.github_setting_id,
        name: this.gitHubSetting.name,
        project_id: this.getCurrentProjectID(),
        type: this.getGitHubTypeCode(this.gitHubSetting.type_text),
        base_url: this.gitHubSetting.base_url,
        target_resource: this.gitHubSetting.target_resource,
        github_user: this.gitHubSetting.github_user,
        personal_access_token: this.isGitHubAppAuth
          ? ''
          : this.gitHubSetting.personal_access_token,
        auth_mode: this.getGitHubAuthModeCode(
          this.gitHubSetting.auth_mode_text
        ),
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
    async refreshGitHubAppInstallationStatus() {
      this.githubAppInstallationStatus =
        await this.getGitHubAppInstallationStatusAPI(
          this.gitHubSetting.github_setting_id
        ).catch((err) => {
          this.$emit('edit-notify', '', this.getErrorMessage(err))
          return null
        })
    },
    async refreshGitHubAppInstallationStatusForReadOnly() {
      if (
        !this.isReadOnly ||
        !this.isConfiguredGitHubSetting ||
        !this.isGitHubAppAuth ||
        this.gitHubSetting.verification_status !== 'FAILED'
      ) {
        return
      }
      await this.refreshGitHubAppInstallationStatus()
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
        project_id: this.getCurrentProjectID(),
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
        project_id: this.getCurrentProjectID(),
        repository_pattern: this.dependencySetting.repository_pattern,
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
    async editCodeScanSetting(gitHubSettingID) {
      if (this.isDeleteCodeScan) {
        await this.deleteCodeScanSettingAPI(gitHubSettingID).catch((err) => {
          return Promise.reject(err)
        })
        return
      }
      if (!this.isEnabledCodeScan) {
        return
      }
      let scan_at = 0
      if (this.codeScanSetting.scan_at) {
        scan_at = this.codeScanSetting.scan_at
      }
      const paramCodeScanSetting = {
        github_setting_id: gitHubSettingID,
        code_data_source_id: this.code_scan_datasource_id,
        project_id: this.getCurrentProjectID(),
        repository_pattern: this.codeScanSetting.repository_pattern,
        scan_public: Boolean(this.codeScanSetting.scan_public),
        scan_internal: Boolean(this.codeScanSetting.scan_internal),
        scan_private: Boolean(this.codeScanSetting.scan_private),
        status: 2, // CONFIGURED
        status_detail:
          'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
        scan_at: scan_at,
      }
      const codeScanSetting = await this.putCodeScanSettingAPI(
        paramCodeScanSetting
      ).catch((err) => {
        return Promise.reject(err)
      })
      return codeScanSetting
    },
    async handleGitHubEditSubmit() {
      if (!this.$refs.formGitHub.validate()) {
        return
      }
      this.loading = true
      try {
        const gitHubSetting = await this.editGitHubSetting().catch((err) => {
          this.$emit('edit-notify', '', this.getErrorMessage(err))
          return null
        })
        if (gitHubSetting === null) {
          return
        }
        if (!this.applyGitHubSetting(gitHubSetting)) {
          this.$emit('edit-notify', '', 'GitHub setting response is invalid.')
          return
        }
        if (this.isGitHubAppAuth) {
          await this.refreshGitHubAppInstallationStatus()
        }
        this.e6 = 2
      } finally {
        this.loading = false
      }
    },
    async handleGitHubAppUserVerification() {
      this.loading = true
      const returnTo = this.buildGitHubAppOAuthReturnTo()
      const oauthURL = await this.getGitHubAppOAuthStartURLAPI(
        this.gitHubSetting.github_setting_id,
        returnTo
      )
        .catch((err) => {
          this.$emit('edit-notify', '', this.getErrorMessage(err))
          return ''
        })
        .finally(() => {
          this.loading = false
        })
      if (!oauthURL) {
        return
      }
      if (!this.isAllowedGitHubAppOAuthURL(oauthURL)) {
        this.$emit('edit-notify', '', 'GitHub App OAuth URL is invalid.')
        return
      }
      window.location.href = oauthURL
    },
    async handleGitHubAppLinkFromDetail() {
      this.loading = true
      const gitHubSetting = await this.verifyGitHubAppInstallationAPI(
        this.gitHubSetting.github_setting_id
      )
        .catch((err) => {
          this.$emit('edit-notify', '', this.getErrorMessage(err))
          return null
        })
        .finally(() => {
          this.loading = false
        })
      if (gitHubSetting === null) {
        return
      }
      if (!this.applyGitHubSetting(gitHubSetting)) {
        this.$emit('edit-notify', '', 'GitHub setting response is invalid.')
        return
      }
      this.$emit('editGitHubSetting')
    },
    buildGitHubAppOAuthReturnTo() {
      const query = new URLSearchParams()
      query.set('project_id', this.$route.query.project_id)
      query.set('github_setting_id', this.gitHubSetting.github_setting_id)
      return `${this.$route.path}?${query.toString()}`
    },
    async handleGitHubAppResync() {
      this.loading = true
      const gitHubSetting = await this.verifyGitHubAppInstallationAPI(
        this.gitHubSetting.github_setting_id
      )
        .catch((err) => {
          this.$emit('edit-notify', '', this.getErrorMessage(err))
          return null
        })
        .finally(() => {
          this.loading = false
        })
      if (gitHubSetting === null) {
        return
      }
      if (!this.applyGitHubSetting(gitHubSetting)) {
        this.$emit('edit-notify', '', 'GitHub setting response is invalid.')
        return
      }
      this.$emit('edit-notify', 'Success: Resynced GitHub App repositories.')
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
      this.e6 = 4
    },
    async handleCodeScanEditSubmit() {
      if (this.isEnabledCodeScan && !this.$refs.formCodeScan.validate()) {
        return
      }
      this.loading = true
      const codeScanSetting = await this.editCodeScanSetting(
        this.gitHubSetting.github_setting_id
      )
        .catch((err) => {
          this.$emit('edit-notify', err)
          return
        })
        .finally(() => {
          this.loading = false
        })
      if (codeScanSetting) {
        this.codeScanSetting = codeScanSetting
      }
      this.$emit('edit-notify', 'Success: Updated.')
      if (this.isGitHubAppAuth) {
        this.e6 = 1
        return
      }
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
    async handleScanCodeScan() {
      this.loading = true
      if (!this.isEnabledCodeScan) {
        this.$emit('edit-notify', '', 'CodeScan is not enabled.')
        this.loading = false
        return
      }
      await this.invokeScanCodeScanAPI(this.gitHubSetting.github_setting_id)
        .catch((err) => {
          this.$emit('edit-notify', '', err.response.data)
        })
        .finally(() => {
          this.loading = false
        })
      this.$emit('edit-notify', 'Success: Invoke scan for CodeScan.')
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
    newCodeScanSetting() {
      this.codeScanSetting = {
        scan_public: true,
        scan_internal: true,
        scan_private: false,
      }
    },

    getGitHubTypeCode(typeText) {
      switch (typeText) {
        case 'Organization':
          return 1
        case 'User':
          return 2
        default:
          return 0 // Unknown
      }
    },
    handleChangeStatus() {
      this.e6 = 2
    },
    openGitleaksCacheDialog() {
      this.gitleaksCacheDialog = true
      this.githubSettingID = this.gitHubSetting.github_setting_id
    },
  },
}
</script>

<style>
.v-tab {
  text-transform: none !important;
}
.github-app-installation-warning {
  background-color: #fff4d6 !important;
  color: #4d3600 !important;
}
.github-app-installation-warning .v-alert__prepend {
  color: #8a6100 !important;
}
.github-app-installation-warning-link {
  color: #6b4900;
  font-weight: 600;
  text-decoration: underline;
}
</style>
