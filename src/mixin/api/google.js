const google = {
  data: () => {
    return {}
  },
  methods: {
    async listGCPAPI() {
      const res = await this.$axios.get(
        '/google/list-gcp/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.gcp ) {
        return []
      }
      return res.data.data.gcp  
    },


    async putGCPAPI(param) {
      const res = await this.$axios.post('/google/put-gcp/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },

    async deleteGCPAPI(gcpID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        gcp_id: gcpID,
      }
      const res = await this.$axios.post('/google/delete-gcp/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
  },
}

export default google 
