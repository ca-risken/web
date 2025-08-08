<template>
  <v-dialog v-model="dialogOpen" max-width="600px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center bg-grey-lighten-4 border-b">
        <v-icon class="mr-2" color="blue-lighten-2">
          mdi-file-document-plus-outline
        </v-icon>
        {{ $t(`item['New Report']`) }}
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
          :disabled="!valid || !reportName"
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
  },
  emits: ['update:modelValue', 'report-created', 'error'],
  data() {
    return {
      valid: false,
      creating: false,
      reportName: '',
      aiPrompt: '',
      nameRules: [
        (v) => !!v || this.$t('message["Report name is required"]'),
        (v) =>
          (v && v.length <= 100) ||
          this.$t('message["Report name must be less than 100 characters"]'),
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
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.resetValidation()
          }
        })
      }
    },
  },
  methods: {
    resetForm() {
      this.reportName = ''
      this.aiPrompt = ''
      this.valid = false
      this.creating = false
    },

    handleCancel() {
      this.dialogOpen = false
      this.resetForm()
    },

    async handleCreate() {
      if (!this.valid || !this.reportName) {
        return
      }

      this.creating = true
      try {
        const newReport = {
          name: this.reportName,
          type: 'Markdown',
          status: 'OK',
          content: '',
        }

        if (this.aiPrompt) {
          // AIプロンプトがある場合はAI生成を実行
          const result = await this.generateReport(
            this.aiPrompt,
            this.reportName
          )

          if (result.report_id) {
            this.$emit('report-created', {
              report_id: result.report_id,
              name: this.reportName,
              status: result.status || 'IN_PROGRESS',
              isAIGenerated: true,
            })
          }
        } else {
          // 通常の新規作成
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
