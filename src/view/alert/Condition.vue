<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="red lighten-2">mdi-alert</v-icon>
              Condition
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
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
              v-model="table.enabledOnly"
              label="Enabled only"
              @change="searchCondition"
            ></v-checkbox>
          </v-col>
          <v-spacer />
          <v-btn 
            fab dense outlined small 
            color="blue darken-3" 
            class="mt-3 mr-4"
            :loading="loading" 
            @click="handleAnalyze"
          >
            <v-icon>mdi-magnify-scan</v-icon>
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
                item-key="alert_condition_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar icon class="ma-1">
                    <v-icon large class="pr-2" color="darken-2">mdi-cog</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.enabled`]="{ item }">
                  <v-icon v-if="item.enabled==true" color="success">mdi-check-circle</v-icon>
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:[`item.severity`]="{ item }">
                  <v-chip  class="ma-1" dark :color="getSeverityColor(item.severity)">{{ item.severity }}</v-chip>
                </template>
                <template v-slot:[`item.and_or`]="{ item }">
                  <template v-if="item.and_or=='and'">
                    <v-icon left color="teal lighten-2">mdi-set-center</v-icon>AND
                  </template>
                  <template v-else>
                    <v-icon left color="teal lighten-2">mdi-set-all</v-icon> OR
                  </template>
                </template>
                <template v-slot:[`item.rules`]="{ item }">
                  <v-chip :color="getColorByCount(item.rules.length)" dark>{{ item.rules.length }}</v-chip>
                </template>
                <template v-slot:[`item.notifications`]="{ item }">
                  <v-chip :color="getColorByCount(item.notifications.length)" dark>{{ item.notifications.length }}</v-chip>
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

    <v-dialog v-model="editDialog" max-width="65%">
      <v-card>
        <!-- Alert Condition -->
        <v-card-title>
          <v-icon large class="pr-2" color="grey darken-2">mdi-cog</v-icon>
          <span class="mx-4 headline">Alert Condition</span>
          <v-chip dark label color="primary darken-3">
            <v-icon left>mdi-identifier</v-icon>
            {{ dataModel.alert_condition_id }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-row>
              <v-col cols="10">
                <v-text-field
                  v-model="dataModel.description"
                  :counter="200"
                  :rules="form.description.validator"
                  :label="form.description.label"
                  :placeholder="form.description.placeholder"
                  outlined required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-combobox
                  outlined required clearable
                  v-model="dataModel.severity"
                  :rules="form.severity.validator"
                  :label="form.severity.label"
                  :placeholder="form.severity.placeholder"
                  :items="form.severity.list"
                />
              </v-col>
              <v-col cols="4">
                <v-combobox
                  outlined required clearable
                  v-model="dataModel.and_or"
                  :rules="form.and_or.validator"
                  :label="form.and_or.label"
                  :placeholder="form.and_or.placeholder"
                  :items="form.and_or.list"
                />
              </v-col>
              <v-col cols="4">
                <v-checkbox
                  required
                  v-model="dataModel.enabled"
                  :rules="form.enabled.validator"
                  :label="form.enabled.label"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-divider class="mt-3 mb-3"></v-divider>
          </v-form>
        </v-card-text>


        <!-- Alert Rule -->
        <v-card-title>
          <v-icon large color="brown darken-2">mdi-book-open-variant</v-icon>
          <span class="mx-4 headline">Alert Rule</span>
          <v-chip outliend class="mx-4" v-if="dataModel.and_or=='and'">
            <v-icon left color="teal lighten-2">mdi-set-center</v-icon>
            AND
          </v-chip>
          <v-chip outliend class="mx-4" v-else>
            <v-icon left color="teal lighten-2">mdi-set-all</v-icon>
            OR
          </v-chip>
          <v-spacer />
          <v-btn
            text outlined link
            to="/alert/rule/"
          >
            create new rule
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- Rule List -->
          <v-toolbar flat color="white">
            <v-text-field text solo flat
              prepend-icon="mdi-magnify"
              placeholder="Type something"
              v-model="ruleTable.search"
              hide-details
              class="hidden-sm-and-down"
            />
            <v-btn icon>
              <v-icon>mdi-filter</v-icon>
            </v-btn>
          </v-toolbar>
          <v-divider></v-divider>

          <v-data-table
            v-model="ruleTable.selected"
            :search="ruleTable.search"
            :headers="ruleTable.headers"
            :footer-props="ruleTable.footer"
            :items="ruleTable.items"
            :options.sync="ruleTable.options"
            :loading="loading"
            locale="ja-jp"
            loading-text="読込中"
            no-data-text="データがありません。"
            class="elevation-1"
            item-key="alert_rule_id"
            show-select
          >
            <template v-slot:[`item.resource_name`]="{ item }">
              <template v-if="item.resource_name">
                <v-chip label><v-icon left>mdi-file-find-outline</v-icon>{{ item.resource_name | cutString }}</v-chip>
              </template>
              <template v-else>-</template>
            </template>
            <template v-slot:[`item.tag`]="{ item }">
              <template v-if="item.tag">
                <v-chip label><v-icon left>mdi-label</v-icon>{{ item.tag | cutString }}</v-chip>
              </template>
              <template v-else>-</template>
            </template>
            <template v-slot:[`item.score`]="{ item }">
              <v-chip :color="getColorByScore(item.score)" dark>{{ item.score }}</v-chip>
            </template>
            <template v-slot:[`item.finding_cnt`]="{ item }">
              <v-chip :color="getColorByCount(item.finding_cnt)" dark>{{ item.finding_cnt }}</v-chip>
            </template>
          </v-data-table>
          <v-divider class="mt-3 mb-3"></v-divider>
        </v-card-text>

        <!-- Alert Notification -->
        <v-card-title>
          <v-icon large color="brown darken-2">mdi-email</v-icon>
          <span class="mx-4 headline">Alert Notification</span>
          <v-spacer />
          <v-btn
            text outlined link
            to="/alert/notification/"
          >
            create new Notification
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- Notification List -->
          <v-toolbar flat color="white">
            <v-text-field text solo flat
              prepend-icon="mdi-magnify"
              placeholder="Type something"
              v-model="notiTable.search"
              hide-details
              class="hidden-sm-and-down"
            />
            <v-btn icon>
              <v-icon>mdi-filter</v-icon>
            </v-btn>
          </v-toolbar>
          <v-divider></v-divider>

          <v-data-table
            v-model="notiTable.selected"
            :search="notiTable.search"
            :headers="notiTable.headers"
            :footer-props="notiTable.footer"
            :items="notiTable.items"
            :options.sync="notiTable.options"
            :loading="loading"
            locale="ja-jp"
            loading-text="読込中"
            no-data-text="データがありません。"
            class="elevation-1"
            item-key="notification_id"
            show-select
          >
          </v-data-table>
          <v-divider class="mt-3 mb-3"></v-divider>
        </v-card-text>

        <v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text outlined color="grey darken-1" @click="editDialog = false">
              CANCEL
            </v-btn>
            <v-btn text outlined color="green darken-1" :loading="loading" @click="handleEditSubmit">
              <template v-if="form.new">Regist</template>
              <template v-else>Edit</template>
            </v-btn>
          </v-card-actions>
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
              <v-list-item-title v-text="dataModel.alert_condition_id"></v-list-item-title>
              <v-list-item-subtitle>Alert Condition ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="dataModel.description"></v-list-item-title>
              <v-list-item-subtitle>Description</v-list-item-subtitle>
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
      form: {
        new: false,
        valid: false,
        alert_condition_id: { label: 'ID', placeholder: '-' },
        description: { label: 'Description *', placeholder: 'description', validator:[
            v => !!v || 'Description is required',
            v => v.length <= 200 || 'Name must be less than 200 characters',
          ]
        },
        severity: { label: 'Serverity *', placeholder: 'high',
          list: ['high', 'medium', 'low'],
          validator:[
            v => !!v || 'Serverity is required',
            v => !v || v === 'high' || v === 'medium' || v === 'low' || 'Serverity is invalid',
          ]
        },
        and_or: { label: 'And or Or *', placeholder: 'and',
          list: ['and', 'or'],
          validator:[
            v => !!v || 'And Or is required',
            v => !v || v === 'and' || v === 'or' || 'And_Or is invalid',
          ]
        },
        enabled: { label: 'Enabled *', placeholder: 'true'},
      },
      dataModel: {
        alert_condition_id:0,
        description:'', 
        severity:'', 
        and_or:'',
        enabled:false,
        rules: [],
        notifications: [],
        updated_at:''
      },
      table: {
        selected: [],
        search: '',
        enabledOnly: true,
        headers: [
          { text: '', align: 'center', width: '5%', sortable: false, value: 'avator' },
          { text: 'Enabled', align: 'start', sortable: true, value: 'enabled' },
          { text: 'ID',  align: 'start', sortable: true, value: 'alert_condition_id' },
          { text: 'Description', align: 'start', sortable: true, value: 'description' },
          { text: 'Serverity', align: 'center', sortable: true, value: 'severity' },
          { text: 'And Or', align: 'start', sortable: true, value: 'and_or' },
          { text: 'Rules', align: 'center', sortable: true, value: 'rules' },
          { text: 'Notificationns', align: 'center', sortable: true, value: 'notifications' },
          // { text: 'Updated', align: 'center', sortable: true, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_condition_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          { text: 'Delete Item', icon: 'mdi-trash-can-outline', click: this.handleDeleteItem },
          { text: 'Analyze Alert', icon: 'mdi-magnify-scan', click: this.handleAnalyze },
        ],
        footer: {
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
      ruleTable: {
        selected: [],
        search: '',
        headers: [
          { text: 'ID',  align: 'start', sortable: true, value: 'alert_rule_id' },
          { text: 'Name', align: 'start', sortable: true, value: 'name' },
          { text: 'Resource Name', align: 'start', sortable: true, value: 'resource_name' },
          { text: 'Tag', align: 'start', sortable: true, value: 'tag' },
          { text: 'Finding Count', align: 'center', sortable: true, value: 'finding_cnt' },
          { text: 'Score', align: 'center', sortable: true, value: 'score' },
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_rule_id'] },
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [5],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
      notiTable: {
        selected: [],
        search: '',
        headers: [
          { text: 'ID',  align: 'start', sortable: true, value: 'notification_id' },
          { text: 'Name', align: 'start', sortable: true, value: 'name' },
          { text: 'type', align: 'start', sortable: true, value: 'type' },
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_rule_id'] },
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [5],
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
    cutString: (str) => {
      return Util.cutLongString(str, 10)
    },
  },
  mounted() {
    this.handleSearchList()
  },
  methods: {
    // List Condition
    async searchCondition() {
      this.clearList()
      let enabledParam = ''
      if (this.table.enabledOnly) {
        enabledParam = '&enabled=true'
      }
      const res = await this.$axios.get(
        '/alert/list-condition/?project_id=' + this.$store.state.project.project_id + enabledParam
      ).catch((err) =>  {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if ( !res.data.data.alert_condition ) {
        this.clearList()
        return false
      }
      res.data.data.alert_condition.forEach( async cond => {
        const rules = await this.$axios.get(
          '/alert/list-condition_rule/?project_id=' + this.$store.state.project.project_id
            + '&alert_condition_id=' + cond.alert_condition_id
        ).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const notis = await this.$axios.get(
          '/alert/list-condition_notification/?project_id=' + this.$store.state.project.project_id
            + '&alert_condition_id=' + cond.alert_condition_id
        ).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        const item = {
          alert_condition_id: cond.alert_condition_id,
          description: cond.description, 
          severity: cond.severity, 
          and_or: cond.and_or,
          enabled: cond.enabled,
          rules: rules.data.data.alert_cond_rule ?
            rules.data.data.alert_cond_rule.map(item => item.alert_rule_id) : [],
          notifications: notis.data.data.alert_cond_notification ?
            notis.data.data.alert_cond_notification.map(item => item.notification_id) : [],
          updated_at: cond.updated_at,
        }
        this.table.items.push(item)
      })
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },

    // Delete Condition
    async deleteItem() {
      const param = {
          project_id: this.$store.state.project.project_id,
          alert_condition_id: this.dataModel.alert_condition_id,
      }
      await this.$axios.post('/alert/delete-condition/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Delete.')
    },

    // Put Condition
    async putItem() {
      const param = { 
        project_id: this.$store.state.project.project_id,
        alert_condition: {
          project_id: this.$store.state.project.project_id,
          alert_condition_id: this.dataModel.alert_condition_id,
          description: this.dataModel.description,
          severity: this.dataModel.severity,
          and_or: this.dataModel.and_or,
          enabled: this.dataModel.enabled,  // falase をセットしても正しく反映されない？
        },
      }
      const res = await this.$axios.post('/alert/put-condition/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if (res && res.data && res.data.data && res.data.data.alert_condition) {
        // update `alert_condition_id` for NEW condition data
        this.dataModel.alert_condition_id = res.data.data.alert_condition.alert_condition_id
      }
    },

    // List Rule
    async listRule() {
      this.clearRuleList()
      const res = await this.$axios.get(
        '/alert/list-rule/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if ( !res.data.data.alert_rule	 ) {
        return false
      }
      res.data.data.alert_rule.forEach( async rule => {
        this.ruleTable.items.push(rule)
        if (this.dataModel.rules.indexOf(rule.alert_rule_id) !== -1 ){
          this.ruleTable.selected.push(rule)
        }
      })
      this.loading = false
    },
    clearRuleList() {
      this.ruleTable.selected = []
      this.ruleTable.items = []
    },

    // Put Rules
    async putRule() {
      this.ruleTable.items.forEach( async item => {
        // Set param for delete request.
        let uri = '/alert/delete-condition_rule/'
        let param = { 
          project_id: this.$store.state.project.project_id,
          alert_condition_id: this.dataModel.alert_condition_id,
          alert_rule_id: item.alert_rule_id,
        }
        this.ruleTable.selected.some( selected => {
          if(item.alert_rule_id === selected.alert_rule_id){
            // If the rule is selected, change to param for put request.
            uri = '/alert/put-condition_rule/'
            param = { 
              project_id: this.$store.state.project.project_id,
              alert_cond_rule: {
                project_id: this.$store.state.project.project_id,
                alert_condition_id: this.dataModel.alert_condition_id,
                alert_rule_id: item.alert_rule_id,
              },
            }
            return true
          }
        })
        await this.$axios.post(uri, param).catch((err) =>  {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        })
      })
    },

    // List Notifications
    async listNotification() {
      this.clearNotiList()

      const res = await this.$axios.get(
        '/alert/list-notification/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.notification ) {
        return false
      }
      res.data.data.notification.forEach( async noti => {
        this.notiTable.items.push(noti)
        if (this.dataModel.notifications.indexOf(noti.notification_id) !== -1 ){
          this.notiTable.selected.push(noti)
        }
      })
      this.loading = false
    },
    clearNotiList() {
      this.notiTable.selected = []
      this.notiTable.items = []
    },

    // Put Notifications
    async putNotification() {
      this.notiTable.items.forEach( async item => {
        // Set param for delete request.
        let uri = '/alert/delete-condition_notification/'
        let param = { 
          project_id: this.$store.state.project.project_id,
          alert_condition_id: this.dataModel.alert_condition_id,
          notification_id: item.notification_id,
        }
        this.notiTable.selected.some( selected => {
          if(item.notification_id === selected.notification_id){
            // If the rule is selected, change to param for put request.
            uri = '/alert/put-condition_notification/'
            param = { 
              project_id: this.$store.state.project.project_id,
              alert_cond_notification: {
                project_id: this.$store.state.project.project_id,
                alert_condition_id: this.dataModel.alert_condition_id,
                notification_id: item.notification_id,
                cache_second: 60 * 60, // an hour 
                notified_at: 0,
              },
            }
            return true
          }
        })
        await this.$axios.post(uri, param).catch((err) =>  {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      })
    },

    // Analyze Alert
    async analyzeAlert(alertConditionID) {
      const param = { 
        project_id: this.$store.state.project.project_id,
        alert_condition_id: alertConditionID,
      }
      await this.$axios.post('/alert/analyze-alert/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishAnalyze('Analyze Started: You will be redirected to the alert result soon...')
    },

    // handler
    handleSearchList() {
      this.loading = true
      this.searchCondition('')
    },
    async handleNewItem() {
      this.dataModel = {
        alert_condition_id:0,
        description:'', 
        severity:'', 
        and_or:'',
        enabled:true,
        rules: [],
        notifications: [],
        updated_at:''
      }
      await this.listRule()
      await this.listNotification()
      this.form.new = true
      this.editDialog  = true
    },
    handleRowClick(item) {
      this.handleEditItem(item)
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.listRule()
      this.listNotification()
      this.form.new = false
      this.editDialog  = true
    },
    async handleEditSubmit() {
      if ( !this.$refs.form.validate() ) {
        return
      }
      this.loading = true
      await this.putItem()
      await this.putRule()
      await this.putNotification()
      this.finishSuccess('Success: Put alert condition.')
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog  = true
    },
    handleDeleteSubmit() {
      this.loading = true
      this.deleteItem()
    },
    handleAnalyze(item) {
      this.loading = true
      let alertConditionID = ''
      if (item.alert_condition_id) {
        alertConditionID = item.alert_condition_id
      }
      this.analyzeAlert(alertConditionID)
    },
    assignDataModel(item) {
      this.dataModel = {}
      this.dataModel = Object.assign(this.dataModel, item)
    },

    // finish process
    async finishAnalyze(msg) {
      this.$refs.snackbar.notifyInfo(msg)
      await new Promise(resolve => setTimeout(resolve, 2000))
      this.$router.push('/alert/alert/')
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
      this.ruleDialog  = false
      this.notiDialog = false
      if ( reflesh ) {
        this.searchCondition()
      }
    },
  }
}
</script>
