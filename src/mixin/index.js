let mixin = {
  data: () => {
    return {
      dataSourceList: [
        'aws:guard-duty',
        'aws:access-analyzer',
        'aws:admin-checker',
        'aws:cloudsploit',
        'diagnosis:jira',
        'diagnosis:wpscan',
        'osint:subdomain',
        'code:gitleaks',
        'google:asset',
        'google:cloudsploit',
        'google:scc',
      ],
      jira_datasource_id: 1001,
      wpscan_datasource_id: 1002,
      gitleaks_datasource_id: 1001,
    }
  },
  methods: {
    async signin() {
      const res = await this.$axios.get('/signin/').catch((err) =>  {
        return Promise.reject(err)
      })
      if (!res.data.user_id) {
        return
      }
      return res.data.user_id
    },
    reload: function() {
      this.$router.go({path: this.$router.currentRoute.path, force: true})
    },
    getColorByCount(cnt) {
      if ( cnt == 0 ) {
        return 'grey lighten-1'
      } else if ( cnt <= 10 ) {
        return 'teal lighten-2'
      } else if ( cnt <= 30 ) {
        return 'yellow darken-3'
      } else {
        return 'red darken-2'
      }
    },
    getColorByScore: (score) => {
      if ( score < 0.6 ) {
        return 'teal lighten-2'
      } else if ( score < 0.8 ) {
        return 'yellow darken-3'
      } else {
        return 'red darken-2'
      }
    },
    getColorRGBByScore: (score) => {
      if ( score < 0.6 ) {
        return '#4DB6AC'
      } else if ( score < 0.8 ) {
        return '#F9A825'
      } else {
        return '#D32F2F'
      }
    },
    getSeverityColor: (severity) => {
      switch (severity) {
        case 'high':
          return 'red darken-2'
        case 'medium':
          return 'yellow darken-3'
        default:
          return 'teal lighten-2'
      }
    },
    getHistoryTypeColor: (type) => {
      switch (type) {
        case 'created':
          return 'teal lighten-2'
        case 'updated':
          return 'yellow darken-3'
        case 'deleted':
          return 'grey lighten-1'
        default:
          return 'grey'
      }
    },
    getDataSourceIcon: (dataSource) => {
      if ( !dataSource.split(':')[0] ) { return 'mdi-help-circle-outline' }
      switch (dataSource.split(':')[0]) {
        case 'aws':
          return 'mdi-aws'
        case 'diagnosis':
          return 'mdi-bug-check-outline'
        case 'osint':
          return 'http'
        case 'code':
          return 'mdi-github'
        case 'google':
          return 'mdi-google-cloud'
          default:
          return 'mdi-help-circle-outline'
      }
    },
    getDataSourceIconColor: (dataSource) => {
      if ( !dataSource.split(':')[0] ) { return '' }
      switch (dataSource.split(':')[0]) {
        case 'aws':
          return 'orange'
        case 'diagnosis':
          return 'blue'
        case 'osint':
          return 'green'
        case 'code':
          return 'black'
        case 'google':
          return 'blue'
        default:
          return 'mdi-help-circle-outline'
      }
    },
    getDataSourceStatusText: (status) => {
      switch (status) {
        case 1:
          return 'OK'
        case 2:
          return 'Configured'
        case 3:
          return 'InProgress'
        case 4:
          return 'Error'
        default:
          return 'Unknown'
      }
    },
    isInProgressDataSourceStatus: (status) => {
      if ( status === 3) return true
      return false
    },
    getDataSourceStatusColor: (status) => {
      switch (status) {
        case 1:
          return 'green'
        case 2:
          return 'blue'
        case 3:
          return 'cyan'
        case 4:
          return 'red'
        default:
          return 'grey'
      }
    },
    getDataSourceStatusIcon: (status) => {
      switch (status) {
        case 1:
          return 'mdi-check-circle-outline'
        case 2:
          return 'mdi-wrench'
        case 3:
          return ''
        case 4:
          return 'mdi-alert-circle-outline'
        default:
          return ''
      }
    },
    getAlertStatus: (statusText) => {
      switch (statusText) {
        case 'ACTIVE':
          return 1
        case 'PENDING':
          return 2
        case 'DEACTIVATE':
          return 3
        default:
          return 0 // Unknown
      }
    },
    getAlertStatusText: (status) => {
      switch (status) {
        case 1:
          return 'ACTIVE'
        case 2:
          return 'PENDING'
        case 3:
          return 'DEACTIVE'
        default:
          return 'UNKNOWN'
      }
    },
    cutLongText: (str, cutNum) => {
      if (str.length < cutNum || cutNum < 1 ) {
        return str
      }
      return str.substr(0, cutNum) + ' ...'
    },
    getShortName: (longName) => {
      // colon
      if ( !longName.split(':').slice(-1)[0] ) { return longName }
      const endOfColon = longName.split(':').slice(-1)[0]

      // slash
      if ( !endOfColon.split('/') ) { return endOfColon }
      const slashSplited = endOfColon.split('/')

      if ( slashSplited.length < 2 ) {
        return slashSplited[slashSplited.length -1]
      }
      return slashSplited[slashSplited.length -2] + '/' + slashSplited[slashSplited.length -1]
    },

    // Common APIs ----------------------------------------------------------------
    // FindingAPI 
    async listFinding(searchCond){
      const res = await this.$axios.get(
        '/finding/list-finding/?project_id=' + this.$store.state.project.project_id + searchCond).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.finding_id ) {
        return [] // empty list
      }
      return res.data.data.finding_id
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
        this.clearList()
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
        this.clearList()
        return Promise.reject(err)
      })
      if ( !res.data.data.resource_id ) {
        return [] // empty
      }
      return res.data.data.resource_id
    },
    async getResource(id) {
      const res = await this.$axios.get('/finding/get-resource/?project_id='+ this.$store.state.project.project_id +'&resource_id=' + id).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      if ( !res.data.data.resource ) {
        return {} // empty
      }
      return res.data.data.resource
    },

  },
}

export default mixin 
