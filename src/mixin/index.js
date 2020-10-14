let mixin = {
  data: () => {
    return {
      dataSourceList: [
        'aws:guard-duty',
        'aws:access-analyzer',
        'aws:iam-checker',
        'diagnosis:jira',
      ],
    }
  },
  methods: {
    reload: function() {
      this.$router.go({path: this.$router.currentRoute.path, force: true})
    },
    getColorByCount(cnt) {
      if ( cnt <= 0 ) {
        return 'grey lighten-1'
      } else if ( cnt <= 1 ) {
        return 'info lighten-1'
      } else if ( cnt <= 3 ) {
        return 'yellow darken-3'
      } else {
        return 'red'
      }
    },
    getColorByScore: (score) => {
      if ( score <= 0.6 ) {
        return 'success'
      } else if ( score <= 0.8 ) {
        return 'yellow darken-3'
      } else {
        return 'red'
      }
    },
    getSeverityColor: (severity) => {
      switch (severity) {
        case 'high':
          return 'pink'
        case 'medium':
          return 'yellow darken-3'
        default:
          return 'teal'
      }
    },
    getHistoryTypeColor: (type) => {
      switch (type) {
        case 'created':
          return 'teal'
        case 'updated':
          return 'amber'
        case 'deleted':
          return 'grey'
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
        case 'intrigue':
          return 'http'
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
        case 'intrigue':
          return 'indigo'
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
  },
}

export default mixin 
