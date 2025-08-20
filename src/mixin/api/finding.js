import axios from 'axios'

const longAxios = axios.create({
  baseURL: '/api/v1',
  timeout: 120000,
})

const getCookies = (name) => {
  const value = '; ' + document.cookie
  const parts = value.split('; ' + name + '=')
  if (parts.length == 2) return parts.pop().split(';').shift()
  return null
}

const finding = {
  data: () => {
    return {}
  },
  methods: {
    // FindingAPI
    async listFinding(searchCond) {
      const res = await this.$axios
        .get(
          '/finding/list-finding/?project_id=' +
            this.getCurrentProjectID() +
            searchCond
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data) {
        return { total: 0, finding_id: [] } // empty list
      }
      return res.data.data
    },
    async listFindingForOrganization(organization_id, searchCond) {
      const res = await this.$axios
        .get(
          '/finding/list-finding-for-organization/?organization_id=' +
            organization_id +
            searchCond
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data) {
        return { total: 0, finding_id: [] } // empty list
      }
      return res.data.data
    },
    async listFindingCnt(searchCond) {
      const res = await this.$axios
        .get(
          '/finding/list-finding/?project_id=' +
            this.getCurrentProjectID() +
            searchCond
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.total) {
        return 0
      }
      return res.data.data.total
    },
    async getFinding(id) {
      const res = await this.$axios
        .get(
          '/finding/get-finding/?project_id=' +
            this.getCurrentProjectID() +
            '&finding_id=' +
            id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.finding) {
        return {} // empty
      }
      if (!res.data.data.finding.score) {
        res.data.data.finding.score = 0.0 // set zero value
      }
      return res.data.data.finding
    },
    async listFindingTag(id) {
      const res = await this.$axios
        .get(
          '/finding/list-finding-tag/?project_id=' +
            this.getCurrentProjectID() +
            '&finding_id=' +
            id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.tag) {
        return {} // empty
      }
      return res.data.data.tag
    },
    async listFindingTagName() {
      const res = await this.$axios
        .get(
          '/finding/list-finding-tag-name/?project_id=' +
            this.getCurrentProjectID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.tag) {
        return [] // empty
      }
      return res.data.data.tag
    },
    async getPendFinding(id) {
      const res = await this.$axios
        .get(
          '/finding/get-pend-finding/?project_id=' +
            this.getCurrentProjectID() +
            '&finding_id=' +
            id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.pend_finding) {
        return {} // empty
      }
      return res.data.data.pend_finding
    },
    async listResourceID(searchCond) {
      const res = await this.$axios
        .get(
          '/finding/list-resource/?project_id=' +
            this.getCurrentProjectID() +
            searchCond
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data) {
        return [] // empty
      }
      return res.data.data
    },
    async getResource(id) {
      const res = await this.$axios
        .get(
          '/finding/get-resource/?project_id=' +
            this.getCurrentProjectID() +
            '&resource_id=' +
            id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.resource) {
        return {} // empty
      }
      return res.data.data.resource
    },
    async listResourceTag(id) {
      const res = await this.$axios
        .get(
          '/finding/list-resource-tag/?project_id=' +
            this.getCurrentProjectID() +
            '&resource_id=' +
            id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.tag) {
        return [] // empty
      }
      return res.data.data.tag
    },
    async listResourceTagName() {
      const res = await this.$axios
        .get(
          '/finding/list-resource-tag-name/?project_id=' +
            this.getCurrentProjectID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.tag) {
        return [] // empty
      }
      return res.data.data.tag
    },

    async tagFinding(project_id, findingID, tag) {
      const param = {
        project_id: project_id,
        tag: {
          project_id: project_id,
          finding_id: findingID,
          tag: tag,
        },
      }
      await this.$axios.post('/finding/tag-finding/', param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
    },

    async untagFinding(project_id, finding_tag_id) {
      const param = {
        project_id: project_id,
        finding_tag_id: finding_tag_id,
      }
      await this.$axios.post('/finding/untag-finding/', param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
    },
    async deletePendFinding(project_id, finding_id) {
      const param = {
        project_id: project_id,
        finding_id: finding_id,
      }
      await this.$axios
        .post('/finding/delete-pend-finding/', param)
        .catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
    },
    async putPendFinding(project_id, finding_id, note, reason, expired_at) {
      const param = {
        project_id: project_id,
        pend_finding: {
          finding_id: finding_id,
          project_id: project_id,
          note: note,
          reason: reason,
        },
      }
      if (expired_at) {
        param.pend_finding.expired_at = expired_at
      }
      await this.$axios
        .post('/finding/put-pend-finding/', param)
        .catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
    },
    async deleteFinding(project_id, finding_id) {
      const param = {
        project_id: project_id,
        finding_id: finding_id,
      }
      await this.$axios.post('/finding/delete-finding/', param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
    },
    async deleteResourceAPI(resource_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        resource_id: resource_id,
      }
      await this.$axios
        .post('/finding/delete-resource/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },

    // FindingSetting API
    async listFindingSettingAPI(statusParam) {
      const res = await this.$axios
        .get(
          '/finding/list-finding-setting/?project_id=' +
            this.getCurrentProjectID() +
            statusParam
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.finding_setting) {
        return []
      }
      return res.data.data.finding_setting
    },
    async putFindingSettingAPI(param) {
      await this.$axios
        .post('/finding/put-finding-setting/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async deleteFindingSettingAPI(finding_setting_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        finding_setting_id: finding_setting_id,
      }
      await this.$axios
        .post('/finding/delete-finding-setting/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async getRecommend(findingID) {
      const res = await this.$axios
        .get(
          '/finding/get-recommend/?project_id=' +
            this.getCurrentProjectID() +
            '&finding_id=' +
            findingID
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.recommend) {
        return {} // empty
      }
      return res.data.data.recommend
    },
    async getAISummary(findingID, lang) {
      const res = await longAxios
        .get(
          '/finding/get-ai-summary/?project_id=' +
            this.getCurrentProjectID() +
            '&finding_id=' +
            findingID +
            '&lang=' +
            lang
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.answer) {
        return '' // empty
      }
      return res.data.data.answer
    },
    async getAISummaryStream(findingID, lang, signal) {
      // Using fetch API for streaming response
      const fetchOptions = {
        method: 'GET',
        headers: {
          'X-Xsrf-Token': getCookies('XSRF-TOKEN'),
        },
        credentials: 'same-origin',
        signal: signal, // Abort signal
      }
      return await fetch(
        '/api/v1/finding/get-ai-summary-stream/?project_id=' +
          this.getCurrentProjectID() +
          '&finding_id=' +
          findingID +
          '&lang=' +
          lang,
        fetchOptions
      )
    },
  },
}

export default finding
