<template>
  <v-card tile>
    <v-card-text class="pa-0">
      <div class="d-flex">
        <div class="flex pa-3">
          <div class="layout justify-center align-center">
            <v-icon size="54px" :color="color">{{ icon }}</v-icon>
          </div>
        </div>
        <div class="flex pa-3" :class="color">
          <div class="white--text headline">{{ title }}</div>
          <span class="white--text">{{ subTitle }}</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'MiniStatistic',
  props: {
    icon: String,
    title: String,
    subTitle: String,
    color: String,
  },
}
</script>
