<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @click:outside="handleClickOutside"
    max-width="70%"
    persistent
    :retain-focus="false"
  >
    <v-card>
      <v-toolbar>
        <copy-link :url="getPageUrl" />
        <v-card-title class="mx-0 px-0">{{
          $t(`submenu['Finding']`)
        }}</v-card-title>
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
          icon
          color="grey-darken-1"
          @click="close"
          size="x-small"
          variant="tonal"
        >
          <v-icon color="grey-darken-1">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-container fluid>
        <v-row dense class="mx-2">
          <v-col cols="3">
            <v-list-item two-line>
              <v-list-item-subtitle>
                <v-icon size="large" color="black" left icon="mdi-identifier" />
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
          <v-col cols="2">
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
                  @click="handleTriageClick"
                  style="cursor: pointer"
                  >{{ formatScore(findingModel.score) }}</v-chip
                >
              </v-list-item-title>
            </v-list-item>
          </v-col>
          <v-col cols="2">
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
        <v-row dense class="ma-2">
          <v-col cols="8">
            <v-list-item-subtitle class="my-1">
              <v-icon left>mdi-gesture-tap</v-icon>
              {{ $t(`item['Action']`) }}
            </v-list-item-subtitle>
            <v-list-item-title>
              <v-btn
                color="red-darken-1"
                text
                variant="outlined"
                class="mx-2"
                @click="handleArchiveButtonClick"
              >
                {{ $t(`btn['ARCHIVE']`) }}
              </v-btn>
              <v-btn
                color="red-darken-1"
                text
                variant="outlined"
                class="mx-2"
                @click="handlePendButtonClick"
              >
                {{ $t(`btn['PEND']`) }}
              </v-btn>
              <v-btn
                v-if="!isOrganizationMode"
                color="blue-grey"
                variant="outlined"
                style="text-transform: none"
                class="mx-2"
                @click="handleGenerativeAI"
              >
                <template v-slot:prepend>
                  <v-icon color="purple">mdi-forum-outline</v-icon>
                </template>
                {{ $t(`btn['Chat with AI']`) }}
              </v-btn>
            </v-list-item-title>
          </v-col>
        </v-row>

        <template v-if="findingModel.status != 'ACTIVE'">
          <v-row v-if="findingModel.pendModel.note != ''" class="mx-4">
            <v-col cols="12">
              <v-list-item-subtitle>
                <v-icon left>mdi-check-circle-outline</v-icon>
                {{ $t(`view.finding['ARCHIVE']`) }}
              </v-list-item-subtitle>
              <v-list-item-title>
                <v-alert
                  border="start"
                  border-color="warning"
                  type="warning"
                  variant="outlined"
                >
                  <Markdown
                    breaks
                    linkify
                    :source="findingModel.pendModel.note"
                  />
                </v-alert>
              </v-list-item-title>
            </v-col>
          </v-row>
          <v-row v-if="findingModel.pendModel.pend_user" class="mx-4 my-1">
            <v-col cols="3">
              <v-list-item-subtitle>
                <v-icon left>mdi-account-outline</v-icon>
                {{ $t(`item['Archived By']`) }}
              </v-list-item-subtitle>
              <v-list-item-title align="center">
                <v-chip>{{ findingModel.pendModel.pend_user }}</v-chip>
              </v-list-item-title>
            </v-col>
            <v-col v-if="findingModel.pendModel.expired_at" cols="3">
              <v-list-item-subtitle>
                <v-icon left>mdi-clock-outline</v-icon>
                {{ $t(`item['Expired At']`) }}
              </v-list-item-subtitle>
              <v-list-item-title>
                <v-chip>{{
                  formatTime(findingModel.pendModel.expired_at)
                }}</v-chip>
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
        <v-row>
          <v-col cols="12">
            <AIPanel :loading="loading" :ai-answer="aiAnswer" />
          </v-col>
        </v-row>

        <v-row class="mx-2 my-0">
          <v-col cols="11 py-0 dense-list">
            <v-list-item-subtitle>
              <v-icon left>mdi-link-variant</v-icon>
              URL
            </v-list-item-subtitle>
            <v-list class="py-0 dense-list">
              <v-list-item
                v-for="(urlItem, index) in findingModel.urls"
                :key="index"
                :href="urlItem.url"
                target="_blank"
                rel="noopener"
                class="my-0 py-0"
                density="compact"
              >
                <v-list-item-content class="text-truncate">
                  <span class="d-flex">
                    <v-icon size="small" color="grey-darken-2" class="mx-2"
                      >mdi-open-in-new</v-icon
                    >
                    <span class="text-grey-darken-2">{{ urlItem.label }}:</span>
                    <span class="ml-2 font-italic text-truncate url-link">{{
                      urlItem.url
                    }}</span>
                  </span>
                </v-list-item-content>
              </v-list-item>
            </v-list>
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
            <json-view :jsonData="findingModel.data" />
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
        <v-btn text variant="outlined" color="grey-darken-1" @click="close">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <FindingTriageDialog v-model="triageDialog" :triage-data="getTriageData" />
</template>

<script>
import mixin from '@/mixin'
import organization_helper from '@/mixin/helper/organization_helper'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
import JsonView from '@/component/text/JsonView.vue'
import AIPanel from '@/component/text/AIPanel.vue'
import FindingTriageDialog from '@/component/dialog/finding/Triage.vue'
import CopyLink from '@/component/link/CopyLink.vue'
import Markdown from '@/component/text/Markdown.vue'

export default {
  name: 'FindingDetailDialog',
  components: {
    ClipBoard,
    JsonView,
    AIPanel,
    FindingTriageDialog,
    CopyLink,
    Markdown,
  },
  mixins: [mixin, organization_helper],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    findingModel: {
      type: Object,
      required: true,
    },
    recommendModel: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    aiAnswer: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      triageDialog: false,
    }
  },
  computed: {
    formatScore() {
      return (score) => {
        if (!Number.isInteger(score)) {
          return score
        }
        return score.toFixed(2)
      }
    },
    getTriageData() {
      if (!this.findingModel.data) {
        return {}
      }
      try {
        const data = JSON.parse(this.findingModel.data)
        return data.risken_triage?.assessment || {}
      } catch (e) {
        return {}
      }
    },
    getPageUrl() {
      const baseUrl = window.location.origin
      return `${baseUrl}/finding/finding?from_score=0&status=0&project_id=${this.$route.query.project_id}&finding_id=${this.findingModel.finding_id}`
    },
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
    async handleGenerativeAI() {
      const context =
        'Detected the following finding data:\n\n' +
        '\n\n## Finding Data:\n' +
        JSON.stringify(this.findingModel, null, 2) +
        '\n\n## AI Summary:\n' +
        this.aiAnswer

      this.$root.$refs.aiChatRef.open({
        name: 'Finding Detail',
        content: context,
      })
    },
    handleRecommendItem() {
      this.$emit('recommend')
    },
    handleArchiveButtonClick() {
      this.$emit('archive')
    },
    handlePendButtonClick() {
      this.$emit('pend')
    },
    handleNewTag() {
      this.$emit('new-tag')
    },
    handleUntag(tag) {
      this.$emit('untag', tag)
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
    handleTriageClick() {
      this.triageDialog = true
    },
    handleClickOutside(event) {
      const chatEl = document.getElementById('ai-chat-window')
      if (
        chatEl &&
        (event.target === chatEl || chatEl.contains(event.target))
      ) {
        this.$emit('update:modelValue', true)
        return
      }
      this.$emit('update:modelValue', false)
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  word-wrap: break-word;
  white-space: pre-wrap;
}

.url-link {
  color: #068cca;
  cursor: pointer;
}

.dense-list {
  :deep(.v-list-item) {
    min-height: 32px;
  }
}
</style>
