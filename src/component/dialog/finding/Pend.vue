<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="40%"
  >
    <v-card>
      <v-card-title class="text-h5">
        <span class="mx-4">
          {{ $t(pendDialogTitle) }}
        </span>
      </v-card-title>
      <v-card-text>
        <v-checkbox
          v-model="pendModel.false_positive"
          hide-details
          :label="$t(`view.finding['False Positive']`)"
        ></v-checkbox>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-identifier" class="my-2">
            <v-list-item-title v-if="pendAll">
              {{ selectedCount }} findings selected...
            </v-list-item-title>
            <v-list-item-title v-else>
              {{ findingId }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Finding ID']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-clock-time-eight-outline" class="my-2">
            <v-combobox
              variant="outlined"
              density="compact"
              hide-no-data
              hide-details
              clearable
              bg-color="white"
              v-model="pendModel.expired_at"
              :loading="loading"
              :items="pendExpiredItems"
            />
            <v-list-item-subtitle>
              {{ $t(`item['Expired At']`) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-list-item-subtitle>
          <v-icon left>mdi-note-edit-outline</v-icon>
          Note
        </v-list-item-subtitle>
        <v-textarea
          class="mt-4"
          variant="outlined"
          clearable
          clear-icon="mdi-close-circle"
          v-model="pendModel.note"
          :label="pendDialogNoteLabel"
        ></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text variant="outlined" color="grey-darken-1" @click="close">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
        <v-btn
          color="red-darken-1"
          :text="$t(`btn['` + pendDialogSubmitButtonText + `']`)"
          variant="outlined"
          :loading="loading"
          @click="handleSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'FindingPendDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    findingId: {
      type: String,
      default: '',
    },
    selectedCount: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    pendAll: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      pendModel: {
        note: '',
        expired_at: '',
        false_positive: false,
      },
      pendExpiredItems: [
        '3 days',
        '7 days',
        '30 days',
        '90 days',
        'No expiration',
      ],
    }
  },
  computed: {
    pendDialogTitle() {
      if (this.isArchived) {
        return `message['Do you want to archive this?']`
      }
      return `message['Do you want to update PENDING this?']`
    },
    pendDialogNoteLabel() {
      if (this.isArchived) {
        return 'archive note'
      }
      return 'pending note'
    },
    pendDialogSubmitButtonText() {
      let label = ''
      if (this.isArchived) {
        label = 'ARCHIVE'
      } else if (this.pendModel.expired_at === 'No expiration') {
        label = 'ARCHIVE'
      } else {
        label = 'PEND'
      }
      if (this.pendAll) {
        label += ' ALL'
      }
      return label
    },
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
      this.resetForm()
    },
    handleSubmit() {
      this.$emit('submit', {
        ...this.pendModel,
        finding_id: this.findingId,
      })
      this.resetForm()
      this.$emit('update:modelValue', false)
    },
    resetForm() {
      this.pendModel = {
        note: '',
        expired_at: '',
        false_positive: false,
      }
    },
  },
}
</script>
