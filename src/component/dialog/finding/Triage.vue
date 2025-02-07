<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="40%"
  >
    <v-card class="py-2">
      <v-card-title class="text-h5 font-weight-bold">
        <span>Auto Triage</span>
      </v-card-title>
      <v-card-text>
        <p class="mb-6 text-subtitle-2" v-html="$t('view.triage.description', ['SSVC 2.0', '<a href=\'https://certcc.github.io/SSVC/howto/deployer_tree/?h=deployer#deployer-decision-points\' target=\'_blank\'>' + $t('view.triage.decision_model') + '</a>'])">
        </p>

        <v-timeline side="end" align="start" class="mr-16 pt-6">
          <v-timeline-item
            :dot-color="getScoreTextColor(normalizedTriageData.exploitation.score)"
            size="small"
            class="pb-2"
          >
            <template v-slot:opposite>
              <div class="text-right">
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-3">
                  {{ $t('view.triage.items.exploitation.title') }}
                </div>
                <div class="text-caption">
                  {{ $t('view.triage.items.exploitation.description') }}
                </div>
              </div>
            </template>
            <v-card flat bg-color="transparent" class="pa-0">
              <v-card-text class="pa-2">
                <div>
                  <v-chip
                    density="comfortable"
                    class="mr-2 text-body-1 font-weight-medium"
                    :color="getScoreColor(normalizedTriageData.exploitation.score)"
                    :text-color="getScoreTextColor(normalizedTriageData.exploitation.score)"
                  >
                    {{ normalizedTriageData.exploitation.score }}
                  </v-chip>
                  <span class="text-body-2">{{ normalizedTriageData.exploitation.result }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-timeline-item>

          <v-timeline-item
            :dot-color="getScoreTextColor(normalizedTriageData.system_exposure.score)"
            size="small"
            class="pb-2"
          >
            <template v-slot:opposite>
              <div class="text-right">
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-3">
                  {{ $t('view.triage.items.system_exposure.title') }}
                </div>
                <div class="text-caption">
                  {{ $t('view.triage.items.system_exposure.description') }}
                </div>
              </div>
            </template>
            <v-card flat bg-color="transparent" class="pa-0">
              <v-card-text class="pa-2">
                <div>
                  <v-chip
                    density="comfortable"
                    class="mr-2 text-body-1 font-weight-medium"
                    :color="getScoreColor(normalizedTriageData.system_exposure.score)"
                    :text-color="getScoreTextColor(normalizedTriageData.system_exposure.score)"
                  >
                    {{ normalizedTriageData.system_exposure.score }}
                  </v-chip>
                  <span class="text-body-2">{{ normalizedTriageData.system_exposure.result }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-timeline-item>

          <v-timeline-item
            :dot-color="getScoreTextColor(normalizedTriageData.utility.score)"
            size="small"
            class="pb-2"
          >
            <template v-slot:opposite>
              <div class="text-right">
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-3">
                  {{ $t('view.triage.items.utility.title') }}
                </div>
                <div class="text-caption">
                  {{ $t('view.triage.items.utility.description') }}
                </div>
              </div>
            </template>
            <v-card flat bg-color="transparent" class="pa-0">
              <v-card-text class="pa-2">
                <div>
                  <v-chip
                    density="comfortable"
                    class="mr-2 text-body-1 font-weight-medium"
                    :color="getScoreColor(normalizedTriageData.utility.score)"
                    :text-color="getScoreTextColor(normalizedTriageData.utility.score)"
                  >
                    {{ normalizedTriageData.utility.score }}
                  </v-chip>
                  <span class="text-body-2">{{ normalizedTriageData.utility.result }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-timeline-item>

          <v-timeline-item
            :dot-color="getScoreTextColor(normalizedTriageData.human_impact.score)"
            size="small"
            class="pb-2"
          >
            <template v-slot:opposite>
              <div class="text-right">
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-3">
                  {{ $t('view.triage.items.human_impact.title') }}
                </div>
                <div class="text-caption">
                  {{ $t('view.triage.items.human_impact.description') }}
                </div>
              </div>
            </template>
            <v-card flat bg-color="transparent" class="pa-0">
              <v-card-text class="pa-2">
                <div>
                  <v-chip
                    density="comfortable"
                    class="mr-2 text-body-1 font-weight-medium"
                    :color="getScoreColor(normalizedTriageData.human_impact.score)"
                    :text-color="getScoreTextColor(normalizedTriageData.human_impact.score)"
                  >
                    {{ normalizedTriageData.human_impact.score }}
                  </v-chip>
                  <span class="text-body-2">{{ normalizedTriageData.human_impact.result }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text variant="outlined" color="grey-darken-1" @click="close">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'FindingTriageDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    triageData: {
      type: Object,
      default: () => ({
        exploitation: null,
        system_exposure: null,
        utility: null,
        human_impact: null,
      }),
    },
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
    getScoreColor(score) {
      return score >= 0 ? 'grey-darken-1' : 'red-darken-1'
    },
    getScoreTextColor(score) {
      return score >= 0 ? 'grey-lighten-2' : 'red-lighten-2'
    },
  },
  computed: {
    normalizedTriageData() {
      const defaultValue = {
        score: 0,
        result: 'UNKNOWN'
      }
      return {
        exploitation: {
          ...defaultValue,
          ...this.triageData.exploitation
        },
        system_exposure: {
          ...defaultValue,
          ...this.triageData.system_exposure
        },
        utility: {
          ...defaultValue,
          ...this.triageData.utility
        },
        human_impact: {
          ...defaultValue,
          ...this.triageData.human_impact
        }
      }
    }
  },
}
</script>

<style scoped>
:deep(.v-timeline-divider__line) {
  border-left-color: rgba(0, 0, 0, 0.1);
}
</style> 