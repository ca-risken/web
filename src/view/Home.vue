<template><div /></template>
<script>
export default {
  name: 'Home',
  mounted() { this.signin() },
  methods: {
    async signin() {
      await this.$axios.get('/signin/').catch((err) =>  {
        return Promise.reject(err)
      })
      this.$router.push('/dashboard')
    }
  },
}
</script>
