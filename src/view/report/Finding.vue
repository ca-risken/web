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
              multiple outlined dense clearable small-chips deletable-chips
              background-color="white"
              :label="$t(`item['`+searchForm.dataSource.label+`']`)"
              :placeholder="searchForm.dataSource.placeholder"
              :items="dataSourceList"
              v-model="searchModel.dataSource"
            />
          </v-col>
          <v-col cols="3">
            <v-slider
              outlined dense thumb-label
              min="0.0"
              max="1.0"
              step="0.1"
              :label="$t(`item['`+searchForm.score.label+`']`)"
              :messages="searchForm.score.placeholder"
              v-model="searchModel.score"
            ></v-slider>
          </v-col>
        </v-row>
        <v-row dense justify="start" align-content="center">
          <v-col cols="3" offset="1">
            <v-menu
                v-model="fromMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
            >
                <template v-slot:activator="{ on, attrs }">
                <v-text-field outlined dense clearable
                    v-model="searchModel.fromDate"
                    :label="$t(`item['`+searchForm.fromDate.label+`']`)"
                    readonly
                    background-color="white"
                    v-bind="attrs"
                    v-on="on"
                ></v-text-field>
                </template>
                <v-date-picker
                v-model="searchModel.fromDate"
                @input="fromMenu = false"
                ></v-date-picker>
            </v-menu>
          </v-col>
        <v-col cols="3">
            <v-menu
                v-model="toMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
            >
                <template v-slot:activator="{ on, attrs }">
                <v-text-field outlined dense clearable
                    v-model="searchModel.toDate"
                    :placeholder="searchForm.toDate.placeholder"
                    :label="$t(`item['`+searchForm.toDate.label+`']`)"
                    readonly
                    background-color="white"
                    v-bind="attrs"
                    v-on="on"
                ></v-text-field>
                </template>
                <v-date-picker
                v-model="searchModel.toDate"
                @input="toMenu = false"
                ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="3">
            <v-select
              outlined dense clearable
              background-color="white"
              :label="$t(`item['`+searchForm.format.label+`']`)"
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
                @click="handleGet('')">
                {{ $t(`btn['DOWNLOAD REPORT (PROJECT)']`) }}
            </v-btn>
        </v-row>
        <v-row v-if="flagAdmin" dense justify="center" align-content="center">
            <v-btn
                depressed
                elevation="1"
                color="primary"
                class="ma-4"
                @click="handleGet('all')">
                {{ $t(`btn['DOWNLOAD REPORT (ALL)']`) }}
            </v-btn>
        </v-row>
      </v-form>

      <!-- Visual -->
      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat color="background">
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon x-large class="pr-2" color="indigo darken-2">mdi-thermometer</v-icon>
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
              <v-avatar icon class="ma-2">
                <v-icon large class="pr-2" :color="getDataSourceIconColor(item.category)">{{ getDataSourceIcon(item.category) }}</v-icon>
              </v-avatar>
            </template>
            <template v-slot:[`item.change`]="{ item }">
              <v-icon dense> {{ getIconByCountChange(item.change) }} </v-icon>
              {{ Math.abs(item.change) }}
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
                <v-icon large class="pr-2" :color="getSeverityColor(item.severity)">mdi-file-find-outline</v-icon>
              </v-avatar>
            </template>
            <template v-slot:[`item.change`]="{ item }">
              <v-icon dense> {{ getIconByCountChange(item.change) }} </v-icon>
              {{ Math.abs(item.change) }}
            </template>
 
          </v-data-table>
        </v-col>
      </v-row>

      <v-row justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar flat color="background">
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon x-large class="pr-2" color="indigo darken-2">mdi-thermometer</v-icon>
              {{ $t(`view.report['Number of Finding']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
        <v-col cols="6" v-if="loadedDoughnut">
          <v-card
            class="mx-auto"
            outlined
          >
            <v-list-item three-line>
              <v-list-item-content>
                <div class="overline mb-4">
                {{ $t(`view.report['Per Category']`) }}
                </div>
                  <doughnut-chart :chart-data="dataSourceDoughnutChart" :height="chartHeight"></doughnut-chart>
              </v-list-item-content>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="6" v-if="loadedDoughnut">
            <v-card
            class="mx-auto"
            outlined
          >
            <v-list-item three-line>
              <v-list-item-content>
                <div class="overline mb-4">
                  {{ $t(`view.report['Per Severity']`) }}
                </div>
                  <doughnut-chart :chart-data="severityDoughnutChart" :height="chartHeight"></doughnut-chart>
              </v-list-item-content>
            </v-list-item>
          </v-card>

        </v-col>
      </v-row>

    <!-- Bar Chart -->
      <v-row justify="center" align-content="center">
        <v-col cols="8">
          <v-toolbar flat color="background">
            <v-toolbar-title class="grey--text text--darken-4 headline">
              <v-icon x-large class="pr-2" color="indigo darken-2">mdi-thermometer</v-icon>
              {{ $t(`view.report['Finding Transition']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
        <v-col cols="4">
          <v-select
            v-model="visibleDuration"
            background-color="white"
            :items="visibleDurationList"
            item-text="duration"
            item-value="duration"
            :label="$t(`item['Duration']`)"
            @change="SetBarChart"
            return-object
            outlined
            dense
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" v-if="loadedBar">
          <v-card
            class="mx-auto"
            outlined
          >
            <v-list-item three-line>
              <v-list-item-content>
                <div class="overline mb-4">
                  {{ $t(`view.report['Per Category']`) }}
                </div>
                  <bar-chart :chart-data="dataSourceBarChart" :height="chartHeight"></bar-chart>
              </v-list-item-content>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col cols="6" v-if="loadedBar">
            <v-card
            class="mx-auto"
            outlined
          >
            <v-list-item three-line>
              <v-list-item-content>
                <div class="overline mb-4">
                  {{ $t(`view.report['Per Severity']`) }}
                </div>
                  <bar-chart :chart-data="severityBarChart" :height="chartHeight"></bar-chart>
              </v-list-item-content>
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
import DoughnutChart from '@/component/widget/chart/DoughnutChart'
import BarChart from '@/component/widget/chart/BarChart'
import colors from 'vuetify/lib/util/colors'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  mixins: [mixin, finding, alert],
  components: {
    BottomSnackBar,
    DoughnutChart,
    BarChart,
  },
  data() {
    return {
      loading: false,
      fromMenu: false,
      toMenu: false,
      format: "csv",
      flagAdmin: false,
      availableFormat: ["csv","json"],
      reportFindings: [],
      searchModel: { 
          dataSource: [],
          score: 0.0,
          fromDate: "",
          toDate: new Date().toISOString().substr(0, 10),
          format: "csv",
      },
      searchForm: {
        dataSource: { label: 'Data Source', placeholder: 'Filter data sources' },
        score: { label: 'Score', placeholder: 'Filter score( from )' },
        format: { label: 'Format', placeholder: 'select format' },
        fromDate: { label: 'FromDate', placeholder: 'Filter date( from )' },
        toDate: { label: 'ToDate', placeholder: 'Filter date( to )' },
      },
      // for visual
      now:  0,
      dateLastMonth:  0,
      latest: '',
      yesterday: '',
      lastMonth:  '',
      todayReportFindings: [],
      yesterdayReportFindings: [],
      ReportFindings: [],
      totalFindings: 0,
      totalHighFindings: 0,
      yesterdayTotalFindings: 0,
      yesterdayTotalHighFindings: 0,
      category: ["aws", "diagnosis", "osint", "code", "google"],
      severity: ["Low","Medium","High"],
      categorystatistics: [],
      categoryFinding: {
        aws:0,
        google:0,
        diagnosis:0,
        osint:0,
        code:0,
      },
      yesterdayCategoryFinding: {
        aws:0,
        google:0,
        diagnosis:0,
        osint:0,
        code:0,
      },
      ReportFindingTable: {
        headersCategory: [
          { text: '',          sortable: false, align: 'center', width: '5%',  value: 'avatar' },
          { text: 'Category',  sortable: false, align: 'left',   width: '5%',  value: 'category' },
          { text: 'Previous',  sortable: false, align: 'center', width: '5%',  value: 'previous' },
          { text: 'Latest',    sortable: false, align: 'center', width: '5%',  value: 'latest' },
          { text: 'Change',    sortable: false, align: 'center', width: '5%',  value: 'change' },
        ],
        headersSeverity: [
          { text: '',          sortable: false, align: 'center', width: '5%',  value: 'avatar' },
          { text: 'Severity',  sortable: false, align: 'left',   width: '5%',  value: 'severity' },
          { text: 'Previous',  sortable: false, align: 'center', width: '5%',  value: 'previous' },
          { text: 'Latest',    sortable: false, align: 'center', width: '5%',  value: 'latest' },
          { text: 'Change',    sortable: false, align: 'center', width: '5%',  value: 'change' },
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
      visibleDuration: "week",
      visibleDurationList: ["week", "month"],
      labelBarChart: [],
      dataSourceBarChart: {
        labels: [],
        datasets: [],
      },
      severityBarChart: {
        labels: [],
        datasets: [],
      },
      barChartOption: {responsive: true},
      loadedDoughnut: false,
      loadedBar: false,
    }
  },
  mounted() {
      this.setFlagAdmin()
      this.now = new Date()
      this.now.setDate(this.now.getDate() - 1)
      var yesterdayDate = new Date()
      yesterdayDate.setDate(this.now.getDate() - 1)
      this.yesterday = Util.formatDate(yesterdayDate, 'yyyy-MM-dd')
      this.dateLastMonth = new Date()
      this.dateLastMonth.setMonth(this.now.getMonth() - 1)
      this.latest = Util.formatDate(this.now, 'yyyy-MM-dd')
      this.lastMonth = Util.formatDate(this.dateLastMonth, 'yyyy-MM-dd')
      this.setData()
  },
  methods: {
    async setFlagAdmin() {
        const admin = await this.$axios.get('/iam/is-admin/?user_id=' + store.state.user.user_id ).catch((err) =>  {
            return Promise.reject(err)
        })
        if (admin.data.data.ok) {
            this.flagAdmin = true
            return
            }
        this.flagAdmin = false
        return
    },
    async getReportFinding(searchCond,target) {
        let url = ""
        if (target == "all"){
            url = '/report/get-report-all/?project_id='
        }else {
            url = '/report/get-report/?project_id='
        }
        const res = await this.$axios.get(
        url + this.$store.state.project.project_id + searchCond
        ).catch((err) =>  {
            this.clearList()
            return Promise.reject(err)
        })
        if(!res.data.data.report_finding){
            return
        }
        res.data.data.report_finding.forEach( report_finding => {
            report_finding.report_date = report_finding.report_date.substr(0, 10)
            this.reportFindings.push(report_finding)
      })
    },
    clearList (){
        this.reportFindings = []
    },
    async handleGet(target) {
      this.clearList()
      let searchCond = ''
      if (this.searchModel.dataSource) {
        searchCond += '&data_source=' + this.searchModel.dataSource
      }
      if (this.searchModel.fromDate) {
        searchCond += '&from_date=' + this.searchModel.fromDate
      }
      if (this.searchModel.toDate) {
        searchCond += '&to_date=' + this.searchModel.toDate
      }
      if (this.searchModel.score) {
        searchCond += '&score=' + this.searchModel.score
      }
      await this.getReportFinding(searchCond,target)
      if (this.searchModel.format == "csv"){
        var csv = '\ufeff' + 'report_finding_id,report_date,category,data_source,project_id,project_name,score,count\n'
        this.reportFindings.forEach(el => {
            var line = el['report_finding_id'] + ',' + el['report_date'] + ',' + el['category'] + ',' + el['data_source'] + ',' + 
             el['project_id'] + ',' + el['project_name'] + ','  + el['score'] + ',' + el['count'] +  '\n'
            csv += line
        })
        let blob = new Blob([csv], { type: 'text/csv' })
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'finding_report.csv'
        link.click()
      } else if (this.searchModel.format == "json"){
        var json = JSON.stringify({"data": this.reportFindings})
        let blob = new Blob([json], { type: 'text/json' })
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'finding_report.json'
        link.click()
      }
    },
    save (date) {
        this.$refs.searchModel.fromDate.save(date)
    },
    // -- Raw Data ---------------------------------
    async setData() {
      await this.setReportFinding()
      this.SetTableData()
      this.SetDoughnutChart()
      this.SetBarChart()
    },
    async setReportFinding() {
      const res = await this.$axios.get(
        '/report/get-report/?project_id=' + this.$store.state.project.project_id + '&from_date=' + this.lastMonth  + '&to_date=' + this.latest
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data  || !res.data.data || !res.data.data.report_finding ) {
        return
      }
      var category = ""
      for ( const fr of res.data.data.report_finding) {
        var reportFinding = new this.newReportFinding(fr)
        this.ReportFindings.push(reportFinding)
        if (reportFinding.date.indexOf(this.latest) > -1){
          this.todayReportFindings.push(reportFinding)
          this.totalFindings += reportFinding.count
          if (reportFinding.score >= 0.8) {
            this.totalHighFindings += reportFinding.count            
          }
          category = reportFinding.data_source.split(":")[0]
          this.categoryFinding[category] += reportFinding.count
        }
        if (reportFinding.date.indexOf(this.yesterday) > -1){
          this.todayReportFindings.push(reportFinding)
          this.yesterdayTotalFindings += reportFinding.count
          if (reportFinding.score >= 0.8) {
            this.yesterdayTotalHighFindings += reportFinding.count
          }
          category = reportFinding.data_source.split(":")[0]
          this.yesterdayCategoryFinding[category] += reportFinding.count

        }
      }
    },
    newReportFinding(finding_report) {
      return {
        date:finding_report.report_date,
        data_source:finding_report.data_source,
        score:finding_report.score,
        count:finding_report.count
        }
    },
    // TableData ---------------
    SetTableData(){
      this.SetTableDataPerCategory()
      this.SetTableDataPerSeverity()
    },
    SetTableDataPerCategory(){
      this.category.map(category =>
        this.ReportFindingTable.itemsPerCategory.push({
          category: category,
          previous: this.yesterdayCategoryFinding[category],
          latest: this.categoryFinding[category],
          change: this.categoryFinding[category] - this.yesterdayCategoryFinding[category],
        })
      )
    },
    SetTableDataPerSeverity(){
      this.severity.map(severity =>
        this.ReportFindingTable.itemsPerSeverity.push({
          severity: severity,
          previous: this.CountFindingsPerSeverityDate(severity,this.yesterday),
          latest:this.CountFindingsPerSeverityDate(severity,this.latest),
          change: this.CountFindingsPerSeverityDate(severity,this.latest) - this.CountFindingsPerSeverityDate(severity,this.yesterday),
        })
      )
    },
    // DoughnutChart -----------------------------
    SetDoughnutChart(){
      this.loadedDoughnut = false
      this.SetDoughnutChartDataSource()
      this.SetDoughnutChartSeverity()
      this.loadedDoughnut = true
    },

    SetDoughnutChartDataSource(){
      this.dataSourceDoughnutChart.labels = this.category
      this.dataSourceDoughnutChart.datasets.push({data: [
        this.categoryFinding.aws,
        this.categoryFinding.diagnosis,
        this.categoryFinding.osint,
        this.categoryFinding.code,
        this.categoryFinding.google
        ],
        backgroundColor: [
        this.getRGBByCategory("aws"),
        this.getRGBByCategory("diagnosis"),
        this.getRGBByCategory("osint"),
        this.getRGBByCategory("code"),
        this.getRGBByCategory("google"),
      ]})
    },
    SetDoughnutChartSeverity(){
      this.severityDoughnutChart.labels = this.severity
      this.severityDoughnutChart.datasets.push ({
        data: this.severity.map( sev => this.CountFindingsPerSeverityDate(sev,this.latest) ),
        backgroundColor: [
          this.getRGBBySeverity("low"),
          this.getRGBBySeverity("medium"),
          this.getRGBBySeverity("high"),
      ]})
    },
    // BarChart ------------------------------------
      SetBarChart(){
      this.loadedBar = false
      this.clearBarChart()
      this.SetLabelBarChart()
      this.SetBarChartDataSource()
      this.SetBarChartSeverity()
      this.loadedBar = true
    },
    clearBarChart(){
      this.labelBarChart = []
      this.dataSourceBarChart = {
        labels: [],
        datasets: [],
      }
      this.severityBarChart= {
        labels: [],
        datasets: [],
      }
    },
    SetLabelBarChart(){
      var label = []
      var now = new Date()
      now.setDate(this.now.getDate() - 1)
      var day = new Date()
      switch (this.visibleDuration) {
      case "week": 
        day.setDate(now.getDate() - 6)
        break
      case "month":
      default:
        day.setMonth(now.getMonth() - 1)
        break
      }
      var nowDate = Util.formatDate(this.now,'yyyy-MM-dd')
      var date = ""
      while (date != nowDate) {
        date = Util.formatDate(day,'yyyy-MM-dd')
        label.push(date)
        day.setDate(day.getDate()+ 1)
      }
      this.labelBarChart = label
    },
    SetBarChartDataSource(){
      this.dataSourceBarChart.datasets =  this.category.map(
        cat => this.GetBarDataPerDataSource(cat,this.labelBarChart))
      this.dataSourceBarChart.labels = this.labelBarChart.map( label =>
        label.slice(-5))
    },
    GetBarDataPerDataSource(category,dateArr){
      const countPerDataSource = dateArr.map (date => this.GetBarCountPerDataSource(category,date))
      return {
        label: category, 
        borderColor: this.getRGBByCategory(category), 
        backgroundColor: this.getRGBByCategory(category),
        fill: false,
        data: countPerDataSource}
    },
    GetBarCountPerDataSource(category,date){
      const data = this.ReportFindings.filter( rf => {
        return rf.date.indexOf(date) > -1 && rf.data_source.indexOf(category) > -1
      })
      const countPerDate = data.reduce(function(sum, element){ return sum + element.count;}, 0)
      return countPerDate
    },
    SetBarChartSeverity(){
      this.severityBarChart.datasets =  this.severity.map(
        sev => this.GetBarDataPerSeverity(sev,this.labelBarChart))
      this.severityBarChart.labels = this.labelBarChart.map( label =>
        label.slice(-5))
    },
    GetBarDataPerSeverity(severity,dateArr){
      const countPerSeverity = dateArr.map (date => this.CountFindingsPerSeverityDate(severity,date))
      return {
        label: severity, 
        backgroundColor: this.getRGBBySeverity(severity), 
        borderColor: this.getRGBBySeverity(severity), 
        data: countPerSeverity}
    },
    CountFindingsPerSeverityDate(severity,date){
      const data = this.ReportFindings.filter( rf => {
        switch (severity.toLowerCase()){
        case "high":
          return rf.score >= 0.8 && rf.date.indexOf(date) > -1
        case "low":
          return rf.score < 0.6 && rf.date.indexOf(date) > -1
        case "medium":
          return rf.score >= 0.6 && rf.score < 0.8 && rf.date.indexOf(date) > -1
        }
      })
      const countPerDate = data.reduce(function(sum, element){ return sum + element.count;}, 0)
      return countPerDate
    },
    getRGBByCategory(category){
      category = category.toLowerCase()
      switch (category) {
        case "aws":
          return colors.orange.lighten3
        case "diagnosis":
          return colors.indigo.lighten3
        case "osint":
          return colors.green.lighten3
        case "code":
          return colors.grey.darken1
        case "google":
          return colors.lightBlue.lighten3
        default:
          return colors.gray
      }
    },
    getRGBBySeverity(severity){
      severity = severity.toLowerCase()
      switch (severity) {
        case "high":
          return colors.red.lighten2
        case "medium":
          return colors.yellow.lighten2
        case "low":
          return colors.teal.lighten2
        default:
          return colors.gray
      }
    },
    getIconByCountChange(num) {
      if (num > 0){
        return 'mdi-arrow-up'
      } else if (num < 0){
          return "mdi-arrow-down"
      } else {
        return "mdi-arrow-right"
      }
    },
  }
}
</script>
