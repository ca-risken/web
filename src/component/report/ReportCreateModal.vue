<template>
  <v-dialog v-model="dialogOpen" max-width="600px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center bg-grey-lighten-4 border-b">
        <v-icon class="mr-2" color="blue-lighten-2">
          mdi-file-document-plus-outline
        </v-icon>
        {{ $t(`item['AI Report']`) }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="reportName"
            :label="$t(`item['Report Name']`)"
            :rules="nameRules"
            :placeholder="$t(`item['Report Name Placeholder']`)"
            variant="outlined"
            density="compact"
            autofocus
            @keydown.enter.prevent
          ></v-text-field>

          <v-row class="mt-2">
            <v-col cols="4">
              <v-label class="mb-2">BaseScore</v-label>
              <v-text-field
                v-model.number="baseScore"
                type="number"
                :min="0.0"
                :max="1.0"
                :step="0.1"
                variant="outlined"
                density="compact"
                @keydown.enter.prevent
              ></v-text-field>
            </v-col>
            <v-col cols="8">
              <v-label class="mb-0">Data Source</v-label>
              <v-row dense>
                <v-col v-for="ds in dataSources" :key="ds.value" cols="auto">
                  <v-checkbox
                    v-model="selectedDataSources"
                    :value="ds.value"
                    :label="ds.text"
                    density="compact"
                    hide-details
                    class="text-caption"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-textarea
            v-model="aiPrompt"
            :label="
              $t(`item['AI Prompt']`) + ' (' + $t(`item['Optional']`) + ')'
            "
            :placeholder="$t(`item['Report prompt by AI']`)"
            variant="outlined"
            rows="4"
            class="mt-2"
          ></v-textarea>
          <v-alert v-if="aiPrompt" type="info" variant="tonal" class="mt-2">
            <template v-slot:prepend>
              <v-icon>mdi-robot</v-icon>
            </template>
            {{ $t(`message['AI will generate report content automatically']`) }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="handleCancel"
          :disabled="creating"
        >
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>

        <v-btn
          v-show="presetTitle === ''"
          variant="tonal"
          color="grey-darken-2"
          @click="handleCreateEmptyReport"
          :loading="creating"
          :disabled="creating"
        >
          {{ $t(`btn['CREATE EMPTY REPORT']`) }}
        </v-btn>

        <v-btn
          variant="tonal"
          color="green-darken-4"
          @click="handleCreate"
          :loading="creating"
          :disabled="creating"
        >
          {{ $t(`btn['CREATE AUTO']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import mixin from '@/mixin'
import report from '@/mixin/api/report'
import ai from '@/mixin/api/ai'

export default {
  name: 'ReportCreateModal',
  mixins: [mixin, report, ai],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    presetTitle: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'report-created', 'error'],
  data() {
    return {
      valid: false,
      creating: false,
      reportName: '',
      aiPrompt: '',
      baseScore: 0.5,
      selectedDataSources: [],
      dataSources: [
        { value: 'aws:*', text: 'AWS' },
        { value: 'google:*', text: 'GCP' },
        { value: 'azure:*', text: 'Azure' },
        { value: 'code:*', text: 'GitHub' },
        { value: 'osint:*', text: 'OSINT' },
        { value: 'diagnosis:*', text: 'Diagnosis' },
      ],
      nameRules: [
        (v) =>
          !v ||
          (v && v.length <= 100) ||
          'Report name must be less than 100 characters',
      ],
    }
  },
  computed: {
    dialogOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.resetForm()
        if (this.presetTitle) {
          this.reportName = this.presetTitle
        }
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.resetValidation()
            this.valid = true
          }
        })
      }
    },
    presetTitle(newVal) {
      if (newVal) {
        this.reportName = newVal
      }
    },
  },
  methods: {
    resetForm() {
      this.reportName = ''
      this.aiPrompt = ''
      this.baseScore = 0.5
      this.selectedDataSources = []
      this.creating = false
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetValidation()
        }
      })
    },

    formatPromptWithConditions(
      originalPrompt,
      baseScore,
      dataSources,
      language
    ) {
      let conditions = ''
      if (baseScore > 0.0) {
        conditions += `\n- Base Score: ${baseScore}`
      }
      if (dataSources.length > 0) {
        conditions += `\n- Data Source: ${dataSources.join(', ')}`
      }
      if (language) {
        conditions += `\n- Language: ${language}`
      }

      if (conditions !== '') {
        return `${originalPrompt}\n\n---\nReport Conditions\n${conditions}`
      }
      return originalPrompt
    },

    getLanguageFromLocale() {
      return this.$store.state.locale?.text || 'English'
    },

    getReportName() {
      // If report name is empty, set default name as current date
      if (this.reportName === '') {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        this.reportName = `${year}-${month}-${day}`
      }
      return this.reportName
    },

    handleCancel() {
      this.dialogOpen = false
      this.resetForm()
    },

    async handleCreateEmptyReport() {
      const isValid = await this.$refs.form?.validate()
      if (!isValid?.valid) {
        return
      }
      const reportName = this.getReportName()
      const result = await this.putReport({
        name: reportName,
        type: 'Markdown',
        status: 'OK',
        content: '',
      })
      if (result.report_id) {
        this.$emit('report-created', {
          report_id: result.report_id,
          name: reportName,
          status: result.status || 'OK',
          isAIGenerated: false,
        })
      }

      this.dialogOpen = false
      this.resetForm()
    },

    async handleCreate() {
      const isValid = await this.$refs.form?.validate()
      if (!isValid?.valid) {
        return
      }

      this.creating = true
      try {
        const language = this.getLanguageFromLocale()
        const enhancedPrompt = this.formatPromptWithConditions(
          this.aiPrompt,
          this.baseScore,
          this.selectedDataSources,
          language
        )
        console.log('enhancedPrompt: ', enhancedPrompt)
        const reportName = this.getReportName()
        const result = await this.generateReport(enhancedPrompt, reportName)

        if (result.report_id) {
          this.$emit('report-created', {
            report_id: result.report_id,
            name: reportName,
            status: result.status || 'IN_PROGRESS',
            isAIGenerated: true,
          })
        }

        this.dialogOpen = false
        this.resetForm()
      } catch (error) {
        this.$emit('error', error)
        this.creating = false
      }
    },
  },
}
</script>
