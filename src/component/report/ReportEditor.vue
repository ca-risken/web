<template>
  <div class="pa-4">
    <div v-if="!reportId" class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-2">
        mdi-file-document-outline
      </v-icon>
      <div class="text-h6 mt-2 grey--text">
        {{ $t(`message['Select a report to edit']`) }}
      </div>
    </div>

    <div v-else>
      <v-card flat>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="d-flex">
                <div>
                  <h2 class="text-h5 mr-3">{{ report.name }}</h2>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row class="mt-0">
            <v-col cols="12">
              <div class="d-flex">
                <v-tabs
                  v-model="tab"
                  class="modern-tabs"
                  density="comfortable"
                  color="primary"
                >
                  <v-tab value="preview" class="modern-tab">
                    <v-icon left size="small">mdi-eye</v-icon>
                    {{ $t(`item['Preview']`) }}
                  </v-tab>
                  <v-tab value="edit" class="modern-tab">
                    <v-icon left size="small">mdi-pencil</v-icon>
                    {{ $t(`item['Edit']`) }}
                  </v-tab>
                </v-tabs>
                <v-spacer />
                <v-btn
                  v-if="hasUnsavedChanges && tab === 'edit'"
                  color="green-darken-4"
                  variant="tonal"
                  class="mr-4"
                  @click="handleSave"
                  :loading="saveLoading"
                >
                  <v-icon left>mdi-content-save</v-icon>
                  {{ $t(`btn['SAVE']`) }}
                </v-btn>
              </div>

              <v-window v-model="tab">
                <v-window-item value="edit">
                  <v-card flat>
                    <v-card-text class="px-0">
                      <div
                        class="bg-grey-lighten-5 pa-6"
                        style="min-height: 500px"
                      >
                        <v-textarea
                          v-model="report.content"
                          :label="$t(`item['Content (Markdown)']`)"
                          variant="outlined"
                          rows="25"
                          auto-grow
                          class="modern-textarea bg-white elevation-1 rounded-lg"
                          :placeholder="
                            $t(
                              `item['Enter report content in Markdown format']`
                            )
                          "
                          @input="markAsChanged"
                        ></v-textarea>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-window-item>

                <v-window-item value="preview">
                  <v-card flat>
                    <v-card-text class="px-0">
                      <div
                        class="bg-grey-lighten-5 pa-6 d-flex justify-center"
                        style="min-height: 500px"
                      >
                        <markdown-display
                          v-if="report.content"
                          :source="report.content"
                          :card="true"
                          card-color="white"
                          :card-elevation="true"
                          max-width="800px"
                        />
                        <v-sheet
                          v-else
                          class="pa-8 rounded-lg elevation-1"
                          style="max-width: 800px; width: 100%"
                          color="white"
                        >
                          <div
                            class="d-flex flex-column align-center justify-center"
                            style="min-height: 300px"
                          >
                            <v-icon
                              size="48"
                              color="grey-lighten-2"
                              class="mb-4"
                            >
                              mdi-file-document-outline
                            </v-icon>
                            <div class="text-body-1 text-grey">
                              {{ $t(`message['No content to preview']`) }}
                            </div>
                          </div>
                        </v-sheet>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-window-item>
              </v-window>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import mixin from '@/mixin'
import report from '@/mixin/api/report'
import ai from '@/mixin/api/ai'
import MarkdownDisplay from '@/component/text/Markdown.vue'

export default {
  name: 'ReportEditor',
  mixins: [mixin, report, ai],
  components: {
    MarkdownDisplay,
  },
  props: {
    reportId: {
      type: [String, Number],
      default: null,
    },
  },
  emits: ['report-updated', 'report-saved'],
  data() {
    return {
      tab: 'preview',
      report: {
        report_id: null,
        name: '',
        type: 'Markdown',
        status: 'OK',
        content: '',
      },
      originalReport: {},
      aiPrompt: '',
      saveLoading: false,
      hasUnsavedChanges: false,
    }
  },
  watch: {
    reportId: {
      handler() {
        this.loadReport()
      },
      immediate: true,
    },
  },
  methods: {
    async loadReport() {
      if (!this.reportId) {
        this.resetReport()
        return
      }

      try {
        const data = await this.getReport(this.reportId)
        this.report = { ...data }
        this.originalReport = { ...data }
        this.hasUnsavedChanges = false
      } catch (error) {
        this.$emit('error', error)
      }
    },

    resetReport() {
      this.report = {
        report_id: null,
        name: '',
        type: 'Markdown',
        status: 'OK',
        content: '',
      }
      this.originalReport = {}
      this.hasUnsavedChanges = false
      this.aiPrompt = ''
    },

    markAsChanged() {
      this.$nextTick(() => {
        const hasChanged =
          JSON.stringify(this.report) !== JSON.stringify(this.originalReport)
        this.hasUnsavedChanges = hasChanged
      })
    },

    async handleSave() {
      if (!this.report.name) {
        this.$emit('error', {
          response: { data: { message: 'Report name is required' } },
        })
        return
      }

      this.saveLoading = true
      try {
        const savedReport = await this.putReport(this.report)
        this.report = { ...savedReport }
        this.originalReport = { ...savedReport }
        this.hasUnsavedChanges = false
        this.$emit('report-saved', savedReport)
        this.$emit('report-updated')
      } catch (error) {
        this.$emit('error', error)
      } finally {
        this.saveLoading = false
      }
    },
  },
}
</script>

<style scoped>
.modern-tabs {
  background: transparent !important;
  box-shadow: none !important;
}

.modern-tab {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0 !important;
  border-radius: 8px 8px 0 0 !important;
  margin-right: 4px !important;
  transition: all 0.2s ease !important;
}

.modern-tab:hover {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.modern-tabs :deep(.v-slide-group__content) {
  border-bottom: 1px solid #e0e0e0;
}

.modern-tabs :deep(.v-tab--selected) {
  color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.modern-tabs :deep(.v-tab--selected .v-tab__slider) {
  height: 3px !important;
  border-radius: 2px !important;
}

.modern-textarea :deep(.v-field__input) {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas,
    monospace !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}
</style>
