<template>
  <v-dialog v-model="internalDialog" max-width="60%">
    <v-card>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-list-item prepend-icon="mdi-chat">
              <v-list-item class="px-0 pt-10 ma-0">
                {{ $t(`view.ai['GenerativeAI Question-1']`) }}<br />
                {{ $t(`view.ai['GenerativeAI Question-2']`) }}<br />
              </v-list-item>
            </v-list-item>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <AIPanel :loading="loading" :ai-answer="aiAnswer" />
          </v-col>
        </v-row>
      </v-container>
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
import AIPanel from '@/component/text/AIPanel.vue'

export default {
  name: 'AI',
  components: {
    AIPanel,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
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
  computed: {
    internalDialog: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      },
    },
  },
  methods: {
    close() {
      this.internalDialog = false
    },
  },
}
</script>

<style scoped></style>
