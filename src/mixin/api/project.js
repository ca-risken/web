const project = {
  data: () => {
    return {}
  },
  methods: {
    async listProjectAPI(param) {
      const res = await this.$axios.get('/project/list-project/' + param ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.project ) {
        return []
      }
      return res.data.data.project  
    },

    async createProjectAPI(name) {
      const param = {
        user_id: this.$store.state.user.user_id,
        name: name,
      }
      const res = await this.$axios.post('/project/create-project/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.project ) {
        return {}
      }
      return res.data.data.project
    },

    async updateProjectAPI(name) {
      const param = {
        project_id: this.$store.state.project.project_id,
        name: name,
      }
      const res = await this.$axios.post('/project/update-project/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.project ) {
        return {}
      }
      return res.data.data.project
    },

    async tagProjectAPI(tag, color) {
      const param = {
        project_id: this.$store.state.project.project_id,
        tag: tag,
        color: color,
      }
      const res = await this.$axios.post('/project/tag-project/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
    async untagProjectAPI(tag) {
      const param = {
        project_id: this.$store.state.project.project_id,
        tag: tag,
      }
      const res = await this.$axios.post('/project/untag-project/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
    async deleteProjectAPI() {
      const param = {
        project_id: this.$store.state.project.project_id,
      }
      const res = await this.$axios.post('/project/delete-project/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
  },
}

export default project 
