const aws = {
  data: () => {
    return {}
  },
  methods: {
    async listAWSAPI() {
      const res = await this.$axios.get(
        '/aws/list-aws/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.aws ) {
        return []
      }
      return res.data.data.aws  
    },
    async deleteAWSAPI(awsID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        aws_id: awsID,
      }
      const res = await this.$axios.post('/aws/delete-aws/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
    async putAWSAPI(name, aws_account_id) {
      const param = { 
        project_id: this.$store.state.project.project_id,
        aws: {
          project_id: this.$store.state.project.project_id,
          name: name,
          aws_account_id: aws_account_id,
        },
      }
      const res = await this.$axios.post('/aws/put-aws/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },

    async listAWSDataSourceAPI(aws_id, data_source) {
      const res = await this.$axios.get(
        '/aws/list-datasource/'
            + '?project_id=' + this.$store.state.project.project_id 
            + '&aws_id=' + aws_id
            + '&data_source=' + data_source

      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.data_source ) {
        return []
      }
      return res.data.data.data_source  
    },
    async detachAWSDataSourceAPI(aws_id, aws_data_source_id) {
      const param = {
        project_id: this.$store.state.project.project_id,
        aws_id: aws_id,
        aws_data_source_id: aws_data_source_id
      }
      const res = await this.$axios.post('/aws/detach-datasource/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
    async attachAWSDataSourceAPI(param) {
      const res = await this.$axios.post('/aws/attach-datasource/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },

    async invokeAWSScanAPI(aws_id, aws_data_source_id) {
      const param = {
        project_id: this.$store.state.project.project_id,
        aws_id: aws_id,
        aws_data_source_id: aws_data_source_id,
      }
      const res = await this.$axios.post('/aws/invoke-scan/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },

    async describeArnAPI(arn) {
      const res = await this.$axios.get(
        '/aws/describe-arn/?project_id=' + this.$store.state.project.project_id + '&arn=' + arn
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.arn ) {
        return []
      }
      return res.data.data.arn  
    },
    async listCloudTrailAPI(
      aws_id,
      region,
      start_time,
      end_time,
      attr_key,
      attr_value,
      next_token,
    ) {
      const res = await this.$axios.get('/aws/list-cloudtrail/'
          + '?project_id=' + this.$store.state.project.project_id
          + '&aws_id=' + aws_id
          + '&region=' + region
          + '&start_time=' + start_time
          + '&end_time=' + end_time
          + '&attribute_key=' + Number(attr_key)
          + '&attribute_value=' + attr_value
          + '&next_token=' + encodeURIComponent(next_token)
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data ) {
        return {}
      }
      return res.data.data
    },
    async listConfigHistoryAPI(
      aws_id,
      region,
      resource_type,
      resource_id,
      earlier_time,
      later_time,
      starting_token, // like: next_token
    ) {
      const res = await this.$axios.get('/aws/list-config-history/'
          + '?project_id=' + this.$store.state.project.project_id
          + '&aws_id=' + aws_id
          + '&region=' + region
          + '&resource_type=' + resource_type
          + '&resource_id=' + resource_id
          + '&earlier_time=' + earlier_time
          + '&later_time=' + later_time
          + '&starting_token=' + encodeURIComponent(starting_token)
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data ) {
        return {}
      }
      return res.data.data
    },
  },
}

export default aws 
