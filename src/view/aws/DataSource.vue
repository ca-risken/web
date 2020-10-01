<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="white" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="orange">mdi-aws</v-icon>
              Data Source
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
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
                loading-text="読込中"
                no-data-text="データがありません。"
                class="elevation-1"
                item-key="aws_data_source_id"
                @click:row="handleViewItem"
              >
                <template v-slot:item.avator="{ item }">
                  <v-avatar tile class="ma-2">
                    <img :src="getAWSDataSourceIcon(item.data_source)" :alt="item.data_source" />
                  </v-avatar>
                </template>
                <template v-slot:item.status="{ item }">
                  <v-chip
                    v-if="item.aws_id"
                    color="green"
                    dark
                  >Configured</v-chip>
                  <v-chip
                    v-else
                    color="grey"
                    dark
                  >Not configured</v-chip>
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

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <v-icon large color="orange darken-1">mdi-aws</v-icon>
          <span class="mx-4 headline">AWS</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="awsForm.valid" ref="form">
            <v-text-field
              v-model="awsModel.aws_id"
              :label="awsForm.aws_id.label"
              :placeholder="awsForm.aws_id.placeholder"
              outlined filled disabled
            ></v-text-field>
            <v-text-field
              v-model="awsModel.aws_data_source_id"
              :label="awsForm.aws_data_source_id.label"
              :placeholder="awsForm.aws_data_source_id.placeholder"
              outlined filled disabled
            ></v-text-field>
            <v-text-field
              v-model="awsModel.data_source"
              :label="awsForm.data_source.label"
              :placeholder="awsForm.data_source.placeholder"
              outlined filled disabled
            ></v-text-field>
            <v-text-field
              v-model="awsModel.max_score"
              :label="awsForm.max_score.label"
              :placeholder="awsForm.max_score.placeholder"
              outlined filled disabled
            ></v-text-field>   
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
                v-if="!awsForm.readOnly"
                :loading="loading" 
                @click="handleAttachSubmit">
                Attach
              </v-btn>
            </v-card-actions>
          </v-form>
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
              <v-list-item-subtitle>Data Souce </v-list-item-subtitle>
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
      awsForm: {
        readOnly: false,
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
            v => v.length <= 255 || 'Assume Role must be less than 255 characters',
        ]},
        external_id: { label: 'External ID', placeholder: '-', validator: [
            v => v.length <= 255 || 'External ID must be less than 255 characters',
        ]},
      },
      awsModel: { aws_id:'', aws_data_source_id:'', data_source:'', max_score:'', assume_role_arn:'', external_id:'' },
      table: {
        selected: [],
        search: '',
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'Data Source', align: 'start', sortable: false, value: 'data_source' },
          { text: 'MAX Score', align: 'center', sortable: false, value: 'max_score' },
          { text: 'status', align: 'center', width: '12%', sortable: false, value: 'status' },
          { text: 'AWS ID',  align: 'start', sortable: false, value: 'aws_id' },
          { text: 'Assume Role', align: 'start', sortable: false, value: 'assume_role_arn' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['aws_id'] },
        actions: [
          { text: 'View DataSource',  icon: 'mdi-eye', click: this.handleViewItem },
          { text: 'Attach DataSource',  icon: 'mdi-pencil', click: this.handleAttachItem },
          { text: 'Detach DataSource', icon: 'mdi-trash-can-outline', click: this.handleDetachItem },
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
  mounted() {
    this.refleshList(this.$route.query.aws_id)
  },
  methods: {
    async refleshList(awsID) {
      const res = await this.$axios.get(
        '/aws/list-datasource/?project_id=' + this.$store.state.project.project_id + '&aws_id=' + awsID
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.data_source ) {
        this.clearList()
        return false
      }
      this.table.total = list.data.data_source.length
      this.table.items = list.data.data_source
      this.loading = false
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
          return '/static/aws/iam.svg'
        case 'aws:iam-admin':
          return '/static/aws/iam.svg'
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
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Detach AWS Data Source.')
    },
    async attachDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        attach_data_source: {
          aws_id: this.awsModel.aws_id,
          aws_data_source_id: this.awsModel.aws_data_source_id,
          project_id: this.$store.state.project.project_id,
          assume_role_arn: this.awsModel.assume_role_arn,
          external_id: this.awsModel.external_id,
        },
      }
      await this.$axios.post('/aws/attach-datasource/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Attach AWS Data Source.')
    },
    async scanDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        aws_id: this.awsModel.aws_id,
        aws_data_source_id: this.awsModel.aws_data_source_id,
      }
      await this.$axios.post('/aws/invoke-scan/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Invoke scan for Data Source.')
    },

    // handler method
    handleViewItem(item) {
      this.assignDataModel(item)
      this.awsForm.readOnly = true
      this.editDialog  = true
    },
    handleAttachItem(item) {
      this.assignDataModel(item)
      this.awsForm.readOnly = false
      this.editDialog  = true
    },
    handleAttachSubmit() {
      if ( !this.$refs.form.validate() ) {
        return
      }
      this.loading = true
      this.attachDataSource()
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
    handleScan() {
      this.loading = true
      this.scanDataSource()
    },
    assignDataModel(item) {
      this.awsModel = { aws_id: Number(this.$route.query.aws_id), aws_data_source_id:'', data_source:'', max_score:'', assume_role_arn:'', external_id:'' }
      this.awsModel = Object.assign(this.awsModel, item)
    },
    async finish(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.editDialog  = false
      this.deleteDialog  = false
      this.refleshList(this.$route.query.aws_id)
    },
  }
}
</script>
