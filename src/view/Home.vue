<template><div /></template>
<script>
import mixin from '@/mixin'

export default {
  name: 'AppHome',
  mounted() {
    this.redirectDashBoard()
  },
  mixins: [mixin],
  methods: {
    async redirectDashBoard() {
      this.$router.push('/dashboard')
    },
  },
}
</script>
