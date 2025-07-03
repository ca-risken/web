<template>
  <v-dialog v-model="dialog" max-width="40%">
    <v-card>
      <v-card-title class="text-h5">
        <span class="mx-4">
          {{ title }}
        </span>
      </v-card-title>
      <v-list two-line>
        <v-list-item v-if="itemData.id" prepend-icon="mdi-identifier">
          <v-list-item-title>
            {{ itemData.id }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ $t(`item['ID']`) }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="itemData.name" :prepend-icon="itemIcon">
          <v-list-item-title>
            {{ itemData.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ $t(`item['Name']`) }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text
          variant="outlined"
          color="grey-darken-1"
          @click="handleCancel"
        >
          {{ cancelText || $t(`btn['CANCEL']`) }}
        </v-btn>
        <v-btn
          :loading="loading"
          color="red-darken-1"
          text
          variant="outlined"
          @click="handleConfirm"
        >
          {{ confirmText || $t(`btn['DELETE']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DeleteDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    itemData: {
      type: Object,
      default: () => ({}),
    },
    itemIcon: {
      type: String,
      default: 'mdi-file',
    },
    cancelText: {
      type: String,
      default: '',
    },
    confirmText: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  computed: {
    dialog: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm')
    },
    handleCancel() {
      this.$emit('cancel')
      this.dialog = false
    },
  },
}
</script>

<style scoped></style>
