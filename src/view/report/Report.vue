<template>
  <div>
    <v-container fluid class="pa-0">
      <v-row no-gutters style="min-height: 80vh">
        <v-col cols="12" md="4" lg="3" class="d-flex flex-column">
          <report-list
            ref="reportList"
            :selected-report-id="selectedReportId"
            @select-report="handleSelectReport"
            @create-report="handleCreateReport"
            @ai-edit="handleAIEdit"
            @error="handleError"
          />
        </v-col>

        <v-col cols="12" md="8" lg="9" class="d-flex flex-column">
          <report-editor
            ref="reportEditor"
            :report-id="selectedReportId"
            @report-updated="handleReportUpdated"
            @report-saved="handleReportSaved"
            @error="handleError"
          />
        </v-col>
      </v-row>
    </v-container>

    <report-create-modal
      v-model="createModalOpen"
      :preset-title="presetReportTitle"
      @report-created="handleReportCreated"
      @error="handleError"
    />

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ReportList from '@/component/report/ReportList.vue'
import ReportEditor from '@/component/report/ReportEditor.vue'
import ReportCreateModal from '@/component/report/ReportCreateModal.vue'

export default {
  name: 'ReportManagement',
  mixins: [mixin],
  components: {
    BottomSnackBar,
    ReportList,
    ReportEditor,
    ReportCreateModal,
  },
  data() {
    return {
      selectedReportId: null,
      createModalOpen: false,
      presetReportTitle: '',
    }
  },
  computed: {
    selectedQueryParam() {
      return this.$route.query.selected
    },
  },
  watch: {
    selectedQueryParam: {
      handler(newSelected) {
        this.selectedReportId = newSelected || null
      },
      immediate: true,
    },
    selectedReportId(newId) {
      const query = { ...this.$route.query }
      if (newId) {
        query.selected = newId
      } else {
        delete query.selected
      }

      if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
        this.$router.replace({ query })
      }
    },
    createModalOpen(newVal) {
      if (!newVal) {
        // Reset flags when modal is closed
        this.presetReportTitle = ''
      }
    },
  },
  methods: {
    handleSelectReport(report) {
      this.selectedReportId = report.report_id
    },

    handleCreateReport() {
      this.presetReportTitle = ''
      this.createModalOpen = true
    },

    handleAIEdit(report) {
      this.presetReportTitle = report.name
      this.$nextTick(() => {
        this.createModalOpen = true
      })
    },

    handleReportCreated(reportData) {
      // Refresh report list
      if (this.$refs.reportList) {
        this.$refs.reportList.refreshList()
      }

      // Select the newly created report
      this.selectedReportId = reportData.report_id
      this.createModalOpen = false

      if (reportData.isAIGenerated) {
        this.showSuccessSnackbar(
          this.$t('message["Report created and AI generation started"]')
        )
      } else {
        this.showSuccessSnackbar(
          this.$t('message["Report created successfully"]')
        )
      }
    },

    handleReportUpdated() {
      // Refresh report list
      if (this.$refs.reportList) {
        this.$refs.reportList.refreshList()
      }
    },

    handleReportSaved() {
      this.showSuccessSnackbar(this.$t('message["Report saved successfully"]'))
      this.handleReportUpdated()
    },

    handleError(error) {
      this.showErrorSnackbar(error)
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
