<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue">mdi-bug-check-outline</v-icon>
              WPScan
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
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

          <v-spacer />
          <v-btn class="mt-3 mr-4" color="grey darken-2" dense small icon fab outlined
            :loading="loading"
            @click="handleList"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn class="mt-3 mr-4" color="primary darken-3" fab dense small @click="handleNewItem">
            <v-icon>mdi-new-box</v-icon>
          </v-btn>
        </v-row>
      </v-form>
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
                item-key="diagnosis_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-3">
                    <v-icon color="blue darken-1" large>mdi-wordpress</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    v-if="item.status"
                    :color="getDataSourceStatusColor(item.status)"
                    dark
                  >{{ getDataSourceStatusText(item.status) }}</v-chip>
                  <v-chip
                    v-else
                    color="grey"
                    dark
                  >Not configured</v-chip>
                </template>
                <template v-slot:[`item.scan_at`]="{ item }">
                  <v-chip v-if="item.scan_at">{{ item.scan_at | formatTime }}</v-chip>
                  <v-chip v-else>Not yet scan...</v-chip>
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

    <v-dialog v-model="editDialog" max-width="60%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue">mdi-wpscan</v-icon>
          <span class="mx-4 headline">WPScan</span>
        </v-card-title>
        <v-container fluid>
          <v-row dense>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>Diagnosis DataSouce ID</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ diagnosisModel.diagnosis_data_source_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>DataSource</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ diagnosisModel.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>Description</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ diagnosisModel.description }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="2">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>MAX Score</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip outlined>
                      {{ diagnosisModel.max_score }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="3" v-if="wpscanModel.wpscan_setting_id">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>WPScan Setting ID</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ wpscanModel.wpscan_setting_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="wpscanModel.status">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    <v-list-item-subtitle>Status</v-list-item-subtitle>
                    <v-chip dark :color="getDataSourceStatusColor(wpscanModel.status)">
                      {{ getDataSourceStatusText(wpscanModel.status) }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="wpscanModel.scan_at">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>Scan At</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip color="grey lighten-3">
                      {{ wpscanModel.scan_at | formatTime }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" v-if="wpscanModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">Status Detail</span>
                </v-card-title>
                <v-card-text>
                  {{ wpscanModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-text>
          <v-form v-model="wpscanForm.valid" ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="wpscanModel.target_url"
                  :counter="255"
                  :rules="wpscanForm.target_url.validator"
                  :label="wpscanForm.target_url.label"
                  :placeholder="wpscanForm.target_url.placeholder"
                  :disabled="wpscanForm.readOnly"
                  :filled="wpscanForm.readOnly"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-btn 
                text outlined color="blue darken-1" 
                v-if="wpscanForm.readOnly"
                :loading="loading" 
                @click="handleScan"
              >
                SCAN
              </v-btn>
              <v-spacer />
              <v-btn text outlined color="grey darken-1" @click="editDialog = false">
                CANCEL
              </v-btn>
              <v-btn
                text outlined color="green darken-1" 
                v-if="!wpscanForm.readOnly"
                :loading="loading" 
                @click="handleEditSubmit">
                EDIT
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">Do you really want to delete this?</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="diagnosisModel.wpscan_setting_id"></v-list-item-title>
              <v-list-item-subtitle>WPScan Setting ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="diagnosisModel.name"></v-list-item-title>
              <v-list-item-subtitle>Name</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined color="grey darken-1" @click="deleteDialog = false">
            CANCEL
          </v-btn>
          <v-btn
            color="red darken-1"
            text outlined
            :loading="loading"
            @click="handleDeleteSubmit"
          >
            DELETE
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
      wpscanForm: {
        readOnly: false,
        valid: false,
        target_url: { label: 'Target URL', placeholder: '-', validator:[
            v => !v || v.length <= 200 || 'WPScan Key must be less than 200 characters',
          ]
        },
      },
      diagnosisModel: { diagnosis_data_source_id:'', name:'', description:'', max_score:'', updated_at:'' },
      wpscanModel: {
        wpscan_setting_id: '',
        diagnosis_data_source_id:'',
        target_url:'',
        status:'',
        status_detail:'',
        scan_at:'',
        updated_at:'',
      },
      table: {
        selected: [],
        search: '',
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: true, value: 'wpscan_setting_id' },
          { text: 'TARGET URL', align: 'start', sortable: true, value: 'target_url' },
          { text: 'Status', align: 'start', sortable: true, value: 'status' },
          { text: 'Scaned', align: 'start', sortable: true, value: 'scan_at' },
          { text: 'Updated', align: 'center', sortable: true, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 5, sortBy: ['diagnosis_data_source_id'] },
        actions: [
          { text: 'View Item',  icon: 'mdi-eye', click: this.handleViewItem },
          { text: 'Edit Item',  icon: 'mdi-pencil', click: this.handleEditItem },
          { text: 'Delete Item', icon: 'mdi-trash-can-outline', click: this.handleDeleteItem },
          { text: 'Scan', icon: 'mdi-magnify-scan', click: this.handleScan },
        ],
        footer: {
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
      deleteDialog: false,
      editDialog: false,
    }
  },
  filters: {
    formatTime: (unix) => {
      return Util.formatDate(new Date(unix * 1000), 'yyyy/MM/dd HH:mm')
    },
  },
  async mounted() {
    this.loading = true
    await this.getWPScan()
    await this.listWPScanSetting()
  },
  methods: {
    async getWPScan() {
      const res = await this.$axios.get(
        '/diagnosis/get-datasource/'
          + '?diagnosis_data_source_id=' + this.wpscan_datasource_id 
          + '&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.diagnosis_data_source ) {
        this.clearList()
        return false
      }
      this.diagnosisModel = res.data .data.diagnosis_data_source
      this.loading = false
    },
    async listWPScanSetting() {
      const res = await this.$axios.get(
        '/diagnosis/list-wpscan-setting/'
          + '?diagnosis_data_source_id=' + this.diagnosisModel.diagnosis_data_source_id
          + '&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.wpscan_setting ) {
        this.clearList()
        return false
      }
      this.table.items = res.data.data.wpscan_setting
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem() {
      const param = {
          project_id: this.$store.state.project.project_id,
          wpscan_setting_id: this.wpscanModel.wpscan_setting_id,
      }
      await this.$axios.post('/diagnosis/delete-wpscan-setting/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Delete.')
    },
    async putItem() {
      let scan_at = 0
      if (this.wpscanModel.scan_at > 0 ) {
        scan_at = this.wpscanModel.scan_at
      }
      const param = {
        project_id: this.$store.state.project.project_id,
        wpscan_setting: {
          project_id: this.$store.state.project.project_id,
          wpscan_setting_id: this.wpscanModel.wpscan_setting_id,
          diagnosis_data_source_id: this.diagnosisModel.diagnosis_data_source_id,
          target_url: this.wpscanModel.target_url,
          status: 2, // CONFIGURED
          status_detail: 'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      await this.$axios.post('/diagnosis/put-wpscan-setting/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Put WPScan.')
    },
    async scanDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        setting_id: this.wpscanModel.wpscan_setting_id,
        diagnosis_data_source_id: this.wpscanModel.diagnosis_data_source_id,
}
      await this.$axios.post('/diagnosis/invoke-scan/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Invoke scan for Data Source.')
    },

    // Handler
    async handleList() {
      this.loading = true
      await this.listWPScanSetting()
      this.finishInfo('Reflesh list')
    },
    handleRowClick(item) {
      this.handleViewItem(item)
    },
    handleViewItem(item) {
      this.assignDataModel(item)
      this.wpscanForm.readOnly = true
      this.editDialog  = true
    },
    handleNewItem() {
      this.handleEditItem()
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.wpscanForm.readOnly = false
      this.editDialog  = true
    },
    handleEditSubmit() {
      if ( !this.$refs.form.validate() ) {
        return
      }
      this.loading = true
      this.putItem()
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog  = true
    },
    handleDeleteSubmit() {
      this.loading = true
      this.deleteItem()
    },
    handleScan(item) {
      this.loading = true
      if (item && item.wpscan_setting_id) {
        this.assignDataModel(item)
      }
      this.scanDataSource()
    },

    assignDataModel(item) {
      this.wpscanModel = {}
      this.wpscanModel = Object.assign(this.wpscanModel, item)
    },

    async finishInfo(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifyInfo(msg)
      this.finish(true)
    },
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
      this.editDialog  = false
      this.deleteDialog  = false
      if ( reflesh ) {
        this.listWPScanSetting()
      }
    },
  }
}
</script>
