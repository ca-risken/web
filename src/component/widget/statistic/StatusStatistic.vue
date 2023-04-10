<template>
  <v-card tile height="98%">
    <v-container justify="center" align="center">
      <v-row justify="center" align="center">
        <v-col cols="4" justify="center" align="center">
          <v-card-text class="pa-0 align-center">
            <v-icon size="160px" :color="color">{{ icon }}</v-icon>
          </v-card-text>
        </v-col>
        <v-col cols="8" justify="center" align="left">
          <v-card-text>
            <span class="headline font-weight-black">{{ description }}</span>
          </v-card-text>
          <v-card-text>
            <span class="subtitle font-weight-light">{{ detail }}</span>
          </v-card-text>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: 'StatusStatistic',
  props: {
    icon: String,
    color: String,
    description: String,
    detail: String,
  },
}
</script>
