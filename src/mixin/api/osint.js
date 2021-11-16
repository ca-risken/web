import Util from '@/util'

const osint = {
  data: () => {
    return {
      detectWordDefault: ['dev', 'stg', 'jenkins', 'admin'],
      DataSourceReferenceResourceType: new Map([
        ['Domain', new Array('osint:subdomain')],
        ['Website', new Array('osint:website')],
      ]),
    }
  },
  methods: {
    async listOSINT(project_id) {
      const res = await this.$axios
        .get('/osint/list-osint/?project_id=' + project_id)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data
    },
    async getOSINT(project_id, osint_id) {
      const res = await this.$axios
        .get(
          '/osint/get-osint/?project_id=' + project_id + '&osint_id=' + osint_id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data
    },
    async deleteOSINT(project_id, osint_id) {
      const param = {
        project_id: project_id,
        osint_id: osint_id,
      }
      await this.$axios.post('/osint/delete-osint/', param).catch((err) => {
        return Promise.reject(err)
      })
    },
    async putOSINT(project_id, osint_id, resource_type, resource_name) {
      const param = {
        project_id: project_id,
        osint: {
          osint_id: osint_id,
          project_id: project_id,
          resource_type: resource_type,
          resource_name: resource_name,
        },
      }
      const res = await this.$axios
        .post('/osint/put-osint/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data
    },
    async listOSINTDataSource(project_id) {
      const res = await this.$axios
        .get('/osint/list-datasource/?project_id=' + project_id)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data
    },
    async listRelOSINTDataSource(project_id, osint_id, osint_data_source_id) {
      const res = await this.$axios
        .get(
          '/osint/list-rel-datasource/' +
            '?project_id=' +
            project_id +
            '&osint_data_source_id=' +
            osint_data_source_id +
            '&osint_id=' +
            osint_id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data
    },
    async deleteRelOSINTDataSource(project_id, rel_osint_data_source_id) {
      const param = {
        project_id: project_id,
        rel_osint_data_source_id: rel_osint_data_source_id,
      }
      await this.$axios
        .post('/osint/delete-rel-datasource/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async AttachReferenceDataSource(project_id, osint_id, resource_type) {
      const listDataSource = await this.listOSINTDataSource(project_id)
      var dataSources = listDataSource.osint_data_source
      for (var i = 0; i < dataSources.length; i++) {
        var dataSource = dataSources[i]
        var existRelOsintDataSource = await this.CheckExistRelOSINTDataSource(
          project_id,
          dataSource.osint_data_source_id,
          osint_id
        )
        if (
          this.matchResourceType(dataSource.name, resource_type) &&
          !existRelOsintDataSource
        ) {
          var isPutDetectWord = false
          if (resource_type == 'Domain') {
            isPutDetectWord = true
          }
          await this.attachRelOSINTDataSource(
            project_id,
            0,
            dataSource.osint_data_source_id,
            osint_id,
            0,
            true,
            isPutDetectWord
          )
        }
      }
    },
    matchResourceType(data_source_name, resource_type) {
      if (!this.DataSourceReferenceResourceType.has(resource_type)) {
        return false
      }
      var dataSourceArr =
        this.DataSourceReferenceResourceType.get(resource_type)
      if (dataSourceArr.includes(data_source_name)) {
        return true
      }
      return false
    },
    async CheckExistRelOSINTDataSource(
      project_id,
      osint_data_source_id,
      osint_id
    ) {
      var res = await this.listRelOSINTDataSource(
        project_id,
        osint_data_source_id,
        osint_id
      ).catch((err) => {
        return Promise.reject(err)
      })
      if (
        !res.rel_osint_data_source ||
        res.rel_osint_data_source.length() < 1
      ) {
        return false
      }
      return true
    },
    async attachRelOSINTDataSource(
      project_id,
      rel_osint_data_source_id,
      osint_data_source_id,
      osint_id,
      scan_at,
      isNew,
      isPutDetectWord
    ) {
      const ret = await this.putRelOSINTDataSource(
        project_id,
        rel_osint_data_source_id,
        osint_data_source_id,
        osint_id
      )
      const updated = ret.rel_osint_data_source
      if (isNew && isPutDetectWord && updated.rel_osint_data_source_id) {
        this.detectWordDefault.forEach(async (word) => {
          await this.putDetectWord(
            project_id,
            updated.rel_osint_data_source_id,
            word
          )
        })
      }
    },
    async putRelOSINTDataSource(
      project_id,
      rel_osint_data_source_id,
      osint_data_source_id,
      osint_id,
      scan_at
    ) {
      const param = {
        project_id: project_id,
        rel_osint_data_source: {
          rel_osint_data_source_id: rel_osint_data_source_id,
          osint_data_source_id: osint_data_source_id,
          osint_id: osint_id,
          project_id: project_id,
          status: 2, // CONFIGURED
          status_detail:
            'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      const res = await this.$axios
        .post('/osint/put-rel-datasource/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data
    },
    async listDetectWord(project_id, rel_osint_data_source_id) {
      const res = await this.$axios
        .get(
          '/osint/list-word/?project_id=' +
            project_id +
            '&rel_osint_data_source_id=' +
            rel_osint_data_source_id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data
    },
    async putDetectWord(project_id, rel_osint_data_source_id, word) {
      const param = {
        project_id: project_id,
        osint_detect_word: {
          rel_osint_data_source_id: rel_osint_data_source_id,
          word: word,
          project_id: project_id,
        },
      }
      const res = await this.$axios
        .post('/osint/put-word/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data
    },
    async deleteDetectWord(project_id, osint_detect_word_id) {
      const param = {
        project_id: project_id,
        osint_detect_word_id: osint_detect_word_id,
      }
      await this.$axios.post('/osint/delete-word/', param).catch((err) => {
        return Promise.reject(err)
      })
    },
    async deleteDetectWordByRelOsintDataSourceID(
      project_id,
      rel_osint_data_source_id
    ) {
      const resListWord = await this.$axios
        .get(
          '/osint/list-word/?project_id=' +
            project_id +
            '&rel_osint_data_source_id=' +
            rel_osint_data_source_id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (
        !resListWord.data ||
        !resListWord.data.data ||
        !resListWord.data.data.osint_detect_word
      ) {
        return
      }
      var listWord = resListWord.data.data.osint_detect_word
      listWord.forEach(async (word) => {
        await this.deleteDetectWord(word.project_id, word.osint_detect_word_id)
      })
    },
  },
}

export default osint
