<template><div /></template>
<script>
import mixin from '@/mixin'
import signin from '@/mixin/api/signin'
import iam from '@/mixin/api/iam'

export default {
  name: 'AppHome',
  async mounted() {
    try {
      if (!this.$store.state.user.user_id) {
        await this.signinUser()
      } else {
        await this.reSign()
      }
    } catch (error) {
      if (![303, 401, 403].includes(error.response?.status)) {
        await this.$router.push(
          error.code === 'ECONNABORTED' ? '/timeout' : '/error'
        )
      }
      return
    }
    return this.redirectDashBoard()
  },
  mixins: [mixin, signin, iam],
  methods: {
    async redirectDashBoard() {
      const { returnTo, ...query } = this.$route.query
      if (
        typeof returnTo === 'string' &&
        /^\/(?!\/)/.test(returnTo) &&
        !returnTo.includes('\\') &&
        !Array.from(returnTo).some((char) => char.charCodeAt(0) <= 32)
      ) {
        const path = this.$router.resolve(returnTo).path
        if (path !== '/' && !/^\/auth(?:\/|$)/.test(path)) {
          return this.$router.push(returnTo)
        }
      }
      this.$router.push({ path: '/dashboard', query })
    },
  },
}
</script>
