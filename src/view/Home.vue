<template><div /></template>
<script>
import mixin from '@/mixin'
import signin from '@/mixin/api/signin'
import iam from '@/mixin/api/iam'

export default {
  name: 'AppHome',
  async mounted() {
    await this.reSign()
    this.redirectDashBoard()
  },
  mixins: [mixin, signin, iam],
  methods: {
    async redirectDashBoard() {
      this.$router.push('/dashboard')
    },
  },
}
</script>
