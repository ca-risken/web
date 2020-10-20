<template>
  <div class="page-dashboard">
    <v-container>
      <!-- Status -->
      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat>
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon x-large class="pr-2" color="indigo darken-2">mdi-thermometer</v-icon>
              Status
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row class="mx-2">
        <!-- Status -->
        <v-col cols="8">
          <status-statistic
            :icon="status.risk.icon"
            :color="status.risk.color"
            :description="status.risk.description"
            :detail="status.risk.detail"
            class="mx-2"
          />
        </v-col>

        <!-- mini statistic start -->
        <v-col cols="4">
          <mini-statistic
            v-for="factor in status.riskFactor"
            :key="factor.subTitle"
            :icon="factor.icon"
            :title="factor.title"
            :sub-title="factor.subTitle"
            :color="factor.color"
            :link="factor.link"
            class="mb-2"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-spacer />
        <v-btn text dense
          class="mr-4"
          color="grey"
          @click="settingDialog = true">
          setting steps
        </v-btn>
      </v-row>

      <!-- Category -->
      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat>
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon x-large class="pr-2" color="indigo darken-2">mdi-shape</v-icon>
              Category
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row class="mx-2">
        <v-col
          cols="3"
          v-for="c in category"
          :key="c.category"
        >
          <category-statistic
            :icon="c.icon"
            :category="c.category"
            :title="c.title"
            :sub-title="c.subTitle"
            :color="c.color"
            :link="c.link"
          />
        </v-col>
      </v-row>

      <!-- Chart -->
      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat>
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon x-large class="pr-2" color="indigo darken-2">mdi-chart-areaspline</v-icon>
              Chart
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" class="ml-6">
          <v-card>
            <v-card-text>
              <time-line-chart
                v-if="chart.loaded"
                :height="chart.height"
                :chart-data="chart.finding.data"
              ></time-line-chart>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="5">
          <v-card>
            <v-card-text>
              <doughnut-chart
                v-if="chart.loaded"
                :height="chart.height"
                :chart-data="chart.alert.data"
              ></doughnut-chart>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    </v-container>
    <v-dialog v-model="settingDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">Setting Step Detail</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                1. User invited: <span class="headline">{{ raw.invitedUser.length }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                2, Setting DataSources(≒ Store some Findings): <span class="headline">{{ raw.storeFinding.length }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                3. Setting Alert Condition: <span class="headline">{{ raw.alertCondition.length }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                4. Setting Alert Rule: <span class="headline">{{ raw.alertRule.length }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                5. Setting Alert Notification: <span class="headline">{{ raw.notification.length }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined color="grey darken-1" @click="settingDialog = false">
            CANCEL
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import StatusStatistic from '@/component/widget/statistic/StatusStatistic'
import MiniStatistic from '@/component/widget/statistic/MiniStatistic'
import CategoryStatistic from '@/component/widget/statistic/CategoryStatistic'
import TimeLineChart from '@/component/widget/chart/TimeLineChart'
import DoughnutChart from '@/component/widget/chart/DoughnutChart'
export default {
  name: 'PageDashboard',
  components: {
    StatusStatistic,
    MiniStatistic,
    CategoryStatistic,
    TimeLineChart,
    DoughnutChart,
  },
  data() {
    return {
      nowUnix:  0,
      oneMonthAgoUnix:  0,
      raw: {
        activeAlert: [],
        highScoreFinding: [],

        settingStep: 5,     // [Total 5 setting steps]
        invitedUser: [],    // 1. User invited, 
        storeFinding: [],   // 2, Setting DataSources ( = Store some Findings),
        alertCondition: [], // 3. Setting Alert Condition,
        alertRule: [],      // 4. Setting Alert Rule,
        notification: [],   // 5. Setting Alert Notification
      },
      status: {
        alert: '-',
        finding: '-',
        compSettingRate: '-',
        imcompSetting: '-',
        riskFactor: [],
        risk: {
          icon: 'mdi-map-marker-question-outline',
          color: 'grey',
          description: 'There is nothing to display.',
          detail: 'Please reload after selecting the project.',
        }
      },

      category: [],

      chart: {
        loaded: false,
        height: 300,
        finding: {
          data: {
            labels: [new Date()],
            datasets: [
              {
                label: 'Findings',
                data: [0],
                type: 'line',
                lineTension: 0.3,
              }
            ]
          },
        },
        alert: {
          data: {
            labels: ['high', 'medium', 'low'],
            datasets: [
              {
                label: 'Alerts',
                data: [10, 40, 50],
                type: 'doughnut',
              }
            ]
          },
        },
      },
      settingDialog: false,
    }
  },
  async mounted() {
    if (!this.$store.state.project.project_id) {
      return false
    }
    this.nowUnix = Math.floor(new Date() / 1000)
    this.oneMonthAgoUnix = Math.floor(new Date().setMonth(new Date().getMonth() - 1) / 1000)

    await this.setRawData()
    this.setStatus()
    this.setCategory()
    this.setChart()
  },
  methods: {
    // -- Raw Data ---------------------------------
    async setRawData() {
      await this.setActiveAlert()
      await this.setHighScoreFinding()
      await this.setUser()              // 1. User invited, 
      await this.setStoreFinding()      // 2, Setting DataSources ( = Store some Findings),
      await this.setAlertCondition()    // 3. Setting Alert Condition,
      await this.setAlertRule()         // 4. Setting Alert Rule,
      await this.setAlertNotification() // 5. Setting Alert Notification
    },
    // alert list
    async setActiveAlert() {
      const res = await this.$axios.get(
        '/alert/list-alert/?activated=true&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.alert ) {
        return []
      }
      this.raw.activeAlert = res.data.data.alert
    },
    // Findings
    async setHighScoreFinding() {
      this.raw.highScoreFinding          = await this.getFinding(this.oneMonthAgoUnix, this.nowUnix, 0.8, '')
      this.raw.highScoreFindingAWS       = await this.getFinding(this.oneMonthAgoUnix, this.nowUnix, 0.8, 'aws:guard-duty')
      this.raw.highScoreFindingDiagnosis = await this.getFinding(this.oneMonthAgoUnix, this.nowUnix, 0.8, 'diagnosis:jira')
      this.raw.highScoreFindingOsint     = await this.getFinding(this.oneMonthAgoUnix, this.nowUnix, 0.8, 'osint:intrigue')
    },
    async setStoreFinding() {
      this.raw.storeFinding = await this.getFinding(0, this.nowUnix, 0, '')
    },
    async getFinding(fromAt, toAt, fromScore, dataSource) {
      const res = await this.$axios.get(
        '/finding/list-finding/?project_id=' + this.$store.state.project.project_id
          + '&from_at=' + fromAt
          + '&to_at=' + toAt
          + '&from_score=' + fromScore
          + '&data_source=' + dataSource
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.finding_id ) {
        return []
      }
      return res.data.data.finding_id
    },
    // User
    async setUser() {
      this.raw.invitedUser = []
      const res = await this.$axios.get(
        '/iam/list-user/?activated=true&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.user_id ) {
        return []
      }
      this.raw.invitedUser = res.data.data.user_id
    },
    // Alert condition
    async setAlertCondition() {
      this.raw.alertCondition = []
      const res = await this.$axios.get(
        '/alert/list-condition/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.alert_condition ) {
        return []
      }
      this.raw.alertCondition = res.data.data.alert_condition
    },
    // Alert condition
    async setAlertRule() {
      this.raw.alertRule = []
      const res = await this.$axios.get(
        '/alert/list-rule/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.alert_rule ) {
        return []
      }
      this.raw.alertRule = res.data.data.alert_rule
    },
    // Notification
    async setAlertNotification() {
      this.raw.notification = []
      const res = await this.$axios.get(
        '/alert/list-notification/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.notification ) {
        return []
      }
      this.raw.notification = res.data.data.notification
    },

    // -- Status ---------------------------------
    setStatus() {
      this.status.alert = this.raw.activeAlert.length.toString()
      this.status.finding = this.raw.highScoreFinding.length.toString(),
      this.setSettingStatus()

      this.setTotalStatus()
      this.status.riskFactor = []
      this.status.riskFactor.push({
        title: this.status.alert,
        subTitle: 'Action Required ....',
        icon: 'mdi-alert',
        color: 'red darken-3',
        link: '/alert/alert/',
      })
      this.status.riskFactor.push({
        title: this.status.finding,
        subTitle: 'HighScore Findings ',
        icon: 'mdi-file-find-outline',
        color: 'blue darken-1',
        link: '/finding/finding/',
      })
      this.status.riskFactor.push({
        title: this.status.compSettingRate,
        subTitle: 'Coverage Settings...',
        icon: 'mdi-cog',
        color: 'grey darken-2',
        link: '/alert/condition/',
      })
    },
    // Setting Status
    setSettingStatus() {
      let completed = 0
      if (this.raw.invitedUser.length > 0) {
        completed++
      }
      if (this.raw.storeFinding.length > 0) {
        completed++
      }
      if (this.raw.alertCondition.length > 0) {
        completed++
      }
      if (this.raw.alertRule.length > 0) {
        completed++
      }
      if (this.raw.notification.length > 0) {
        completed++
      }
      this.status.imcompSetting = this.raw.settingStep - completed
      this.status.compSettingRate = ((completed / this.raw.settingStep) * 100 ).toString() + '%'
    },
    // Total Status
    setTotalStatus() {
      const totalRisk = Number(this.status.alert) + Number(this.status.finding) + Number(this.status.imcompSetting)
      this.status.risk.detail =
        '  Active Alerts: ' + this.status.alert +
        ', High Score Findings: ' + this.status.finding +
        ', Imcompleted Settings: ' + this.status.imcompSetting + ' / ' + this.raw.settingStep
      if ( totalRisk === 0 ) {
        this.status.risk.icon = 'mdi-check-circle-outline'
        this.status.risk.color = 'green'
        this.status.risk.description = '問題ありません👌'
      } else if ( 0 < totalRisk && totalRisk <= 3 ) {
        this.status.risk.icon = 'mdi-weather-cloudy'
        this.status.risk.color = 'grey darken-1'
        this.status.risk.description = '確認が必要な項目があります👀'
      } else if ( 3 < totalRisk && totalRisk <= 10 ) {
        this.status.risk.icon = 'mdi-weather-pouring'
        this.status.risk.color = 'lime darken-3'
        this.status.risk.description = '何か問題がありそうです...😥'
      } else {
        this.status.risk.icon = 'mdi-weather-lightning'
        this.status.risk.color = 'red darken-2'
        this.status.risk.description = '問題が山積みです...🙀'
      }
    },

    // -- Category ---------------------------------
    setCategory() {
      this.category = []
      this.category.push({
        category: 'User',
        title: this.raw.invitedUser.length.toString(),
        subTitle: 'Project members',
        icon: 'mdi-account-multiple',
        color: 'cyan darken-1',
        link: '/iam/user/',
      })
      this.category.push({
        category: 'AWS',
        title: this.raw.highScoreFindingAWS.length.toString(),
        subTitle: 'High score findings',
        icon: 'mdi-aws',
        color: 'orange darken-2',
        link: '/finding/finding/',
      })
      this.category.push({
        category: 'Diagnosis',
        title: this.raw.highScoreFindingDiagnosis.length.toString(),
        subTitle: 'High score findings',
        icon: 'mdi-bug-check-outline',
        color: 'indigo darken-2',
        link: '/finding/finding/',
      })
      this.category.push({
        category: 'OSINT',
        title: '-',
        subTitle: 'Not yet suported...',
        icon: 'http',
        color: 'light-green darken-1',
        link: '/',
      })
      this.category.push({
        category: 'GCP',
        title: '-',
        subTitle: 'Not yet suported...',
        icon: 'mdi-google-cloud',
        color: 'blue darken-1',
        link: '/finding/finding/',
      })
      this.category.push({
        category: 'Source Code',
        title: '-',
        subTitle: 'Not yet suported...',
        icon: 'mdi-github',
        color: 'grey darken-3',
        link: '/finding/finding/',
      })
      this.category.push({
        category: 'Azure',
        title: '-',
        subTitle: 'Not yet suported...',
        icon: 'mdi-microsoft-azure',
        color: 'light-blue darken-2',
        link: '/finding/finding/',
      })
    },

    // -- Chart ---------------------------------
    async setChart() {
      await this.setFindingChart()
      await this.setAlertChart()
      this.chart.loaded = true
    },
    async setFindingChart() {
      const now = new Date()
      for (let day = 7; day >= 0; day--) {
        const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() -day, 0, 0, 0)
        const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() -day +1, 0, 0, 0)
        await this.setFindingChartByDayNumber(from, to)
      }
    },
    async setFindingChartByDayNumber(from, to){
      const fromUnix = Math.floor(from / 1000)
      const toUnix = Math.floor(to / 1000)
      const finding = await this.getFinding(fromUnix, toUnix-1, 0, '')
      this.chart.finding.data.labels.push(from)
      this.chart.finding.data.datasets[0].data.push(finding.length.toString())
    },
    // getDateLabel(dt) {
    //   return dt.getMonth()+1 + '/' + dt.getDate() // `getMonth()` will return 0~11, because need +1 month for display label
    // }
    setAlertChart() {
      this.chart.alert.data.labels = [ 'high', 'medium', 'low']
      let highCnt =0
      let mediumCnt = 0
      let lowCnt = 0
      this.raw.activeAlert.forEach( async alert => {
        switch (alert.severity) {
          case 'high':
            highCnt++
            break
          case 'medium': 
            mediumCnt++
            break
          case 'low':
            lowCnt++
            break
          default:
            console.log('Unknown serverity: ' + alert.severity)
        }
      })
      this.chart.alert.data.datasets[0].data = [ highCnt, mediumCnt, lowCnt ]
    },

    // handler
    handleSettingSteps() {
      this.settingDialog = true
    }
  },
}
</script>
