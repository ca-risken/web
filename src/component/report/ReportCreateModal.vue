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
            variant="outlined"
            density="compact"
            required
            autofocus
            @keyup.enter="handleCreate"
          ></v-text-field>

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
          variant="tonal"
          color="green-darken-4"
          @click="handleCreate"
          :loading="creating"
          :disabled="!valid"
        >
          {{ $t(`btn['CREATE']`) }}
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
      valid: true,
      creating: false,
      reportName: '',
      aiPrompt: '',
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
      this.valid = true
      this.creating = false
    },

    handleCancel() {
      this.dialogOpen = false
      this.resetForm()
    },

    async handleCreate() {
      if (!this.valid) {
        return
      }

      // If report name is empty, set default name as current date
      let finalReportName = this.reportName
      if (!finalReportName) {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        finalReportName = `${year}-${month}-${day}`
      }

      this.creating = true
      try {
        const newReport = {
          name: finalReportName,
          type: 'Markdown',
          status: 'OK',
          content: '',
        }

        if (this.aiPrompt) {
          // If AI prompt is present, execute AI generation
          const result = await this.generateReport(
            this.aiPrompt,
            finalReportName
          )

          if (result.report_id) {
            this.$emit('report-created', {
              report_id: result.report_id,
              name: finalReportName,
              status: result.status || 'IN_PROGRESS',
              isAIGenerated: true,
            })
          }
        } else {
          // Normal new creation
          const savedReport = await this.putReport(newReport)
          this.$emit('report-created', {
            ...savedReport,
            isAIGenerated: false,
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
