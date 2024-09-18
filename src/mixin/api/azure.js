const azure = {
  data: () => {
    return {}
  },
  methods: {
    async listAzureDataSourceAPI() {
      const res = await this.$axios
        .get(
          '/azure/list-azure-datasource/?project_id=' +
            this.getCurrentProjectID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.azure_data_source) {
        return []
      }
      return res.data.data.azure_data_source
    },

    async listAzureAPI() {
      const res = await this.$axios
        .get('/azure/list-azure/?project_id=' + this.getCurrentProjectID())
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.azure) {
        return []
      }
      return res.data.data.azure
    },

    async putAzureAPI(param) {
      const res = await this.$axios
        .post('/azure/put-azure/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },

    async deleteAzureAPI(azureID) {
      const param = {
        project_id: this.getCurrentProjectID(),
        azure_id: azureID,
      }
      const res = await this.$axios
        .post('/azure/delete-azure/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },

    async getRelAzureDataSourceAPI(azureID, dataSourceID) {
      let url =
        '/azure/get-rel-azure-datasource/?project_id=' +
        this.getCurrentProjectID()
      if (azureID) {
        url += '&azure_id=' + azureID
      }
      if (dataSourceID) {
        url += '&azure_data_source_id=' + dataSourceID
      }
      const res = await this.$axios.get(url).catch((err) => {
        return Promise.reject(err)
      })
      return res
    },

    async attachAzureDataSourceAPI(param) {
      const res = await this.$axios
        .post('/azure/attach-azure-datasource/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },

    async detachAzureDataSourceAPI(param) {
      const res = await this.$axios
        .post('/azure/detach-azure-datasource/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },

    async invokeScanAzureAPI(param) {
      const res = await this.$axios
        .post('/azure/invoke-scan-azure/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
  },
}

export default azure
