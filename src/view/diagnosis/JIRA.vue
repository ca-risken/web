<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue">mdi-bug-check-outline</v-icon>
              {{ $t(`submenu['JIRA']`) }}
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
          <v-btn text outlined class="mt-1 mr-4" color="blue darken-1" @click="projectTagDialog = true">
              {{ $t(`btn['TAG']`) }}
          </v-btn>
          <project-tag
            :tagDialog="projectTagDialog"
            @projectTagCancel="projectTagDialog = false"
            @projectTagUpdated="handleProjectTagUpdated"
          />
          <v-btn class="mt-1 mr-4" color="grey darken-2" dense small icon fab outlined
            :loading="loading"
            @click="handleList"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn class="mt-1 mr-4" color="primary darken-3" fab dense small @click="handleNewItem">
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
                :headers="headers"
                :items="table.items"
                :options.sync="table.options"
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="diagnosis_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-3">
                    <v-icon color="blue darken-1" large>mdi-jira</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    v-if="item.status"
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
                    <v-icon
                      v-else
                      small               
                      color="white"
                      class="mr-2"
                    >{{ getDataSourceStatusIcon(item.status) }}</v-icon>
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
                        <v-list-item-title>{{ $t(`action['`+ action.text +`']`) }}</v-list-item-title>
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

    <v-dialog v-model="editDialog" max-width="64%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue">mdi-jira</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['JIRA']`) }}
          </span>
        </v-card-title>
        <v-container fluid>
          <v-row dense>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Data Source ID']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ diagnosisModel.diagnosis_data_source_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Name']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ diagnosisModel.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Description']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ diagnosisModel.description }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="2">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['MAX Score']`) }}
                  </v-list-item-subtitle>
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
            <v-col cols="3" v-if="jiraModel.jira_setting_id">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['JIRA Setting ID']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ jiraModel.jira_setting_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="jiraModel.status">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    <v-list-item-subtitle>
                      {{ $t(`item['Status']`) }}
                    </v-list-item-subtitle>
                    <v-chip dark :color="getDataSourceStatusColor(jiraModel.status)">
                      {{ getDataSourceStatusText(jiraModel.status) }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="jiraModel.scan_at">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['ScanAt']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip color="grey lighten-3">
                      {{ jiraModel.scan_at | formatTime }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" v-if="jiraModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">
                    {{ $t(`item['Status Detail']`) }}
                  </span>
                </v-card-title>
                <v-card-text>
                  {{ jiraModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-text>
          <v-form v-model="jiraForm.valid" ref="form">
            <v-row>
              <v-col cols="6">
                <v-text-field outlined
                  v-model="jiraModel.name"
                  :counter="255"
                  :rules="jiraForm.name.validator"
                  :label="$t(`item['`+jiraForm.name.label+`']`) + ' *'"
                  :placeholder="jiraForm.name.placeholder"
                  :disabled="jiraForm.readOnly"
                  :filled="jiraForm.readOnly"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field outlined
                  v-model="jiraModel.jira_key"
                  :counter="50"
                  :rules="jiraForm.jira_key.validator"
                  :label="$t(`item['`+jiraForm.jira_key.label+`']`) + ' *'"
                  :placeholder="jiraForm.jira_key.placeholder"
                  :disabled="jiraForm.readOnly"
                  :filled="jiraForm.readOnly"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-btn 
                text outlined color="blue darken-1" 
                v-if="jiraForm.readOnly"
                :loading="loading" 
                @click="handleScan"
              >
                {{ $t(`btn['SCAN']`) }}
              </v-btn>
              <v-spacer />
              <v-btn text outlined color="grey darken-1" @click="editDialog = false">
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                text outlined color="green darken-1" 
                v-if="!jiraForm.readOnly"
                :loading="loading" 
                @click="handleEditSubmit">
                {{ $t(`btn['EDIT']`) }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">Do you really want to delete this?</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="diagnosisModel.jira_setting_id"></v-list-item-title>
              <v-list-item-subtitle>JIRA Setting ID</v-list-item-subtitle>
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
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red darken-1"
            text outlined
            :loading="loading"
            @click="handleDeleteSubmit"
          >
            {{ $t(`btn['DELETE']`) }}
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
import project from '@/mixin/api/project'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
import ProjectTag from '@/component/widget/tag/ProjectTag'
export default {
  mixins: [mixin, project],
  components: {
    BottomSnackBar,
    ProjectTag,
  },
  data() {
    return {
      loading: false,
      jiraForm: {
        readOnly: false,
        valid: false,
        name: { label: 'Name', placeholder: 'something', validator:[
            v => !!v || 'Name is required',
            v => !v || v.length <= 200 || 'Name must be less than 200 characters',
          ]
        },
        identity_field: { label: 'identity_field', placeholder: '-', validator:[
            v => !v || v.length <= 50 || 'identity_field must be less than 50 characters',
          ]
        },
        identity_value: { label: 'identity_value', placeholder: '-', validator:[
            v => !v || v.length <= 50 || 'identity_value must be less than 50 characters',
          ]
        },
        jira_id: { label: 'JIRA ID(JIRA Project ID)', placeholder: '-', validator:[
            v => !v || v.length <= 50 || 'JIRA ID must be less than 50 characters',
          ]
        },
        jira_key: { label: 'JIRA Project', placeholder: '-', validator:[
            v => !!v || 'JIRA Project is required',
            v => !v || v.length <= 50 || 'JIRA Project must be less than 50 characters',
          ]
        },
      },
      diagnosisModel: { diagnosis_data_source_id:'', name:'', description:'', max_score:'', updated_at:'' },
      jiraModel: {
        jira_setting_id: '',
        name:'',
        diagnosis_data_source_id:'',
        identity_field:'',
        identity_value:'',
        jira_id:'',
        jira_key:'',
        status:'',
        status_detail:'',
        scan_at:'',
        updated_at:'',
      },
      table: {
        selected: [],
        search: '',
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
  created () {
    this.$setInterval( async () => {
      await this.listJiraSetting()
    }, 3000)
  },
  computed: {
    headers() {
      return [
          { text: this.$i18n.t('item[""]'), align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: this.$i18n.t('item["ID"]'),  align: 'start', sortable: true, value: 'jira_setting_id' },
          { text: this.$i18n.t('item["Name"]'), align: 'start', sortable: true, value: 'name' },
          { text: this.$i18n.t('item["JIRA Project"]'), align: 'start', sortable: true, value: 'jira_key' },
          { text: this.$i18n.t('item["Status"]'), align: 'start', sortable: true, value: 'status' },
          { text: this.$i18n.t('item["ScanAt"]'), align: 'start', sortable: true, value: 'scan_at' },
          { text: this.$i18n.t('item["Updated"]'), align: 'center', sortable: true, value: 'updated_at' },
          { text: this.$i18n.t('item["Action"]'), align: 'center', sortable: false, value: 'action' }
      ]
    },
  },
  async mounted() {
    this.loading = true
    await this.getJira()
    await this.listJiraSetting()
  },
  methods: {
    async getJira() {
      const res = await this.$axios.get(
        '/diagnosis/get-datasource/'
          + '?diagnosis_data_source_id=' + this.jira_datasource_id 
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
    async listJiraSetting() {
      const res = await this.$axios.get(
        '/diagnosis/list-jira-setting/'
          + '?diagnosis_data_source_id=' + this.diagnosisModel.diagnosis_data_source_id
          + '&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.jira_setting ) {
        this.clearList()
        return false
      }
      this.table.items = res.data.data.jira_setting
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem() {
      const param = {
          project_id: this.$store.state.project.project_id,
          jira_setting_id: this.jiraModel.jira_setting_id,
      }
      await this.$axios.post('/diagnosis/delete-jira-setting/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Delete.')
    },
    async putItem() {
      let scan_at = 0
      if (this.jiraModel.scan_at > 0 ) {
        scan_at = this.jiraModel.scan_at
      }
      const param = {
        project_id: this.$store.state.project.project_id,
        jira_setting: {
          project_id: this.$store.state.project.project_id,
          jira_setting_id: this.jiraModel.jira_setting_id,
          name: this.jiraModel.name,
          diagnosis_data_source_id: this.diagnosisModel.diagnosis_data_source_id,
          identity_field: this.jiraModel.identity_field,
          identity_value: this.jiraModel.identity_value,
          jira_id: this.jiraModel.jira_id,
          jira_key: this.jiraModel.jira_key,
          status: 2, // CONFIGURED
          status_detail: 'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      await this.$axios.post('/diagnosis/put-jira-setting/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Put JIRA.')
    },
    async scanDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        setting_id: this.jiraModel.jira_setting_id,
        diagnosis_data_source_id: this.jiraModel.diagnosis_data_source_id,
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
      await this.listJiraSetting()
      this.finishInfo('Reflesh list')
    },
    handleRowClick(item) {
      this.handleViewItem(item)
    },
    handleViewItem(item) {
      this.assignDataModel(item)
      this.jiraForm.readOnly = true
      this.editDialog  = true
    },
    handleNewItem() {
      this.handleEditItem()
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.jiraForm.readOnly = false
      this.editDialog  = true
    },
    getJiraTag() {
      if (this.jiraModel.jira_key !== '') {
        return 'jira:' + this.jiraModel.jira_key
      } else if (this.jiraModel.jira_id !== '') {
        return 'jira:' + this.jiraModel.jira_id
      }
      return ''
    },
    async handleEditSubmit() {
      if ( !this.$refs.form.validate() ) {
        return
      }
      this.loading = true
      await this.putItem()
      if (this.getJiraTag() !== '') {
        await this.tagProjectAPI(this.getJiraTag(), 'indigo darken-1')
      }
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog  = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      if (this.getJiraTag() !== '') {
        await this.untagProjectAPI(this.getJiraTag())
      }
      await this.deleteItem()
    },
    handleScan(item) {
      this.loading = true
      if (item && item.jira_setting_id) {
        this.assignDataModel(item)
      }
      this.scanDataSource()
    },

    assignDataModel(item) {
      this.jiraModel = {}
      this.jiraModel = Object.assign(this.jiraModel, item)
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
        this.listJiraSetting()
      }
    },
  }
}
</script>
