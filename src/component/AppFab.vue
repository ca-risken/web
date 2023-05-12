<template>
  <v-layout-item
    v-scroll="onScroll"
    class="text-end"
    model-value
    position="bottom"
    size="60"
  >
    <v-fab-transition>
      <v-btn
        class="mt-auto"
        size="large"
        color="pink-lighten-2"
        v-show="fab"
        @click="toTop"
        icon="mdi-chevron-up"
      />
    </v-fab-transition>
  </v-layout-item>
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
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    },
  },
}
</script>

<style scoped>
.pointer-events-none {
  pointer-events: none;
}
.pointer-events-initial {
  pointer-events: initial;
}
</style>
