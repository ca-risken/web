<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="red lighten-2"
                >mdi-alert</v-icon
              >
              {{ $t(`submenu['Alert']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense justify="center" align-content="center">
        <v-col cols="6">
          <v-text-field
            outlined
            clearable
            dense
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
            :label="$t(`view.alert['Active Only']`)"
            @change="handleRefleshList"
          ></v-checkbox>
        </v-col>
        <v-spacer />
        <v-btn
          fab
          dense
          outlined
          small
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
                :headers="headers"
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
                  <v-chip
                    class="ma-1"
                    dark
                    :color="getSeverityColor(item.severity)"
                    >{{ item.severity }}</v-chip
                  >
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-icon
                    v-if="getAlertStatusText(item.status) == 'ACTIVE'"
                    color="success"
                    >mdi-check-circle</v-icon
                  >
                  <v-icon
                    v-else-if="getAlertStatusText(item.status) == 'PENDING'"
                    color="yellow"
                    >mdi-check-circle</v-icon
                  >
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:[`item.created_at`]="{ item }">
                  <v-chip dark label color="grey lighten-1">{{
                    item.created_at | elapsedTimeText
                  }}</v-chip>
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
                        @click="action.click(item)"
                      >
                        <v-list-item-icon class="mr-2">
                          <v-icon small>{{ action.icon }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{
                          $t(`action['` + action.text + `']`)
                        }}</v-list-item-title>
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

    <v-dialog v-model="viewDialog" max-width="70%">
      <!-- Finding -->
      <v-card>
        <v-card-title>
          <span class="mx-4 headline">{{
            $t(`view.alert['Alert Findings']`)
          }}</span>
          <v-chip dark label color="primary darken-3">
            <v-icon left>mdi-label</v-icon>
            {{ alertModel.alert_id }}
          </v-chip>
          <strong class="mx-4 headline">{{ alertModel.description }}</strong>
        </v-card-title>
        <v-card-text class="py-0">
          <v-chip-group active-class="primary--text" column>
            <v-chip
              v-for="(resouruce, idx) in getResourceList(alertResource)"
              :key="idx"
              link
              :to="{
                path: '/finding/finding/',
                query: { resource_name: resouruce, from_score: 0 },
              }"
              @click="handleClickFinding(resouruce)"
              risken-action-name="search-finding-by-resource-from-alert"
            >
              {{ resouruce }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>
      <!-- History -->
      <v-card>
        <v-card-title>
          <span class="mx-4 headline">
            {{ $t(`view.alert['AlertHistory']`) }}
          </span>
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
                  <v-btn
                    text
                    link
                    style="text-transform: none"
                    :to="{
                      path: '/finding/finding/',
                      query: { alert_id: item.alert_id, from_score: 0 },
                    }"
                    color="grey darken-3"
                    class="px-1 mx-0"
                    risken-action-name="search-finding-by-alert-id-from-alert"
                    >{{ $t(`action['See findings']`) }} ({{
                      item.finding_history.count
                    }})</v-btn
                  >
                </v-col>
                <v-col cols="2">
                  <v-chip dark :color="getHistoryTypeColor(item.history_type)">
                    {{ $t(`view.alert['` + item.history_type + `']`) }}
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
            <v-btn
              text
              outlined
              color="grey darken-1"
              @click="viewDialog = false"
            >
              {{ $t(`btn['CANCEL']`) }}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="pendDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">
            {{ $t(`message['Do you want to update PENDING this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar
              ><v-icon>mdi-identifier</v-icon></v-list-item-avatar
            >
            <v-list-item-content>
              <v-list-item-title
                v-text="alertModel.alert_id"
              ></v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Alert ID']`) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-file-find-outline</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                <v-chip
                  class="ma-1"
                  dark
                  :color="getSeverityColor(alertModel.severity)"
                  >{{ alertModel.severity }}</v-chip
                >
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Severity']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-image-text</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                v-text="alertModel.description"
              ></v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Description']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            outlined
            color="grey darken-1"
            @click="pendDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            outlined
            :loading="loading"
            @click="handlePendSubmit"
          >
            {{ $t(`btn['PEND']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>
<script>
import mixin from '@/mixin'
import alert from '@/mixin/api/alert'
import finding from '@/mixin/api/finding'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  name: 'AlertList',
  mixins: [mixin, alert, finding],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      alertModel: {},
      alertHistoryModel: [],
      alertResource: [],
      findingMaxCount: 5,
      table: {
        selected: [],
        search: '',
        activeOnly: true,
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_id'] },
        footer: {
          disableItemsPerPage: false,
          itemsPerPageOptions: [20, 50, 100],
          itemsPerPageText: 'Rows/Page',
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      viewDialog: false,
      pendDialog: false,
    }
  },
  computed: {
    headers() {
      return [
        {
          text: this.$i18n.t('item["Status"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          value: 'status',
        },
        {
          text: this.$i18n.t('item["ID"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          value: 'alert_id',
        },
        {
          text: this.$i18n.t('item["Severity"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          value: 'severity',
        },
        {
          text: this.$i18n.t('item["Description"]'),
          align: 'start',
          width: '40%',
          sortable: true,
          value: 'description',
        },
        {
          text: this.$i18n.t('item["Passed"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          value: 'created_at',
        },
        {
          text: this.$i18n.t('item["Updated"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          value: 'updated_at',
        },
        {
          text: this.$i18n.t('item["Action"]'),
          align: 'center',
          width: '10%',
          sortable: false,
          value: 'action',
        },
      ]
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
      const list = await this.listAlert(statusParam)
      this.table.items = list
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },

    // alert history list
    async getHistory() {
      this.alertHistoryModel = []
      const alertHistory = await this.listAlertHistory(this.alertModel.alert_id)
      alertHistory.forEach(async (history) => {
        const json = JSON.parse(history.finding_history)
        this.alertHistoryModel.push({
          alert_history_id: history.alert_history_id,
          history_type: history.history_type,
          alert_id: history.alert_id,
          description: history.description,
          severity: history.severity,
          finding_history: json,
          project_id: history.project_id,
          created_at: history.created_at,
          updated_at: history.updated_at,
        })
      })
    },

    // alert finding list
    async getRelAlertFinding() {
      this.clearFinding()
      let rel_alert_finding = await this.listRelAlertFinding(
        this.alertModel.alert_id
      )
      if (rel_alert_finding.length > this.findingMaxCount) {
        rel_alert_finding = rel_alert_finding.slice(0, this.findingMaxCount)
      }
      rel_alert_finding.forEach(async (finding) => {
        const f = await this.getFinding(finding.finding_id)
        this.alertResource.push(f.resource_name)
      })
    },
    clearFinding() {
      this.alertResource = []
      this.loading = false
    },
    getResourceList(array) {
      const resources = Array.from(new Set(array)) // dedupulicated
      let result = []
      if (resources.length > 10) {
        for (let i = 0; i < 10; i++) {
          result.push(resources[i])
        }
        result.push('...')
      } else {
        result = resources
      }
      return result
    },
    getActionList(item) {
      let list = [
        { text: 'View Item', icon: 'mdi-eye', click: this.handleViewItem },
      ]
      if (!item.status) return list
      if (this.getAlertStatusText(item.status) == 'ACTIVE') {
        list.push({
          text: 'Pending',
          icon: 'mdi-trash-can-outline',
          click: this.handlePendItem,
        })
      } else if (this.getAlertStatusText(item.status) == 'PENDING') {
        list.push({
          text: 'Activate',
          icon: 'mdi-check-circle-outline',
          click: this.handleActiveItem,
        })
      }
      return list
    },

    // Pending alert
    async putAlertStatus(status) {
      const param = {
        project_id: this.getCurrentProjectID(),
        alert: {
          project_id: this.getCurrentProjectID(),
          alert_id: this.alertModel.alert_id,
          alert_condition_id: this.alertModel.alert_condition_id,
          description: this.alertModel.description,
          severity: this.alertModel.severity,
          status: Number(this.getAlertStatus(status)),
        },
      }
      await this.putAlert(param).catch((err) => {
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
      this.getRelAlertFinding()
      this.getHistory()
      this.viewDialog = true
      this.loading = false
    },
    handlePendItem(item) {
      this.assignDataModel(item)
      this.pendDialog = true
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
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.finish(true)
    },
    async finishError(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyError(msg)
      this.finish(false)
    },
    async finish(reflesh) {
      this.loading = false
      this.viewDialog = false
      this.pendDialog = false
      if (reflesh) {
        this.getAlert()
      }
    },
  },
}
</script>
