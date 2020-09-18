<template><div /></template>
<script>
import store from '@/store'
export default {
  name: 'Home',
  mounted() { this.signin() },
  methods: {
    async signin() {
      store.commit('storeUser', {})
      const res = await this.$axios.get('/signin/').catch((err) =>  {
        return Promise.reject(err)
      })
      if (res.data.user_id) {
        const user = await this.$axios.get('/iam/get-user?user_id=' + res.data.user_id).catch((err) => {
          return Promise.reject(err)
        })
        store.commit('storeUser', user.data.data.user)
      }
      this.$router.push('/dashboard')
    }
  },
}
</script>
