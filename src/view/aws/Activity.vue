<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="orange">mdi-aws</v-icon>
              {{ $t(`submenu['AWS Activity']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="3">
          <v-select
            v-model="awsModel"
            background-color="white"
            append-icon="mdi-aws"
            :items="awsList"
            :loading="loading"
            item-text="name"
            item-value="aws_id"
            label="AWS"
            @change="handleList"
            return-object
            outlined
            dense hide-details
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-combobox
            outlined dense hide-details
            background-color="white"
            v-model="search.region"
            append-icon="mdi-earth"
            :loading="loading"
            :label="$t(`item['Region']`)"
            placeholder="-"
            :items="regions"
            persistent-hint
          />
        </v-col>
        <v-col cols="2">
          <v-menu
            v-model="fromMenu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y hide-details
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field outlined dense  hide-details
                v-model="search.from"
                placeholder=""
                :label="$t(`item['FromDate']`)"
                :loading="loading"
                background-color="white"
                append-icon="mdi-calendar-search"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="search.from"
              @input="toMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="2">
          <v-menu
            v-model="toMenu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y hide-details
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                outlined dense hide-details
                v-model="search.to"
                placeholder=""
                :label="$t(`item['ToDate']`)"
                :loading="loading"
                background-color="white"
                append-icon="mdi-calendar-search"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="search.to"
              @input="toMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="3">
          <v-combobox
            outlined dense hide-details
            background-color="white"
            v-model="search.type"
            :loading="loading"
            :label="$t(`item['Type']`)"
            placeholder="-"
            :items="types"
            persistent-hint
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            outlined clearable dense hide-details
            :loading="loading"
            background-color="white"
            :label="$t(`item['Resource']`)"
            placeholder="-"
            v-model="search.resource"
            class="hidden-sm-and-down"
          />
        </v-col>
        <v-spacer />
        <v-col cols="1">
          <v-btn
            text
            outlined
            class="pa-2"
            style="text-transform: none"
            :loading="loading"
            @click="arnDialog = true"
          >
            {{ $t(`btn['Set ARN']`) }}
          </v-btn>
        </v-col>
        <v-col cols="2">
          <v-btn
            text
            outlined
            class="pa-2"
            style="text-transform: none"
            :loading="loading"
            @click="handleCloudTrailFilter"
          >
            {{ $t(`btn['CloudTrail Filter']`) }}
          </v-btn>
        </v-col>
        <v-col cols="1">
          <v-btn
            small
            fab
            outlined
            class="pa-1"
            :loading="loading"
            @click="handleList"
          >
            <v-icon dark>mdi-magnify</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-card v-if="customCloudTrailLog"  outlined color="background darken-1" class="pa-1 ma-1" width="90%">
        <v-row dense>
          <v-col cols="3">
            <v-combobox
              outlined dense hide-details
              background-color="white"
              v-model="search.attrKey"
              label="AttributeKey"
              placeholder="-"
              :loading="loading"
              :items="cloudTrailAttrList"
              @change="handleAttributeKey"
              persistent-hint
            />
          </v-col>
          <v-col cols="5">
            <v-text-field
              outlined dense hide-details
              :loading="loading"
              background-color="white"
              label="AttributeValue"
              placeholder="-"
              v-model="search.attrValue"
              class="hidden-sm-and-down"
            />
          </v-col>
        </v-row>
      </v-card>
      <v-row>
        <v-col cols="12">
          <v-timeline
            align-top
            v-if="!items || items.length > 0"
          >
            <v-timeline-item
              v-for="(item, i) in items"
              :key="i"
              :color="item.color"
              :icon="getIconByType(item.type)"
              :left="isLeftItem(item.type)"
              :right="!isLeftItem(item.type)"
              :v-show="item.display"
              fill-dot
            >
              <template v-slot:opposite>
                <v-chip
                  outlined
                  
                >
                  <v-icon left >mdi-calendar-clock</v-icon>
                  <span class="mx-2 text-subtitle-1">{{item.time}}</span>
                </v-chip>
              </template>
              <v-card
                :color="item.color"
                dark
              >
                <v-card-title class="title pa-2 mb-0">
                  {{ item.title }}
                  <v-chip class="mx-2" dark color="white" :text-color="item.color">{{item.tag}}</v-chip>
                  <v-spacer />
                  <v-btn
                    class="mx-0" outlined
                    @click="handleClickItem(item.data)"
                  >
                    <v-icon left>mdi-magnify</v-icon>VIEW
                  </v-btn>
                </v-card-title>
                <v-card-text class="white text--primary">
                  <div
                    v-for="(v, k) in item.contents"
                    :key="k"
                  >
                    <v-card-text class="text--primary pa-1">
                      <strong class="pr-4">{{ k }}</strong>{{v}}
                      <clip-board
                        :name="k"
                        :text="v"
                        size="small"
                        color="grey"
                      />
                    </v-card-text>
                  </div>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
          <v-card
            v-else
            color="background"
            flat
          >
            <v-card-text align="center" justify="center">
              <template v-if="loading">Loading ...</template>
              <template v-else-if="noDataSource">
                <v-alert
                  border="right"
                  colored-border
                  type="error"
                  elevation="2"
                >
                  <p>{{ $t("view.aws['You must configure the DataSource for `aws:activity`.']") }}</p>
                  <p>{{ $t("view.aws['Please access to the ']") }}<router-link :to="{ path: '/aws/data-source', query: { aws_id: awsModel.aws_id }}">AWS DataSource</router-link>.</p>
                </v-alert>
              </template>
              <template v-else>No data ...</template>
            </v-card-text>
          </v-card>
          <v-card
            color="background"
            flat
          >
            <v-card-text align="center" justify="center">
              <v-btn :loading="loading" text v-show="more" @click="handleLoadMore">
                {{ $t(`btn['LOAD MORE ...']`) }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="arnDialog" max-width="40%">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">
            Set your ARN
          </span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            outlined clearable dense
            :loading="loading"
            background-color="white"
            label="ARN"
            placeholder="arn:aws:service:region:123456789012:your/resource..."
            v-model="search.arn"
            hide-details
            class="hidden-sm-and-down"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined color="grey darken-1" @click="arnDialog = false">
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red darken-1"
            text outlined
            :loading="loading"
            @click="handleSetARN"
          >
           SET
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="70%">
      <v-card>
        <v-toolbar>
          <v-card-title>{{ $t(`submenu['AWS Activity']`) }}</v-card-title>
        </v-toolbar>
        <v-container fluid>
          <v-row class="ma-2">
            <v-col cols="12">
              <v-list-item-subtitle>
                <v-icon left>mdi-code-json</v-icon>
                JSON Data
                <clip-board
                  name="JSON Data"
                  :text="detailJSON | pretty"
                />
              </v-list-item-subtitle>
              <v-card dark color="grey darken-3" class="ma-4">
                <v-card-text class="title font-weight-bold" style="overflow-wrap: normal;">
                <pre>{{ detailJSON | pretty }}</pre>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined  color="grey darken-1" @click="viewDialog = false">
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>
<script>
import Util from '@/util'
import mixin from '@/mixin'
import aws from '@/mixin/api/aws'
import project from '@/mixin/api/project'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
export default {
  mixins: [mixin, aws, project],
  components: {
    BottomSnackBar,
    ClipBoard,
  },
  data() {
    return {
      loading: false,
      more: false,
      arnDialog: false,
      viewDialog: false,
      nowUnix: new Date().getTime(),
      awsModel: { aws_id:'', name:'', aws_account_id:'', updated_at:'' },
      search: {
        arn: '',
        region: 'ap-northeast-1',
        type: '',
        resource: '',
        from: '',
        to: '',
        attrKey: '' ,
        attrValue: '',
      },
      awsList: [],
      cloudTrailAttrList: [
        "RESOURCE_TYPE",      // {key: 1, text: "RESOURCE_TYPE"},
        "RESOURCE_NAME",      // {key: 2, text: "RESOURCE_NAME"},
        "EVENT_ID",           // {key: 3, text: "EVENT_ID"},
        "EVENT_SOURCE",       // {key: 4, text: "EVENT_SOURCE"},
        "EVENT_NAME",         // {key: 5, text: "EVENT_NAME"},
        "USERNAME",           // {key: 6, text: "USERNAME"},
        "READ_ONLY",          // {key: 7, text: "READ_ONLY"},
      ],
      regions: [
        'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
        'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
        'ap-east-1', 'ap-south-1', 'ap-southeast-1', 'ap-southeast-2',
        'eu-west-1', 'eu-west-2', 'eu-west-3',
        'eu-central-1', 'eu-south-1', 'eu-north-1',
        'ca-central-1', 'af-south-1', 'me-south-1', 'sa-east-1',
      ],
      types: [
        'AWS::ACM::Certificate',
        'AWS::ApiGateway::RestApi' ,'AWS::ApiGateway::Stage' ,'AWS::ApiGatewayV2::Api',
        'AWS::ApiGatewayV2::Stage' ,'AWS::AutoScaling::AutoScalingGroup',
        'AWS::AutoScaling::LaunchConfiguration' ,'AWS::AutoScaling::ScalingPolicy' ,'AWS::AutoScaling::ScheduledAction',
        'AWS::CloudFormation::Stack',
        'AWS::CloudFront::Distribution' ,'AWS::CloudFront::StreamingDistribution',
        'AWS::CloudTrail::Trail',
        'AWS::CloudWatch::Alarm',
        'AWS::CodeBuild::Project',
        'AWS::CodePipeline::Pipeline',
        'AWS::Config::ConformancePackCompliance' ,'AWS::Config::ResourceCompliance',
        'AWS::DynamoDB::Table',
        'AWS::EC2::CustomerGateway' ,'AWS::EC2::EgressOnlyInternetGateway' ,'AWS::EC2::EIP',
        'AWS::EC2::FlowLog' ,'AWS::EC2::Host' ,'AWS::EC2::Instance' ,'AWS::EC2::InternetGateway',
        'AWS::EC2::NatGateway' ,'AWS::EC2::NetworkAcl' ,'AWS::EC2::NetworkInterface',
        'AWS::EC2::RegisteredHAInstance' ,'AWS::EC2::RouteTable' ,'AWS::EC2::SecurityGroup',
        'AWS::EC2::Subnet','AWS::EC2::Volume','AWS::EC2::VPC',
        'AWS::EC2::VPCEndpoint','AWS::EC2::VPCEndpointService' ,'AWS::EC2::VPCPeeringConnection',
        'AWS::EC2::VPNConnection' ,'AWS::EC2::VPNGateway',
        'AWS::ElasticBeanstalk::Application' ,'AWS::ElasticBeanstalk::ApplicationVersion' ,'AWS::ElasticBeanstalk::Environment',
        'AWS::ElasticLoadBalancing::LoadBalancer' ,'AWS::ElasticLoadBalancingV2::LoadBalancer',
        'AWS::Elasticsearch::Domain',
        'AWS::IAM::Group' ,'AWS::IAM::Policy' ,'AWS::IAM::Role' ,'AWS::IAM::User',
        'AWS::KMS::Key',
        'AWS::Lambda::Function',
        'AWS::NetworkFirewall::Firewall' ,'AWS::NetworkFirewall::FirewallPolicy' ,'AWS::NetworkFirewall::RuleGroup',
        'AWS::QLDB::Ledger',
        'AWS::RDS::DBCluster' ,'AWS::RDS::DBClusterSnapshot' ,'AWS::RDS::DBInstance' ,'AWS::RDS::DBSecurityGroup',
        'AWS::RDS::DBSnapshot' ,'AWS::RDS::DBSubnetGroup' ,'AWS::RDS::EventSubscription',
        'AWS::Redshift::Cluster' ,'AWS::Redshift::ClusterParameterGroup' ,'AWS::Redshift::ClusterSecurityGroup',
        'AWS::Redshift::ClusterSnapshot' ,'AWS::Redshift::ClusterSubnetGroup' ,'AWS::Redshift::EventSubscription',
        'AWS::S3::AccountPublicAccessBlock' ,'AWS::S3::Bucket',
        'AWS::SecretsManager::Secret',
        'AWS::ServiceCatalog::CloudFormationProduct' ,'AWS::ServiceCatalog::CloudFormationProvisionedProduct' ,'AWS::ServiceCatalog::Portfolio',
        'AWS::Shield::Protection',
        'AWS::ShieldRegional::Protection',
        'AWS::SNS::Topic',
        'AWS::SQS::Queue',
        'AWS::SSM::AssociationCompliance' ,'AWS::SSM::FileData' ,'AWS::SSM::ManagedInstanceInventory' ,'AWS::SSM::PatchCompliance',
        'AWS::WAF::RateBasedRule' ,'AWS::WAF::Rule' ,'AWS::WAF::RuleGroup' ,'AWS::WAF::WebACL',
        'AWS::WAFRegional::RateBasedRule' ,'AWS::WAFRegional::Rule'  ,'AWS::WAFRegional::RuleGroup','AWS::WAFRegional::WebACL',
        'AWS::WAFv2::IPSet' ,'AWS::WAFv2::ManagedRuleSet' ,'AWS::WAFv2::RegexPatternSet' ,'AWS::WAFv2::RuleGroup' ,'AWS::WAFv2::WebACL',
        'AWS::XRay::EncryptionConfig',
      ],
      cloudtrail: {
        list: [],
        next_token: '',
      },
      config: {
        list: [],
        next_token: '',
      },
      fromMenu: false,
      toMenu: false,
      items: [],
      detailJSON: '',
      noDataSource: false,
      customCloudTrailLog: false,
      maxAPIResult: 30,
    }
  },
  async mounted() {
    this.search.readOnly = false
    await this.listAWS()
    if (this.awsList.length < 1) {
      this.loading = false
      return false
    }
    this.awsModel = this.awsList[0]
    this.awsList.forEach( async aws => {
      if ( aws.aws_id ==  Number(this.$route.query.aws_id)) {
        this.awsModel = aws
        return
      }
    })
    this.parseQuery()
    await this.setARN()
    await this.refleshList()
  },
  filters: {
    pretty: (v) => {
      if (!v || v == '') return
      let obj = v
      if (typeof (v) == "string") {
        obj = JSON.parse(v)
      }
      return JSON.stringify(obj, null, 2).replaceAll(',', ', ')
    },
 },
  methods: {
    async listAWS() {
      this.loading = true
      const aws = await this.listAWSAPI().catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !aws ) {
        return false
      }
      this.awsList = aws
      this.loading = false
    },

    async alreadyDataSourceSetting() {
      const dataSources = await this.listAWSDataSourceAPI( this.awsModel.aws_id, 'aws:activity').catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !dataSources || dataSources.length < 1 || !dataSources[0].assume_role_arn || !dataSources[0].external_id ) {
        return false
      }
      return true
    },
    async refleshList() {
      this.loading = true
      await this.setQuery()
      this.items = [], this.noDataSource = false
      this.cloudtrail = {list: [], next_token: ''}, this.config = {list: [], next_token: ''}

      if (this.awsModel.aws_id == '' || this.search.region == '') {
        this.loading = false
        return
      }
      const ok = await this.alreadyDataSourceSetting()
      if (!ok) {
        this.loading = false
        this.noDataSource = true
        return
      }

      await this.listCloudTrail('')
      if (!this.search.type || !this.search.resource) {
        await this.sortList()
        this.loading = false
        return
      }
      await this.listConfig('')
      await this.sortList()
      this.loading = false
    },

    // AWS CloudTrail API request
    async listCloudTrail(nextToken) {
      this.cloudtrail.next_token = ''
      const trail = await this.listCloudTrailAPI(
        this.awsModel.aws_id, this.search.region, 
        this.convertFromUnixTime(this.search.from), this.convertToUnixTime(this.search.to),
        this.convertAttrKey(this.search.attrKey), this.search.attrValue,
        nextToken, // this.cloudtrail.next_token,
      ).catch((err) =>  {
        this.loading = false
        // return Promise.reject(err)
        this.$refs.snackbar.notifyError('CloudTrail API Error: ' + JSON.stringify(err.response.data))
      })
      if (!trail || !trail.cloudtrail) {
        return
      }
      if (trail.next_token && trail.next_token != '') {
        this.cloudtrail.next_token = trail.next_token
        this.more = true
      }
      trail.cloudtrail.forEach( async t => {
        this.cloudtrail.list.push(this.parseTrailLog(t))
      })
    },
    convertAttrKey(key){
      if (Util.isEmptyString(key)) return 0
      switch (key.toLocaleUpperCase()) {
        case 'RESOURCE_TYPE':
          return 1
        case 'RESOURCE_NAME':
          return 2
        case 'EVENT_ID':
          return 3
        case 'EVENT_SOURCE':
          return 4
        case 'EVENT_NAME':
          return 5
        case 'USERNAME':
          return 6
        case 'READ_ONLY':
          return 7
        default:
          return 0
      }
    },

    // AWS Config API request
    async listConfig(nextToken) {
      this.config.next_token = ''
      const config = await this.listConfigHistoryAPI(
        this.awsModel.aws_id, this.search.region, this.search.type, this.search.resource,
        this.convertFromUnixTime(this.search.from), this.convertToUnixTime(this.search.to), nextToken, // this.config.next_token,
      ).catch((err) =>  {
        this.loading = false
        // return Promise.reject(err)
        this.$refs.snackbar.notifyError('ConfigService API Error: ' + JSON.stringify(err.response.data))
      })
      if (!config || !config.configuration) {
        return 
      }
console.log(config)
      if (config.next_token && config.next_token != '') {
        this.config.next_token = config.next_token
        this.more = true
      }
      config.configuration.forEach( async c => {
        this.config.list.push(this.parseConfigLog(c))
      })
    },

    async sortList() {
      let list = this.cloudtrail.list.concat(this.config.list)
      // Sort list with DESC order
      await list.sort( (a, b) => {
        if(a.time > b.time) return -1
        if(a.time < b.time) return 1
        return 0
      })

      let dispPoint = "0000/01/01 00:00"
      if (this.cloudtrail.list.length > 0){
        dispPoint = this.cloudtrail.list[ this.cloudtrail.list.length - 1].time
      }
      // Update display flag
      await Object.keys(list).forEach( (index) => {
        if (this.canDisplay(dispPoint, list[index].time)) list[index].display = true
      })
      this.items = list
    },
    canDisplay(dispPoint, time){
      if (this.cloudtrail.next_token == '' || time >= dispPoint) {
        return true
      }
      return false
    },

    parseTrailLog(log) {
      const parsed = JSON.parse(log.cloudtrail_event)
      const title = log.event_name
      const tag = log.read_only === 'true' ? 'Read' : 'Write'
      let color = log.read_only === 'true' ? 'success' : 'warning darken-1'
      let contents = {ID: log.event_id, event_source: log.event_source, username: log.username}
      if (parsed.errorCode || parsed.errorMessage) {
        color = 'error'
        contents = {ID: log.event_id, event_source: log.event_source, username: log.username, error_code: parsed.errorCode, error_message: parsed.errorMessage}
      }
      return {
        type: 'cloudtrail',
        color: color,
        tag: tag,
        time: Util.formatDate(new Date(log.event_time * 1000), 'yyyy/MM/dd HH:mm'),
        title: title,
        contents: contents,
        data: log.cloudtrail_event,
        display: false,
      }
    },
    parseConfigLog(log){
      if (log.configuration) {
        const parsed = JSON.parse(log.configuration)
        log.configuration = parsed
      }
      const title = log.resource_id
      let color = 'grey'
      let tag = 'Unknown'
      // https://docs.aws.amazon.com/config/latest/APIReference/API_ConfigurationItem.html
      switch (log.configuration_item_status) {
        case 'OK':
          tag = 'Updated'
          color = 'warning darken-1' // updated
          break
        case 'ResourceDiscovered':
        case 'ResourceNotRecorded':
          tag = 'Created'
          color = 'success' // created
          break
        case 'ResourceDeleted':
        case 'ResourceDeletedNotRecorded':
          tag = 'Deleted'
          color = 'error' // deleted
          break
        default:
          tag += 'Unknown'
          color = 'grey' // Unknown status
      }
      return {
        type: 'config',
        color: color,
        tag: tag,
        time: Util.formatDate(new Date(log.configuration_item_capture_time * 1000), 'yyyy/MM/dd HH:mm'),
        title: title,
        contents: {state_id: log.configuration_state_id, aws_account:log.account_id, region: log.aws_region, resource: log.resource_id},
        data: log,
        display: false,
      }
    },

    async setARN() {
      if ( !this.search.arn ) {
        return 
      }
      this.loading = true
      const arn = await this.describeArnAPI(this.search.arn).catch((err) =>  {
        this.loading = false
        return Promise.reject(err)
      })
      if (!arn) {
        this.loading = false
        return 
      }
      this.search.type = ''
      this.search.resource = ''
      this.search.attrKey = ''
      this.search.attrValue = ''

      let query = await Object.assign({}, this.$router.query)
      if (arn.account_id) {
        for (const aws of this.awsList) {
          if ( aws.aws_account_id ==  arn.account_id) {
            this.awsModel = aws
            query.aws_id = aws.aws_id
          }
        }
      }
      if (arn.region) {
        this.search.region = arn.region
        query.region = arn.region
      }
      if (arn.resource_type) {
        this.search.type = arn.resource_type
        query.type = arn.resource_type
      }
      if (arn.resource_id) {
        this.search.resource = arn.resource_id
        this.search.attrKey = 'RESOURCE_NAME'
        this.search.attrValue = arn.resource_id
        query.resource = arn.resource_id
        query.attr_key = 'RESOURCE_NAME'
        query.attr_value = arn.resource_id
      }
      await this.$router.push({query: query})
      this.loading = false
    },
    clearList() {
      this.items = []
      this.loading = false
    },
    isLeftItem(type) {
      if (type === 'config') return true
      return false
    },
    getIconByType(type) {
      if (type === 'config') return 'mdi-buffer'
      return 'mdi-run'
    },

    parseQuery() {
      if (!Util.isEmptyString(this.$route.query.arn)) this.search.arn = this.$route.query.arn
      if (!Util.isEmptyString(this.$route.query.region)) this.search.region = this.$route.query.region
      if (!Util.isEmptyString(this.$route.query.type)) this.search.type = this.$route.query.type
      if (!Util.isEmptyString(this.$route.query.resource)) this.search.resource = this.$route.query.resource
      if (!Util.isEmptyString(this.$route.query.from)) this.search.from = Util.formatDate(new Date(this.$route.query.from), 'yyyy-MM-dd')
      if (!Util.isEmptyString(this.$route.query.to)) this.search.to = Util.formatDate(new Date(this.$route.query.to), 'yyyy-MM-dd')
      if (!Util.isEmptyString(this.$route.query.attr_key)) this.search.attrKey = this.$route.query.attr_key
      if (!Util.isEmptyString(this.$route.query.attr_value)) this.search.attrValue = this.$route.query.attr_value
    },
    async setQuery() {
      const queryOld = this.$route.query
      let queryNew = await Object.assign({}, this.$route.query)
      if (!Util.isEmptyString(this.awsModel.aws_id)) queryNew.aws_id = this.awsModel.aws_id
      if (!Util.isEmptyString(this.search.arn)) queryNew.arn = this.search.arn
      if (!Util.isEmptyString(this.search.region)) queryNew.region = this.search.region
      if (!Util.isEmptyString(this.search.type)) queryNew.type = this.search.type
      if (!Util.isEmptyString(this.search.resource)) queryNew.resource = this.search.resource
      if (!Util.isEmptyString(this.search.attrKey)) queryNew.attr_key = this.search.attrKey
      if (!Util.isEmptyString(this.search.attrValue)) queryNew.attr_value = this.search.attrValue
      const today = new Date()
      if (Util.isEmptyString(this.search.from)) {
        let threeMonthAgo = new Date(today)
        threeMonthAgo.setDate(threeMonthAgo.getDate() - 89)
        this.search.from = threeMonthAgo.toISOString().substr(0, 10)
        // this.search.from = Util.formatDate(threeMonthAgo, 'yyyy-MM-dd')
      }
      queryNew.from = this.search.from
      if (Util.isEmptyString(this.search.to)) {
        this.search.to = today.toISOString().substr(0, 10)
        // this.search.to = Util.formatDate(today, 'yyyy-MM-dd')
      }
      queryNew.to = this.search.to

      if (Object.entries(queryNew).sort().toString() != Object.entries(queryOld).sort().toString() ){
        await this.$router.push({query: queryNew})
      }
    },

    convertFromUnixTime(timeString) {
      let date = new Date(timeString)
      date.setHours(0, 0, 0)
      return Math.floor( date.getTime() / 1000 )
    },
    convertToUnixTime(timeString) {
      let date = new Date(timeString)
      date.setHours(23, 59, 59)
      if (date.getTime() > this.nowUnix) {
        return Math.floor( this.nowUnix / 1000 )
      }
      return Math.floor( date.getTime() / 1000 )
    },

    // handler method
    handleClickItem(data) {
      this.detailJSON = data
      this.viewDialog = true
    },
    async handleList() {
      this.loading = true
      await this.refleshList()
      // this.finishInfo('Reflesh list')
    },
    handleAttributeKey() {
      if (this.search.attrKey.toLocaleUpperCase() == 'READ_ONLY') {
        this.search.attrValue = 'true'
      }
    },
    async handleSetARN() {
      await this.setARN()
      this.arnDialog = false
    },
    async handleLoadMore() {
      this.loading = true
      if (this.cloudtrail.next_token == '' && this.config.next_token == '') {
        this.more =false 
        this.loading = false
        return
      }
      if (this.cloudtrail.next_token != '') {
        await this.listCloudTrail(this.cloudtrail.next_token)
      }
      if (this.config.next_token != '') {
        await this.listConfig(this.config.next_token)
      }
      await this.sortList()
      if (this.cloudtrail.next_token == '' && this.config.next_token == '') {
        this.more =false
      }
      this.loading = false
    },
    async handleCloudTrailFilter() {
      this.customCloudTrailLog = !this.customCloudTrailLog
    },

    async finishInfo(msg, reflesh) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyInfo(msg)
      this.finish(reflesh)
    },
    async finishSuccess(msg, reflesh) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.finish(reflesh)
    },
    async finishError(msg) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyError(msg)
      this.finish(false)
    },
    async finish(reflesh) {
      this.loading = false
      this.arnDialog = false
      this.viewDialog = false
      if ( reflesh ) {
        this.refleshList()
      }
    },
  }
}
</script>
