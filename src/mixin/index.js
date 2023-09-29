import Util from '@/util'
import store from '@/store'
const maskedPattern = /\*.*$/
let mixin = {
  data: () => {
    return {
      dataSourceList: [
        'aws:guard-duty',
        'aws:access-analyzer',
        'aws:admin-checker',
        'aws:cloudsploit',
        'aws:portscan',
        'diagnosis:wpscan',
        'diagnosis:portscan',
        'diagnosis:application-scan',
        'osint:subdomain',
        'osint:website',
        'code:gitleaks',
        'code:dependency',
        'google:asset',
        'google:cloudsploit',
        'google:scc',
        'google:portscan',
        'RISKEN',
      ],
      wpscan_datasource_id: 1002,
      diagnosis_portscan_datasource_id: 1003,
      diagnosis_application_scan_datasource_id: 1004,
      gitleaks_datasource_id: 1001,
      dependency_datasource_id: 1002,
      resourceNameCombobox: [],
      projectTagDialog: false,
      namespaceTagMap: new Map([
        ['aws', 'aws'],
        ['google', 'google'],
        // ['gcp', 'google'],
        ['diagnosis', 'diagnosis'],
        ['code', 'code'],
        ['osint', 'osint'],
      ]),
      awsResourceTypeTagMap: new Map([
        ['access-analyzer', 'access-analyzer'],
        ['ec2', 'ec2'],
        ['iam', 'iam'],
        ['s3', 's3'],
        ['sqs', 'sqs'],
        ['lambda', 'lambda'],
        ['kms', 'kms'],
        ['acm', 'acm'],
        ['apigateway', 'apigateway'],
        ['athena', 'athena'],
        ['autoscaling', 'autoscaling'],
        ['cloudformation', 'cloudformation'],
        ['cloudfront', 'cloudfront'],
        ['cloudtrail', 'cloudtrail'],
        ['cloudwatchlogs', 'cloudwatchlogs'],
        ['comprehend', 'comprehend'],
        ['configservice', 'configservice'],
        ['dms', 'dms'],
        ['dynamodb', 'dynamodb'],
        ['ecr', 'ecr'],
        ['efs', 'efs'],
        ['eks', 'eks'],
        ['elasticbeanstalk', 'elasticbeanstalk'],
        ['elasticloadbalancing', 'elasticloadbalancing'],
        ['emr', 'emr'],
        ['es', 'es'],
        ['firehose', 'firehose'],
        ['guardduty', 'guardduty'],
        ['kinesis', 'kinesis'],
        ['organizations', 'organizations'],
        ['rds', 'rds'],
        ['redshift', 'redshift'],
        ['route53', 'route53'],
        ['sagemaker', 'sagemaker'],
        ['securitygroup', 'securitygroup'], // TODO
        ['ses', 'ses'],
        ['shield', 'shield'],
        ['sns', 'sns'],
        ['ssm', 'ssm'],
        ['transfer', 'transfer'],
        ['xray', 'xray'],
        ['vpc', 'vpc'],
      ]),
      googleResourceTypeTagMap: new Map([
        // Asset ResourceName Format
        ['aiplatform', 'aiplatform'],
        ['apigateway', 'apigateway'],
        ['appengine', 'appengine'],
        ['artifactregistry', 'artifactregistry'],
        ['assuredworkloads', 'assuredworkloads'],
        ['bigquery', 'bigquery'],
        ['bigtable', 'bigtable'],
        ['cloudbilling', 'cloudbilling'],
        ['cloudfunctions', 'cloudfunctions'],
        ['cloudkms', 'cloudkms'],
        ['cloudresourcemanager', 'cloudresourcemanager'],
        ['cloudsql', 'cloudsql'],
        ['composer', 'composer'],
        ['compute', 'compute'],
        ['container', 'container'],
        ['dataflow', 'dataflow'],
        ['datafusion', 'datafusion'],
        ['dataproc', 'dataproc'],
        ['dialogflow', 'dialogflow'],
        ['dlp', 'dlp'],
        ['dns', 'dns'],
        ['documentai', 'documentai'],
        ['eventarc', 'eventarc'],
        ['file', 'file'],
        ['firewall', 'firewall'],
        ['gameservices', 'gameservices'],
        ['gkehub', 'gkehub'],
        ['iam', 'iam'],
        ['logging', 'logging'],
        ['managedidentities', 'managedidentities'],
        ['memcache', 'memcache'],
        ['metastore', 'metastore'],
        ['monitoring', 'monitoring'],
        ['networkmanagement', 'networkmanagement'],
        ['osconfig', 'osconfig'],
        ['privateca', 'privateca'],
        ['pubsub', 'pubsub'],
        ['redis', 'redis'],
        ['run', 'run'],
        ['secretmanager', 'secretmanager'],
        ['servicedirectory', 'servicedirectory'],
        ['servicemanagement', 'servicemanagement'],
        ['serviceusage', 'serviceusage'],
        ['spanner', 'spanner'],
        ['storage', 'storage'],
        ['tpu', 'tpu'],
        ['vpcaccess', 'vpcaccess'],
        // CloudSploit
        ['clb', 'clb'],
        ['cryptographic keys', 'cryptographic keys'],
        ['kubernetes', 'kubernetes'],
        ['sql', 'sql'],
        ['vpc network', 'vpc network'],
        ['serviceaccount', 'iam'],
        // ['compute', 'compute'],
        // ['dns', 'dns'],
        // ['iam', 'iam'],
        // ['logging', 'logging'],
        // ['storage', 'storage'],
      ]),
      codeResourceTypeTagMap: new Map([['repository', 'repository']]),
      diagnosisResourceTypeTagMap: new Map([['url', 'url']]),
      osintResourceTypeTagMap: new Map([
        ['domain', 'domain'],
        ['website', 'website'],
      ]),
      projectTagModel: {
        project_id: '',
        tag: '',
        color: {},
      },
      generativeAIEnabled: false,
    }
  },
  mounted() {
    this.generativeAIEnabled = this.$generativeAIEnabled
  },
  methods: {
    async signinUser() {
      await store.commit('storeUser', {})
      const userID = await this.signin().catch((err) => {
        return Promise.reject(err)
      })
      const user = await this.getUserAPI(userID).catch((err) => {
        return Promise.reject(err)
      })
      await store.commit('storeUser', user)
    },
    async signin() {
      const userID = await this.signinAPI().catch((err) => {
        return Promise.reject(err)
      })
      if (!userID) {
        return
      }
      return userID
    },
    reload: function () {
      this.$router.go({
        path: this.$router.currentRoute.value.path,
        force: true,
      })
    },
    getColorByCount(cnt) {
      if (cnt == 0) {
        return 'grey-lighten-1'
      } else if (cnt <= 10) {
        return 'teal-lighten-2'
      } else if (cnt <= 30) {
        return 'yellow-darken-4'
      } else {
        return 'red-darken-2'
      }
    },
    getColorByScore: (score) => {
      if (score === undefined || score < 0.6) {
        return 'teal-lighten-2'
      } else if (score < 0.8) {
        return 'yellow-darken-4'
      } else {
        return 'red-darken-2'
      }
    },
    getColorRGBByScore: (score) => {
      if (score < 0.6) {
        return '#4DB6AC'
      } else if (score < 0.8) {
        return '#F9A825'
      } else {
        return '#D32F2F'
      }
    },
    getColorByFindingStatus(status) {
      if (typeof status !== 'string' || status === '') return 'grey'
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
      if (typeof severity !== 'string' || severity === '') return ''
      switch (severity.toLowerCase()) {
        case 'high':
          return 'red-darken-2'
        case 'medium':
          return 'yellow-darken-4'
        default:
          return 'teal-lighten-2'
      }
    },
    getHistoryTypeColor: (type) => {
      if (typeof type !== 'string' || type === '') return ''
      switch (type.toLowerCase()) {
        case 'created':
          return 'teal-lighten-2'
        case 'updated':
          return 'yellow-darken-4'
        case 'deleted':
          return 'grey-lighten-1'
        default:
          return 'grey'
      }
    },
    getDataSourceIcon: (dataSource) => {
      if (typeof dataSource !== 'string' || !dataSource.split(':')[0]) {
        return 'mdi-help-circle-outline'
      }
      switch (dataSource.split(':')[0].toLowerCase()) {
        case 'aws':
          return 'mdi-aws'
        case 'diagnosis':
          return 'mdi-bug-check-outline'
        case 'osint':
          return 'md:http'
        case 'code':
          return 'mdi-github'
        case 'google':
          return 'mdi-google-cloud'
        default:
          return 'mdi-help-circle-outline'
      }
    },
    getDataSourceIconColor: (dataSource) => {
      if (typeof dataSource !== 'string' || !dataSource.split(':')[0]) {
        return ''
      }
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
    isOKStatus: (status) => {
      if (Number(status) === 1) return true
      return false
    },
    isInProgressDataSourceStatus: (status) => {
      if (Number(status) === 3) return true
      return false
    },
    isErrorStatus: (status) => {
      if (Number(status) === 4) return true
      return false
    },
    hasDataSourceWarning(datasource) {
      if (
        !this.isOKStatus(datasource.status) &&
        !this.isErrorStatus(datasource.status)
      ) {
        return false
      }
      if (datasource.status_detail && datasource.status_detail != '') {
        return true
      }
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
      if (typeof statusText !== 'string' || statusText === '') return 0
      switch (statusText.toUpperCase()) {
        case 'ALL':
          return 0
        case 'ACTIVE':
          return 1
        case 'ARCHIVE':
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
          return 'ARCHIVE'
        default:
          return 'ALL'
      }
    },
    getFindingSettingStatus: (statusText) => {
      if (typeof statusText !== 'string' || statusText === '') return 0
      switch (statusText.toUpperCase()) {
        case 'ACTIVE':
          return 1
        case 'DEACTIVATE':
          return 2
        default:
          return 0 // Unknown
      }
    },
    getFindingSettingStatusText: (status) => {
      switch (status) {
        case 1:
          return 'ACTIVE'
        case 2:
          return 'DEACTIVE'
        default:
          return 'UNKNOWN'
      }
    },
    getAlertStatus: (statusText) => {
      if (typeof statusText !== 'string' || statusText === '') return 0
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
      if (typeof str !== 'string') return ''
      if (str.length < cutNum || cutNum < 1) {
        return str
      }
      return str.substr(0, cutNum) + ' ...'
    },
    getShortName: (longName) => {
      // colon
      if (!longName.split(':').slice(-1)[0]) {
        return longName
      }
      const endOfColon = longName.split(':').slice(-1)[0]

      // slash
      if (!endOfColon.split('/')) {
        return endOfColon
      }
      const slashSplited = endOfColon.split('/')

      if (slashSplited.length < 2) {
        return slashSplited[slashSplited.length - 1]
      }
      return (
        slashSplited[slashSplited.length - 2] +
        '/' +
        slashSplited[slashSplited.length - 1]
      )
    },
    async listResourceNameForCombobox(event) {
      let input = ''
      if (event && event.target && event.target._value) {
        input = event.target._value
      }
      if (event && event.key) {
        input += event.key
      }
      const list = await this.listResourceID(
        '&resource_name=' +
          input +
          '&offset=0&limit=10&sort=resource_name&direction=asc'
      )
      if (!list.resource_id || list.resource_id.length == 0) {
        this.resourceNameCombobox = []
        return
      }
      let rnList = []
      await Promise.all(
        list.resource_id.map(async (id) => {
          const resource = await this.getResource(id)
          rnList.push(resource.resource_name)
        })
      )

      this.resourceNameCombobox = rnList
    },
    handleProjectTagUpdated(message) {
      this.$refs.snackbar.notifySuccess(message)
      this.projectTagDialog = false
    },
    getNamespaceByTags(tags) {
      let namespace = ''
      tags.forEach(async (t) => {
        if (!t.tag) return
        const lowerTag = t.tag.toLowerCase()
        if (this.namespaceTagMap.has(lowerTag)) {
          namespace = this.namespaceTagMap.get(lowerTag)
          return
        }
      })
      return namespace
    },
    getResourceTypeByTags(namespace, tags) {
      if (namespace === '') return ''
      let resourceType = ''
      tags.forEach(async (t) => {
        if (!t.tag) return
        const lowerTag = t.tag.toLowerCase()
        switch (namespace) {
          case 'aws':
            if (this.awsResourceTypeTagMap.has(lowerTag)) {
              resourceType = this.awsResourceTypeTagMap.get(lowerTag)
              return
            }
            break
          case 'google':
            if (this.googleResourceTypeTagMap.has(lowerTag)) {
              resourceType = this.googleResourceTypeTagMap.get(lowerTag)
              return
            }
            break
          case 'diagnosis':
            if (this.diagnosisResourceTypeTagMap.has(lowerTag)) {
              resourceType = this.diagnosisResourceTypeTagMap.get(lowerTag)
              return
            }
            break
          case 'code':
            if (this.codeResourceTypeTagMap.has(lowerTag)) {
              resourceType = this.codeResourceTypeTagMap.get(lowerTag)
              return
            }
            break
          case 'osint':
            if (this.osintResourceTypeTagMap.has(lowerTag)) {
              resourceType = this.osintResourceTypeTagMap.get(lowerTag)
              return
            }
            break
          default:
        }
      })
      return resourceType
    },
    async handleNewProjectTag() {
      this.projectTagDialog = true
    },
    async handleEditProjectTag(tag) {
      this.projectTagModel = {
        project_id: this.getCurrentProjectID(),
        tag: tag.tag,
      }
      this.projectTagDialog = true
    },
    getCurrentProjectID() {
      if (this.$store.state.project.project_id) {
        return this.$store.state.project.project_id
      }
      return ''
    },
    pretty: (v) => {
      if (!v) {
        return false
      }
      return JSON.stringify(JSON.parse(v), null, 2)
    },
    formatTime: (unix) => {
      if (unix === '0') {
        return '-'
      }
      return Util.formatDate(new Date(unix * 1000), 'yyyy/MM/dd HH:mm')
    },
    elapsedTimeText: (unix) => {
      return Util.elapsedTimeText(new Date(unix * 1000))
    },
    cutString: (str) => {
      return Util.cutLongString(str, 10)
    },
    formatSmartMaskString: (masked) => {
      if (!masked) {
        return ''
      }
      return masked.replace(maskedPattern, '*****')
    },
    canAttackFlowAnalyze(resourceName) {
      if (!resourceName) {
        return false
      }
      if (
        resourceName.startsWith('arn:aws:cloudfront:') &&
        resourceName.includes(':distribution/')
      ) {
        return true
      } else if (
        resourceName.startsWith('arn:aws:elasticloadbalancing:') &&
        resourceName.includes(':loadbalancer/')
      ) {
        return true
      } else if (
        resourceName.startsWith('arn:aws:apigateway:') &&
        resourceName.includes('apis/')
      ) {
        return true
      } else if (
        resourceName.startsWith('arn:aws:lambda:') &&
        resourceName.includes(':function:')
      ) {
        return true
      } else if (
        resourceName.startsWith('arn:aws:ec2:') &&
        resourceName.includes(':instance/')
      ) {
        return true
      } else if (
        resourceName.startsWith('arn:aws:apprunner:') &&
        resourceName.includes(':service/')
      ) {
        return true
      } else if (resourceName.startsWith('arn:aws:s3:')) {
        return true
      } else if (resourceName.startsWith('arn:aws:sns:')) {
        return true
      }
      return false
    },
    parseAPIErrorMessage: (err) => {
      if (!err) {
        return ''
      }
      if (err.response && err.response.data && err.response.data.error) {
        if (err.response.data.error.code && err.response.data.error.message) {
          return (
            err.response.data.error.code +
            ': ' +
            err.response.data.error.message
          )
        }
        return err.response.statusText + ': ' + err.response.data.error
      }
      if (err.response)
        if (err.code && err.message) {
          return err.code + ': ' + err.message
        }
      return ''
    },
    async UpdateAlertFirstViewedAt() {
      if (!this.$route.query) return
      const query = this.$route.query
      let project_id = 0
      let alert_id = 0
      let from = ''
      if (query.from && query.from != '') {
        from = query.from
      }
      if (query.project_id && query.project_id != '') {
        project_id = parseInt(query.project_id)
      }
      if (query.alert_id && query.alert_id != '') {
        alert_id = parseInt(query.alert_id)
      }
      if (!project_id || !alert_id || from == '') {
        return
      }
      await this.putAlertFirstViewedAt(project_id, alert_id)
    },
  },
}

export default mixin
