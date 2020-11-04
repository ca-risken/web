<template><div /></template>
<script>
import store from '@/store'
import mixin from '@/mixin'

export default {
  name: 'Home',
  mounted() { this.signinUser() },
  mixins: [mixin],
  methods: {
    async signinUser() {
      store.commit('storeUser', {})
      const userID = await this.signin().catch((err) =>  {
        return Promise.reject(err)
      })
      const user = await this.$axios.get('/iam/get-user?user_id=' + userID).catch((err) => {
        return Promise.reject(err)
      })
      store.commit('storeUser', user.data.data.user)
      this.$router.push('/dashboard')
    }
  },
}
</script>
