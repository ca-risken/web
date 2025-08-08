<template>
  <div class="list-table">
    <v-container>
      <!-- Visual -->
      <v-row>
        <v-col cols="12">
          <v-toolbar color="background">
            <v-toolbar-title class="grey--text text-h5">
              <v-icon large class="pr-2">mdi-file-chart</v-icon>
              {{ $t(`view.report['Finding Summary']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="2">
          <v-select
            v-model="visibleDataSource"
            bg-color="white"
            :items="visibleDataSourceList"
            item-text="datasource"
            item-value="datasource"
            :label="$t(`view.dashboard['Category']`)"
            @update:modelValue="setReport"
            return-object
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            v-model="visibleScore"
            bg-color="white"
            :items="visibleScoreList"
            item-title="title"
            item-value="value"
            :label="$t(`item['Score']`)"
            @update:modelValue="setReport"
            return-object
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-menu
            v-model="fromDatePicker"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                density="compact"
                variant="outlined"
                v-model="fromDate"
                :label="$t(`item['FromDate']`)"
                show-current
                bg-color="white"
              ></v-text-field>
            </template>
            <datepicker
              inline
              :enable-time-picker="false"
              v-model="fromDate"
              model-type="yyyy-MM-dd"
              :format="datePickerFormat"
              :max-date="toDate"
              @update:model-value="fromDatePicker = false"
              auto-apply
              no-today
            ></datepicker>
          </v-menu>
        </v-col>
        <v-col cols="3">
          <v-menu
            v-model="toDatePicker"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                density="compact"
                variant="outlined"
                v-model="toDate"
                :label="$t(`item['ToDate']`)"
                show-current
                bg-color="white"
              ></v-text-field>
            </template>
            <datepicker
              inline
              :enable-time-picker="false"
              v-model="toDate"
              model-type="yyyy-MM-dd"
              :format="datePickerFormat"
              :min-date="fromDate"
              :max-date="latest"
              @update:model-value="toDatePicker = false"
              auto-apply
              no-today
            ></datepicker>
          </v-menu>
        </v-col>
        <v-col>
          <v-btn
            class=""
            color="grey-darken-2"
            size="large"
            density="compact"
            icon="mdi-refresh"
            variant="outlined"
            :loading="loading"
            @click="setData"
          />
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                class="ms-4"
                size="large"
                density="compact"
                variant="outlined"
                color="green-darken-2"
                :loading="loading"
                icon="mdi-format-list-bulleted-square"
              >
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="action in getDownloadActionList()"
                :key="action.text"
                @click="action.click"
                :prepend-icon="action.icon"
              >
                <v-list-item-title class="ma-1">{{
                  action.text
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="7">
          <v-row>
            <v-col cols="4">
              <report-number-statistic
                icon="mdi-magnify"
                category="All"
                color="cyan-lighten-2"
                :title="findingNumber('total')"
              >
              </report-number-statistic>
            </v-col>
            <v-col cols="4">
              <report-number-statistic
                icon="mdi-aws"
                :category="$t(`menu['AWS']`)"
                color="orange-darken-1"
                :title="findingNumber('aws')"
              >
              </report-number-statistic>
            </v-col>
            <v-col cols="4">
              <report-number-statistic
                icon="mdi-google"
                :category="$t(`menu['Google']`)"
                color="light-blue-darken-1"
                :title="findingNumber('google')"
              >
              </report-number-statistic>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <report-number-statistic
                icon="mdi-bug-check-outline"
                :category="$t(`menu['Diagnosis']`)"
                color="indigo-darken-1"
                :title="findingNumber('diagnosis')"
              >
              </report-number-statistic>
            </v-col>
            <v-col cols="4">
              <report-number-statistic
                icon="md:http"
                :category="$t(`menu['OSINT']`)"
                color="green-darken-1"
                :title="findingNumber('osint')"
              >
              </report-number-statistic>
            </v-col>
            <v-col cols="4">
              <report-number-statistic
                icon="mdi-github"
                :category="$t(`menu['Code']`)"
                color="black"
                :title="findingNumber('code')"
              >
              </report-number-statistic>
            </v-col>
          </v-row>
        </v-col>
        <v-col align-self="center">
          <v-row justify="center">
            <v-col v-if="loadedPie" cols="9">
              <v-card class="mx-auto" outlined>
                <v-list-item>
                  <pie-chart
                    :chart-data="pieChart"
                    :options="pieOptions"
                  ></pie-chart>
                </v-list-item>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row justify="start" align-content="center">
        <v-col cols="4">
          <v-toolbar flat color="background">
            <v-toolbar-title class="grey--text text--darken-4 text-h5">
              <v-icon x-large class="pr-2" color="indigo-darken-2"
                >mdi-thermometer</v-icon
              >
              {{ $t(`view.report['Finding Transition']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <!-- Line Chart -->
      <v-row>
        <v-col cols="12" v-if="loadedLine">
          <v-card class="mx-auto" outlined>
            <v-list-item>
              <line-chart
                :chart-data="lineChart"
                :height="lineChartHeight"
              ></line-chart>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import store from '@/store'
import Util from '@/util'
import mixin from '@/mixin'
import finding from '@/mixin/api/finding'
import alert from '@/mixin/api/alert'
import iam from '@/mixin/api/iam'
import PieChart from '@/component/widget/chart/PieChart.vue'
import LineChart from '@/component/widget/chart/LineChart.vue'
import colors from 'vuetify/lib/util/colors'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import ReportNumberStatistic from '@/component/widget/statistic/ReportNumberStatistic.vue'
export default {
  name: 'ReportFinding',
  mixins: [mixin, finding, alert, iam],
  components: {
    BottomSnackBar,
    PieChart,
    LineChart,
    Datepicker,
    ReportNumberStatistic,
  },
  computed: {
    findingNumber() {
      return (category) => {
        return this.getFindingNumber(category)
      }
    },
  },
  data() {
    return {
      loading: false,
      flagAdmin: false,
      reportFindings: [],
      // for visual
      dateLastMonth: 0,
      latest: '',
      ReportFindings: [],
      category: ['aws', 'diagnosis', 'osint', 'code', 'google'],
      severity: ['Low', 'Medium', 'High'],
      categoryFinding: {
        RISKEN: { Low: 0, Medium: 0, High: 0 },
        total: { Low: 0, Medium: 0, High: 0 },
        aws: { Low: 0, Medium: 0, High: 0 },
        google: { Low: 0, Medium: 0, High: 0 },
        diagnosis: { Low: 0, Medium: 0, High: 0 },
        osint: { Low: 0, Medium: 0, High: 0 },
        code: { Low: 0, Medium: 0, High: 0 },
      },
      lineChartHeight: 150,
      // filter config
      fromDate: '',
      toDate: '',
      fromDatePicker: false,
      toDatePicker: false,
      visibleScore: { title: '>= 0.8', value: 'High' },
      visibleScoreList: [
        { title: '>= 0.1', value: 'Low' },
        { title: '>= 0.6', value: 'Medium' },
        { title: '>= 0.8', value: 'High' },
      ],
      visibleDataSource: 'All',
      visibleDataSourceList: [
        'All',
        'aws',
        'diagnosis',
        'osint',
        'code',
        'google',
      ],
      // PieChart
      pieChart: {
        labels: [],
        datasets: [],
      },
      pieOptions: {
        plugins: {},
      },
      // LineChart
      labelLineChart: [],
      lineChart: {
        labels: [],
        datasets: [],
      },
      loadedPie: false,
      loadedLine: false,
    }
  },
  mounted() {
    this.setFlagAdmin()
    const now = new Date()

    // latest
    let yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    this.latest = Util.formatDate(yesterday, 'yyyy-MM-dd')

    // last month
    this.dateLastMonth = new Date()
    this.dateLastMonth.setMonth(now.getMonth() - 1)
    const lastMonth = Util.formatDate(this.dateLastMonth, 'yyyy-MM-dd')

    // default date condition
    this.toDate = this.latest
    this.fromDate = lastMonth

    this.setData()
  },
  methods: {
    async setFlagAdmin() {
      if (!store.state.user || !store.state.user.user_id) {
        this.$refs.snackbar.notifyError('Error: Try again after signin.')
        return
      }
      const admin = await this.isAdminAPI(store.state.user.user_id).catch(
        (err) => {
          return Promise.reject(err)
        }
      )
      if (admin) {
        this.flagAdmin = true
        return
      }
      this.flagAdmin = false
      return
    },
    async getReportFinding(searchCond) {
      let url = ''
      url = '/report/get-report-finding/?project_id='
      const res = await this.$axios
        .get(url + this.getCurrentProjectID() + searchCond)
        .catch((err) => {
          this.clearList()
          return Promise.reject(err)
        })
      if (!res.data.data.report_finding) {
        return
      }
      res.data.data.report_finding.forEach((report_finding) => {
        report_finding.report_date = report_finding.report_date.substr(0, 10)
        this.reportFindings.push(report_finding)
      })
    },
    async getReportFindingAll(searchCond, fromDate, toDate) {
      let fDate = new Date()
      let tDate = new Date()
      let endDate = new Date()
      if (fromDate == '') {
        fDate = new Date()
        fDate.setMonth(fDate.getMonth() - 3)
        tDate.setMonth(fDate.getMonth())
        tDate.setDate(tDate.getDate() + 6)
      } else {
        fDate = new Date(fromDate)
        tDate.setMonth(fDate.getMonth())
        tDate.setDate(fDate.getDate() + 6)
      }
      if (toDate != null && toDate != '') {
        endDate = new Date(toDate)
      }
      const url = '/report/get-report-finding-all/?project_id='
      while (fDate < endDate) {
        let condDate = '&from_date=' + Util.formatDate(fDate, 'yyyy-MM-dd')
        condDate += '&to_date=' + Util.formatDate(tDate, 'yyyy-MM-dd')
        const res = await this.$axios
          .get(url + this.getCurrentProjectID() + searchCond + condDate)
          .catch((err) => {
            this.clearList()
            return Promise.reject(err)
          })
        if (res.data.data.report_finding) {
          res.data.data.report_finding.forEach((report_finding) => {
            report_finding.report_date = report_finding.report_date.substr(
              0,
              10
            )
            this.reportFindings.push(report_finding)
          })
        }
        fDate.setDate(fDate.getDate() + 7)
        tDate.setDate(tDate.getDate() + 7)
      }
    },
    clearList() {
      this.reportFindings = []
      this.ReportFindings = []
      this.categoryFinding = {
        RISKEN: { Low: 0, Medium: 0, High: 0 },
        total: { Low: 0, Medium: 0, High: 0 },
        aws: { Low: 0, Medium: 0, High: 0 },
        google: { Low: 0, Medium: 0, High: 0 },
        diagnosis: { Low: 0, Medium: 0, High: 0 },
        osint: { Low: 0, Medium: 0, High: 0 },
        code: { Low: 0, Medium: 0, High: 0 },
      }
    },
    async handleGet(target, format) {
      this.clearList()
      let searchCond = ''
      if (this.visibleDataSource != 'All') {
        searchCond += '&data_source=' + this.visibleDataSource
      }
      searchCond += '&score=' + this.getScoreBySeverity(this.visibleScore.value)
      if (target == 'all') {
        await this.getReportFindingAll(searchCond, this.fromDate, this.toDate)
      } else {
        if (this.toDate) {
          searchCond += '&to_date=' + this.toDate
        }
        if (this.fromDate) {
          searchCond += '&from_date=' + this.fromDate
        }
        await this.getReportFinding(searchCond, target)
      }
      if (format == 'csv') {
        var csv =
          '\ufeff' +
          'report_finding_id,report_date,category,data_source,project_id,project_name,score,count\n'
        this.reportFindings.forEach((el) => {
          var line =
            el['report_finding_id'] +
            ',"' +
            el['report_date'] +
            '","' +
            el['category'] +
            '","' +
            el['data_source'] +
            '",' +
            el['project_id'] +
            ',"' +
            el['project_name'] +
            '",' +
            el['score'] +
            ',' +
            el['count'] +
            '\n'
          csv += line
        })
        let blob = new Blob([csv], { type: 'text/csv' })
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'finding_report.csv'
        link.click()
      } else if (format == 'json') {
        var json = JSON.stringify({ data: this.reportFindings })
        let blob = new Blob([json], { type: 'text/json' })
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'finding_report.json'
        link.click()
      }
    },
    save(date) {
      this.$refs.fromDate.save(date)
    },
    // -- Raw Data ---------------------------------
    async setData() {
      this.clearList()
      await this.setReportFinding()
      this.setReport()
    },
    async setReportFinding() {
      const res = await this.$axios
        .get(
          '/report/get-report-finding/?project_id=' +
            this.getCurrentProjectID() +
            '&from_date=' +
            this.fromDate +
            '&to_date=' +
            this.toDate
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.report_finding) {
        return
      }
      var category = ''
      for (const fr of res.data.data.report_finding) {
        var reportFinding = this.newReportFinding(fr)
        this.ReportFindings.push(reportFinding)
        if (reportFinding.date.indexOf(this.toDate) > -1) {
          var severity = this.getSeverityByScore(reportFinding.score)
          category = reportFinding.data_source.split(':')[0]
          if (reportFinding.score > 0) {
            this.categoryFinding.total[severity] += reportFinding.count
            this.categoryFinding[category][severity] += reportFinding.count
          }
        }
      }
    },
    newReportFinding(finding_report) {
      return {
        date: finding_report.report_date,
        data_source: finding_report.data_source,
        score: finding_report.score,
        count: finding_report.count,
      }
    },
    setReport() {
      this.SetPieChart()
      this.SetLineChart()
    },
    // PieChart -----------------------------
    SetPieChart() {
      this.loadedPie = false
      this.clearPieChart()
      this.SetPieChartData()
      this.loadedPie = true
    },
    clearPieChart() {
      this.pieChart = {
        labels: [],
        datasets: [],
      }
    },
    SetPieChartData() {
      if (this.visibleDataSource == 'All') {
        this.pieChart.labels = this.category
      } else {
        this.pieChart.labels = [this.visibleDataSource]
      }
      let data = []
      let bgColor = []
      for (const ds in this.pieChart.labels) {
        const cat = this.pieChart.labels[ds]
        data.push(this.getFindingNumber(cat))
        bgColor.push(this.getRGBByCategory(cat))
      }
      this.pieChart.datasets = [
        {
          data: data,
          backgroundColor: bgColor,
        },
      ]
    },
    // LineChart ------------------------------------
    SetLineChart() {
      this.loadedLine = false
      this.clearLineChart()
      this.SetLabelLineChart()
      this.SetLineChartData()
      this.loadedLine = true
    },
    clearLineChart() {
      this.labelLineChart = []
      this.lineChart = {
        labels: [],
        datasets: [],
      }
    },
    SetLabelLineChart() {
      var label = []
      var day = new Date(this.fromDate)
      var date = ''
      while (date != this.toDate) {
        date = Util.formatDate(day, 'yyyy-MM-dd')
        label.push(date)
        day.setDate(day.getDate() + 1)
      }
      this.labelLineChart = label
    },
    SetLineChartData() {
      let category = []
      if (this.visibleDataSource == 'All') {
        category = this.category
      } else {
        category = [this.visibleDataSource]
      }
      this.lineChart.datasets = category.map((cat) =>
        this.GetLineDataPerDataSource(
          cat,
          this.labelLineChart,
          this.visibleScore.value
        )
      )
      this.lineChart.labels = this.labelLineChart.map((label) =>
        label.slice(-5)
      )
    },
    GetLineDataPerDataSource(category, dateArr, severity) {
      const countPerDataSource = dateArr.map((date) =>
        this.GetLineCountPerDataSource(category, date, severity)
      )
      return {
        label: category,
        borderColor: this.getRGBByCategory(category),
        backgroundColor: this.getRGBByCategory(category),
        data: countPerDataSource,
      }
    },
    GetLineCountPerDataSource(category, date, severity) {
      let score = 0
      switch (severity) {
        case 'High':
          score = 0.8
          break
        case 'Medium':
          score = 0.6
          break
        case 'Low':
          score = 0.1
          break
        default:
          break
      }
      const data = this.ReportFindings.filter((rf) => {
        return (
          rf.date.indexOf(date) > -1 &&
          rf.data_source.indexOf(category) > -1 &&
          rf.score >= score
        )
      })
      const countPerDate = data.reduce(function (sum, element) {
        return sum + element.count
      }, 0)
      return countPerDate
    },
    getRGBByCategory(category) {
      category = category.toLowerCase()
      switch (category) {
        case 'aws':
          return colors.orange.lighten3
        case 'diagnosis':
          return colors.indigo.lighten3
        case 'osint':
          return colors.green.lighten3
        case 'code':
          return colors.grey.darken1
        case 'google':
          return colors.lightBlue.lighten3
        default:
          return colors.gray
      }
    },
    datePickerFormat(date) {
      return Util.formatDate(date, 'yyyy-MM-dd')
    },
    getSeverityByScore(score) {
      switch (true) {
        case score >= 0.8:
          return 'High'
        case score >= 0.6:
          return 'Medium'
        case score > 0.0:
          return 'Low'
        default:
          return ''
      }
    },
    getScoreBySeverity(severity) {
      switch (severity) {
        case 'High':
          return 0.8
        case 'Medium':
          return 0.6
        case 'Low':
          return 0.1
        default:
          return 0.0
      }
    },
    getFindingNumber(category) {
      let count = this.categoryFinding[category].High
      if (this.visibleScore.value == 'Medium') {
        count += this.categoryFinding[category].Medium
      }
      if (this.visibleScore.value == 'Low') {
        count += this.categoryFinding[category].Low
      }
      return count
    },
    getDownloadActionList() {
      let list = []
      list.push({
        text: this.$t(`btn['DOWNLOAD REPORT (PROJECT)']`) + ' (csv)',
        icon: 'mdi-file-download',
        click: () => this.handleGet('', 'csv'),
      })
      list.push({
        text: this.$t(`btn['DOWNLOAD REPORT (PROJECT)']`) + ' (json)',
        icon: 'mdi-file-download',
        click: () => this.handleGet('', 'json'),
      })
      if (this.flagAdmin) {
        list.push({
          text: this.$t(`btn['DOWNLOAD REPORT (ALL)']`) + ' (csv)',
          icon: 'mdi-file-download',
          click: () => this.handleGet('all', 'csv'),
        })
        list.push({
          text: this.$t(`btn['DOWNLOAD REPORT (ALL)']`) + ' (json)',
          icon: 'mdi-file-download',
          click: () => this.handleGet('all', 'json'),
        })
      }
      return list
    },
  },
}
</script>
