<template>
  <v-card class="mx-auto" height="140">
    <v-toolbar height="10" :color="color" />
    <v-card-title class="text-subtitle-1">
      <v-icon :color="color">{{ icon }}</v-icon>
      {{ category }}
    </v-card-title>
    <v-card-text class="text-h4 py-5 px-6">
      {{ title }}
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'ReportNumberStatistic',
  props: {
    icon: String,
    category: String,
    title: [String, Number],
    color: String,
  },
}
</script>
