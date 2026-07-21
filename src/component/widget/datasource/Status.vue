<template>
  <template v-if="iconOnly">
    <v-tooltip
      :text="status ? getDataSourceStatusText(status) : 'Disabled'"
      location="top"
    >
      <template v-slot:activator="{ props }">
        <v-progress-circular
          v-if="isInProgressDataSourceStatus(status)"
          v-bind="props"
          indeterminate
          size="24"
          width="3"
          color="cyan"
        />
        <v-icon
          v-else
          v-bind="props"
          :color="status ? getDataSourceStatusColor(status) : 'grey'"
          :icon="
            status
              ? getDataSourceStatusIcon(status)
              : 'mdi-minus-circle-outline'
          "
        />
      </template>
    </v-tooltip>
  </template>
  <v-chip
    v-else
    :color="getDataSourceStatusColor(status)"
    variant="flat"
    class="text-white"
  >
    <v-progress-circular
      v-if="isInProgressDataSourceStatus(status)"
      indeterminate
      size="20"
      width="2"
      color="white"
      class="mr-2"
    ></v-progress-circular>
    <v-icon v-else small color="white" class="mr-2">{{
      getDataSourceStatusIcon(status)
    }}</v-icon>
    {{ getDataSourceStatusText(status) }}
  </v-chip>
</template>

<script>
import mixin from '@/mixin'
export default {
  mixins: [mixin],
  name: 'DataSourceStatus',
  props: {
    iconOnly: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
}
</script>
