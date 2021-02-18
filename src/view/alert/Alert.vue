<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="red lighten-2">mdi-alert</v-icon>
              Alert
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense justify="center" align-content="center">
        <v-col cols="6">
          <v-text-field
            outlined clearable dense
            background-color="white"
            prepend-icon="mdi-magnify"
            placeholder="Type something..."
            v-model="table.search"
            hide-details
            class="hidden-sm-and-down"
          />
        </v-col>
        <v-col cols="3">
          <v-checkbox
            required
            v-model="table.activeOnly"
            label="Active only"
            @change="handleRefleshList"
          ></v-checkbox>
        </v-col>
        <v-spacer />
        <v-btn 
          fab dense outlined small 
          color="primary darken-3" 
          class="mt-3 mr-4"
          :loading="loading" 
          @click="handleCondition"
        >
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                v-model="table.selected"
                :search="table.search"
                :headers="table.headers"
                :items="table.items"
                :options.sync="table.options"
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="alert_id"
                @click:row="handleViewItem"
              >
                <template v-slot:[`item.severity`]="{ item }">
                  <v-chip  class="ma-1" dark :color="getSeverityColor(item.severity)">{{ item.severity }}</v-chip>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-icon v-if="getAlertStatusText(item.status)=='ACTIVE'" color="success">mdi-check-circle</v-icon>
                  <v-icon v-else-if="getAlertStatusText(item.status)=='PENDING'" color="yellow">mdi-check-circle</v-icon>
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:[`item.created_at`]="{ item }">
                  <v-chip dark label color="grey lighten-1">{{ item.created_at | elapsedTimeText }}</v-chip>
                </template>
                <template v-slot:[`item.updated_at`]="{ item }">
                  <v-chip>{{ item.updated_at | formatTime }}</v-chip>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ on: menu }">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on: tooltip }">
                          <v-btn icon v-on="{ ...menu, tooltip }">
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <span>Action</span>
                      </v-tooltip>
                    </template>
                    <v-list class="pa-0" dense>
                      <v-list-item
                        v-for="action in getActionList(item)"
                        :key="action.text"
                        @click="action.click( item )"
                      >
                        <v-list-item-icon class="mr-2">
                          <v-icon small>{{ action.icon }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{ action.text }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="viewDialog" max-width="60%">
      <!-- Finding -->
      <v-card>
        <v-card-title>
          <span class="mx-4 headline">Alert Findings</span>
          <v-chip dark label color="primary darken-3">
            <v-icon left>mdi-label</v-icon>
            {{ alertModel.alert_id }}
          </v-chip>
          <strong class="mx-4 headline">{{alertModel.description}}</strong>
        </v-card-title>
        <v-card-text class="py-0">
          <v-chip-group
            active-class="primary--text"
            column
          >
            <v-chip
              v-for="(resouruce, idx) in getResourceList(alertResource)"
              :key="idx"
              @click="handleClickFinding(resouruce)"
            >
              {{ resouruce }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>
      <!-- History -->
      <v-card>
        <v-card-title>
          <span class="mx-4 headline">AlertHistory</span>
        </v-card-title>
        <v-card-text class="py-0">
          <v-timeline align-top dense>
            <v-timeline-item
              v-for="item in alertHistoryModel"
              icon="mdi-alert"
              :key="item.alert_history_id"
              :color="getSeverityColor(item.severity)"
              large
            >
              <v-row class="pt-1">
                <v-col cols="3">
                  <v-chip>{{ item.created_at | formatTime }}</v-chip>
                </v-col>
                <v-col>
                  <div class="caption">{{ item.alert_history_id }}</div>
                  <strong>{{ item.description }}</strong>
                </v-col>
                <v-col>
                  <div class="caption">findings</div>
                  <strong>{{ item.findingsIDs }}</strong>
                </v-col>
                <v-col cols="2">
                  <v-chip
                    dark
                    :color="getHistoryTypeColor(item.history_type)"
                  >
                    {{ item.history_type }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
        <v-card-text>
          <v-divider class="mt-3 mb-3"></v-divider>
          <v-card-actions>
            <v-spacer />
            <v-btn text outlined color="grey darken-1" @click="viewDialog = false">
              CANCEL
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="pendDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">Do you want to update PENDING this?</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="alertModel.alert_id"></v-list-item-title>
              <v-list-item-subtitle>Alert ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-file-find-outline</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                <v-chip  class="ma-1" dark :color="getSeverityColor(alertModel.severity)">{{ alertModel.severity }}</v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>Serverity</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-image-text</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="alertModel.description"></v-list-item-title>
              <v-list-item-subtitle>Description</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined color="grey darken-1" @click="pendDialog = false">
            CANCEL
          </v-btn>
          <v-btn
            color="red darken-1"
            text outlined
            :loading="loading"
            @click="handlePendSubmit"
          >
            PEND
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
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  mixins: [mixin],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      alertModel: {},
      alertHistoryModel: [],
      alertResource: [],
      table: {
        selected: [],
        search: '',
        activeOnly: true,
        headers: [
          { text: 'Status', align: 'center', width: '10%', sortable: true, value: 'status' },
          { text: 'ID',  align: 'center', width: '10%', sortable: true, value: 'alert_id' },
          { text: 'Severity', align: 'center', width: '10%', sortable: true, value: 'severity' },
          { text: 'Description', align: 'start', width: '40%', sortable: true, value: 'description' },
          { text: 'Passed', align: 'center', width: '10%', sortable: true, value: 'created_at' },
          { text: 'Updated', align: 'center', width: '10%', sortable: true, value: 'updated_at' },
          { text: 'Action', align: 'center', width: '10%', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_id'] },
        footer: {
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
      viewDialog: false,
      pendDialog: false,
    }
  },
  filters: {
    formatTime: (unix) => {
      return Util.formatDate(new Date(unix * 1000), 'yyyy/MM/dd HH:mm')
    },
    elapsedTimeText: (unix) => {
      return Util.elapsedTimeText(new Date(unix * 1000))
    },
  },
  mounted() {
    this.handleRefleshList()
  },
  methods: {
    // alert list
    async getAlert() {
      this.table.items = []
      let statusParam = ''
      if (this.table.activeOnly) {
        statusParam = '&status=' + this.getAlertStatus('ACTIVE')
      }
      const res = await this.$axios.get(
        '/alert/list-alert/?project_id=' + this.$store.state.project.project_id + statusParam
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      if ( !res.data.data.alert ) {
        this.clearList()
        return false
      }
      this.table.items = res.data.data.alert
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },

    // alert history list
    async getHistory() {
      this.alertHistoryModel = []
      const res = await this.$axios.get(
        '/alert/list-history/?alert_id=' + this.alertModel.alert_id + '&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      if ( !res.data.data.alert_history ) {
        this.clearHistory()
        return false
      }
      // this.alertHistoryModel = list.data.alert_history
      res.data.data.alert_history.forEach(async history => {
        const json = JSON.parse(history.finding_history)
        let findingsIDs = ""
        if (json && json.finding_id) {
          findingsIDs = this.formatFindingIDs(json.finding_id)
        }
        this.alertHistoryModel.push({
          alert_history_id: history.alert_history_id,
          history_type: history.history_type,
          alert_id: history.alert_id,
          description: history.description,
          severity: history.severity,
          finding_history: history.finding_history,
          project_id: history.project_id,
          created_at: history.created_at,
          updated_at: history.updated_at,
          findingsIDs: findingsIDs,
        })
      })
    },
    formatFindingIDs(ids){
      if (ids.length <= 5) {
        return ids
      }
      let formated = []
      for ( let i=0; i < 5; i++ ) {
        formated.push(ids[i])
      }
      formated.push('...')
      return formated
    },
    clearHistory() {
      this.alertHistoryModel = []
      this.loading = false
    },

    // alert finding list
    async getFinding() {
      this.clearFinding()
      const res = await this.$axios.get(
        '/alert/list-rel_alert_finding/?alert_id=' + this.alertModel.alert_id + '&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      if ( !res.data.data.rel_alert_finding ) {
        this.clearFinding()
        return false
      }
      res.data.data.rel_alert_finding.forEach( async finding => {
        const res = await this.$axios.get(
          '/finding/get-finding/?finding_id=' + finding.finding_id + '&project_id=' + this.$store.state.project.project_id
        ).catch((err) =>  {
          return Promise.reject(err)
        })
        this.alertResource.push(res.data.data.finding.resource_name)
      })
    },
    clearFinding() {
      this.alertResource = []
      this.loading = false
    },
    getResourceList(array) {
      const resources = Array.from(new Set(array)) // dedupulicated
      let result = []
      if ( resources.length > 10 ) {
        for (let i = 0; i < 10; i++) {
          result.push(resources[i])
        }
        result.push('...')
      } else {
        result = resources
      }
      return result
    },
    getActionList( item ) {
      let list = [
          { text: 'View Item',  icon: 'mdi-eye', click: this.handleViewItem },
      ]
      if ( !item.status ) return list
      if ( this.getAlertStatusText(item.status)=='ACTIVE' ) {
        list.push({ text: 'Pending', icon: 'mdi-trash-can-outline', click: this.handlePendItem })
      } else if (this.getAlertStatusText(item.status)=='PENDING' ) {
        list.push({ text: 'Activate', icon: 'mdi-check-circle-outline', click: this.handleActiveItem })
      }
      return list
    },

    // Pending alert
    async putAlertStatus(status) {
      const param = { 
        project_id: this.$store.state.project.project_id,
        alert: {
          project_id: this.$store.state.project.project_id,
          alert_id: this.alertModel.alert_id,
          alert_condition_id: this.alertModel.alert_condition_id,
          description: this.alertModel.description,
          severity: this.alertModel.severity,
          status: Number(this.getAlertStatus(status)),
        },
      }
      await this.$axios.post('/alert/put-alert/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Update alert status.')
    },

    // handler
    handleRefleshList() {
      this.loading = true
      this.getAlert()
    },
    handleCondition() {
      this.$router.push('/alert/condition/')
    },
    handleViewItem(item) {
      this.loading = true
      this.assignDataModel(item)
      this.getFinding()
      this.getHistory()
      this.viewDialog  = true
      this.loading = false
    },
    handleClickFinding(resourceName) {
      let name = resourceName
      if (resourceName == '...') {
        name = ''
      }
      this.$router.push('/finding/finding?resource_name=' + name)
    },
    handlePendItem(item) {
      this.assignDataModel(item)
      this.pendDialog  = true
    },
    handlePendSubmit() {
      this.loading = true
      this.putAlertStatus('PENDING')
    },
    handleActiveItem(item) {
      this.loading = true
      this.assignDataModel(item)
      this.putAlertStatus('ACTIVE')
    },
    assignDataModel(item) {
      this.alertModel = {}
      this.alertModel = Object.assign(this.alertModel, item)
    },

    // finish

    // finish process
    async finishSuccess(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifySuccess(msg)
      this.finish(true)
    },
    async finishError(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifyError(msg)
      this.finish(false)
    },
    async finish(reflesh) {
      this.loading = false
      this.viewDialog  = false
      this.pendDialog  = false
      if ( reflesh ) {
        this.getAlert()
      }
    },
  }
}
</script>
