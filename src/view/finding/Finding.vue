<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="9">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue-lighten-2"
                >mdi-file-find-outline</v-icon
              >
              {{ $t(`submenu['Finding']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row justify="center" align-content="center">
          <v-col cols="2" class="px-1">
            <v-text-field
              variant="outlined"
              density="compact"
              clearable
              hide-details
              bg-color="white"
              :placeholder="searchForm.findingID.placeholder"
              :loading="loading"
              v-model="searchModel.findingID"
            />
          </v-col>
          <v-col cols="2" class="px-1">
            <v-text-field
              variant="outlined"
              density="compact"
              clearable
              hide-details
              bg-color="white"
              :placeholder="searchForm.alertID.placeholder"
              :loading="loading"
              v-model="searchModel.alertID"
            />
          </v-col>
          <v-col cols="3" class="px-1">
            <v-combobox
              multiple
              variant="outlined"
              density="compact"
              clearable
              hide-details
              bg-color="white"
              :label="$t(`item['` + searchForm.dataSource.label + `']`)"
              :placeholder="searchForm.dataSource.placeholder"
              :items="dataSourceList"
              :loading="loading"
              v-model="searchModel.dataSource"
              ref="refDataSource"
            />
          </v-col>
          <v-col cols="3" class="text-right">
            <v-slider
              variant="outlined"
              hide-details
              min="0.0"
              max="1.0"
              step="0.1"
              :label="$t(`item['` + searchForm.score.label + `']`)"
              v-model="searchModel.scoreFrom"
              thumb-label="always"
              :thumb-color="getColorByScore(searchModel.scoreFrom)"
            ></v-slider>
          </v-col>
          <v-col cols="2" class="px-1 text-right">
            <v-tooltip bottom>
              <template v-slot:activator="{ attrs }">
                <v-btn
                  v-bind="attrs"
                  size="large"
                  density="compact"
                  variant="outlined"
                  color="grey-darken-2"
                  @click="searchMenuDetail = !searchMenuDetail"
                  :icon="
                    searchMenuDetail ? 'mdi-chevron-up' : 'mdi-chevron-down'
                  "
                />
              </template>
              <span>search detail</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ attrs }">
                <v-btn
                  v-bind="attrs"
                  class="ml-2"
                  size="large"
                  density="compact"
                  variant="outlined"
                  color="indigo-darken-2"
                  @click="handleSearch"
                  :loading="loading"
                  risken-action-name="search-finding-by-condition-from-finding"
                  icon="mdi-magnify"
                />
              </template>
              <span>search</span>
            </v-tooltip>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  class="ml-2"
                  size="large"
                  density="compact"
                  variant="outlined"
                  color="green-darken-2"
                  :loading="loading"
                  icon="mdi-format-list-bulleted-square"
                >
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item
                  v-for="action in getSelectedActionList()"
                  :key="action.text"
                  @click="action.click"
                  :prepend-icon="action.icon"
                  :disabled="!table.selected || table.selected.length <= 0"
                >
                  <v-list-item-title class="ma-1">{{
                    $t(`action['` + action.text + `']`)
                  }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
        <transition name="fade">
          <div>
            <v-row v-show="searchMenuDetail">
              <v-col cols="3" class="px-1">
                <v-combobox
                  multiple
                  variant="outlined"
                  density="compact"
                  clearable
                  small-chips
                  deletable-chips
                  hide-details
                  bg-color="white"
                  :label="$t(`item['` + searchForm.tag.label + `']`)"
                  :placeholder="searchForm.tag.placeholder"
                  :items="searchForm.tagList"
                  :loading="loading"
                  v-model="searchModel.tag"
                  ref="refTag"
                />
              </v-col>

              <v-col cols="4" class="px-1">
                <v-combobox
                  multiple
                  variant="outlined"
                  density="compact"
                  clearable
                  small-chips
                  deletable-chips
                  hide-details
                  bg-color="white"
                  v-model="searchModel.resourceName"
                  :loading="loading"
                  :label="$t(`item['` + searchForm.resourceName.label + `']`)"
                  :placeholder="searchForm.resourceName.placeholder"
                  :items="resourceNameCombobox"
                  ref="refResourceName"
                  no-filter
                />
              </v-col>
            </v-row>

            <!-- SearchHistory -->
            <v-row v-show="searchMenuDetail">
              <v-col>
                <p class="ml-4">{{ $t(`view.finding['SearchHistory']`) }}</p>
              </v-col>
            </v-row>
            <v-row v-show="searchMenuDetail">
              <v-col class="pb-10">
                <v-slide-group show-arrows>
                  <v-slide-group-item
                    v-for="history in sortedFindingHistory"
                    :key="history.search_at"
                  >
                    <v-chip
                      :text="history.label"
                      label
                      closable
                      class="wrap mx-1"
                      @click="searchByHistory(history)"
                      @click:close="deleteSearchHistory(history)"
                      risken-action-name="search-finding-by-history-from-finding"
                    >
                      {{ history.label }}
                      <v-tooltip activator="parent" location="bottom"
                        ><span class="wrap">{{
                          history.tooltip
                        }}</span></v-tooltip
                      >
                    </v-chip>
                  </v-slide-group-item>
                </v-slide-group>
              </v-col>
            </v-row>
          </div>
        </transition>
      </v-form>

      <!-- Popular Search -->
      <v-row>
        <v-col class="pb-10">
          <v-slide-group show-arrows="false">
            <v-slide-group-item
              v-for="cond in popularSearchConditions"
              :key="cond.label"
            >
              <v-chip
                :text="cond.label"
                label
                color="indigo-darken-4"
                text-color="white"
                class="wrap mx-2"
                @click="searchByPopularCondition(cond)"
                risken-action-name="search-finding-by-popular-condition"
              >
                {{
                  $t(`view.finding.PopularSearch.label['` + cond.label + `']`)
                }}
                <v-tooltip activator="parent" location="bottom"
                  ><span class="wrap">{{
                    $t(
                      `view.finding.PopularSearch.tooltip['` + cond.label + `']`
                    )
                  }}</span></v-tooltip
                >
              </v-chip>
            </v-slide-group-item>
          </v-slide-group>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col>
          <v-tabs
            v-model="searchModel.tab"
            color="cyan-darken-3"
            fixed-tabs
            @update:modelValue="handleChangeStatus"
          >
            <v-tab class="mx-0 px-0">{{ $t(`view.finding['ACTIVE']`) }}</v-tab>
            <v-tab class="mx-0 px-0">{{ $t(`view.finding['PENDING']`) }}</v-tab>
            <v-tab class="mx-0 px-0">{{ $t(`view.finding['ALL']`) }}</v-tab>
          </v-tabs>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table-server
                :headers="headers"
                :items-length="table.total"
                :items="table.items"
                v-model:sort-by="table.options.sortBy"
                v-model:items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :show-current-page="table.footer.showCurrentPage"
                :items-per-page-text="table.footer.itemsPerPageText"
                :loading="loading"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="finding_id"
                @click:row="handleRowClick"
                @update:options="updateOptions"
                @update:sort-by="handleSort($event)"
                v-model="table.selected"
                show-select
              >
                <template v-slot:[`item.resource_name`]="{ item }">
                  {{ cutLongText(item.value.resource_name, 64) }}
                </template>
                <template v-slot:[`item.data_source`]="{ item }">
                  <v-layout justify-center>
                    <v-avatar
                      v-if="item.value.data_source == 'RISKEN'"
                      tile
                      class="ma-0"
                      size="30px"
                    >
                      <img src="/static/m.png" :alt="item.value.data_source" />
                    </v-avatar>
                    <v-icon
                      v-else
                      :color="getDataSourceIconColor(item.value.data_source)"
                    >
                      {{ getDataSourceIcon(item.value.data_source) }}
                    </v-icon>
                  </v-layout>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-icon
                    v-if="item.value.status"
                    :color="getColorByFindingStatus(item.value.status)"
                    >mdi-check-circle</v-icon
                  >
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:[`item.score`]="{ item }">
                  <v-chip
                    variant="flat"
                    :color="getColorByScore(item.value.score)"
                    >{{ formatScore(item.value.score) }}</v-chip
                  >
                </template>
                <template v-slot:[`item.tags`]="{ item }">
                  <v-chip prepend-icon="mdi-label">
                    <v-tooltip location="top" activator="parent" :scrim="false">
                      <v-chip
                        v-for="t in item.value.tags"
                        :key="t.finding_tag_id"
                        class="ma-1"
                        >{{ t.tag }}</v-chip
                      >
                    </v-tooltip>
                    {{ itemCount(item.value.tags) }}
                  </v-chip>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-dots-vertical"></v-icon>
                    </template>
                    <v-list class="pa-0" dense>
                      <v-list-item
                        v-for="action in getActionList(item)"
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
              </v-data-table-server>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="viewDialog" max-width="70%">
      <v-card>
        <v-toolbar>
          <v-card-title>{{ $t(`submenu['Finding']`) }}</v-card-title>
          <v-spacer />
          <v-btn
            v-if="canAttackFlowAnalyze(findingModel.resource_name)"
            color="blue-grey"
            variant="outlined"
            style="text-transform: none"
            class="mx-2"
            :to="{
              path: '/analysis/attack-flow/',
              query: { resource_name: findingModel.resource_name },
            }"
          >
            <template v-slot:prepend>
              <v-icon color="success">mdi-sitemap-outline</v-icon>
            </template>
            {{ $t(`action['Analyze Attack Flow']`) }}
          </v-btn>

          <v-btn
            color="blue-grey"
            variant="outlined"
            style="text-transform: none"
            @click="handleChatGPT"
          >
            <template v-slot:prepend>
              <v-icon color="purple">mdi-forum-outline</v-icon>
            </template>
            {{ $t(`btn['Summarize with ChatGPT']`) }}
          </v-btn>
        </v-toolbar>
        <v-container fluid>
          <v-row dense class="mx-2">
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  <v-icon
                    size="large"
                    color="black"
                    left
                    icon="mdi-identifier"
                  />
                  Finding ID
                  <clip-board
                    size="large"
                    name="Finding ID"
                    :text="String(findingModel.finding_id)"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ findingModel.finding_id }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  <v-icon
                    left
                    :color="getDataSourceIconColor(findingModel.data_source)"
                  >
                    {{ getDataSourceIcon(findingModel.data_source) }}
                  </v-icon>
                  {{ $t(`item['Data Source']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['Data Source']`)"
                    :text="findingModel.data_source"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ findingModel.data_source }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  <v-icon left>mdi-file-find-outline</v-icon>
                  {{ $t(`item['Resource Name']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['Resource Name']`)"
                    :text="findingModel.resource_name"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ findingModel.resource_name }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense class="mx-2">
            <v-col cols="12">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  <v-icon left>mdi-image-text</v-icon>
                  {{ $t(`item['Description']`) }}
                  <clip-board
                    size="large"
                    :name="$t(`item['Description']`)"
                    :text="findingModel.description"
                  />
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ findingModel.description }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
          </v-row>

          <v-row dense class="mx-2">
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  <v-icon :color="getColorByScore(findingModel.score)"
                    >mdi-scoreboard</v-icon
                  >
                  {{ $t(`item['Score']`) }}
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  <v-chip
                    variant="flat"
                    :color="getColorByScore(findingModel.score)"
                    >{{ formatScore(findingModel.score) }}</v-chip
                  >
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-subtitle>
                  <v-icon>mdi-scoreboard</v-icon>
                  {{ $t(`item['Original Score']`) }}
                </v-list-item-subtitle>
                <v-list-item-title class="text-h5">
                  {{ findingModel.original_score }}
                </v-list-item-title>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="recommendModel.recommend_id">
              <v-list-item-subtitle>
                <v-icon left>mdi-run</v-icon>
                {{ $t(`item['Recommend']`) }}
              </v-list-item-subtitle>
              <v-list-item-title>
                <v-btn
                  text
                  variant="outlined"
                  color="purple-darken-2"
                  class="ma-1"
                  :loading="loading"
                  @click="handleRecommendItem"
                >
                  {{ $t(`btn['Recommendation']`) }}
                </v-btn>
              </v-list-item-title>
            </v-col>
          </v-row>

          <template v-if="findingModel.status != 'ACTIVE'">
            <v-row dense class="mx-4">
              <v-col v-if="findingModel.pend_note != ''" cols="8">
                <v-list-item-subtitle>
                  <v-icon left>mdi-check-circle-outline</v-icon>
                  {{ $t(`view.finding['PENDING']`) }}
                </v-list-item-subtitle>
                <v-list-item-title>
                  <v-alert
                    border="start"
                    border-color="warning"
                    type="warning"
                    variant="outlined"
                  >
                    <p>
                      {{ findingModel.pend_note }}
                    </p>
                  </v-alert>
                </v-list-item-title>
              </v-col>
              <v-col
                v-if="findingModel.pend_expired != 0"
                cols="3"
                class="mx-4"
              >
                <v-list-item-subtitle>
                  <v-icon left>mdi-clock-outline</v-icon>
                  {{ $t(`item['Expired At']`) }}
                </v-list-item-subtitle>
                <v-list-item-title class="mt-4">
                  <v-chip>{{ formatTime(findingModel.pend_expired) }}</v-chip>
                </v-list-item-title>
              </v-col>
            </v-row>
          </template>

          <v-row dense class="mx-4">
            <v-col cols="12">
              <v-list-item-subtitle>
                <v-icon left>mdi-label</v-icon>
                {{ $t(`item['Tag']`) }}
                <v-btn
                  text
                  variant="outlined"
                  color="black-lighten-1"
                  class="ma-4"
                  :loading="loading"
                  @click="handleNewTag"
                >
                  {{ $t(`btn['NEW TAG']`) }}
                </v-btn>
              </v-list-item-subtitle>
              <v-list-item-title>
                <v-chip
                  v-for="tag in findingModel.tags"
                  :key="tag.finding_tag_id"
                  @click:close.stop.prevent="handleUntag(tag)"
                  class="mx-1"
                  closable
                  link
                  :to="{
                    path: '/finding/finding/',
                    query: { tag: tag.tag, from_score: 0 },
                  }"
                  target="_blank"
                  rel="noopener"
                  risken-action-name="search-finding-by-tag-from-finding"
                >
                  {{ tag.tag }}
                  <v-icon class="ml-1" color="grey">mdi-open-in-new</v-icon>
                </v-chip>
              </v-list-item-title>
            </v-col>
          </v-row>

          <v-row class="ma-2">
            <v-col cols="12">
              <v-list-item-subtitle>
                <v-icon left>mdi-code-json</v-icon>
                JSON Data
                <clip-board
                  size="large"
                  name="JSON Data"
                  :text="pretty(findingModel.data)"
                />
              </v-list-item-subtitle>
              <v-card dark color="grey-darken-3" class="ma-4">
                <v-card-text
                  class="title font-weight-bold"
                  density="comfortable"
                >
                  <json-viewer
                    :value="parseFindingData(findingModel.data)"
                    :expand-depth="5"
                    preview-mode
                    theme="finding-json-theme"
                  ></json-viewer>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row class="ma-2" v-if="getExternalLink(findingModel.data)">
            <v-col cols="12">
              <v-list-item-subtitle>
                <v-icon left>mdi-link</v-icon>
                {{ $t(`item['External Link']`) }}
              </v-list-item-subtitle>
              <a :href="getExternalLink(findingModel.data)" target="blank_">{{
                getExternalLink(findingModel.data)
              }}</a>
            </v-col>
          </v-row>
          <v-row class="ma-2">
            <v-col cols="4">
              <v-list-item-subtitle>
                <v-icon left>mdi-clock-outline</v-icon>
                {{ $t(`item['Created']`) }}
              </v-list-item-subtitle>
              <v-list-item-title>
                <v-chip>{{ formatTime(findingModel.created_at) }}</v-chip>
              </v-list-item-title>
            </v-col>
            <v-col cols="4">
              <v-list-item-subtitle>
                <v-icon left>mdi-clock-outline</v-icon>
                {{ $t(`item['Updated']`) }}
              </v-list-item-subtitle>
              <v-list-item-title>
                <v-chip>{{ formatTime(findingModel.updated_at) }}</v-chip>
              </v-list-item-title>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red-darken-1"
            text
            variant="outlined"
            @click="handleArchiveButtonClick"
          >
            {{ $t(`btn['ARCHIVE']`) }}
          </v-btn>
          <v-btn
            color="red-darken-1"
            text
            variant="outlined"
            @click="handlePendButtonClick"
          >
            {{ $t(`btn['PEND']`) }}
          </v-btn>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="viewDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="tagDialog" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="mx-4">New tag</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="findingModel.new_tag"
            label="tag"
            placeholder="key:value"
            variant="outlined"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="tagDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="blue-darken-1"
            text
            variant="outlined"
            :loading="loading"
            @click="handleNewTagSubmit"
          >
            {{ $t(`btn['TAG']`) }}
          </v-btn>
        </v-card-actions>
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
          <v-list-item>
            <template v-slot:prepend>
              <v-icon size="large" icon="mdi-identifier" />
            </template>
            <v-list-item-title>
              {{ findingModel.finding_id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Finding ID']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-file-find-outline">
            <v-list-item-title>
              {{ findingModel.resource_name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Resource Name']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-image-text">
            <v-list-item-title style="white-space: pre-wrap">
              {{ findingModel.description }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Description']`)
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

    <v-dialog v-model="pendDialog" max-width="40%">
      <v-card>
        <v-card-title class="text-h5">
          <span class="mx-4">
            {{ $t(pendDialogTitle) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-list two-line>
            <v-list-item prepend-icon="mdi-identifier">
              <v-list-item-title v-if="pendAll">
                {{ table.selected.length }} findings selected...
              </v-list-item-title>
              <v-list-item-title v-else>
                {{ findingModel.finding_id }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Finding ID']`) }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-image-text">
              <v-textarea
                variant="outlined"
                clearable
                clear-icon="mdi-close-circle"
                v-model="pendModel.note"
                :label="pendDialogNoteLabel"
              ></v-textarea>
            </v-list-item>
            <v-list-item
              v-if="!isArchived"
              prepend-icon="mdi-clock-time-eight-outline"
            >
              <v-combobox
                variant="outlined"
                density="compact"
                hide-no-data
                hide-details
                clearable
                bg-color="white"
                v-model="pendModel.expired_at"
                :loading="loading"
                :label="$t(`item['Expired At']`)"
                :items="pendExpiredItems"
              />
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="pendDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red-darken-1"
            v-if="pendAll"
            :text="$t(`btn['` + pendDialogSubmitButtonText + `']`)"
            variant="outlined"
            :loading="loading"
            @click="handlePendSelectedSubmit"
          />
          <v-btn
            color="red-darken-1"
            v-else
            :text="$t(`btn['` + pendDialogSubmitButtonText + `']`)"
            variant="outlined"
            :loading="loading"
            @click="handlePendItemSubmit"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="recommendDialog" max-width="60%">
      <v-card>
        <v-container>
          <v-row>
            <v-col cols="9">
              <v-card-title class="text-h5">
                <span class="mx-4">
                  {{ $t(`item['Recommendation']`) }}
                </span>
              </v-card-title>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-list-item prepend-icon="mdi-identifier">
                <v-list-item-title>
                  {{ recommendModel.recommend_id }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ $t(`item['Recommend ID']`) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="4">
              <v-list-item prepend-icon="mdi-identifier">
                <v-list-item-title>
                  {{ recommendModel.finding_id }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ $t(`item['Finding ID']`) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-list-item prepend-icon="mdi-tag-multiple">
                <v-list-item-title>
                  {{ recommendModel.type }}
                </v-list-item-title>
                <v-list-item-subtitle>{{
                  $t(`item['Type']`)
                }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item
                :prepend-icon="getDataSourceIcon(recommendModel.data_source)"
              >
                <v-list-item-title>
                  {{ recommendModel.data_source }}
                </v-list-item-title>
                <v-list-item-subtitle>{{
                  $t(`item['Data Source']`)
                }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-list-item prepend-icon="mdi-comment-alert-outline">
                <v-list-item class="pa-0 ma-0">
                  <auto-link :text="recommendModel.risk" />
                </v-list-item>
                <v-list-item-subtitle>{{
                  $t(`item['Risk']`)
                }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-alert
                type="info"
                icon="mdi-run"
                color="purple-lighten-2"
                prominent
                variant="outlined"
                border="start"
                border-color="purple-lighten-2"
                class="mb-4 mt-4 pa-6 font-weight-medium"
              >
                <auto-link :text="recommendModel.recommendation" />
              </v-alert>
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="recommendDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="aiDialog" max-width="60%">
      <v-card>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-list-item prepend-icon="mdi-chat">
                <v-list-item class="px-0 pt-10 ma-0">
                  {{ $t(`view.finding['ChatGPT Question-1']`) }}<br />
                  {{ $t(`view.finding['ChatGPT Question-2']`) }}<br />
                  <br />
                  {{ $t(`view.finding['ChatGPT Examples']`) }}
                </v-list-item>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-alert
                title="ChatGPT"
                type="success"
                icon="$success"
                variant="outlined"
                border="end"
                border-color="green-lighten-2"
                class="my-4 pl-6 pr-8 font-weight-medium"
              >
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  :size="40"
                  width="4"
                  color="green-darken-2"
                  class="ma-6 px-12"
                ></v-progress-circular>
                <v-card-text v-else class="text-sm-h6 ma-0 pa-0 wrap">
                  <auto-link :text="aiAnswer" />
                </v-card-text>
              </v-alert>
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="aiDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import Util from '@/util'
import store from '@/store'
import finding from '@/mixin/api/finding'
import alert from '@/mixin/api/alert'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
import JsonViewer from 'vue-json-viewer'
import AutoLink from '@/component/text/AutoLink.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
export default {
  name: 'FindingList',
  mixins: [mixin, finding, alert],
  components: {
    BottomSnackBar,
    ClipBoard,
    JsonViewer,
    AutoLink,
    VDataTableServer,
  },
  data() {
    return {
      loading: false,
      searchMenuDetail: false,
      searchModel: {
        findingID: '',
        alertID: '',
        dataSource: [],
        resourceName: [],
        tag: [],
        // score: [0.0, 1.0],
        scoreFrom: 0.5,
        scoreTo: 1.0,
        tab: 0,
        status: 1,
      },
      searchForm: {
        findingID: { label: 'ID', placeholder: 'ID' },
        alertID: { label: 'AlertID', placeholder: 'AlertID' },
        dataSource: {
          label: 'Data Source',
          placeholder: 'Filter data sources',
        },
        resourceName: {
          label: 'Resource Name',
          placeholder: 'Filter resource',
        },
        tag: { label: 'Tag', placeholder: 'Filter tag' },
        score: { label: 'Score', placeholder: 'Filter score' },
        tagList: [],
      },
      findingModel: {
        finding_id: '',
        status: '',
        score: '',
        original_score: '',
        data_source: '',
        resource_name: '',
        description: '',
        tags: [],
        data: '',
        created_at: '',
        updated_at: '',
        new_tag: '',
        pend_note: '',
      },
      viewDialog: false,
      tagDialog: false,
      deleteDialog: false,
      pendDialog: false,
      recommendDialog: false,
      recommendModel: {
        recommend_id: '',
        finding_id: '',
        data_source: '',
        type: '',
        risk: '',
        recommendation: '',
      },
      pendModel: {
        finding_id: '',
        note: '',
        expired_at: '',
      },
      pendExpiredItems: [
        '3 days',
        '7 days',
        '30 days',
        '90 days',
        'No expiration',
      ],
      popularSearchConditions: [
        { label: 'ALL', search_condition: { status: 1, from_score: 0.0 } },
        {
          label: 'HighScore',
          search_condition: { status: 1, from_score: 0.8 },
        },
        {
          label: 'AWS',
          search_condition: {
            status: 1,
            from_score: 0.5,
            dataSource: ['aws:'],
          },
        },
        {
          label: 'GCP',
          search_condition: {
            status: 1,
            from_score: 0.5,
            dataSource: ['google:'],
          },
          tooltip: '',
        },
        {
          label: 'SecretKey',
          search_condition: {
            status: 1,
            from_score: 0.5,
            dataSource: ['code:gitleaks'],
          },
        },
        {
          label: 'WordPress',
          search_condition: {
            status: 1,
            from_score: 0.5,
            dataSource: ['diagnosis:wpscan'],
          },
        },
        {
          label: 'IAM',
          search_condition: { status: 1, from_score: 0.5, tag: ['IAM'] },
        },
        {
          label: 'PublicFacing',
          search_condition: {
            status: 1,
            from_score: 0.5,
            tag: ['PublicFacing'],
          },
        },
      ],
      isArchived: false,
      pendAll: false,
      table: {
        selected: [],
        options: {
          page: 1,
          itemsPerPage: 20,
          sortBy: ['id', 'score', 'data_source', 'resource', 'description'],
        },
        sort: {
          key: 'finding_id',
          direction: 'asc',
        },
        total: 0,
        footer: {
          itemsPerPageOptions: [
            { value: 20, title: '20' },
            { value: 50, title: '50' },
            { value: 100, title: '100' },
          ],
          itemsPerPageText: 'Rows/Page',
          showCurrentPage: true,
        },
        items: [],
      },
      findingHistory: [],
      aiDialog: false,
      aiAnswer: '',
    }
  },
  filters: {},
  computed: {
    headers() {
      return [
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'center',
          width: '5%',
          key: 'finding_id',
        },
        {
          title: this.$i18n.t('item["Status"]'),
          align: 'center',
          width: '10%',
          key: 'status',
          sortable: false,
        },
        {
          title: this.$i18n.t('item["Score"]'),
          align: 'center',
          width: '5%',
          key: 'score',
        },
        {
          title: this.$i18n.t('item["Data Source"]'),
          align: 'center',
          width: '10%',
          key: 'data_source',
        },
        {
          title: this.$i18n.t('item["Resource"]'),
          align: 'start',
          width: '30%',
          key: 'resource_name',
        },
        {
          title: this.$i18n.t('item["Description"]'),
          align: 'start',
          width: '30%',
          key: 'description',
        },
        {
          title: this.$i18n.t('item["Tags"]'),
          align: 'start',
          width: '5%',
          key: 'tags',
          sortable: false,
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          width: '5%',
          key: 'action',
          sortable: false,
        },
      ]
    },
    sortedFindingHistory() {
      return this.findingHistory.slice().sort((a, b) => {
        return b.search_at - a.search_at // desc
      })
    },
    formatScore() {
      return (score) => {
        if (!Number.isInteger(score)) {
          return score
        }
        return score.toFixed(2)
      }
    },
    itemCount() {
      return (items) => {
        if (items && items.length) {
          return items.length
        }
        return 0
      }
    },
    pendDialogTitle() {
      if (this.isArchived) {
        return `message['Do you want to archive this?']`
      }
      return `message['Do you want to update PENDING this?']`
    },
    pendDialogNoteLabel() {
      if (this.isArchived) {
        return 'archive note'
      }
      return 'pending note'
    },
    pendDialogSubmitButtonText() {
      let label = ''
      if (this.isArchived) {
        label = 'ARCHIVE'
      } else {
        label = 'PEND'
      }
      if (this.pendAll) {
        label += ' ALL'
      }
      return label
    },
  },
  async mounted() {
    this.UpdateAlertFirstViewedAt()
    this.findingHistory = this.getSearchHistory()
    this.getTag()
    this.listResourceNameForCombobox()
    this.refleshList(true)
  },
  methods: {
    refleshList(parse) {
      this.table.options.page = 1
      this.table.total = 0
      this.loadList(parse)
    },
    updateOptions(options) {
      this.table.options.page = options.page
      this.table.options.itemsPerPage = options.itemsPerPage
      this.loadList(true)
    },
    async loadList(parse) {
      this.loading = true
      this.clearList()
      if (parse) {
        this.parseQuery()
      }
      const list = await this.listFinding(this.getSearchCondition())
      if (!list.finding_id || list.finding_id.length == 0) {
        this.loading = false
        return
      }
      this.table.total = list.total
      let findings = []
      for (const id of list.finding_id) {
        findings.push(this.getFindingDetail(id))
      }
      this.table.items = await Promise.all(findings) // Parallel API call
      this.loading = false
    },
    async getFindingDetail(id) {
      const [finding, tag, pend] = await Promise.all([
        this.getFinding(id),
        this.listFindingTag(id),
        this.getPendFinding(id),
      ])
      return {
        finding_id: id,
        status: this.isPending(pend),
        score: finding.score,
        original_score: finding.original_score,
        data_source: finding.data_source,
        resource_name: finding.resource_name,
        description: finding.description,
        tags: tag,
        data: finding.data,
        updated_at: finding.updated_at,
        created_at: finding.created_at,
        pend_note: pend.note ? pend.note : '',
        pend_expired: pend.expired_at ? pend.expired_at : 0,
      }
    },
    clearList() {
      this.table.items = []
    },
    isPending(pend) {
      if (!pend.finding_id) {
        return 'ACTIVE'
      }
      if (pend.expired_at && pend.expired_at < Math.floor(Date.now() / 1000)) {
        return 'ACTIVE'
      }
      return 'PENDING'
    },

    async getTag() {
      this.searchForm.tagList = []
      const tag = await this.listFindingTagName()
      this.searchForm.tagList = tag
    },
    getActionList(item) {
      let list = [
        { text: 'View Finding', icon: 'mdi-eye', click: this.handleViewItem },
      ]
      if (!item.value.status) return list
      if (item.value.status === 'ACTIVE') {
        list.push({
          text: 'Archive Finding',
          icon: 'mdi-archive',
          click: this.handleArchiveItem,
        })
        list.push({
          text: 'Pend Finding',
          icon: 'mdi-check-circle-outline',
          click: this.handlePendItem,
        })
      } else {
        list.push({
          text: 'Activate Finding',
          icon: 'mdi-check-circle',
          click: this.handleActivateItem,
        })
      }
      list.push({
        text: 'Delete Finding',
        icon: 'mdi-trash-can-outline',
        click: this.handleDeleteItem,
      })
      return list
    },
    getSelectedActionList() {
      let list = []
      if (this.searchModel.status != this.getFindingStatus('PENDING')) {
        list.push({
          text: 'Archive selected findings',
          icon: 'mdi-archive',
          click: this.handleArchiveSelected,
        })
        list.push({
          text: 'Pend selected findings',
          icon: 'mdi-check-circle-outline',
          click: this.handlePendSelected,
        })
      }
      if (this.searchModel.status != this.getFindingStatus('ACTIVE')) {
        list.push({
          text: 'Activate selected findings',
          icon: 'mdi-check-circle',
          click: this.handleActivateSelected,
        })
      }
      list.push({
        text: 'Delete selected findings',
        icon: 'mdi-trash-can-outline',
        click: this.handleDeleteSelected,
      })
      list.push({
        text: 'Download selected findings CSV',
        icon: 'mdi-file-download-outline',
        click: this.handleDownloadCSVSelected,
      })
      return list
    },
    getExternalLink(data) {
      if (!data) {
        return ''
      }
      const jsonData = JSON.parse(JSON.stringify(JSON.parse(data), null, 2))
      if (jsonData.external_link) {
        return jsonData.external_link
      }
      return ''
    },

    // handler
    async handleRowClick(event, findings) {
      this.handleViewItem(findings.item)
    },
    async handleViewItem(item) {
      this.findingModel = Object.assign(this.findingModel, item.value)
      this.recommendModel = await this.getRecommend(
        this.findingModel.finding_id
      )
      this.orverrideRecommend()
      this.viewDialog = true
    },
    orverrideRecommend() {
      const d = JSON.parse(this.findingModel.data)
      switch (this.findingModel.data_source) {
        case 'google:scc':
          if (d.source_properties.Recommendation) {
            this.recommendModel.recommendation =
              d.source_properties.Recommendation
          }
          break
        case 'aws:guard-duty':
          if (d.Title && d.Description) {
            this.recommendModel.risk = d.Title + '\n- ' + d.Description
          }
          break
        case 'diagnosis:application-scan':
          this.recommendModel.recommendation =
            this.recommendModel.recommendation.replaceAll(
              '\nPhase:',
              '\n\nPhase:'
            )
          break
        default:
          break
      }
    },
    parseQuery() {
      if (!this.$route.query) return
      const query = this.$route.query
      if (query.finding_id && query.finding_id != '') {
        this.searchModel.findingID = query.finding_id
      }
      if (query.alert_id && query.alert_id != '') {
        this.searchModel.alertID = query.alert_id
      }
      if (query.data_source && query.data_source != '') {
        this.searchModel.dataSource = String(query.data_source).split(',')
      }
      if (query.tag && query.tag != '') {
        this.searchModel.tag = String(query.tag).split(',')
      }
      if (query.resource_name && query.resource_name != '') {
        this.searchModel.resourceName = String(query.resource_name).split(',')
      }
      this.searchModel.scoreFrom = 0.5
      this.searchModel.scoreTo = 1.0
      if (query.from_score) {
        this.searchModel.scoreFrom = query.from_score
      }
      this.searchModel.status = this.getFindingStatus('ACTIVE')
      if (query.status) {
        this.searchModel.status = query.status
      }
      this.setStatusTab()
    },
    getSearchCondition() {
      let searchCond = ''
      let queryOld = this.$route.query
      let queryNew = {}
      if (this.searchModel.findingID) {
        searchCond += '&finding_id=' + this.searchModel.findingID
        queryNew.finding_id = this.searchModel.findingID
      }
      if (this.searchModel.alertID) {
        searchCond += '&alert_id=' + this.searchModel.alertID
        queryNew.alert_id = this.searchModel.alertID
      }
      if (this.searchModel.dataSource) {
        searchCond +=
          '&data_source=' + encodeURIComponent(this.searchModel.dataSource)
        queryNew.data_source = this.searchModel.dataSource
      }
      if (this.searchModel.tag) {
        searchCond += '&tag=' + encodeURIComponent(this.searchModel.tag)
        queryNew.tag = this.searchModel.tag
      }
      if (this.searchModel.resourceName) {
        searchCond +=
          '&resource_name=' + encodeURIComponent(this.searchModel.resourceName)
        queryNew.resource_name = this.searchModel.resourceName
      }
      if (!this.searchModel.scoreFrom) {
        this.searchModel.scoreFrom = 0
      }
      searchCond += '&from_score=' + this.searchModel.scoreFrom
      queryNew.from_score = this.searchModel.scoreFrom
      if (this.searchModel.status) {
        searchCond += '&status=' + this.searchModel.status
        queryNew.status = this.searchModel.status
      }
      const offset =
        (this.table.options.page - 1) * this.table.options.itemsPerPage
      const limit = this.table.options.itemsPerPage
      const sort = this.table.sort.key
      const direction = this.table.sort.direction
      searchCond +=
        '&offset=' +
        offset +
        '&limit=' +
        limit +
        '&sort=' +
        sort +
        '&direction=' +
        direction
      if (
        Object.entries(queryNew).sort().toString() !=
        Object.entries(queryOld).sort().toString()
      ) {
        this.$router.push({ query: queryNew })
      }
      return searchCond
    },
    handleSort(newSort) {
      const newSortKey = newSort[0].key
      const oldKey = this.table.sort.key
      const oldDirection = this.table.sort.direction
      if (oldKey === newSortKey) {
        this.table.sort.direction = oldDirection === 'asc' ? 'desc' : 'asc' // reverse direction
      } else {
        this.table.sort.key = newSortKey
        this.table.sort.direction = 'asc'
      }
      this.refleshList()
    },
    handleSearch() {
      this.$refs.refDataSource.blur()
      this.$refs.refTag.blur()
      this.$refs.refResourceName.blur()
      this.$nextTick(() => {
        this.refleshList()
        this.updateSearchHistory()
      })
    },
    handleNewTag() {
      this.findingModel.new_tag = '' // clear
      this.tagDialog = true
    },
    async handleNewTagSubmit() {
      this.loading = true
      if (this.findingModel.finding_id && this.findingModel.new_tag) {
        await this.tagFinding(
          this.findingModel.finding_id,
          this.findingModel.new_tag
        )
        this.finishSuccess(
          'Success: New Tag `' + this.findingModel.new_tag + '`.'
        )
      }
      this.tagDialog = false
      this.loading = false
    },
    async handleUntag(item) {
      this.loading = true
      if (item.finding_tag_id) {
        await this.untagFinding(item.finding_tag_id)
        this.finishSuccess('Success: Untag `' + item.tag + '`.')
      }
      this.viewDialog = false
      this.loading = false
    },
    // Delete
    handleDeleteItem(row) {
      this.findingModel = Object.assign(this.findingModel, row.value)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.deleteFinding(this.findingModel.finding_id)
      this.finishSuccess('Success: Delete.')
    },
    async handleDeleteSelected() {
      this.loading = true
      const count = this.table.selected.length
      this.table.selected.forEach(async (item) => {
        if (!item.finding_id) return
        await this.deleteFinding(item.finding_id)
      })
      this.table.selected = []
      this.finishSuccess('Success: Delete ' + count + ' findings.')
    },
    async handleActivateItem(row) {
      this.loading = true
      await this.deletePendFinding(
        this.getCurrentProjectID(),
        row.value.finding_id
      )
      this.finishSuccess('Success: Activated.')
    },
    async handleActivateSelected() {
      this.loading = true
      const count = this.table.selected.length
      this.table.selected.forEach(async (item) => {
        if (!item.finding_id) return
        await this.deletePendFinding(
          this.getCurrentProjectID(),
          item.finding_id
        )
      })
      this.table.selected = []
      this.finishSuccess('Success: Activated ' + count + ' findings.')
    },
    // Pend
    handleArchiveButtonClick() {
      this.pendAll = false
      this.isArchived = true
      this.pendDialog = true
    },
    handlePendButtonClick() {
      this.pendAll = false
      this.isArchived = false
      this.pendDialog = true
    },
    handleArchiveItem(row) {
      this.findingModel = Object.assign(this.findingModel, row.value)
      this.pendModel = {
        finding_id: this.findingModel.finding_id,
        note: '',
        expired_at: null,
      }
      this.pendAll = false
      this.isArchived = true
      this.pendDialog = true
    },
    handlePendItem(row) {
      this.findingModel = Object.assign(this.findingModel, row.value)
      this.pendAll = false
      this.pendModel.note = ''
      this.isArchived = false
      this.pendDialog = true
    },
    async handlePendItemSubmit(isArchived) {
      this.loading = true
      await this.putPendFinding(
        this.findingModel.finding_id,
        this.pendModel.note,
        this.getPendExpiredSecound(this.pendModel.expired_at)
      )
      if (isArchived) {
        this.finishSuccess('Success: Archived.')
        return
      }
      this.finishSuccess('Success: Pending.')
    },
    async handleArchiveSelected() {
      this.pendAll = true
      this.pendModel.note = ''
      this.pendModel.expired_at = null
      this.isArchived = true
      this.pendDialog = true
    },
    async handlePendSelected() {
      this.pendAll = true
      this.pendModel.note = ''
      this.isArchived = false
      this.pendDialog = true
    },
    async handlePendSelectedSubmit(isArchived) {
      this.loading = true
      const count = this.table.selected.length
      this.table.selected.forEach(async (item) => {
        if (!item.finding_id) return
        await this.putPendFinding(
          item.finding_id,
          this.pendModel.note,
          this.getPendExpiredSecound(this.pendModel.expired_at)
        )
      })
      this.table.selected = []
      if (isArchived) {
        this.finishSuccess('Success: Archived ' + count + ' findings.')
        return
      }
      this.finishSuccess('Success: Pend ' + count + ' findings.')
    },
    getPendExpiredSecound(expiredAt) {
      const nowUnix = Math.floor(Date.now() / 1000)
      const oneDaySec = 86400
      switch (expiredAt) {
        case 'No expiration':
          return null
        case '3 days':
          return nowUnix + oneDaySec * 3
        case '7 days':
          return nowUnix + oneDaySec * 7
        case '30 days':
          return nowUnix + oneDaySec * 30
        case '90 days':
          return nowUnix + oneDaySec * 90
        default:
          return null
      }
    },

    async handleRecommendItem() {
      this.recommendDialog = true
    },
    handleChangeStatus(tabNumber) {
      switch (tabNumber) {
        case 0:
          this.searchModel.status = this.getFindingStatus('ACTIVE')
          break
        case 1:
          this.searchModel.status = this.getFindingStatus('PENDING')
          break
        case 2:
          this.searchModel.status = this.getFindingStatus('ALL')
          break
        default:
          this.searchModel.status = this.getFindingStatus('ACTIVE')
      }
      this.loadList()
    },
    setStatusTab() {
      const status = this.getFindingStatusText(this.searchModel.status)
      switch (status) {
        case 'ACTIVE':
          this.searchModel.tab = 0
          break
        case 'PENDING':
          this.searchModel.tab = 1
          break
        case 'ALL':
          this.searchModel.tab = 2
          break
        default:
          this.searchModel.tab = 0
      }
    },

    // ChatGPT
    async handleChatGPT() {
      this.aiAnswer = ''
      this.loading = true
      this.aiDialog = true

      // api
      this.aiAnswer = await this.getAISummary(
        this.findingModel.finding_id,
        this.$i18n.locale
      ).catch((err) => {
        this.loading = false
        return Promise.reject(err)
      })
      this.loading = false
    },

    // CSV
    handleDownloadCSVSelected() {
      this.loading = true
      const count = this.table.selected.length
      let csv =
        '\ufeff' +
        'finding_id,data_source,description,score,status,tags,created_at,updtated_at\n'
      this.table.selected.forEach((item) => {
        let created_at = Util.formatDate(
          new Date(item.created_at * 1000),
          'yyyy/MM/dd HH:mm'
        )
        let updated_at = Util.formatDate(
          new Date(item.updated_at * 1000),
          'yyyy/MM/dd HH:mm'
        )
        if (!item.finding_id) return
        let tags = ''
        if (item.tags && Array.isArray(item.tags)) {
          tags = item.tags.map((tag) => tag.tag).join(',')
        }
        const line =
          '' +
          item['finding_id'] +
          ',"' +
          item['data_source'] +
          '","' +
          item['description'] +
          '",' +
          item['score'] +
          ',"' +
          item['status'] +
          '","' +
          tags +
          '","' +
          created_at +
          '","' +
          updated_at +
          '"\n'
        csv += line
      })
      let blob = new Blob([csv], { type: 'text/csv' })
      let link = document.createElement('a')
      let fileDate = Util.formatDate(new Date(), 'yyyyMMddTHHmmss')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'finding_' + fileDate + '.csv'
      link.click()
      this.finishSuccess('Success: Export ' + count + ' findings.')
    },

    // searchHistory
    getSearchHistory() {
      if (this.$store.state.findingHistory) {
        return this.$store.state.findingHistory
      }
      return []
    },
    async deleteSearchHistory(target) {
      let history = []
      for (const h of this.getSearchHistory()) {
        if (h.search_at == target.search_at) {
          continue
        }
        history.push(h)
      }
      await store.commit('updateFindingHistory', history)
      this.findingHistory = history
    },
    async searchByHistory(target) {
      this.searchModel = Object.assign(
        this.searchModel,
        target.search_condition
      ) // merge & ovveride
      this.refleshList()
      await this.updateSearchHistory()
    },
    async searchByPopularCondition(target) {
      this.searchModel = Object.assign(
        this.searchModel,
        target.search_condition
      ) // merge & ovveride
      this.refleshList()
      await this.updateSearchHistory()
    },
    async updateSearchHistory() {
      const currentSearch = {
        search_at: Date.now(),
        label: this.getSearchHistoryLabel(),
        tooltip: this.getSearchHistoryTooltip(),
        search_condition: Object.assign({}, this.searchModel), // copy obj
      }
      let history = []
      let existsHistory = false
      for (const h of this.getSearchHistory()) {
        if (h.tooltip === currentSearch.tooltip) {
          history.push(currentSearch)
          existsHistory = true
        } else {
          history.push(h)
        }
      }
      if (!existsHistory) {
        history.push(currentSearch)
      }

      this.findingHistory = []
      await this.findingHistory.push(...history)
      this.findingHistory = await this.findingHistory.slice().sort((a, b) => {
        return b.search_at - a.search_at
      }) // desc
      if (this.findingHistory.length > 30) {
        this.findingHistory.pop()
      }
      await store.commit('updateFindingHistory', this.findingHistory)
    },
    getSearchHistoryLabel() {
      let labels = []
      if (this.searchModel.findingID) {
        labels.push(this.searchModel.findingID)
      }
      if (this.searchModel.dataSource) {
        for (const ds of this.searchModel.dataSource) {
          labels.push(ds)
        }
      }
      if (this.searchModel.tag) {
        for (const t of this.searchModel.tag) {
          labels.push(t)
        }
      }
      if (this.searchModel.resourceName) {
        for (const rn of this.searchModel.resourceName) {
          labels.push(rn)
        }
      }
      if (this.searchModel.alertID) {
        labels.push('alert:' + this.searchModel.alertID)
      }
      labels.push('score:' + this.searchModel.scoreFrom)

      let formatedLabel = ''
      for (const l of labels) {
        if (formatedLabel.length > 0) {
          formatedLabel = formatedLabel + ', '
        }
        formatedLabel = formatedLabel + l
        if (formatedLabel.length > 15) {
          formatedLabel = formatedLabel + '...'
          return formatedLabel
        }
      }
      return formatedLabel
    },
    getSearchHistoryTooltip() {
      let tooltip = ''
      if (this.searchModel.findingID) {
        tooltip += '- finding_id: ' + this.searchModel.findingID + '\n'
      }
      if (
        this.searchModel.dataSource &&
        this.searchModel.dataSource.length > 0
      ) {
        tooltip += '- data_source: ' + this.searchModel.dataSource + '\n'
      }
      if (this.searchModel.tag && this.searchModel.tag.length > 0) {
        tooltip += '- tag: ' + this.searchModel.tag + '\n'
      }
      if (
        this.searchModel.resourceName &&
        this.searchModel.resourceName.length > 0
      ) {
        tooltip += '- resource_name: ' + this.searchModel.resourceName + '\n'
      }
      if (this.searchModel.alertID) {
        tooltip += '- alert_id: ' + this.searchModel.alertID + '\n'
      }
      tooltip += '- score: ' + this.searchModel.scoreFrom + '\n'
      return tooltip
    },

    // finish
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
      this.viewDialog = false
      this.deleteDialog = false
      this.pendDialog = false
      this.tagDialog = false
      if (reflesh) {
        this.handleSearch()
      }
    },
    parseFindingData(v) {
      if (!v) {
        return {}
      }
      return JSON.parse(v)
    },
  },
}
</script>

<style lang="scss">
.finding-json-theme {
  background: #424242;
  white-space: nowrap;
  color: #eee;
  font-size: 18px;

  .jv-ellipsis {
    color: #eee;
    background-color: #424242;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }
  .jv-button {
    color: #49b3ff;
  }
  .jv-key {
    color: rgb(181, 216, 55);
  }
  .jv-link {
    color: #068cca;
  }
  .jv-item {
    &.jv-array {
      color: #eee;
    }
    &.jv-boolean {
      color: #b3e5fc;
    }
    &.jv-function {
      color: #068cca;
    }
    &.jv-number {
      color: #42b983;
    }
    &.jv-number-float {
      color: #42b983;
    }
    &.jv-number-integer {
      color: #42b983;
    }
    &.jv-object {
      color: #eee;
    }
    &.jv-undefined {
      color: #e08331;
    }
    &.jv-string {
      color: #eee;
      word-break: break-word;
      white-space: normal;
    }
  }
  .jv-code {
    padding: 1px;
    line-height: 2rem;
    .jv-toggle {
      &:before {
        padding: 0px 2px;
        border-radius: 2px;
      }
      &:hover {
        &:before {
          background: #eee;
        }
      }
    }
  }
}
.wrap {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
