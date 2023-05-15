<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="red-lighten-2"
                >mdi-alert</v-icon
              >
              {{ $t(`submenu['Alert']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense align-content="center">
        <v-col cols="6">
          <v-text-field
            variant="outlined"
            clearable
            density="compact"
            bg-color="white"
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
            density="compact"
            v-model="table.activeOnly"
            :label="$t(`view.alert['Active Only']`)"
            @update:modelValue="handleRefleshList"
          ></v-checkbox>
        </v-col>
        <v-spacer />
        <v-btn
          size="large"
          density="compact"
          variant="outlined"
          color="primary-darken-3"
          class="mr-4"
          :loading="loading"
          @click="handleCondition"
          icon="mdi-cog"
        />
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
                :loading="loading"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :items-per-page-text="table.footer.itemsPerPageText"
                :showCurrentPage="table.footer.showCurrentPage"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="alert_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.severity`]="{ item }">
                  <v-chip
                    class="ma-1"
                    variant="flat"
                    :color="getSeverityColor(item.value.severity)"
                    >{{ item.value.severity }}</v-chip
                  >
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-icon
                    v-if="getAlertStatusText(item.value.status) == 'ACTIVE'"
                    color="success"
                    >mdi-check-circle</v-icon
                  >
                  <v-icon
                    v-else-if="
                      getAlertStatusText(item.value.status) == 'PENDING'
                    "
                    color="yellow"
                    >mdi-check-circle</v-icon
                  >
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:[`item.created_at`]="{ item }">
                  <v-chip
                    variant="flat"
                    label
                    class="text-white"
                    color="grey-lighten-1"
                    >{{ elapsedTimeText(item.value.created_at) }}</v-chip
                  >
                </template>
                <template v-slot:[`item.updated_at`]="{ item }">
                  <v-chip>{{ formatTime(item.value.updated_at) }}</v-chip>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-dots-vertical"></v-icon>
                    </template>
                    <v-list class="pa-0" dense>
                      <v-list-item
                        v-for="action in getActionList(item)"
                        :key="action.text"
                        @click="action.click(item)"
                        :prepend-icon="action.icon"
                      >
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
          <span class="mx-4 text-h5">{{
            $t(`view.alert['Alert Findings']`)
          }}</span>
          <v-chip
            variant="flat"
            class="text-white"
            label
            color="primary-darken-3"
          >
            <v-icon left>mdi-label</v-icon>
            {{ alertModel.alert_id }}
          </v-chip>
          <strong class="mx-4 text-h5">{{ alertModel.description }}</strong>
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
          <span class="mx-4 text-h5">
            {{ $t(`view.alert['AlertHistory']`) }}
          </span>
        </v-card-title>
        <v-card-text class="py-0">
          <v-timeline side="end">
            <v-timeline-item
              v-for="item in alertHistoryModel"
              icon="mdi-alert"
              :key="item.alert_history_id"
              :dot-color="getSeverityColor(item.severity)"
              size="large"
              fill-dot
              width="800"
              hide-opposite
            >
              <div class="d-flex justify-space-between">
                <v-row class="pt-1">
                  <v-col cols="3">
                    <v-chip>{{ formatTime(item.created_at) }}</v-chip>
                  </v-col>
                  <v-col cols="3">
                    <div class="caption">{{ item.alert_history_id }}</div>
                    <strong>{{ item.description }}</strong>
                  </v-col>
                  <v-col cols="3">
                    <div class="caption">findings</div>
                    <v-btn
                      variant="text"
                      link
                      style="text-transform: none"
                      :to="{
                        path: '/finding/finding/',
                        query: { alert_id: item.alert_id, from_score: 0 },
                      }"
                      color="grey-darken-3"
                      class="px-1 mx-0"
                      risken-action-name="search-finding-by-alert-id-from-alert"
                      >{{ $t(`action['See findings']`) }} ({{
                        item.finding_history.count
                      }})</v-btn
                    >
                  </v-col>
                  <v-col cols="2">
                    <v-chip
                      variant="flat"
                      :color="getHistoryTypeColor(item.history_type)"
                    >
                      {{ $t(`view.alert['` + item.history_type + `']`) }}
                    </v-chip>
                  </v-col>
                </v-row>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
        <v-card-text>
          <v-divider class="mt-3 mb-3"></v-divider>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="outlined"
              color="grey-darken-1"
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
        <v-card-title class="text-h5">
          <span class="mx-4">
            {{ $t(`message['Do you want to update PENDING this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item :prepend-icon="mdi - identifier">
            <v-list-item-title>
              {{ alertModel.alert_id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['Alert ID']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-file-find-outline">
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
          </v-list-item>
          <v-list-item prepend-icon="mdi-image-text">
            <v-list-item-title>
              {{ alertModel.description }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Description']`)
            }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="pendDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red-darken-1"
            variant="outlined"
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
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'AlertList',
  mixins: [mixin, alert, finding],
  components: {
    BottomSnackBar,
    VDataTable,
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
          itemsPerPageOptions: [ {value: 20, title: '20'},{value: 50, title: '50'},{value: 100, title: '100'}],
          itemsPerPageText: 'Rows/Page',
          showCurrentPage: true,
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
          title: this.$i18n.t('item["Status"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          key: 'status',
        },
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          key: 'alert_id',
        },
        {
          title: this.$i18n.t('item["Severity"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          key: 'severity',
        },
        {
          title: this.$i18n.t('item["Description"]'),
          align: 'start',
          width: '40%',
          sortable: true,
          key: 'description',
        },
        {
          title: this.$i18n.t('item["Passed"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          key: 'created_at',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          key: 'updated_at',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          width: '10%',
          sortable: false,
          key: 'action',
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
      if (!item.value.status) return list
      if (this.getAlertStatusText(item.value.status) == 'ACTIVE') {
        list.push({
          text: 'Pending',
          icon: 'mdi-trash-can-outline',
          click: this.handlePendItem,
        })
      } else if (this.getAlertStatusText(item.value.status) == 'PENDING') {
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
    handleRowClick(event, alerts) {
      this.loading = true
      this.assignDataModel(alerts.item)
      this.getRelAlertFinding()
      this.getHistory()
      this.viewDialog = true
      this.loading = false
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
      this.alertModel = Object.assign(this.alertModel, item.value)
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
