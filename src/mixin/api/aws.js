const aws = {
  data: () => {
    return {}
  },
  methods: {
    async listAWSAPI() {
      const res = await this.$axios
        .get('/aws/list-aws/?project_id=' + this.getCurrentProjectID())
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.aws) {
        return []
      }
      return res.data.data.aws
    },
    async deleteAWSAPI(awsID) {
      const param = {
        project_id: this.getCurrentProjectID(),
        aws_id: awsID,
      }
      const res = await this.$axios
        .post('/aws/delete-aws/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async putAWSAPI(name, aws_account_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        aws: {
          project_id: this.getCurrentProjectID(),
          name: name,
          aws_account_id: aws_account_id,
        },
      }
      const res = await this.$axios
        .post('/aws/put-aws/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },

    async listAWSDataSourceAPI(aws_id, data_source) {
      const res = await this.$axios
        .get(
          '/aws/list-datasource/' +
            '?project_id=' +
            this.getCurrentProjectID() +
            '&aws_id=' +
            aws_id +
            '&data_source=' +
            data_source
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.data_source) {
        return []
      }
      return res.data.data.data_source
    },
    async detachAWSDataSourceAPI(aws_id, aws_data_source_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        aws_id: aws_id,
        aws_data_source_id: aws_data_source_id,
      }
      const res = await this.$axios
        .post('/aws/detach-datasource/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async attachAWSDataSourceAPI(param) {
      const res = await this.$axios
        .post('/aws/attach-datasource/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },

    async invokeAWSScanAPI(aws_id, aws_data_source_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        aws_id: aws_id,
        aws_data_source_id: aws_data_source_id,
        scan_only: false, // optional
      }
      const res = await this.$axios
        .post('/aws/invoke-scan/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
  },
}

export default aws
