const signin = {
  data: () => {
    return {}
  },
  methods: {
    async signinAPI() {
      const res = await this.$axios.get('/signin/').catch((err) => {
        return Promise.reject(err)
      })
      if (!res.data.user_id) {
        return
      }
      return res.data.user_id
    },
    async signoutAPI() {
      await this.$axios.get('/signout/').catch((err) => {
        return Promise.reject(err)
      })
      return
    },
  },
}

export default signin
