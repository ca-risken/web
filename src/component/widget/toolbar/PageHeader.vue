<template>
  <v-row dense justify="center" align-content="center">
    <v-col cols="12">
      <v-toolbar color="background" flat>
        <v-toolbar-title class="grey--text text--darken-4">
          <v-icon large class="pr-2" :color="iconColor">{{ icon }}</v-icon>
          {{ title }}
        </v-toolbar-title>
      </v-toolbar>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    icon: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    iconColor: {
      type: String,
      default: '',
    },
  },
}
</script>
