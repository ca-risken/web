<template>
  <v-card
    class="mx-auto"
    :color="color"
    dark
    @click="handleClick"
  >
    <v-card-title>
      <v-icon large left>{{ icon }}</v-icon>
      <span class="title font-weight-bold">{{ category }}</span>
    </v-card-title>
    <v-card-text class="headline font-weight-black ml-4">
      {{ title }}
    </v-card-text>
    <v-card-text class="subtitle font-weight-light">
      "{{ subTitle }}"
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    icon: String,
    category: String,
    title: String,
    subTitle: String,
    color: String,
    link: String,
  },
  methods: {
    handleClick() {
      this.$router.push(this.link)
    }
  }
}
</script>
