<template>
  <div>
    <v-container>
      <!-- Status -->
      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat color="background">
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon x-large class="pr-2" color="indigo darken-2"
                >mdi-thermometer</v-icon
              >
              {{ $t(`view.dashboard['Status']`) }}
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
            :description="
              $t(`view.dashboard['` + status.risk.description + `']`)
            "
            :detail="status.risk.detail"
            class="mx-2"
          />
        </v-col>

        <!-- mini statistic start -->
        <v-col cols="4">
          <v-card
            v-for="factor in status.riskFactor"
            :key="factor.subTitle"
            @click="handleClickFactor(factor.link)"
          >
            <mini-statistic
              :icon="factor.icon"
              :title="factor.title"
              :sub-title="$t(`view.dashboard['` + factor.subTitle + `']`)"
              :color="factor.color"
              class="mb-2"
            />
          </v-card>
        </v-col>
      </v-row>

      <!-- Category -->
      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat color="background">
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon x-large class="pr-2" color="indigo darken-2"
                >mdi-shape</v-icon
              >
              {{ $t(`view.dashboard['Category']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row class="mx-2">
        <v-col cols="3" v-for="c in category" :key="c.category">
          <category-statistic
            :icon="c.icon"
            :category="c.category"
            :title="c.title"
            :sub-title="c.subTitle"
            :color="c.color"
            :dark="c.dark"
            :link="c.link"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="settingDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-2">{{
            $t(`view.dashboard['SETTING TUTORIAL']`)
          }}</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                {{ $t(`view.dashboard['1. User invited']`) }}:
                <span class="headline">{{ status.tutorial.invitedUsers }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                {{
                  $t(
                    `view.dashboard['2. Setting data sources(≒ Store some findings)']`
                  )
                }}:
                <span class="headline">{{
                  status.tutorial.storeFindings
                }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                {{ $t(`view.dashboard['3. Setting alert condition']`) }}:
                <span class="headline">{{
                  status.tutorial.alertConditions
                }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                {{ $t(`view.dashboard['4. Setting alert rule']`) }}:
                <span class="headline">{{ status.tutorial.alertRules }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                {{ $t(`view.dashboard['5. Setting alert notification']`) }}:
                <span class="headline">{{
                  status.tutorial.notifications
                }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            outlined
            color="grey darken-1"
            @click="settingDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-spacer class="my-16" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import finding from '@/mixin/api/finding'
import alert from '@/mixin/api/alert'
import iam from '@/mixin/api/iam'
import StatusStatistic from '@/component/widget/statistic/StatusStatistic'
import MiniStatistic from '@/component/widget/statistic/MiniStatistic'
import CategoryStatistic from '@/component/widget/statistic/CategoryStatistic'
export default {
  name: 'PageDashboard',
  mixins: [mixin, finding, alert, iam],
  components: {
    StatusStatistic,
    MiniStatistic,
    CategoryStatistic,
  },
  data() {
    return {
      raw: {
        activeAlert: [],
        highScoreFinding: [],
        settingStep: 5, // [Total 5 setting steps]
        invitedUser: [], // 1. User invited,
        storeFinding: 0, // 2, Setting DataSources ( = Store some Findings),
        alertCondition: [], // 3. Setting Alert Condition,
        alertRule: [], // 4. Setting Alert Rule,
        notification: [], // 5. Setting Alert Notification
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
        },
        tutorial: {
          // [Total 5 setting steps]
          invitedUsers: 0, // 1. User invited,
          storeFindings: false, // 2, Setting DataSources ( = exists some findings),
          alertConditions: 0, // 3. Setting Alert Condition,
          alertRules: 0, // 4. Setting Alert Rule,
          notifications: 0, // 5. Setting Alert Notification
        },
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
              },
            ],
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
              },
            ],
          },
        },
      },
      settingDialog: false,
    }
  },
  async mounted() {
    await this.signinUser()
    if (!this.$store.state.project.project_id) {
      return false
    }
    await this.setRawData()
    this.setStatus()
    this.setCategory()
  },
  methods: {
    // -- Raw Data ---------------------------------
    async setRawData() {
      await this.setActiveAlert()
      await this.setHighScoreFinding()
      await this.setUser() // 1. User invited,
      await this.setStoreFinding() // 2, Setting DataSources ( = Store some Findings),
      await this.setAlertCondition() // 3. Setting Alert Condition,
      await this.setAlertRule() // 4. Setting Alert Rule,
      await this.setAlertNotification() // 5. Setting Alert Notification
    },
    // alert list
    async setActiveAlert() {
      const list = await this.listAlert(
        '&status=' + this.getAlertStatus('ACTIVE')
      )
      this.raw.activeAlert = list
    },
    // Findings
    async setHighScoreFinding() {
      const [all, aws, diagnosis, osint, code, google] = await Promise.all([
        this.getFindingCount(0.8, '', 200),
        this.getFindingCount(0.8, 'aws:', 200),
        this.getFindingCount(0.8, 'diagnosis:', 200),
        this.getFindingCount(0.8, 'osint:', 200),
        this.getFindingCount(0.8, 'code:', 200),
        this.getFindingCount(0.8, 'google:', 200),
      ])
      this.raw.highScoreFinding = all
      this.raw.highScoreFindingAWS = aws
      this.raw.highScoreFindingDiagnosis = diagnosis
      this.raw.highScoreFindingOsint = osint
      this.raw.highScoreFindingCode = code
      this.raw.highScoreFindingGoogle = google
    },
    async setStoreFinding() {
      const storeFindings = await this.getFindingCount(0, '', 1)
      this.status.tutorial.storeFindings = storeFindings > 0
    },
    async getFindingCount(fromScore, dataSource, limit) {
      let searceCondition =
        '&from_score=' +
        fromScore +
        '&data_source=' +
        dataSource +
        '&status=1&offset=0'
      if (limit) {
        searceCondition += '&limit=' & limit
      }
      const count = await this.listFindingCnt(searceCondition)
      return count
    },

    // User
    async setUser() {
      this.raw.invitedUser = []
      const userIDs = await this.listUserAPI(
        '&project_id=' + this.getCurrentProjectID()
      ).catch((err) => {
        return Promise.reject(err)
      })
      this.status.tutorial.invitedUsers = userIDs.length
      this.raw.invitedUser = userIDs
    },
    // Alert condition
    async setAlertCondition() {
      this.raw.alertCondition = []
      const alert_condition = await this.listAlertCondition(true).catch(
        (err) => {
          return Promise.reject(err)
        }
      )
      this.status.tutorial.alertConditions = alert_condition.length
      this.raw.alertCondition = alert_condition
    },
    // Alert condition
    async setAlertRule() {
      this.raw.alertRule = []
      const alert_rule = await this.listAlertRule().catch((err) => {
        return Promise.reject(err)
      })
      this.status.tutorial.alertRules = alert_rule.length
      this.raw.alertRule = alert_rule
    },
    // Notification
    async setAlertNotification() {
      this.raw.notification = []
      const notification = await this.listAlertNotification().catch((err) => {
        return Promise.reject(err)
      })
      this.status.tutorial.notifications = notification.length
      this.raw.notification = notification
    },

    // -- Status ---------------------------------
    setStatus() {
      this.status.alert = this.raw.activeAlert
      ;(this.status.finding = this.raw.highScoreFinding),
        this.setSettingStatus()

      this.setTotalStatus()
      this.status.riskFactor = []
      this.status.riskFactor.push({
        title: this.status.alert.length.toString(),
        subTitle: 'Action required ....',
        icon: 'mdi-alert',
        color: 'red darken-3',
        link: '/alert/alert/',
      })
      this.status.riskFactor.push({
        title: String(this.status.finding),
        subTitle: 'High score findings ',
        icon: 'mdi-file-find-outline',
        color: 'blue darken-1',
        link: '/finding/finding/?from_score=0.8',
      })
      this.status.riskFactor.push({
        title: this.status.compSettingRate,
        subTitle: 'Settings coverage...',
        icon: 'mdi-cog',
        color: 'grey darken-2',
        link: 'settingDialog',
      })
    },
    // Setting Status
    setSettingStatus() {
      let completed = 0
      if (this.raw.invitedUser && this.raw.invitedUser.length > 0) {
        completed++
      }
      if (this.status.tutorial.storeFindings) {
        completed++
      }
      if (this.raw.alertCondition && this.raw.alertCondition.length > 0) {
        completed++
      }
      if (this.raw.alertRule && this.raw.alertRule.length > 0) {
        completed++
      }
      if (this.raw.notification && this.raw.notification.length > 0) {
        completed++
      }
      this.status.imcompSetting = this.raw.settingStep - completed
      this.status.compSettingRate =
        ((completed / this.raw.settingStep) * 100).toString() + '%'
    },
    // Total Status
    setTotalStatus() {
      // const totalRisk = Number(this.status.alert.length) + Number(this.status.finding.length) + Number(this.status.imcompSetting)
      let totalRisk = 0
      if (this.status.alert && this.status.alert.length) {
        totalRisk += Number(this.status.alert.length)
      }
      if (this.status.finding && this.status.finding.length) {
        totalRisk += Number(this.status.finding.length)
      }
      this.status.risk.detail =
        '  Active alerts: ' +
        this.status.alert.length +
        ', High score findings: ' +
        this.status.finding +
        ', Imcompleted settings: ' +
        this.status.imcompSetting +
        ' / ' +
        this.raw.settingStep
      if (this.status.imcompSetting === this.raw.settingStep) {
        this.status.risk.icon = 'mdi-message-settings'
        this.status.risk.color = 'cyan'
        this.status.risk.description = 'You need to configure some settings 🔜'
      } else if (totalRisk === 0) {
        this.status.risk.icon = 'mdi-check-circle-outline'
        this.status.risk.color = 'green'
        this.status.risk.description = 'No problem. 👌'
      } else if (0 < totalRisk && totalRisk <= 3) {
        this.status.risk.icon = 'mdi-weather-cloudy'
        this.status.risk.color = 'grey darken-1'
        this.status.risk.description = 'Need to check a few things. 👀'
      } else if (3 < totalRisk && totalRisk <= 10) {
        this.status.risk.icon = 'mdi-weather-pouring'
        this.status.risk.color = 'lime darken-3'
        this.status.risk.description = 'There are some problems... 😥'
      } else {
        this.status.risk.icon = 'mdi-weather-lightning'
        this.status.risk.color = 'red darken-2'
        this.status.risk.description = 'We have a lot of problems... 🙀'
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
        color: 'cyan lighten-2',
        dark: false,
        link: '/iam/user/',
      })
      this.category.push({
        category: 'AWS',
        title: String(this.raw.highScoreFindingAWS),
        subTitle: 'High score findings',
        icon: 'mdi-aws',
        color: 'orange darken-1',
        dark: true,
        link: '/finding/finding/?from_score=0.8&data_source=aws:',
      })
      this.category.push({
        category: 'Diagnosis',
        title: String(this.raw.highScoreFindingDiagnosis),
        subTitle: 'High score findings',
        icon: 'mdi-bug-check-outline',
        color: 'indigo darken-1',
        dark: true,
        link: '/finding/finding/?from_score=0.8&data_source=diagnosis:',
      })
      this.category.push({
        category: 'OSINT',
        title: String(this.raw.highScoreFindingOsint),
        subTitle: 'High score findings',
        icon: 'http',
        color: 'green darken-1',
        dark: true,
        link: '/finding/finding/?from_score=0.8&data_source=osint:',
      })
      this.category.push({
        category: 'Code',
        title: String(this.raw.highScoreFindingCode),
        subTitle: 'High score findings',
        icon: 'mdi-github',
        color: 'black',
        dark: true,
        link: '/finding/finding/?from_score=0.8&data_source=code:',
      })
      this.category.push({
        category: 'Google',
        title: String(this.raw.highScoreFindingGoogle),
        subTitle: 'High score findings',
        icon: 'mdi-google',
        color: 'light-blue darken-1',
        dark: true,
        link: '/finding/finding/?from_score=0.8&data_source=google:',
      })
    },

    // handler
    handleClickFactor(link) {
      if (link === 'settingDialog') {
        this.handleSettingSteps()
        return
      }
      this.$router.push(link)
    },
    handleSettingSteps() {
      this.settingDialog = true
    },
  },
}
</script>
