var mixin = {
  methods: {
    reload: function() {
      this.$router.go({path: this.$router.currentRoute.path, force: true})
    },
  },
}

export default mixin 
