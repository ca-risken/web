<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="white" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="red lighten-2">mdi-alert</v-icon>
              Alert
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            outlined clearable dense
            prepend-icon="mdi-magnify"
            placeholder="Type something..."
            v-model="table.search"
            hide-details
            class="hidden-sm-and-down"
          />
        </v-col>
        <v-spacer />
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
                loading-text="読込中"
                no-data-text="データがありません。"
                class="elevation-1"
                item-key="alert_id"
                @click:row="handleViewItem"
              >
                <template v-slot:item.severity="{ item }">
                  <v-chip dark :color="getSeverityColor(item.severity)">{{ item.severity }}</v-chip>
                </template>
                <template v-slot:item.activated="{ item }">
                  <v-icon v-if="item.activated==true" color="success">mdi-check-circle</v-icon>
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:item.created_at="{ item }">
                  <v-chip dark label color="grey lighten-1">{{ item.created_at | elapsedTimeText }}</v-chip>
                </template>
                <template v-slot:item.updated_at="{ item }">
                  <v-chip>{{ item.updated_at | formatTime }}</v-chip>
                </template>
                <template v-slot:item.action="{ item }">
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
                        v-for="action in table.actions"
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
      <v-card>
        <v-card-title>
          <span class="mx-4 headline">AlertHistory</span>
          <v-chip dark label color="primary darken-3">
            <v-icon left>mdi-label</v-icon>
            {{ alertModel.alert_id }}
          </v-chip>
          <strong class="mx-4 headline">{{alertModel.description}}</strong>
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
      table: {
        selected: [],
        search: '',
        headers: [
          { text: 'Active', align: 'center', width: '10%', sortable: true, value: 'activated' },
          { text: 'ID',  align: 'center', width: '10%', sortable: true, value: 'alert_id' },
          { text: 'Severity', align: 'center', width: '10%', sortable: true, value: 'severity' },
          { text: 'Description', align: 'start', width: '40%', sortable: true, value: 'description' },
          { text: 'Passed', align: 'center', width: '10%', sortable: true, value: 'created_at' },
          { text: 'Updated', align: 'center', width: '10%', sortable: true, value: 'updated_at' },
          { text: 'Action', align: 'center', width: '10%', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_id'] },
        actions: [
          { text: 'View Item',  icon: 'mdi-eye', click: this.handleViewItem },
        ],
        footer: {
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
      viewDialog: false,
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
    this.loading = true
    this.getAlert(true)
    this.loading = false
  },
  methods: {
    // alert list
    async getAlert(activate) {
      const res = await this.$axios.get(
        '/alert/list-alert/?activated=' + activate + '&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.alert ) {
        this.clearList()
        return false
      }
      this.table.items = list.data.alert
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },

    // alert history list
    async getHistory() {
      const res = await this.$axios.get(
        '/alert/list-history/?alert_id=' + this.alertModel.alert_id + '&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.alert_history ) {
        this.clearHistory()
        return false
      }
      this.alertHistoryModel = list.data.alert_history
    },
    clearHistory() {
      this.alertHistoryModel = []
      this.loading = false
    },

    handleViewItem(item) {
      this.loading = true
      this.assignDataModel(item)
      this.getHistory()
      this.viewDialog  = true
      this.loading = false
    },
    assignDataModel(item) {
      this.alertModel = {}
      this.alertModel = Object.assign(this.alertModel, item)
    },
  }
}
</script>
