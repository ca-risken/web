import axios from 'axios'

const longAxios = axios.create({
  baseURL: '/api/v1',
  timeout: 120000,
})

const datasource = {
  data: () => {
    return {}
  },
  methods: {
    async getAttackFlowAnalysis(cloudType, cloudID, resourceName) {
      const res = await longAxios
        .get(
          '/datasource/get-attack-flow-analysis/?project_id=' +
            this.getCurrentProjectID() +
            '&cloud_type=' +
            cloudType +
            '&cloud_id=' +
            cloudID +
            '&resource_name=' +
            resourceName
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data) {
        return {} // empty
      }
      return res.data.data
    },
  },
}

export default datasource
