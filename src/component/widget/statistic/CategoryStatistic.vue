<template>
  <v-card class="mx-auto" @click="handleClick">
    <v-toolbar height="10" :color="color" />
    <v-card-title>
      <v-icon :color="color" size="large" start>{{ icon }}</v-icon>
      <span class="title font-weight-bold">{{ category }}</span>
    </v-card-title>
    <v-card-text class="text-h5 font-weight-black ml-4">
      {{ title }}
    </v-card-text>
    <v-card-text class="subtitle font-weight-light">
      "{{ subTitle }}"
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'CategoryStatistic',
  props: {
    icon: String,
    category: String,
    title: String,
    subTitle: String,
    color: String,
    dark: Boolean,
    link: String,
  },
  methods: {
    handleClick() {
      this.$router.push(this.link)
    },
  },
}
</script>
