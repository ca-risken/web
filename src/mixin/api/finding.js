const finding = {
  data: () => {
    return {}
  },
  methods: {
    // FindingAPI 
    async listFinding(searchCond){
      const res = await this.$axios.get(
        '/finding/list-finding/?project_id=' + this.$store.state.project.project_id + searchCond).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data ) {
        return {finding_id: []} // empty list
      }
      return res.data.data
    },
    async listFindingByResouceName(resource_name){
      const res = await this.$axios.get(
        '/finding/list-finding/?project_id=' + this.$store.state.project.project_id +
        '&resource_name=' + resource_name ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.finding_id ) {
        return [] // empty list
      }
      return res.data.data.finding_id
    },
    async getFinding(id) {
      const res = await this.$axios.get(
        '/finding/get-finding/?project_id='+ this.$store.state.project.project_id +'&finding_id=' + id).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.finding ) {
        return {} // empty
      }
      return res.data.data.finding
    },
    async listFindingTag(id) {
      const res = await this.$axios.get(
        '/finding/list-finding-tag/?project_id='+ this.$store.state.project.project_id +'&finding_id=' + id).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.tag ) {
        return {} // empty
      }
      return res.data.data.tag
    },
    async listFindingTagName() {
      const res = await this.$axios.get(
        '/finding/list-finding-tag-name/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.tag ) {
        return [] // empty
      }
      return res.data.data.tag
    },    
    async getPendFinding(id) {
      const res = await this.$axios.get(
        '/finding/get-pend-finding/?project_id='+ this.$store.state.project.project_id +'&finding_id=' + id).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.pend_finding ) {
        return {} // empty
      }
      return res.data.data.pend_finding
    },
    async listResourceID(searchCond){
      const res = await this.$axios.get(
        '/finding/list-resource/?project_id=' + this.$store.state.project.project_id + searchCond
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data ) {
        return [] // empty
      }
      return res.data.data
    },
    async getResource(id) {
      const res = await this.$axios.get('/finding/get-resource/?project_id='+ this.$store.state.project.project_id +'&resource_id=' + id).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.resource ) {
        return {} // empty
      }
      return res.data.data.resource
    },

    async tagFinding( findingID, tag ) {
      const param = {
        project_id: this.$store.state.project.project_id,
        tag: {
          project_id: this.$store.state.project.project_id,
          finding_id: findingID,
          tag: tag,
        }
      }
      await this.$axios.post('/finding/tag-finding/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
    },

    async deletePendFinding(project_id, finding_id) {
      const param = {
        project_id: project_id,
        finding_id: finding_id,
      }
      await this.$axios.post('/finding/delete-pend-finding/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
    },
    async putPendFinding(finding_id) {
      const param = {
        project_id: this.$store.state.project.project_id,
        pend_finding: {
          finding_id: finding_id,
          project_id: this.$store.state.project.project_id,
        }
      }
      await this.$axios.post('/finding/put-pend-finding/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
    },
    async deleteFinding(finding_id) {
      const param = {
          project_id: this.$store.state.project.project_id,
          finding_id: finding_id,
      }
      await this.$axios.post('/finding/delete-finding/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
    },
  },
}

export default finding 
