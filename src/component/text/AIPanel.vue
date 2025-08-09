<template>
  <v-alert
    :title="$t(`view.ai['Generative AI Title']`)"
    icon="$success"
    variant="tonal"
    border="end"
    border-color="indigo-darken-4"
    class="my-4 pl-6 pr-8"
  >
    <v-progress-circular
      v-if="loading"
      indeterminate
      :size="40"
      width="4"
      color="green-darken-2"
      class="ma-6 px-12"
    ></v-progress-circular>
    <v-card-text v-else class="text-body-1 my-2 py-2 wrap">
      <MarkdownDisplay
        breaks
        linkify
        :source="aiAnswer"
        :compact="true"
        :card-elevation="false"
        :max-width="'100%'"
      />
    </v-card-text>
  </v-alert>
</template>

<script>
import MarkdownDisplay from '@/component/text/Markdown.vue'

export default {
  name: 'AIPanel',
  components: {
    MarkdownDisplay,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    aiAnswer: {
      type: String,
      default: '',
    },
  },
}
</script>

<style scoped>
.wrap {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
