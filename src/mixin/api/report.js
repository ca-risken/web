const report = {
  data: () => {
    return {}
  },
  methods: {
    // Report API
    async listReport() {
      const res = await this.$axios
        .get('/report/list-report/?project_id=' + this.getCurrentProjectID())
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.report) {
        return [] // empty list
      }
      return res.data.data.report
    },

    async getReport(reportId) {
      const res = await this.$axios
        .get(
          '/report/get-report/?project_id=' +
            this.getCurrentProjectID() +
            '&report_id=' +
            reportId
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.report) {
        return {} // empty
      }
      return res.data.data.report
    },

    async putReport(report) {
      const param = {
        project_id: this.getCurrentProjectID(),
        report_id: report.report_id || 0,
        name: report.name,
        type: report.type || 'Markdown',
        status: report.status || 'OK',
        content: report.content || '',
      }
      const res = await this.$axios
        .post('/report/put-report/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.report) {
        return {} // empty
      }
      return res.data.data.report
    },
  },
}

export default report
