<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue lighten-2">mdi-file-find-outline</v-icon>
              Setting
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
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
            v-model="table.activeOnly"
            label="Active only"
            @change="handleRefleshList"
          ></v-checkbox>
        </v-col>
        <v-spacer />
        <v-btn class="mt-3 mr-4" color="primary darken-3" fab dense small @click="handleNewItem">
          <v-icon>mdi-new-box</v-icon>
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
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="alert_id"
                @click:row="handleEditItem"
              >
                <template v-slot:[`item.status`]="{ item }">
                  <v-icon v-if="getAlertStatusText(item.status)=='ACTIVE'" color="success">mdi-check-circle</v-icon>
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:[`item.score_coefficient`]="{ item }">
                  <v-chip 
                    class="ma-2"
                    :color="getCoefficientColor(item.score_coefficient)"
                    outlined
                  >
                    <v-icon left>
                      mdi-calculator
                    </v-icon>
                    x {{ item.score_coefficient }}
                  </v-chip>
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
          <v-icon large class="pr-2" color="blue lighten-2">mdi-file-find-outline</v-icon>
          <span class="mx-4 headline">Setting</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.finding_setting_id"
              :label="form.finding_setting_id.label"
              :placeholder="form.finding_setting_id.placeholder"
              outlined filled disabled
            ></v-text-field>
            <v-combobox
              v-if="form.new"
              v-model="dataModel.resource_name"
              :loading="loading"
              :counter="255"
              :rules="form.resource_name.validator"
              :label="form.resource_name.label"
              :placeholder="form.resource_name.placeholder"
              :items="resourceNameCombobox"
              @keydown="listResourceNameForCombobox"
              persistent-hint outlined clearable
            />
            <v-text-field
              v-if="!form.new"
              v-model="dataModel.resource_name"
              :label="form.resource_name.label"
              :placeholder="form.resource_name.placeholder"
              outlined filled disabled
            ></v-text-field>
            <v-text-field
              v-model.number="dataModel.score_coefficient"
              :counter="3"
              :rules="form.score_coefficient.validator"
              :label="form.score_coefficient.label"
              :placeholder="form.score_coefficient.placeholder"
              outlined required
            ></v-text-field>
            <v-alert
              dense
              outlined
              type="info"
            >
              If you set a `Score Coefficient`, the score will be <strong>recalculated</strong> against the Resource Name's Base Score.
            </v-alert>
            <v-divider class="mt-3 mb-3"></v-divider>
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
              <v-list-item-title v-text="dataModel.finding_setting_id"></v-list-item-title>
              <v-list-item-subtitle>Finding Setting ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="dataModel.resource_name"></v-list-item-title>
              <v-list-item-subtitle>Resource Name</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-calculator</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="dataModel.score_coefficient"></v-list-item-title>
              <v-list-item-subtitle>Score Coefficient</v-list-item-subtitle>
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
import mixin from '@/mixin'
import finding from '@/mixin/api/finding'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  mixins: [mixin, finding],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      form: {
        new: false,
        valid: false,
        finding_setting_id: { label: 'ID', placeholder: '-' },
        resource_name: { label: 'Resource Name *', placeholder: 'name', validator:[
            v => !!v || 'Resource Name is required',
            v => !v || v.length <= 255 || 'Resource Name must be less than 255 characters',
          ]
        },
        score_coefficient: { label: 'Score Coefficient *', placeholder: '1.5', validator:[
            v => !!v || 'Score Coefficient is required',
            v => !v || -1 <= v && v <= 100 || 'Score Coefficient must be between -1 and 100',
          ]
        },
        resourceNameList: [],
        typing: false,
      },
      dataModel: {
        finding_setting_id: 0,
        resource_name: '',
        status: 0,
        setting: '',
        score_coefficient: 1,
        updated_at: 0,
        created_at: 0,
      },
      table: {
        selected: [],
        search: '',
        activeOnly: true,
        headers: [
          { text: 'ID',  align: 'center', width: '10%', sortable: true, value: 'finding_setting_id' },
          { text: 'Status', align: 'center', width: '10%', sortable: true, value: 'status' },
          { text: 'Resource Name', align: 'start', width: '50%', sortable: true, value: 'resource_name' },
          { text: 'Score Coefficient', align: 'start', width: '10%', sortable: true, value: 'score_coefficient' },
          { text: 'Updated', align: 'center', width: '10%', sortable: true, value: 'updated_at' },
          { text: 'Action', align: 'center', width: '10%', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['finding_setting_id'] },
        footer: {
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
      editDialog: false,
      deleteDialog: false,
    }
  },
  async mounted() {
    this.listResourceNameForCombobox()
    await this.handleRefleshList()
  },
  methods: {
    // list
    async listFindingSetting() {
      this.table.items = []
      let statusParam = ''
      if (this.table.activeOnly) {
        statusParam = '&status=' + this.getFindingSettingStatus('ACTIVE')
      }
      const list = await this.listFindingSettingAPI(statusParam)
      list.forEach(async item => {
        let coefficient = '-'
        const settingJSON = JSON.parse(item.setting)
        if (settingJSON && settingJSON.score_coefficient) {
          coefficient = settingJSON.score_coefficient
        }
        this.table.items.push({
          finding_setting_id: item.finding_setting_id,
          resource_name: item.resource_name,
          status: item.status,
          setting: item.setting,
          score_coefficient: coefficient,
          updated_at: item.updated_at,
        })
      })
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    getActionList( item ) {
      let list = [
          { text: 'Edit Item',  icon: 'mdi-pencil', click: this.handleEditItem },
      ]
      if ( !item.status ) {
        list.push({ text: 'Activate', icon: 'mdi-check-circle-outline', click: this.handleActivateItem })
      } else if ( this.getFindingSettingStatusText(item.status)=='ACTIVE' ) {
        list.push({ text: 'Deactivate', icon: 'mdi-cancel', click: this.handleDeactivateItem })
      }
      list.push({ text: 'Delete Item', icon: 'mdi-trash-can-outline', click: this.handleDeleteItem })
      return list
    },
    getCoefficientColor( coefficient ) {
      if ( !coefficient ) return 'grey'
      if ( coefficient > 1.0 ) return 'green'
      if ( coefficient < 1.0 ) return 'blue'
      return 'grey' // 1.0
    },

    // Update
    async putFindingSetting() {
      const param = { 
        project_id:      this.$store.state.project.project_id,
        finding_setting: {
          project_id:    this.$store.state.project.project_id,
          resource_name: this.dataModel.resource_name,
          setting:       JSON.stringify({score_coefficient: parseFloat(this.dataModel.score_coefficient)}),
          status:        Number(this.getFindingSettingStatus('ACTIVE')),
        },
      }
      await this.putFindingSettingAPI(param).catch((err) =>  {
        this.finishError(err)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Updated setting.')
    },
    // Delete
    async deleteFindingSetting() {
      await this.deleteFindingSettingAPI(this.dataModel.finding_setting_id).catch((err) =>  {
        this.finishError(err)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Deleted setting.')
    },

    // Activate/Deactivate
    async putFindingSettingStatus(status) {
      const param = { 
        project_id: this.$store.state.project.project_id,
        finding_setting: {
          project_id:    this.$store.state.project.project_id,
          resource_name: this.dataModel.resource_name,
          setting:       this.dataModel.setting,
          status:        Number(this.getFindingSettingStatus(status)),
        },
      }
      await this.putFindingSettingAPI(param).catch((err) =>  {
        this.finishError(err)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Updated status.')
    },

    // handler
    handleRefleshList() {
      this.loading = true
      this.listFindingSetting()
    },
    handleNewItem() {
      this.dataModel = {}
      this.form.new = true
      this.editDialog  = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.form.new = false
      this.editDialog  = true
    },
    handleEditSubmit() {
      if ( !this.$refs.form.validate() ) {
        return
      }
      this.loading = true
      this.putFindingSetting()
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog  = true
    },
    handleDeleteSubmit() {
      this.loading = true
      this.deleteFindingSetting()
    },
    handleDeactivateItem(item) {
      this.loading = true
      this.assignDataModel(item)
      this.putFindingSettingStatus('DEACTIVE')
    },
    handleActivateItem(item) {
      this.loading = true
      this.assignDataModel(item)
      this.putFindingSettingStatus('ACTIVE')
    },
    assignDataModel(item) {
      this.dataModel = {}
      this.dataModel = Object.assign(this.dataModel, item)
    },

    // finish process
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
        this.listFindingSetting()
      }
    },
  }
}
</script>
