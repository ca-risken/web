<template>
  <div class="page-dashboard">
    <v-container>
      <!-- Status -->
      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat>
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon large class="pr-2" color="indigo darken-2">mdi-thermometer</v-icon>
              Status
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row>
        <!-- Status -->
        <v-col cols="8">
          <status-statistic
            :icon="status.riskIcon"
            :color="status.riskColor"
            :description="status.riskDescription"
            :detail="status.riskDetail"
            class="mx-2"
            ref="weather"
          />
        </v-col>

        <!-- mini statistic start -->
        <v-col cols="4">
          <!-- <v-btn text tile class="ma-0" width="100%"> -->
          <mini-statistic
            icon="mdi-alert"
            :title="status.activeAlerts.toString()"
            sub-title="Action Required ...."
            color="red darken-3"
            link="/alert/alert/"
            class="mb-2"
          />
          <!-- </v-btn> -->
          <mini-statistic
            icon="mdi-file-find-outline"
            :title="status.highScoreFindings.toString()"
            sub-title="HighScore Findings "
            color="blue darken-1"
            link="/finding/finding/"
            class="mb-2"
          />
          <mini-statistic
            icon="mdi-cog"
            :title="status.settingCompRate"
            sub-title="Setting Coverage ..."
            color="grey darken-2"
            link="/alert/condition/"
            class="mb-2"
          />
        </v-col>
      </v-row>

      <!-- Category -->
      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat>
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon large class="pr-2" color="indigo darken-2">mdi-shape-outline</v-icon>
              Category
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row>
      </v-row>

      <!-- Static -->
      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat>
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon large class="pr-2" color="indigo darken-2">mdi-graph</v-icon>
              Statics
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row>
      </v-row>

    </v-container>
  </div>
</template>

<script>
import StatusStatistic from '@/component/widget/statistic/StatusStatistic'
import MiniStatistic from '@/component/widget/statistic/MiniStatistic'
export default {
  name: 'PageDashboard',
  components: {
    StatusStatistic,
    MiniStatistic,
  },
  data() {
    return {
      activeAlert: [],
      highScoreFinding: [],
      settings: {
        steps: 5,            // [Total 5 setting steps]
        invitedUsers: [],    // 1. User invited, 
        storeFindings: [],   // 2, Setting DataSources ( = Store some Findings),
        alertConditions: [], // 3. Setting Alert Condition,
        alertRules: [],      // 4. Setting Alert Rule,
        notifications: [],   // 5. Setting Alert Notification
      },
      status: {
        activeAlerts: 0,
        highScoreFindings: 0,
        imcompletedSettings: 0,
        settingCompRate: '-',

        riskIcon: '',
        riskColor: '',
        riskDescription: '',
        riskDetail: '',
      }
    }
  },
  async mounted() {
    await this.getActiveAlert()
    await this.getHighScoreFindings()
    await this.getSettings()
    this.riskAssessment()
  },
  methods: {
    // alert list
    async getActiveAlert() {
      const res = await this.$axios.get(
        '/alert/list-alert/?activated=true&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.alert ) {
        this.clearAlert()
        return false
      }
      this.activeAlert = res.data.data.alert
      this.status.activeAlerts =  res.data.data.alert.length
    },

    // Findings
    async getHighScoreFindings() {
      const oneMonthAgoUnix = Math.floor(new Date().setMonth(new Date().getMonth() - 1) / 1000)
      this.highScoreFinding = await this.getFindings(oneMonthAgoUnix, 0.8)
      this.status.highScoreFindings = this.highScoreFinding.length
    },
    async getFindings(fromAt, fromScore) {
      const res = await this.$axios.get(
        '/finding/list-finding/?project_id=' + this.$store.state.project.project_id
          + '&from_at=' + fromAt
          + '&from_score=' + fromScore
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.finding_id ) {
        return false
      }
      return res.data.data.finding_id
    },

    // Settings
    async getSettings() {
      await this.getUsers()              // 1. User invited, 
      await this.getStoreFindings()      // 2, Setting DataSources ( = Store some Findings),
      await this.getAlertConditions()    // 3. Setting Alert Condition,
      await this.getAlertRules()         // 4. Setting Alert Rule,
      await this.getAlertNotifications() // 5. Setting Alert Notification

      this.status.imcompletedSettings = this.settings.steps
      let completed = 0
      if (this.settings.invitedUsers.length > 0) {
        completed++
      }
      if (this.settings.storeFindings.length > 0) {
        completed++
      }
      if (this.settings.alertConditions.length > 0) {
        completed++
      }
      if (this.settings.alertRules.length > 0) {
        completed++
      }
      if (this.settings.notifications.length > 0) {
        completed++
      }
      this.status.imcompletedSettings = this.settings.steps - completed
      this.status.settingCompRate = ((completed / this.settings.steps) * 100 ).toString() + '%'
    },
    async getUsers() {
      this.settings.invitedUsers = []
      const res = await this.$axios.get(
        '/iam/list-user/?activated=true&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.user_id ) {
        return false
      }
      this.settings.invitedUsers = res.data.data.user_id
    },
    async getStoreFindings() {
      this.settings.storeFindings = []
      this.settings.storeFindings = await this.getFindings(0, 0)
    },
    async getAlertConditions() {
      this.settings.alertConditions = []
      const res = await this.$axios.get(
        '/alert/list-condition/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.alert_condition ) {
        return false
      }
      this.settings.alertConditions = res.data.data.alert_condition
    },
    async getAlertRules() {
      this.settings.alertRules = []
      const res = await this.$axios.get(
        '/alert/list-rule/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.alert_rule ) {
        return false
      }
      this.settings.alertRules = res.data.data.alert_rule
    },
    async getAlertNotifications() {
      this.settings.notifications = []
      const res = await this.$axios.get(
        '/alert/list-notification/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.notification ) {
        return false
      }
      this.settings.notifications = res.data.data.notification
    },

    // Risk Assessment
    riskAssessment() {
      const totalRisk = Number(this.status.activeAlerts) + Number(this.status.highScoreFindings) + Number(this.status.imcompletedSettings)
      this.status.riskDetail =
        '  Active Alerts: ' + this.status.activeAlerts +
        ', High Score Findings: ' + this.status.highScoreFindings +
        ', Imcompleted Settings: ' + this.status.imcompletedSettings + ' / ' + this.settings.steps
      if ( totalRisk === 0 ) {
        this.status.riskIcon = 'mdi-check-circle-outline'
        this.status.riskColor = 'green'
        this.status.riskDescription = '問題ありません.'
      } else if ( 0 < totalRisk && totalRisk <= 3 ) {
        this.status.riskIcon = 'mdi-weather-cloudy'
        this.status.riskColor = 'grey darken-1'
        this.status.riskDescription = '確認が必要な項目があります.'
      } else if ( 3 < totalRisk && totalRisk <= 10 ) {
        this.status.riskIcon = 'mdi-weather-pouring'
        this.status.riskColor = 'lime darken-3'
        this.status.riskDescription = '何か問題がありそうです...'
      } else {
        this.status.riskIcon = 'mdi-weather-lightning'
        this.status.riskColor = 'red darken-2'
        this.status.riskDescription = '問題が山積みです...!'
      }
    },

  },
}
</script>
