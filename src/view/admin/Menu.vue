<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-menu-open</v-icon>
              {{ $t(`submenu['Menu']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-row dense justify="center" align-content="center">
        <v-btn
          depressed
          elevation="1"
          color="primary"
          class="ma-4"
          link
          :to="{
            path: '/admin/user/',
            query: {},
          }"
        >
          {{ $t(`submenu['Admin User']`) }}
        </v-btn>
      </v-row>
      <v-row dense justify="center" align-content="center">
        <v-btn
          depressed
          elevation="1"
          color="primary"
          class="ma-4"
          link
          :to="{
            path: '/admin/report/',
            query: {},
          }"
        >
          {{ $t(`submenu['ReportFinding']`) }}
        </v-btn>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'AdminMenu',
  mixins: [],
  components: {},
  data() {
    return {}
  },
  mounted() {},
  methods: {},
}
</script>
