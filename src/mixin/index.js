let mixin = {
  data: () => {
    return {
      dataSourceList: [
        'aws:guard-duty',
        'aws:access-analyzer',
        'aws:iam-checker',
        'diagnosis:jira',
        'diagnosis:wpscan',
        'osint:subdomain',
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
      } else if ( cnt <= 1 ) {
        return 'teal lighten-2'
      } else if ( cnt <= 3 ) {
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
          return 'Not configured'
        case 4:
          return 'Error'
        default:
          return 'Unknown'
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
    getDataSourceStatusColor: (status) => {
      switch (status) {
        case 1:
          return 'green'
        case 2:
          return 'blue'
        case 3:
          return 'grey'
        case 4:
          return 'red'
        default:
          return 'grey'
      }
    },
    cutLongText: (str, cutNum) => {
      if (str.length < cutNum || cutNum < 1 ) {
        return str
      }
      return str.substr(0, cutNum) + ' ...'
    },
  },
}

export default mixin 
