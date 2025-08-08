<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue-lighten-2">
                mdi-file-document-edit-outline
              </v-icon>
              {{
                isNewReport
                  ? $t(`item['New Report']`)
                  : $t(`item['Edit Report']`)
              }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              variant="outlined"
              @click="handleCancel"
              class="mr-2"
            >
              {{ $t(`btn['CANCEL']`) }}
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              @click="handleSave"
              :loading="saveLoading"
            >
              <v-icon left>mdi-content-save</v-icon>
              {{ $t(`btn['SAVE']`) }}
            </v-btn>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-text>
              <v-row>
                <v-col cols="8">
                  <v-text-field
                    v-model="report.name"
                    :label="$t(`item['Report Name']`)"
                    variant="outlined"
                    density="compact"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-chip
                    v-if="report.status"
                    :color="getStatusColor(report.status)"
                    dark
                    class="mt-2"
                  >
                    {{ report.status }}
                  </v-chip>
                </v-col>
              </v-row>

              <v-row v-if="isNewReport || !report.content">
                <v-col cols="12">
                  <v-card variant="outlined">
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <h3>{{ $t(`item['AI Generate']`) }}</h3>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="aiPrompt"
                            :label="$t(`item['AI Prompt']`)"
                            :placeholder="
                              $t(
                                `item['Enter prompt for AI report generation']`
                              )
                            "
                            variant="outlined"
                            rows="3"
                          ></v-textarea>
                        </v-col>
                        <v-col cols="12">
                          <v-btn
                            color="purple"
                            variant="elevated"
                            @click="handleAIGenerate"
                            :loading="aiGenerating"
                            :disabled="!aiPrompt || !report.name"
                          >
                            <v-icon left>mdi-robot</v-icon>
                            {{ $t(`btn['AI GENERATE']`) }}
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row class="mt-4">
                <v-col cols="12">
                  <v-tabs v-model="tab" bg-color="grey-lighten-3">
                    <v-tab value="preview">
                      <v-icon left>mdi-eye</v-icon>
                      {{ $t(`item['Preview']`) }}
                    </v-tab>
                    <v-tab value="edit">
                      <v-icon left>mdi-pencil</v-icon>
                      {{ $t(`item['Edit']`) }}
                    </v-tab>
                  </v-tabs>

                  <v-window v-model="tab">
                    <v-window-item value="edit">
                      <v-card flat>
                        <v-card-text>
                          <v-textarea
                            v-model="report.content"
                            :label="$t(`item['Content (Markdown)']`)"
                            variant="outlined"
                            rows="20"
                            auto-grow
                            :placeholder="
                              $t(
                                `item['Enter report content in Markdown format']`
                              )
                            "
                          ></v-textarea>
                        </v-card-text>
                      </v-card>
                    </v-window-item>

                    <v-window-item value="preview">
                      <v-card flat>
                        <v-card-text>
                          <div class="markdown-preview pa-4">
                            <markdown-display
                              v-if="report.content"
                              :source="report.content"
                              class="markdown"
                            />
                            <div v-else class="text-grey">
                              {{ $t(`message['No content to preview']`) }}
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-window-item>
                  </v-window>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- AI Generation Progress Dialog -->
    <v-dialog v-model="pollingDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>
          {{ $t(`message['Generating Report']`) }}
        </v-card-title>
        <v-card-text>
          <v-progress-linear
            indeterminate
            color="purple"
            class="mb-4"
          ></v-progress-linear>
          <p>
            {{
              $t(
                `message['AI is generating your report. This may take a few minutes...']`
              )
            }}
          </p>
          <p class="mt-2">
            <strong>{{ $t(`item['Status']`) }}:</strong> {{ pollingStatus }}
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import report from '@/mixin/api/report'
import ai from '@/mixin/api/ai'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import MarkdownDisplay from '@/component/text/Markdown.vue'

export default {
  name: 'ReportEdit',
  mixins: [mixin, report, ai],
  components: {
    BottomSnackBar,
    MarkdownDisplay,
  },
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
      aiPrompt: '',
      saveLoading: false,
      aiGenerating: false,
      pollingDialog: false,
      pollingStatus: 'IN_PROGRESS',
      pollingInterval: null,
    }
  },
  computed: {
    isNewReport() {
      return !this.$route.params.id
    },
  },
  mounted() {
    this.redirectToIntegratedView()
  },
  beforeUnmount() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
  },
  methods: {
    redirectToIntegratedView() {
      const reportId = this.$route.params.id
      const query = {
        project_id: this.getCurrentProjectID(),
        ...(reportId && { selected: reportId }),
      }

      this.$router.replace({
        path: '/report',
        query,
      })
    },
    async loadReport() {
      try {
        const reportId = this.$route.params.id
        const data = await this.getReport(reportId)
        this.report = data
      } catch (error) {
        this.showErrorSnackbar(error)
        this.$router.push({
          path: '/report/list',
          query: { project_id: this.getCurrentProjectID() },
        })
      }
    },

    async handleSave() {
      if (!this.report.name) {
        this.showErrorSnackbar({
          response: { data: { message: 'Report name is required' } },
        })
        return
      }

      this.saveLoading = true
      try {
        const savedReport = await this.putReport(this.report)
        this.report = savedReport
        this.showSuccessSnackbar(
          this.$i18n.t('message["Report saved successfully"]')
        )

        if (this.isNewReport) {
          this.$router.push({
            path: `/report/edit/${savedReport.report_id}`,
            query: { project_id: this.getCurrentProjectID() },
          })
        }
      } catch (error) {
        this.showErrorSnackbar(error)
      } finally {
        this.saveLoading = false
      }
    },

    async handleAIGenerate() {
      if (!this.aiPrompt || !this.report.name) {
        this.showErrorSnackbar({
          response: {
            data: {
              message: 'Report name and AI prompt are required',
            },
          },
        })
        return
      }

      this.aiGenerating = true
      try {
        const result = await this.generateReport(
          this.aiPrompt,
          this.report.name
        )

        if (result.report_id) {
          this.report.report_id = result.report_id
          this.pollingStatus = result.status || 'IN_PROGRESS'
          this.pollingDialog = true
          this.startPolling()
        }
      } catch (error) {
        this.showErrorSnackbar(error)
        this.aiGenerating = false
      }
    },

    startPolling() {
      this.pollingInterval = setInterval(async () => {
        try {
          const data = await this.getReport(this.report.report_id)
          this.pollingStatus = data.status

          if (data.status === 'OK') {
            this.report = data
            this.stopPolling()
            this.pollingDialog = false
            this.aiGenerating = false
            this.tab = 'preview'
            this.showSuccessSnackbar(
              this.$i18n.t('message["Report generated successfully"]')
            )

            if (this.isNewReport) {
              this.$router.push({
                path: `/report/edit/${data.report_id}`,
                query: { project_id: this.getCurrentProjectID() },
              })
            }
          } else if (data.status === 'ERROR') {
            this.stopPolling()
            this.pollingDialog = false
            this.aiGenerating = false
            this.showErrorSnackbar({
              response: {
                data: {
                  message: 'AI generation failed',
                },
              },
            })
          }
        } catch (error) {
          this.stopPolling()
          this.pollingDialog = false
          this.aiGenerating = false
          this.showErrorSnackbar(error)
        }
      }, 3000) // Poll every 3 seconds
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    },

    handleCancel() {
      this.$router.push({
        path: '/report/list',
        query: { project_id: this.getCurrentProjectID() },
      })
    },

    getStatusColor(status) {
      switch (status) {
        case 'OK':
          return 'green'
        case 'IN_PROGRESS':
          return 'orange'
        case 'ERROR':
          return 'red'
        default:
          return 'grey'
      }
    },

    showSuccessSnackbar(message) {
      if (this.$refs.snackbar && this.$refs.snackbar.showSnackbar) {
        this.$refs.snackbar.showSnackbar('success', message)
      } else {
        console.log('Success:', message)
      }
    },

    showErrorSnackbar(error) {
      const message = error.response?.data?.message || 'An error occurred'
      if (this.$refs.snackbar && this.$refs.snackbar.showSnackbar) {
        this.$refs.snackbar.showSnackbar('error', message)
      } else {
        console.error('Error:', message)
      }
    },
  },
}
</script>

<style scoped>
.markdown-preview {
  min-height: 400px;
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.markdown {
  line-height: 1.6;
}
</style>
