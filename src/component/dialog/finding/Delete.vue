<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="40%"
  >
    <v-card>
      <v-card-title class="text-h5">
        <span class="mx-4">
          {{ $t(`message['Do you really want to delete this?']`) }}
        </span>
      </v-card-title>
      <v-list two-line>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon size="large" icon="mdi-identifier" />
          </template>
          <v-list-item-title>
            {{ findingModel.finding_id }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ $t(`item['Finding ID']`) }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item prepend-icon="mdi-file-find-outline">
          <v-list-item-title>
            {{ findingModel.resource_name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ $t(`item['Resource Name']`) }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item prepend-icon="mdi-image-text">
          <v-list-item-title style="white-space: pre-wrap">
            {{ findingModel.description }}
          </v-list-item-title>
          <v-list-item-subtitle>{{
            $t(`item['Description']`)
          }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text variant="outlined" color="grey-darken-1" @click="close">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
        <v-btn
          color="red-darken-1"
          text
          variant="outlined"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ $t(`btn['DELETE']`) }}
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
    findingModel: {
      type: Object,
      default: () => ({
        finding_id: '',
        resource_name: '',
        description: '',
      }),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
    handleSubmit() {
      this.$emit('submit', this.findingModel.finding_id)
      this.$emit('update:modelValue', false)
    },
  },
}
</script>
