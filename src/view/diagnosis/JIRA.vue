<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="white" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue">mdi-bug-check-outline</v-icon>
              JIRA
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              outlined clearable dense
              prepend-icon="mdi-magnify"
              placeholder="Type something..."
              v-model="table.search"
              hide-details
              class="hidden-sm-and-down"
            />
          </v-col>

          <v-spacer />
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
                <template v-slot:item.avator="">
                  <v-avatar class="ma-3">
                    <v-icon color="blue darken-1" large>mdi-jira</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:item.updated_at="{ item }">
                  <v-chip>{{ item.updated_at | formatTime }}</v-chip>
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
          <v-icon large color="blue darken-1">mdi-bug-check-outline</v-icon>
          <span class="mx-4 headline">Diagnosis</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="diagnosisForm.valid" ref="form">
            <v-text-field
              v-model="diagnosisModel.diagnosis_id"
              :label="diagnosisForm.diagnosis_id.label"
              :placeholder="diagnosisForm.diagnosis_id.placeholder"
              outlined filled disabled
            ></v-text-field>
            <v-text-field
              v-model="diagnosisModel.name"
              :counter="200"
              :rules="diagnosisForm.name.validator"
              :label="diagnosisForm.name.label"
              :placeholder="diagnosisForm.name.placeholder"
              :disabled="!diagnosisForm.newDiagnosis"
              :filled="!diagnosisForm.newDiagnosis"
              outlined required
            ></v-text-field>

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn text outlined color="grey darken-1" @click="editDialog = false">
                CANCEL
              </v-btn>
              <v-btn text outlined color="green darken-1"
                 v-if="diagnosisForm.newDiagnosis"
                :loading="loading"
                @click="handleEditSubmit"
              >
                Regist
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">削除しますか?</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="diagnosisModel.diagnosis_id"></v-list-item-title>
              <v-list-item-subtitle>Diagnosis ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="diagnosisModel.name"></v-list-item-title>
              <v-list-item-subtitle>Diagnosis Name</v-list-item-subtitle>
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
            YES
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>
<script>
// TODO: Fix JIRA after fix API
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
      diagnosisForm: {
        newDiagnosis: false,
        valid: false,
        diagnosis_id: { label: 'ID', placeholder: '-' },
        name: { label: 'Name *', placeholder: 'something', validator:[
            v => !!v || 'Name is required',
            v => v.length <= 200 || 'Name must be less than 200 characters',
          ]
        },
      },
      diagnosisModel: { diagnosis_id:'', name:'', record_id:'', jira_id:'', jira_key:'', updated_at:'' },
      table: {
        selected: [],
        search: '',
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: false, value: 'diagnosis_id' },
          { text: 'Name', align: 'start', sortable: false, value: 'name' },
          { text: 'Record ID', align: 'start', sortable: false, value: 'record_id' },
          { text: 'JIRA ID', align: 'start', sortable: false, value: 'jira_id' },
          { text: 'JIRA KEY', align: 'start', sortable: false, value: 'jira_key' },
          { text: 'Updated', align: 'center', sortable: false, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 5, sortBy: ['diagnosis_id'] },
        actions: [
          { text: 'View Item',  icon: 'mdi-eye', click: this.handleViewItem },
          { text: 'Delete Item', icon: 'mdi-trash-can-outline', click: this.handleDeleteItem },
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
  mounted() {
    this.loading = true
    this.refleshList('')
  },
  methods: {
    async refleshList() {
      const res = await this.$axios.get(
        '/diagnosis/list-diagnosis/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.diagnosis ) {
        this.clearList()
        return false
      }
      this.table.items = list.data.diagnosis
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem(diagnosisID) {
      const param = {
          project_id: this.$store.state.project.project_id,
          diagnosis_id: diagnosisID,
      }
      await this.$axios.post('/diagnosis/delete-diagnosis/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Delete.')
    },
    async putItem() {
      const param = { 
        project_id: this.$store.state.project.project_id,
        diagnosis: {
          project_id: this.$store.state.project.project_id,
          name: this.diagnosisModel.name,
        },
      }
      await this.$axios.post('/diagnosis/put-diagnosis/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      let msg = 'Success: Updated Diagnosis.'
      if (this.diagnosisForm.newDiagnosis) {
        msg = 'Success: Created new Diagnosis.'
      }
      this.finish(msg)
    },
    handleRowClick(item) {
      // this.$router.push('/diagnosis/data-source?diagnosis_id=' + item.diagnosis_id)
      this.handleViewItem(item)
    },
    handleNewItem() {
      this.diagnosisModel = { diagnosis_id:'', name:'', updated_at:'' }
      this.diagnosisForm.newDiagnosis = true
      this.editDialog  = true
    },
    handleViewItem(item) {
      this.assignDataModel(item)
      this.diagnosisForm.newDiagnosis = false
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
      this.deleteItem(this.diagnosisModel.diagnosis_id)
    },
    assignDataModel(item) {
      this.diagnosisModel = {}
      this.diagnosisModel = Object.assign(this.diagnosisModel, item)
    },

    async finish(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.editDialog  = false
      this.deleteDialog  = false
      this.refleshList()
    },
  }
}
</script>
