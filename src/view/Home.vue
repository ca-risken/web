<template><div /></template>
<script>
import mixin from "@/mixin"

export default {
  name: "Home",
  mounted() {
    this.redirectDashBoard()
  },
  mixins: [mixin],
  methods: {
    async redirectDashBoard() {
      this.$router.push("/dashboard")
    },
  },
}
</script>
