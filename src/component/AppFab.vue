<template>
  <v-fab-transition>
    <v-btn
      fab="fab"
      medium
      class="mb-1"
      dark="dark"
      fixed="fixed"
      bottom="bottom"
      right="right"
      color="pink lighten-2"
      v-show="fab"
      @click="toTop"
    >
      <v-icon>keyboard_arrow_up</v-icon>
    </v-btn>
  </v-fab-transition>
</template>

<script>
export default {
  name: 'AppFab',
  data() {
    return {
      fab: false,
    }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll() {
      if (typeof window === 'undefined') return
      this.fab = window.scrollY > 40
    },
    toTop() {
      this.$vuetify.goTo(0)
    },
  },
}
</script>
