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
      if ( score < 0.5 ) {
        return 'success'
      } else if ( 0.75 < score ) {
        return 'red'
      } else {
        return 'yellow'
      }
    },
    getDataSourceIcon: (dataSource) => {
      if ( !dataSource.split(':')[0] ) { return 'mdi-help-circle-outline' }
      switch (dataSource.split(':')[0]) {
        case 'aws':
          return 'mdi-aws'
        case 'diagnosis':
          return 'mdi-jira'
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
        default:
          return 'mdi-help-circle-outline'
      }
    },
  },
}

export default mixin 
