<template>
  <v-chip
    v-if="true"
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
  <v-chip v-else color="grey" variant="flat">Not configured</v-chip>
</template>

<script>
import mixin from '@/mixin'
export default {
  mixins: [mixin],
  name: 'DataSourceStatus',
  props: {
    status: {
      type: Number,
      default: 0,
    },
  },
}
</script>
