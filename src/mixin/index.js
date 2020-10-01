var mixin = {
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
    getServerityColorByScore: (score) => {
      if ( score <= 0.6 ) {
        return 'success'
      } else if ( score <= 0.8 ) {
        return 'yellow'
      } else {
        return 'red'
      }
    },
    getDataSourceIcon: (dataSource) => {
      if ( !dataSource.split(':')[0] ) { return 'mdi-help-circle-outline' }
      switch (dataSource.split(':')[0]) {
        case 'aws':
          return 'mdi-aws'
        case 'diagnosis':
          return 'mdi-jira'
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
  },
}

export default mixin 
