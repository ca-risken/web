<template>
  <v-layout-item
    v-scroll="onScroll"
    class="text-end pointer-events-none"
    model-value
    position="bottom"
    size="88"
  >
    <div class="ma-4">
      <v-fab-transition>
        <v-btn
          class="mt-auto pointer-events-initial"
          size="large"
          color="pink-lighten-2"
          v-show="fab"
          @click="toTop"
          icon="mdi-chevron-up"
        />
      </v-fab-transition>
    </div>
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
  methods: {
    onScroll() {
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
