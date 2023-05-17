<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-file-chart</v-icon>
              {{ $t(`view.report['Download Finding Report']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="start" align-content="center">
          <v-col cols="6" offset="1">
            <v-combobox
              multiple
              variant="outlined"
              density="compact"
              clearable
              small-chips
              deletable-chips
              bg-color="white"
              :label="$t(`item['` + searchForm.dataSource.label + `']`)"
              :placeholder="searchForm.dataSource.placeholder"
              :items="dataSourceList"
              v-model="searchModel.dataSource"
            />
          </v-col>
          <v-col cols="3">
            <v-slider
              variant="outlined"
              density="compact"
              thumb-label
              min="0.0"
              max="1.0"
              step="0.1"
              :label="$t(`item['` + searchForm.score.label + `']`)"
              :messages="searchForm.score.placeholder"
              v-model="searchModel.score"
            ></v-slider>
          </v-col>
        </v-row>
        <v-row dense justify="start" align-content="center">
          <v-col cols="3" offset="1">
            <datepicker
              :enable-time-picker="false"
              v-model="searchModel.fromDate"
              model-type="yyyy-MM-dd"
              :format="datePickerFormat"
              auto-apply
            ></datepicker>
          </v-col>
          <v-col cols="3">
            <datepicker
              :enable-time-picker="false"
              v-model="searchModel.toDate"
              model-type="yyyy-MM-dd"
              :format="datePickerFormat"
              auto-apply
            ></datepicker>
          </v-col>
          <v-col cols="3">
            <v-select
              variant="outlined"
              density="compact"
              clearable
              bg-color="white"
              :label="$t(`item['` + searchForm.format.label + `']`)"
              :items="availableFormat"
              v-model="searchModel.format"
            />
          </v-col>
        </v-row>
        <v-row dense justify="center" align-content="center">
          <v-btn
            depressed
            elevation="1"
            color="primary"
            class="ma-4"
            @click="handleGet('')"
          >
            {{ $t(`btn['DOWNLOAD REPORT (PROJECT)']`) }}
          </v-btn>
        </v-row>
        <v-row v-if="flagAdmin" dense justify="center" align-content="center">
          <v-btn
            depressed
            elevation="1"
            color="primary"
            class="ma-4"
            @click="handleGet('all')"
          >
            {{ $t(`btn['DOWNLOAD REPORT (ALL)']`) }}
          </v-btn>
        </v-row>
      </v-form>

      <!-- Visual -->
      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat color="background">
            <v-toolbar-title class="grey--text text--darken-4 text-h5">
              <v-icon x-large class="pr-2" color="indigo-darken-2"
                >mdi-thermometer</v-icon
              >
              {{ $t(`view.report['Finding Changes']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
        <v-col cols="5">
          <v-data-table
            :headers="ReportFindingTable.headersCategory"
            :items="ReportFindingTable.itemsPerCategory"
            locale="ja-jp"
            no-data-text="No data."
            class="elevation-1"
            hide-default-footer
          >
            <template v-slot:[`item.avatar`]="{ item }">
              <v-avatar class="ma-2">
                <v-icon
                  large
                  class="pr-2"
                  :color="getDataSourceIconColor(item.value.category)"
                  >{{ getDataSourceIcon(item.value.category) }}</v-icon
                >
              </v-avatar>
            </template>
            <template v-slot:[`item.change`]="{ item }">
              <v-icon dense>
                {{ getIconByCountChange(item.value.change) }}
              </v-icon>
              {{ Math.abs(item.value.change) }}
            </template>
          </v-data-table>
        </v-col>
        <v-col cols="5">
          <v-data-table
            :headers="ReportFindingTable.headersSeverity"
            :items="ReportFindingTable.itemsPerSeverity"
            locale="ja-jp"
            no-data-text="No data."
            class="elevation-1"
            hide-default-footer
          >
            <!-- Sortable Header -->
            <template v-slot:[`item.avatar`]="{ item }">
              <v-avatar icon class="ma-2">
                <v-icon
                  large
                  class="pr-2"
                  :color="getSeverityColor(item.value.severity)"
                  >mdi-file-find-outline</v-icon
                >
              </v-avatar>
            </template>
            <template v-slot:[`item.change`]="{ item }">
              <v-icon dense>
                {{ getIconByCountChange(item.value.change) }}
              </v-icon>
              {{ Math.abs(item.value.change) }}
            </template>
          </v-data-table>
        </v-col>
      </v-row>

      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat color="background">
            <v-toolbar-title class="grey--text text--darken-4 text-h5">
              <v-icon x-large class="pr-2" color="indigo-darken-2"
                >mdi-thermometer</v-icon
              >
              {{ $t(`view.report['Number of Finding']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
        <v-col cols="6" v-if="loadedDoughnut">
          <v-card class="mx-auto" outlined>
            <v-list-item three-line>
              <div class="overline mb-4">
                {{ $t(`view.report['Per Category']`) }}
              </div>
              <doughnut-chart
                :chart-data="dataSourceDoughnutChart"
                :height="chartHeight"
              ></doughnut-chart>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="6" v-if="loadedDoughnut">
          <v-card class="mx-auto" outlined>
            <v-list-item three-line>
              <div class="overline mb-4">
                {{ $t(`view.report['Per Severity']`) }}
              </div>
              <doughnut-chart
                :chart-data="severityDoughnutChart"
                :height="chartHeight"
              ></doughnut-chart>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>

      <!-- Bar Chart -->
      <v-row justify="center" align-content="center">
        <v-col cols="8">
          <v-toolbar flat color="background">
            <v-toolbar-title class="grey--text text--darken-4 text-h5">
              <v-icon x-large class="pr-2" color="indigo-darken-2"
                >mdi-thermometer</v-icon
              >
              {{ $t(`view.report['Finding Transition']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
        <v-col cols="4">
          <v-select
            v-model="visibleDuration"
            bg-color="white"
            :items="visibleDurationList"
            item-text="duration"
            item-value="duration"
            :label="$t(`item['Duration']`)"
            @update:modelValue="SetBarChart"
            return-object
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" v-if="loadedBar">
          <v-card class="mx-auto" outlined>
            <v-list-item three-line>
              <div class="overline mb-4">
                {{ $t(`view.report['Per Category']`) }}
              </div>
              <bar-chart
                :chart-data="dataSourceBarChart"
                :height="chartHeight"
              ></bar-chart>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="6" v-if="loadedBar">
          <v-card class="mx-auto" outlined>
            <v-list-item three-line>
              <div class="overline mb-4">
                {{ $t(`view.report['Per Severity']`) }}
              </div>
              <bar-chart
                :chart-data="severityBarChart"
                :height="chartHeight"
              ></bar-chart>
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
import DoughnutChart from '@/component/widget/chart/DoughnutChart.vue'
import BarChart from '@/component/widget/chart/BarChart.vue'
import colors from 'vuetify/lib/util/colors'
import { VDataTable } from 'vuetify/labs/VDataTable'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
export default {
  name: 'ReportFinding',
  mixins: [mixin, finding, alert, iam],
  components: {
    BottomSnackBar,
    DoughnutChart,
    BarChart,
    VDataTable,
    Datepicker,
  },
  data() {
    return {
      loading: false,
      fromMenu: false,
      toMenu: false,
      format: 'csv',
      flagAdmin: false,
      availableFormat: ['csv', 'json'],
      reportFindings: [],
      searchModel: {
        dataSource: [],
        score: 0.0,
        fromDate: '',
        toDate: '',
        format: 'csv',
      },
      searchForm: {
        dataSource: {
          label: 'Data Source',
          placeholder: 'Filter data sources',
        },
        score: { label: 'Score', placeholder: 'Filter score( from )' },
        format: { label: 'Format', placeholder: 'select format' },
        fromDate: { label: 'FromDate', placeholder: 'Filter date( from )' },
        toDate: { label: 'ToDate', placeholder: 'Filter date( to )' },
      },
      // for visual
      yesterday: 0,
      dateLastMonth: 0,
      latest: '',
      lastDay: '',
      lastMonth: '',
      todayReportFindings: [],
      lastDayReportFindings: [],
      ReportFindings: [],
      totalFindings: 0,
      totalHighFindings: 0,
      lastDayTotalFindings: 0,
      lastDayTotalHighFindings: 0,
      category: ['aws', 'diagnosis', 'osint', 'code', 'google'],
      severity: ['Low', 'Medium', 'High'],
      categorystatistics: [],
      categoryFinding: {
        aws: 0,
        google: 0,
        diagnosis: 0,
        osint: 0,
        code: 0,
      },
      lastDayCategoryFinding: {
        aws: 0,
        google: 0,
        diagnosis: 0,
        osint: 0,
        code: 0,
      },
      ReportFindingTable: {
        headersCategory: [
          {
            title: '',
            sortable: false,
            align: 'center',
            width: '5%',
            key: 'avatar',
          },
          {
            title: 'Category',
            sortable: false,
            align: 'left',
            width: '5%',
            key: 'category',
          },
          {
            title: 'Previous',
            sortable: false,
            align: 'center',
            width: '5%',
            key: 'previous',
          },
          {
            title: 'Latest',
            sortable: false,
            align: 'center',
            width: '5%',
            key: 'latest',
          },
          {
            title: 'Change',
            sortable: false,
            align: 'center',
            width: '5%',
            key: 'change',
          },
        ],
        headersSeverity: [
          {
            title: '',
            sortable: false,
            align: 'center',
            width: '5%',
            key: 'avatar',
          },
          {
            title: 'Severity',
            sortable: false,
            align: 'left',
            width: '5%',
            key: 'severity',
          },
          {
            title: 'Previous',
            sortable: false,
            align: 'center',
            width: '5%',
            key: 'previous',
          },
          {
            title: 'Latest',
            sortable: false,
            align: 'center',
            width: '5%',
            key: 'latest',
          },
          {
            title: 'Change',
            sortable: false,
            align: 'center',
            width: '5%',
            key: 'change',
          },
        ],
        itemsPerCategory: [],
        itemsPerSeverity: [],
      },
      settingDialog: false,
      chartHeight: 300,
      // DoughnutChart
      dataSourceDoughnutChart: {
        labels: [],
        datasets: [],
      },
      severityDoughnutChart: {
        labels: [],
        datasets: [],
      },
      // BarChart
      visibleDuration: 'week',
      visibleDurationList: ['week', 'month'],
      labelBarChart: [],
      dataSourceBarChart: {
        labels: [],
        datasets: [],
      },
      severityBarChart: {
        labels: [],
        datasets: [],
      },
      barChartOption: { responsive: true },
      loadedDoughnut: false,
      loadedBar: false,
    }
  },
  mounted() {
    this.setFlagAdmin()
    const now = new Date()

    // latest
    this.yesterday = new Date()
    this.yesterday.setDate(now.getDate() - 1)
    this.latest = Util.formatDate(this.yesterday, 'yyyy-MM-dd')

    // last day
    let dateLastDay = new Date()
    dateLastDay.setDate(now.getDate() - 2)
    this.lastDay = Util.formatDate(dateLastDay, 'yyyy-MM-dd')

    // last month
    this.dateLastMonth = new Date()
    this.dateLastMonth.setMonth(now.getMonth() - 1)
    this.lastMonth = Util.formatDate(this.dateLastMonth, 'yyyy-MM-dd')

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
      url = '/report/get-report/?project_id='
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
      const url = '/report/get-report-all/?project_id='
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
    },
    async handleGet(target) {
      this.clearList()
      let searchCond = ''
      if (this.searchModel.dataSource) {
        searchCond += '&data_source=' + this.searchModel.dataSource
      }
      if (this.searchModel.score) {
        searchCond += '&score=' + this.searchModel.score
      }
      if (target == 'all') {
        await this.getReportFindingAll(
          searchCond,
          this.searchModel.fromDate,
          this.searchModel.toDate
        )
      } else {
        if (this.searchModel.toDate) {
          searchCond += '&to_date=' + this.searchModel.toDate
        }
        if (this.searchModel.fromDate) {
          searchCond += '&from_date=' + this.searchModel.fromDate
        }
        await this.getReportFinding(searchCond, target)
      }
      if (this.searchModel.format == 'csv') {
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
      } else if (this.searchModel.format == 'json') {
        var json = JSON.stringify({ data: this.reportFindings })
        let blob = new Blob([json], { type: 'text/json' })
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'finding_report.json'
        link.click()
      }
    },
    save(date) {
      this.$refs.searchModel.fromDate.save(date)
    },
    // -- Raw Data ---------------------------------
    async setData() {
      // default date condition
      this.searchModel.toDate = this.latest
      this.searchModel.fromDate = this.lastMonth

      await this.setReportFinding()
      this.SetTableData()
      this.SetDoughnutChart()
      this.SetBarChart()
    },
    async setReportFinding() {
      const res = await this.$axios
        .get(
          '/report/get-report/?project_id=' +
            this.getCurrentProjectID() +
            '&from_date=' +
            this.lastMonth +
            '&to_date=' +
            this.latest
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
        if (reportFinding.date.indexOf(this.latest) > -1) {
          this.todayReportFindings.push(reportFinding)
          this.totalFindings += reportFinding.count
          if (reportFinding.score >= 0.8) {
            this.totalHighFindings += reportFinding.count
          }
          category = reportFinding.data_source.split(':')[0]
          this.categoryFinding[category] += reportFinding.count
        }
        if (reportFinding.date.indexOf(this.lastDay) > -1) {
          this.todayReportFindings.push(reportFinding)
          this.lastDayTotalFindings += reportFinding.count
          if (reportFinding.score >= 0.8) {
            this.lastDayTotalHighFindings += reportFinding.count
          }
          category = reportFinding.data_source.split(':')[0]
          this.lastDayCategoryFinding[category] += reportFinding.count
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
    // TableData ---------------
    SetTableData() {
      this.SetTableDataPerCategory()
      this.SetTableDataPerSeverity()
    },
    SetTableDataPerCategory() {
      this.category.map((category) =>
        this.ReportFindingTable.itemsPerCategory.push({
          category: category,
          previous: this.lastDayCategoryFinding[category],
          latest: this.categoryFinding[category],
          change:
            this.categoryFinding[category] -
            this.lastDayCategoryFinding[category],
        })
      )
    },
    SetTableDataPerSeverity() {
      this.severity.map((severity) =>
        this.ReportFindingTable.itemsPerSeverity.push({
          severity: severity,
          previous: this.CountFindingsPerSeverityDate(severity, this.lastDay),
          latest: this.CountFindingsPerSeverityDate(severity, this.latest),
          change:
            this.CountFindingsPerSeverityDate(severity, this.latest) -
            this.CountFindingsPerSeverityDate(severity, this.lastDay),
        })
      )
    },
    // DoughnutChart -----------------------------
    SetDoughnutChart() {
      this.loadedDoughnut = false
      this.SetDoughnutChartDataSource()
      this.SetDoughnutChartSeverity()
      this.loadedDoughnut = true
    },

    SetDoughnutChartDataSource() {
      this.dataSourceDoughnutChart.labels = this.category
      this.dataSourceDoughnutChart.datasets = [
        {
          data: [
            this.categoryFinding.aws,
            this.categoryFinding.diagnosis,
            this.categoryFinding.osint,
            this.categoryFinding.code,
            this.categoryFinding.google,
          ],
          backgroundColor: [
            this.getRGBByCategory('aws'),
            this.getRGBByCategory('diagnosis'),
            this.getRGBByCategory('osint'),
            this.getRGBByCategory('code'),
            this.getRGBByCategory('google'),
          ],
        },
      ]
    },
    SetDoughnutChartSeverity() {
      this.severityDoughnutChart.labels = this.severity
      this.severityDoughnutChart.datasets.push({
        data: this.severity.map((sev) =>
          this.CountFindingsPerSeverityDate(sev, this.latest)
        ),
        backgroundColor: [
          this.getRGBBySeverity('low'),
          this.getRGBBySeverity('medium'),
          this.getRGBBySeverity('high'),
        ],
      })
    },
    // BarChart ------------------------------------
    SetBarChart() {
      this.loadedBar = false
      this.clearBarChart()
      this.SetLabelBarChart()
      this.SetBarChartDataSource()
      this.SetBarChartSeverity()
      this.loadedBar = true
    },
    clearBarChart() {
      this.labelBarChart = []
      this.dataSourceBarChart = {
        labels: [],
        datasets: [],
      }
      this.severityBarChart = {
        labels: [],
        datasets: [],
      }
    },
    SetLabelBarChart() {
      var label = []
      var day = new Date(this.yesterday.getTime())
      switch (this.visibleDuration) {
        case 'week':
          day.setDate(this.yesterday.getDate() - 6)
          break
        case 'month':
        default:
          day.setMonth(this.yesterday.getMonth() - 1)
          break
      }
      var yesterdayDate = Util.formatDate(this.yesterday, 'yyyy-MM-dd')
      var date = ''
      while (date != yesterdayDate) {
        date = Util.formatDate(day, 'yyyy-MM-dd')
        label.push(date)
        day.setDate(day.getDate() + 1)
      }
      this.labelBarChart = label
    },
    SetBarChartDataSource() {
      this.dataSourceBarChart.datasets = this.category.map((cat) =>
        this.GetBarDataPerDataSource(cat, this.labelBarChart)
      )
      this.dataSourceBarChart.labels = this.labelBarChart.map((label) =>
        label.slice(-5)
      )
    },
    GetBarDataPerDataSource(category, dateArr) {
      const countPerDataSource = dateArr.map((date) =>
        this.GetBarCountPerDataSource(category, date)
      )
      return {
        label: category,
        borderColor: this.getRGBByCategory(category),
        backgroundColor: this.getRGBByCategory(category),
        fill: false,
        data: countPerDataSource,
      }
    },
    GetBarCountPerDataSource(category, date) {
      const data = this.ReportFindings.filter((rf) => {
        return (
          rf.date.indexOf(date) > -1 && rf.data_source.indexOf(category) > -1
        )
      })
      const countPerDate = data.reduce(function (sum, element) {
        return sum + element.count
      }, 0)
      return countPerDate
    },
    SetBarChartSeverity() {
      this.severityBarChart.datasets = this.severity.map((sev) =>
        this.GetBarDataPerSeverity(sev, this.labelBarChart)
      )
      this.severityBarChart.labels = this.labelBarChart.map((label) =>
        label.slice(-5)
      )
    },
    GetBarDataPerSeverity(severity, dateArr) {
      const countPerSeverity = dateArr.map((date) =>
        this.CountFindingsPerSeverityDate(severity, date)
      )
      return {
        label: severity,
        backgroundColor: this.getRGBBySeverity(severity),
        borderColor: this.getRGBBySeverity(severity),
        data: countPerSeverity,
      }
    },
    CountFindingsPerSeverityDate(severity, date) {
      const data = this.ReportFindings.filter((rf) => {
        switch (severity.toLowerCase()) {
          case 'high':
            return rf.score >= 0.8 && rf.date.indexOf(date) > -1
          case 'low':
            return rf.score < 0.6 && rf.date.indexOf(date) > -1
          case 'medium':
            return (
              rf.score >= 0.6 && rf.score < 0.8 && rf.date.indexOf(date) > -1
            )
        }
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
    getRGBBySeverity(severity) {
      severity = severity.toLowerCase()
      switch (severity) {
        case 'high':
          return colors.red.lighten2
        case 'medium':
          return colors.yellow.lighten2
        case 'low':
          return colors.teal.lighten2
        default:
          return colors.gray
      }
    },
    getIconByCountChange(num) {
      if (num > 0) {
        return 'mdi-arrow-up'
      } else if (num < 0) {
        return 'mdi-arrow-down'
      } else {
        return 'mdi-arrow-right'
      }
    },
    datePickerFormat(date) {
      return Util.formatDate(date, 'yyyy-MM-dd')
    },
  },
}
</script>
