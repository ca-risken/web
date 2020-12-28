<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue darken-1">mdi-google-cloud</v-icon>
              GCP Cloud Asset
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
                    <v-icon color="blue darken-a" large>mdi-google-cloud</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.type_text`]="{ item }">
                  <v-chip dark label outlined color="blue darken-2">{{ item.type_text }}</v-chip>
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

    <v-dialog v-model="editDialog" max-width="70%">
      <v-card>
        <v-card-title>
          <v-icon large color="black">mdi-google-cloud</v-icon>
          <span class="mx-4 headline">Cloud Asset</span>
        </v-card-title>
        <v-container fluid>
          <v-row dense>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>GCP ID</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ googleDataSourceModel.google_data_source_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>DataSource</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ googleDataSourceModel.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>Description</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ googleDataSourceModel.description }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="3" v-if="gcpModel.gcp_id">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>GCP ID</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ gcpModel.gcp_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="gcpModel.status">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    <v-list-item-subtitle>Status</v-list-item-subtitle>
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
                  <v-list-item-subtitle>Scan At</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip color="grey lighten-3">
                      {{ gcpModel.scan_at | formatTime }}
                    </v-chip>
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
                      {{ googleDataSourceModel.max_score }}
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
                  <span class="font-weight-light">Status Detail</span>
                </v-card-title>
                <v-card-text>
                  {{ gcpModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-text>
          <v-form v-model="gcpForm.valid" ref="form">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="gcpModel.name"
                  :counter="64"
                  :rules="gcpForm.name.validator"
                  :label="gcpForm.name.label"
                  :placeholder="gcpForm.name.placeholder"
                  :disabled="gcpForm.readOnly || !gcpForm.isNew"
                  :filled="gcpForm.readOnly || !gcpForm.isNew"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="gcpModel.gcp_project_id"
                  :counter="128"
                  :rules="gcpForm.gcp_project_id.validator"
                  :label="gcpForm.gcp_project_id.label"
                  :placeholder="gcpForm.gcp_project_id.placeholder"
                  :disabled="gcpForm.readOnly"
                  :filled="gcpForm.readOnly"
                ></v-text-field>
              </v-col>
            </v-row>
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
      gcpForm: {
        readOnly: false,
        isNew: false,
        valid: false,
        name: { label: 'Name *', placeholder: 'GCP setting name', validator:[
            v => !!v || 'Name is required',
            v => !v || v.length <= 64 || 'Name must be less than 64 characters',
          ]
        },
        gcp_project_id: { label: 'GCP Project ID *', placeholder: 'GCP project', validator:[
            v => !!v || 'GCP Project ID is required',
            v => !v || v.length <= 128 || 'Name must be less than 128 characters',
          ]
        },
      },
      googleDataSourceModel: { 
        google_data_source_id: '',
        name:'',
        description:'',
        max_score:'',
        updated_at:''
      },
      gcpModel: {
        gcp_id: '',
        google_data_source_id: '',
        name:'',
        gcp_organization_id: '',
        gcp_project_id: '',
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
          { text: 'ID',  align: 'start', sortable: true, value: 'gcp_id' },
          { text: 'Name', align: 'start', sortable: true, value: 'name' },
          { text: 'Project', align: 'start', sortable: true, value: 'gcp_project_id' },
          { text: 'Status', align: 'center', sortable: true, value: 'status' },
          { text: 'Updated', align: 'center', sortable: true, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 15, sortBy: ['gcp_id'] },
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
    await this.getGoogleDataSource()
    await this.listGCP()
  },
  methods: {
    async getGoogleDataSource() {
      const res = await this.$axios.get(
        '/google/list-google-datasource/'
          + '?google_data_source_id=' + this.cloud_asset_datasource_id
      ).catch((err) =>  {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.google_data_source ) {
        this.clearList()
        return false
      }
      this.googleDataSourceModel = res.data.data.google_data_source[0]
      this.loading = false
    },
    async listGCP() {
      this.table.items = []
      const res = await this.$axios.get(
        '/google/list-gcp/'
          + '?google_data_source_id=' + this.cloud_asset_datasource_id
          + '&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.gcp ) {
        this.clearList()
        return false
      }
      res.data.data.gcp.forEach( async g => {
        const item = {
          gcp_id:                g.gcp_id,
          google_data_source_id: g.google_data_source_id,
          name:                  g.name,
          gcp_organization_id:   g.gcp_organization_id,
          gcp_project_id:        g.gcp_project_id,
          status:                g.status,
          status_detail:         g.status_detail,
          scan_at:               g.scan_at,
          updated_at:            g.updated_at,
        }
        this.table.items.push(item)
      })

    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem() {
      const param = {
          project_id: this.$store.state.project.project_id,
          gcp_id: this.gcpModel.gcp_id,
      }
      await this.$axios.post('/google/delete-gcp/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Deleted.')
    },
    async putItem() {
      let scan_at = 0
      if (this.gcpModel.scan_at > 0 ) {
        scan_at = this.gcpModel.scan_at
      }
      const param = {
        project_id: this.$store.state.project.project_id,
        gcp: {
          gcp_id:                this.gcpModel.gcp_id,
          google_data_source_id: this.cloud_asset_datasource_id,
          name:                  this.gcpModel.name,
          project_id:            this.$store.state.project.project_id,
          gcp_organization_id:   this.gcpModel.gcp_organization_id,
          gcp_project_id:        this.gcpModel.gcp_project_id,
          status: 2, // CONFIGURED
          status_detail: 'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      await this.$axios.post('/google/put-gcp/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Updated.')
    },
    async scanDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        gcp_id: this.gcpModel.gcp_id,
      }
      await this.$axios.post('/google/invoke-scan-gcp/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Invoke scan for Data Source.')
    },

    // Handler
    async handleList() {
      this.loading = true
      await this.listGCP()
      this.finishInfo('Reflesh list')
    },
    handleRowClick(item) {
      this.handleViewItem(item)
    },
    handleViewItem(item) {
      this.assignDataModel(item)
      this.gcpForm.readOnly = true
      this.editDialog  = true
    },
    handleNewItem() {
      this.gcpModel = {}
      this.gcpForm.isNew = true
      this.gcpForm.readOnly = false
      this.editDialog  = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.gcpForm.isNew = false
      this.gcpForm.readOnly = false
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
      if (item && item.gcp_id) {
        this.assignDataModel(item)
      }
      this.scanDataSource()
    },

    assignDataModel(item) {
      this.gcpModel = {}
      this.gcpModel = Object.assign(this.gcpModel, item)
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
        this.listGCP()
      }
    },
  }
}
</script>
