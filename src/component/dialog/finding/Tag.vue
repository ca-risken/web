<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="400px"
  >
    <v-card>
      <v-card-title>
        <span class="mx-4">{{ $t(`btn['NEW TAG']`) }}</span>
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="tagModel.new_tag"
          :label="$t(`item['Tag']`)"
          placeholder="key:value"
          variant="outlined"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text variant="outlined" color="grey-darken-1" @click="close">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
        <v-btn
          color="blue-darken-1"
          text
          variant="outlined"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ $t(`btn['TAG']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'TagDialog',
  props: {
    modelValue: {
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
      tagModel: {
        new_tag: '',
      },
    }
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
      this.resetForm()
    },
    handleSubmit() {
      this.$emit('submit', this.tagModel.new_tag)
      this.resetForm()
      this.$emit('update:modelValue', false)
    },
    resetForm() {
      this.tagModel.new_tag = ''
    },
  },
}
</script>
