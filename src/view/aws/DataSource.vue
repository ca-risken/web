<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="orange">mdi-aws</v-icon>
              Data Source
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="6" md="6">
          <v-select
            v-model="awsModel"
            background-color="white"
            :items="awsList"
            item-text="name"
            item-value="aws_id"
            label="Select your AWS"
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
        <v-btn
          class="mt-3 mr-4" dense medium dark
          :loading="loading"
          color="light-blue darken-2"
          @click="handleSetupAll"
        >
          Setup all
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
                item-key="aws_data_source_id"
                @click:row="handleViewItem"
              >
                <template v-slot:[`item.avator`]="{ item }">
                  <v-avatar tile class="ma-3" size="76%">
                    <img :src="getAWSDataSourceIcon(item.data_source)" :alt="item.data_source" />
                  </v-avatar>
                </template>
                <template v-slot:[`item.max_score`]="{ item }">
                  <v-chip outlined>{{ item.max_score }}</v-chip>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    v-if="item.aws_id"
                    :color="getDataSourceStatusColor(item.status)"
                    dark
                  >
                    <v-progress-circular
                      v-if="isInProgressDataSourceStatus(item.status)"
                      indeterminate
                      size="20"
                      width="2"
                      color="white"
                      class="mr-2"
                    ></v-progress-circular>
                    {{ getDataSourceStatusText(item.status) }}
                  </v-chip>
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
          <v-icon large color="orange darken-1">mdi-aws</v-icon>
          <span class="mx-4 headline">AWS</span>
        </v-card-title>
        <v-container fluid>
          <v-row dense>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>{{ awsForm.aws_id.label }}</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ awsModel.aws_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="!awsForm.setupAll">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>{{ awsForm.aws_data_source_id.label }}</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ awsModel.aws_data_source_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="6" v-if="!awsForm.setupAll">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>{{ awsForm.data_source.label }}</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ awsModel.data_source }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense v-if="!awsForm.setupAll">
            <v-col cols="3" v-if="awsModel.status">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    <v-list-item-subtitle>{{ awsForm.status.label }}</v-list-item-subtitle>
                    <v-chip dark :color="getDataSourceStatusColor(awsModel.status)">
                      {{ getDataSourceStatusText(awsModel.status) }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="awsModel.scan_at">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>{{ awsForm.scan_at.label }}</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip color="grey lighten-3">
                      {{ awsModel.scan_at | formatTime }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>{{ awsForm.max_score.label }}</v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip outlined>
                      {{ awsModel.max_score }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" v-if="awsModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">{{ awsForm.status_detail.label}}</span>
                </v-card-title>
                <v-card-text>
                  {{ awsModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-text>
          <v-form v-model="awsForm.valid" ref="form">
            <v-text-field
              v-model="awsModel.assume_role_arn"
              :counter="255"
              :rules="awsForm.assume_role_arn.validator"
              :label="awsForm.assume_role_arn.label"
              :placeholder="awsForm.assume_role_arn.placeholder"
              :disabled="awsForm.readOnly"
              :filled="awsForm.readOnly"
            ></v-text-field> 
            <v-text-field
              v-model="awsModel.external_id"
              :counter="255"
              :rules="awsForm.external_id.validator"
              :label="awsForm.external_id.label"
              :placeholder="awsForm.external_id.placeholder"
              :disabled="awsForm.readOnly"
              :filled="awsForm.readOnly"
            ></v-text-field>
            <v-checkbox
              v-if="awsForm.setupAll"
              v-model="awsModel.overrideDataSource"
              label="Override the already attaced datasources"
            ></v-checkbox> 

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-btn 
                text outlined color="blue darken-1" 
                v-if="awsForm.readOnly"
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
                v-if="!awsForm.readOnly && !awsForm.setupAll"
                :loading="loading" 
                @click="handleAttachSubmit">
                Attach
              </v-btn>
              <v-btn
                text outlined color="green darken-1" 
                v-if="awsForm.setupAll"
                :loading="loading" 
                @click="handleAttachAll">
                Attach All
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">Do you really want to detach this?</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="awsModel.aws_id"></v-list-item-title>
              <v-list-item-subtitle>AWS ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="awsModel.name"></v-list-item-title>
              <v-list-item-subtitle>AWS Name</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-aws</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="awsModel.data_source"></v-list-item-title>
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
      awsList: [],
      awsForm: {
        readOnly: false,
        setupAll: false,
        valid: false,
        aws_data_source_id: { label: 'Data Source ID', placeholder: '-', validator: []},
        data_source: { label: 'Data Source', placeholder: '-', validator: []},
        max_score: { label: 'MAX Score', placeholder: '-', validator: [] },
        aws_id: { label: 'AWS ID', placeholder: '-', validator: [
          v => !!v || 'AWS ID is required',
          v => /^\d+$/.test(v) || 'AWS ID must be number',
        ]},
        assume_role_arn: { label: 'Assume Role', placeholder: '-', validator: [
            v => !!v || 'Assume Role is required',
            v => !v || v.length <= 255 || 'Assume Role must be less than 255 characters',
        ]},
        external_id: { label: 'External ID', placeholder: '-', validator: [
            v => !v || v.length <= 255 || 'External ID must be less than 255 characters',
        ]},
        status: { label: 'Status', placeholder: '-', validator: [] },
        status_detail: { label: 'Status Detail', placeholder: '-', validator: [] },
        scan_at: { label: 'Scaned', placeholder: '-', validator: [] },
      },
      awsModel: { aws_id:'', aws_data_source_id:'', data_source:'', max_score:'', assume_role_arn:'', external_id:'', status: 0, status_detail:'', scan_at: 0},
      table: {
        selected: [],
        search: '',
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'Data Source', align: 'start', sortable: false, value: 'data_source' },
          { text: 'MAX Score', align: 'center', sortable: false, value: 'max_score' },
          { text: 'status', align: 'start', width: '12%', sortable: false, value: 'status' },
          { text: 'AWS ID',  align: 'start', sortable: false, value: 'aws_id' },
          { text: 'Assume Role', align: 'start', sortable: false, value: 'assume_role_arn' },
          { text: 'ScanAt', align: 'center', sortable: false, value: 'scan_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['aws_id'] },
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
  created () {
    this.$setInterval( async () => {
      await this.refleshList()
    }, 3000)
  },
  async mounted() {
    this.loading = true
    await this.listAWS()
    if (this.awsList.length < 1) {
      this.loading = false
      return false
    }
    this.awsModel = this.awsList[0]
    this.awsList.forEach( async aws => {
      if ( aws.aws_id ==  Number(this.$route.query.aws_id)) {
        this.awsModel =  aws
        return
      }
    })
    this.refleshList()
    this.loading = false
  },
  methods: {
    async listAWS() {
      const res = await this.$axios.get('/aws/list-aws/?project_id=' + this.$store.state.project.project_id ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.aws ) {
        return false
      }
      this.awsList = res.data.data.aws
      this.loading = false
    },
    async refleshList() {
      if ( !this.awsModel.aws_id ) {
        this.clearList()
        return
      }
      const res = await this.$axios.get(
        '/aws/list-datasource/?project_id=' + this.$store.state.project.project_id + '&aws_id=' + this.awsModel.aws_id
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      if ( !res.data.data.data_source ) {
        this.clearList()
        return false
      }
      this.table.total = res.data.data.data_source.length
      this.table.items = res.data.data.data_source
    },
    clearList() {
      this.table.total = 0
      this.table.items = []
      this.loading = false
    },
    getAWSDataSourceIcon(dataSource) {
      switch (dataSource) {
        case 'aws:guard-duty':
          return '/static/aws/guard-duty.png'
        case 'aws:access-analyzer':
          return '/static/aws/s3.webp'
        case 'aws:prowler':
          return '/static/aws/prowler.png'
        case 'aws:iam-activity':
          return '/static/aws/iam.png'
        case 'aws:admin-checker':
          return '/static/aws/iam.png'
        case 'aws:cloudsploit':
          return '/static/aws/cloudsploit.png'
        default:
          return '/static/aws/default.png'
      }
    },
    async detachDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        aws_id: this.awsModel.aws_id,
        aws_data_source_id: this.awsModel.aws_data_source_id
      }
      await this.$axios.post('/aws/detach-datasource/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Detach AWS Data Source.')
    },
    async attachDataSource() {
      await this.execAttachDataSource()
      this.finishSuccess('Success: Attach AWS Data Source.')
    },
    async attachAllDataSource() {
      this.table.items.forEach( async ds => {
        if ( this.awsModel.overrideDataSource || ds.assume_role_arn == undefined || ds.assume_role_arn == "" ) {
          this.awsModel.aws_data_source_id = ds.aws_data_source_id
          await this.execAttachDataSource()
        }
      })
      this.finishSuccess('Success: Attach all AWS Data Source.')
    },
    async execAttachDataSource() {
      let scan_at = 0
      if (this.awsModel.scan_at > 0 ) {
        scan_at = this.awsModel.scan_at
      }
      const param = {
        project_id: this.$store.state.project.project_id,
        attach_data_source: {
          aws_id: this.awsModel.aws_id,
          aws_data_source_id: this.awsModel.aws_data_source_id,
          project_id: this.$store.state.project.project_id,
          assume_role_arn: this.awsModel.assume_role_arn,
          external_id: this.awsModel.external_id,
          status: 2, // CONFIGURED
          status_detail: 'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      await this.$axios.post('/aws/attach-datasource/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
    },
    async scanDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        aws_id: this.awsModel.aws_id,
        aws_data_source_id: this.awsModel.aws_data_source_id,
      }
      await this.$axios.post('/aws/invoke-scan/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Invoke scan for Data Source.')
    },

    // handler method
    async handleList() {
      this.loading = true
      await this.refleshList()
      this.finishInfo('Reflesh list')
    },
    handleSetupAll() {
      this.awsModel = {aws_id: this.awsModel.aws_id}
      this.awsForm.readOnly = false
      this.awsForm.setupAll = true
      this.editDialog  = true
    },
    handleViewItem(item) {
      this.assignDataModel(item)
      this.awsForm.readOnly = true
      this.awsForm.setupAll = false
      this.editDialog  = true
    },
    handleAttachItem(item) {
      this.assignDataModel(item)
      this.awsForm.readOnly = false
      this.awsForm.setupAll = false
      this.editDialog  = true
    },
    handleAttachSubmit() {
      if ( !this.$refs.form.validate() ) {
        return
      }
      this.loading = true
      this.attachDataSource()
    },
    handleAttachAll() {
      if ( !this.$refs.form.validate() ) {
        return
      }
      this.loading = true
      this.attachAllDataSource()
    },
    handleDetachItem(item) {
      this.assignDataModel(item)
      this.deleteDialog  = true
    },
    handleDetachSubmit() {
      if (!this.awsModel.aws_id) {
        this.$refs.snackbar.notifyError('Error: Not configred.')
        this.deleteDialog  = false
        return
      }
      this.loading = true
      this.detachDataSource()
    },
    handleScan(item) {
      this.loading = true
      if (item.aws_data_source_id) {
        this.assignDataModel(item)
      }
      this.scanDataSource()
    },
    assignDataModel(item) {
      this.awsModel = { aws_id: this.awsModel.aws_id, aws_data_source_id:'', data_source:'', max_score:'', assume_role_arn:'', external_id:'' }
      this.awsModel = Object.assign(this.awsModel, item)
    },
    async finishInfo(msg) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyInfo(msg)
      this.finish(true)
    },
    async finishSuccess(msg) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.finish(true)
    },
    async finishError(msg) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyError(msg)
      this.finish(false)
    },
    async finish(reflesh) {
      this.loading = false
      this.editDialog  = false
      this.deleteDialog  = false
      if ( reflesh ) {
        this.refleshList()
      }
    },
  }
}
</script>
