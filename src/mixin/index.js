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
    getColorByFindingStatus(status) {
      if (typeof status !== 'string' || status ===  '') return 'grey'
      switch (status.toLocaleUpperCase()) {
        case 'ACTIVE':
          return 'success'
        case 'PENDING':
          return 'grey'
        default:
          return 'grey'
      }
    },
    getSeverityColor: (severity) => {
      if (typeof severity !== 'string' || severity ===  '') return ''
      switch (severity.toLowerCase()) {
        case 'high':
          return 'red darken-2'
        case 'medium':
          return 'yellow darken-3'
        default:
          return 'teal lighten-2'
      }
    },
    getHistoryTypeColor: (type) => {
      if (typeof type !== 'string' || type ===  '') return ''
      switch (type.toLowerCase()) {
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
      if ( typeof dataSource !== 'string' || !dataSource.split(':')[0] ) { return 'mdi-help-circle-outline' }
      switch (dataSource.split(':')[0].toLowerCase()) {
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
      if ( typeof dataSource !== 'string' || !dataSource.split(':')[0] ) { return '' }
      switch (dataSource.split(':')[0].toLowerCase()) {
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
      switch (Number(status)) {
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
      if ( Number(status) === 3) return true
      return false
    },
    getDataSourceStatusColor: (status) => {
      switch (Number(status)) {
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
      switch (Number(status)) {
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
    getFindingStatus: (statusText) => {
      if (typeof statusText !== 'string' || statusText ===  '') return 0
      switch (statusText.toUpperCase()) {
        case 'ALL':
          return 0
        case 'ACTIVE':
          return 1
        case 'PENDING':
          return 2
        default:
          return 0
      }
    },
    getFindingStatusText: (status) => {
      switch (Number(status)) {
        case 0:
          return 'ALL'
        case 1:
          return 'ACTIVE'
        case 2:
          return 'PENDING'
        default:
          return 'ALL'
      }
    },
    getAlertStatus: (statusText) => {
      if (typeof statusText !== 'string' || statusText ===  '') return 0
      switch (statusText.toUpperCase()) {
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
      if (typeof str !== 'string' ) return '' 
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
  },
}

export default mixin 
