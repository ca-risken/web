<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-file-chart</v-icon>
              Finding
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
    </v-container>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import store from '@/store'
import mixin from '@/mixin'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  mixins: [mixin],
  components: {
    BottomSnackBar,
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
    }
  },
  mounted() {
      this.setFlagAdmin()
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
  }
}
</script>
