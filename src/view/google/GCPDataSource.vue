<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue darken-1">mdi-google-cloud</v-icon>
              GCP Data Source
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="6" md="6">
          <v-select
            v-model="gcpModel"
            background-color="white"
            :items="gcpList"
            item-text="name"
            item-value="gcp_id"
            label="Select your GCP"
            @change="handleList"
            return-object
            outlined
            dense
          ></v-select>
        </v-col>
        <v-spacer />
        <v-btn class="mt-3 mr-4" color="grey darken-2" dense small icon fab outlined
          :loading="loading"
          @click="handleList"
        >
          <v-icon>mdi-refresh</v-icon>
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
                :server-items-length="table.total"
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="google_data_source_id"
                @click:row="handleViewItem"
              >
                <template v-slot:[`item.avator`]="{ item }">
                  <v-avatar tile class="ma-3" size="74%">
                    <img :src="getGCPDataSourceIcon(item.name)" :alt="item.name" />
                  </v-avatar>
                </template>
                <template v-slot:[`item.max_score`]="{ item }">
                  <v-chip outlined>{{ item.max_score }}</v-chip>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    v-if="item.gcp_id"
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

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <v-icon large color="blue darken-1">mdi-google-cloud</v-icon>
          <span class="mx-4 headline">GCP</span>
        </v-card-title>
        <v-container fluid>
          <v-row dense>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>{{ gcpForm.gcp_id.label }}</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ gcpModel.gcp_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>{{ gcpForm.google_data_source_id.label }}</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ gcpModel.google_data_source_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>{{ gcpForm.name.label }}</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ gcpModel.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="3" v-if="gcpModel.status">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    <v-list-item-subtitle>{{ gcpForm.status.label }}</v-list-item-subtitle>
                    <v-chip dark :color="getDataSourceStatusColor(gcpModel.status)">
                      {{ getDataSourceStatusText(gcpModel.status) }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="gcpModel.scan_at">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>{{ gcpForm.scan_at.label }}</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip color="grey lighten-3">
                      {{ gcpModel.scan_at | formatTime }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>{{ gcpForm.max_score.label }}</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip outlined>
                      {{ gcpModel.max_score }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" v-if="gcpModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">{{ gcpForm.status_detail.label}}</span>
                </v-card-title>
                <v-card-text>
                  {{ gcpModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-text>
          <v-divider class="mt-3 mb-3"></v-divider>
          <v-card-actions>
            <v-btn 
              text outlined color="blue darken-1" 
              v-if="gcpForm.readOnly"
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
              v-if="!gcpForm.readOnly"
              :loading="loading" 
              @click="handleAttachSubmit">
              Attach
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">連携解除しますか?</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="gcpModel.gcp_id"></v-list-item-title>
              <v-list-item-subtitle>GCP ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="gcpModel.name"></v-list-item-title>
              <v-list-item-subtitle>GCP Name</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-google-cloud</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="gcpModel.name"></v-list-item-title>
              <v-list-item-subtitle>Data Source</v-list-item-subtitle>
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
            @click="handleDetachSubmit"
          >
            Detach
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
      gcpList: [],
      googleDataSourceList: [],
      gcpForm: {
        readOnly: false,
        valid: false,
        google_data_source_id: { label: 'Google Data Source ID', placeholder: '-', validator: []},
        name: { label: 'Data Source', placeholder: '-', validator: []},
        max_score: { label: 'MAX Score', placeholder: '-', validator: [] },
        gcp_id: { label: 'GCP ID', placeholder: '-', validator: []},
        status: { label: 'Status', placeholder: '-', validator: [] },
        status_detail: { label: 'Status Detail', placeholder: '-', validator: [] },
        scan_at: { label: 'Scaned', placeholder: '-', validator: [] },
      },
      gcpModel: { gcp_id:'', gcp_project_id:'',  google_data_source_id:'', name:'', max_score:'', status: 0, status_detail:'', scan_at: 0},
      table: {
        selected: [],
        search: '',
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID', align: 'start', sortable: false, value: 'google_data_source_id' },
          { text: 'Google Data Source', align: 'start', sortable: false, value: 'name' },
          { text: 'MAX Score', align: 'center', sortable: false, value: 'max_score' },
          { text: 'status', align: 'center', width: '12%', sortable: false, value: 'status' },
          { text: 'GCP ID',  align: 'start', sortable: false, value: 'gcp_id' },
          { text: 'GCP Project', align: 'start', sortable: false, value: 'gcp_project_id' },
          { text: 'ScanAt', align: 'center', sortable: false, value: 'scan_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['gcp_id'] },
        actions: [
          { text: 'View DataSource',  icon: 'mdi-eye', click: this.handleViewItem },
          { text: 'Attach DataSource',  icon: 'mdi-pencil', click: this.handleAttachItem },
          { text: 'Detach DataSource', icon: 'mdi-trash-can-outline', click: this.handleDetachItem },
          { text: 'Scan', icon: 'mdi-magnify-scan', click: this.handleScan },
        ],
        total: 0,
        footer: {
          disableItemsPerPage: true,
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
    await this.listGoogleDataSource()
    this.listGCP()
    if ( !this.$route.query.gcp_id ) {
      this.loading = false
      return false
    }
    this.gcpModel.gcp_id = Number(this.$route.query.gcp_id)
    this.refleshList()
    this.loading = false
  },
  methods: {
    async listGoogleDataSource() {
      const res = await this.$axios.get('/google/list-google-datasource/').catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.google_data_source ) {
        return false
      }
      this.googleDataSourceList = res.data.data.google_data_source
      this.loading = false
    },
    async listGCP() {
      const res = await this.$axios.get('/google/list-gcp/?project_id=' + this.$store.state.project.project_id ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.gcp ) {
        return false
      }
      this.gcpList = res.data.data.gcp
      this.loading = false
    },
    async refleshList() {
      this.table.items = []
      if ( !this.gcpModel.gcp_id ) {
        this.clearList()
        return
      }
      this.googleDataSourceList.forEach( async ds => {
        const res = await this.$axios.get(
          '/google/get-gcp-datasource/?project_id='+ this.$store.state.project.project_id +
            '&gcp_id=' + this.gcpModel.gcp_id +
            '&google_data_source_id=' + ds.google_data_source_id
        ).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        let item = {
          google_data_source_id: ds.google_data_source_id,
          name:ds.name,
          description: ds.description,
          max_score: ds.max_score,
          gcp_id: this.gcpModel.gcp_id,
          gcp_project_id: '',
          status: 0,
          status_detail:'',
          scan_at: 0,
        }
        if ( res.data.data.gcp_data_source ) {
          item.gcp_id = res.data.data.gcp_data_source.gcp_id
          item.gcp_project_id = res.data.data.gcp_data_source.gcp_project_id
          item.status = res.data.data.gcp_data_source.status
          item.status_detail = res.data.data.gcp_data_source.status_detail
          item.scan_at = res.data.data.gcp_data_source.scan_at
        }
        this.table.items.push(item)
      })
      this.table.total = this.googleDataSourceList.length
      this.loading = false
    },
    clearList() {
      this.table.total = 0
      this.table.items = []
      this.loading = false
    },
    getGCPDataSourceIcon(dataSource) {
      switch (dataSource) {
        case 'google:asset':
          return '/static/google/asset.png'
        case 'google:cloudsploit':
          return '/static/google/cloudsploit.png'
        default:
          return '/static/google/default.png'
      }
    },
    async detachDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        gcp_id: this.gcpModel.gcp_id,
        google_data_source_id: this.gcpModel.google_data_source_id
      }
      await this.$axios.post('/google/detach-gcp-datasource/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Detach GCP Data Source.')
    },
    async attachDataSource() {
      let scan_at = 0
      if (this.gcpModel.scan_at > 0 ) {
        scan_at = this.gcpModel.scan_at
      }
      const param = {
        project_id: this.$store.state.project.project_id,
        gcp_data_source: {
          gcp_id: this.gcpModel.gcp_id,
          google_data_source_id: this.gcpModel.google_data_source_id,
          project_id: this.$store.state.project.project_id,
          status: 2, // CONFIGURED
          status_detail: 'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      await this.$axios.post('/google/attach-gcp-datasource/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Attach GCP Data Source.')
    },
    async scanDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        gcp_id: this.gcpModel.gcp_id,
        google_data_source_id: this.gcpModel.google_data_source_id,
      }
      await this.$axios.post('/google/invoke-scan-gcp/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Invoke scan for GCP Data Source.')
    },

    // handler method
    handleList() {
      this.loading = true
      this.refleshList()
      this.finishInfo('Reflesh list')
    },
    handleViewItem(item) {
      this.assignDataModel(item)
      this.gcpForm.readOnly = true
      this.editDialog  = true
    },
    handleAttachItem(item) {
      this.assignDataModel(item)
      this.gcpForm.readOnly = false
      this.editDialog  = true
    },
    handleAttachSubmit() {
      this.loading = true
      this.attachDataSource()
    },
    handleDetachItem(item) {
      this.assignDataModel(item)
      this.deleteDialog  = true
    },
    handleDetachSubmit() {
      if (!this.gcpModel.gcp_id) {
        this.$refs.snackbar.notifyError('Error: Not configred.')
        this.deleteDialog  = false
        return
      }
      this.loading = true
      this.detachDataSource()
    },
    handleScan(item) {
      this.loading = true
      if (item.google_data_source_id) {
        this.assignDataModel(item)
      }
      this.scanDataSource()
    },
    assignDataModel(item) {
      this.gcpModel = { gcp_id: this.gcpModel.gcp_id, google_data_source_id:'', data_source:'', max_score:'' }
      this.gcpModel = Object.assign(this.gcpModel, item)
    },
    async finishInfo(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await this.finish(false)
      this.$refs.snackbar.notifyInfo(msg)
    },
    async finishSuccess(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await this.finish(true)
      this.$refs.snackbar.notifySuccess(msg)
    },
    async finishError(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await this.finish(false)
      this.$refs.snackbar.notifyError(msg)
    },
    async finish(reflesh) {
      this.loading = false
      this.editDialog  = false
      this.deleteDialog  = false
      if ( reflesh ) {
        await this.refleshList()
      }
    },
  }
}
</script>