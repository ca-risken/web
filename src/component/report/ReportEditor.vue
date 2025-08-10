<template>
  <div class="d-flex flex-column" style="height: calc(100vh - 100px)">
    <div v-if="!reportId" class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-2">
        mdi-file-document-outline
      </v-icon>
      <div class="text-h6 mt-2 grey--text">
        {{ $t(`message['Select a report to edit']`) }}
      </div>
    </div>

    <div v-else class="d-flex flex-column flex-grow-1 overflow-hidden">
      <v-card flat class="d-flex flex-column h-100">
        <v-card-text class="pa-0 d-flex flex-column h-100">
          <!-- Fixed Header Section -->
          <div
            class="pa-4 pb-0 bg-white elevation-1"
            style="position: sticky; top: 0; z-index: 10"
          >
            <div class="d-flex align-center mb-3">
              <h2 class="text-h5">{{ report.name }}</h2>
            </div>

            <div class="d-flex align-center">
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
                v-if="tab === 'preview' && report.content"
                color="grey-darken-2"
                variant="tonal"
                class="mr-2"
                @click="handleDownloadPDF"
                :loading="pdfLoading"
              >
                <v-icon left>mdi-file-pdf-box</v-icon>
                {{ $t(`btn['DOWNLOAD_PDF']`) }}
              </v-btn>
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
          </div>

          <!-- Scrollable Content Section -->
          <div class="flex-grow-1 overflow-hidden">
            <v-window v-model="tab" class="h-100" show-arrows="hover">
              <!-- Preview -->
              <v-window-item value="preview" class="h-100">
                <div class="overflow-y-auto h-100 bg-white pa-4">
                  <markdown-display
                    v-if="report.content"
                    :source="report.content"
                    :card="false"
                    :card-elevation="false"
                    max-width="100%"
                    class="markdown-display"
                  />
                  <v-sheet
                    v-else
                    class="pa-8 rounded-lg"
                    style="max-width: 800px; width: 100%"
                    color="transparent"
                  >
                    <div
                      class="d-flex flex-column align-center justify-center"
                      style="min-height: 300px"
                    >
                      <v-icon size="48" color="grey-lighten-2" class="mb-4">
                        mdi-file-document-outline
                      </v-icon>
                      <div class="text-body-1 text-grey">
                        {{ $t(`message['No content to preview']`) }}
                      </div>
                    </div>
                  </v-sheet>
                </div>
              </v-window-item>

              <!-- Edit -->
              <v-window-item value="edit" class="h-100">
                <div class="overflow-y-auto h-100 bg-grey-lighten-5 pa-8">
                  <v-textarea
                    v-model="report.content"
                    :label="$t(`item['Content (Markdown)']`)"
                    variant="outlined"
                    rows="25"
                    auto-grow
                    class="rounded-lg"
                    bg-color="white"
                    :placeholder="
                      $t(`item['Enter report content in Markdown format']`)
                    "
                    @input="markAsChanged"
                  ></v-textarea>
                </div>
              </v-window-item>
            </v-window>
          </div>
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
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
      pdfLoading: false,
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

    async handleDownloadPDF() {
      this.pdfLoading = true
      try {
        // Get markdown preview DOM element
        const markdownElement = this.$el.querySelector('.markdown-display')
        if (!markdownElement) {
          throw new Error('Preview element not found')
        }

        // Capture with html2canvas
        const canvas = await html2canvas(markdownElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        })

        // Create PDF (A4 portrait)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        })

        // A4 size definitions
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const margin = 10 // Page margin

        // Available area
        const maxWidth = pdfWidth - 2 * margin
        const maxHeight = pdfHeight - 2 * margin

        // Calculate aspect ratio preserving width maximization
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const widthRatio = maxWidth / imgWidth
        const scaledWidth = imgWidth * widthRatio
        const scaledHeight = imgHeight * widthRatio

        // Calculate pages needed for height
        const totalPages = Math.ceil(scaledHeight / maxHeight)

        // Generate each page
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage()
          }

          // Calculate the portion to show on current page
          const sourceY = (page * maxHeight) / widthRatio
          const sourceHeight = Math.min(
            maxHeight / widthRatio,
            imgHeight - sourceY
          )
          const destHeight = sourceHeight * widthRatio

          // Create temporary canvas for cropping
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = imgWidth
          tempCanvas.height = sourceHeight
          const tempCtx = tempCanvas.getContext('2d')
          tempCtx.drawImage(
            canvas,
            0,
            sourceY,
            imgWidth,
            sourceHeight,
            0,
            0,
            imgWidth,
            sourceHeight
          )

          // Add image to PDF
          const pageImgData = tempCanvas.toDataURL('image/png')
          pdf.addImage(
            pageImgData,
            'PNG',
            margin,
            margin,
            scaledWidth,
            destHeight
          )
        }

        // Generate filename
        const filename = `${this.report.name || 'report'}.pdf`

        // Download PDF
        pdf.save(filename)
      } catch (error) {
        console.error('PDF generation failed:', error)
        this.$emit('error', {
          response: { data: { message: 'Failed to generate PDF' } },
        })
      } finally {
        this.pdfLoading = false
      }
    },
  },
}
</script>

<style scoped>
.h-100 {
  height: 100%;
}

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

.v-textarea :deep(.v-field__input) {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas,
    monospace !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}
</style>
