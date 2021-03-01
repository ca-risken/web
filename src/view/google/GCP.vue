<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue darken-1">mdi-google-cloud</v-icon>
              GCP
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
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="gcp_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-3">
                    <v-icon color="blue darken-1" large>mdi-google-cloud</v-icon>
                  </v-avatar>
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

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <v-icon large color="blue darken-1">mdi-google-cloud</v-icon>
          <span class="mx-4 headline">GCP</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="gcpForm.valid" ref="form">
            <v-text-field
              v-model="gcpModel.gcp_id"
              :label="gcpForm.gcp_id.label"
              :placeholder="gcpForm.gcp_id.placeholder"
              outlined filled disabled
            ></v-text-field>
            <v-text-field
              v-model="gcpModel.name"
              :counter="200"
              :rules="gcpForm.name.validator"
              :label="gcpForm.name.label"
              :placeholder="gcpForm.name.placeholder"
              outlined required
            ></v-text-field>
            <template v-if="gcpForm.newGCP">
              <v-text-field
                v-model="gcpModel.gcp_organization_id"
                :counter="128"
                :rules="gcpForm.gcp_organization_id.validator"
                :label="gcpForm.gcp_organization_id.label"
                :placeholder="gcpForm.gcp_organization_id.placeholder"
                outlined required
              ></v-text-field>
              <v-text-field
                v-model="gcpModel.gcp_project_id"
                :counter="128"
                :rules="gcpForm.gcp_project_id.validator"
                :label="gcpForm.gcp_project_id.label"
                :placeholder="gcpForm.gcp_project_id.placeholder"
                outlined required
              ></v-text-field>
            </template>
            <template v-else>
              <v-text-field
                v-model="gcpModel.gcp_organization_id"
                :counter="128"
                :label="gcpForm.gcp_organization_id.label"
                :placeholder="gcpForm.gcp_organization_id.placeholder"
                outlined filled disabled
              ></v-text-field>   
              <v-text-field
                v-model="gcpModel.gcp_project_id"
                :counter="128"
                :label="gcpForm.gcp_project_id.label"
                :placeholder="gcpForm.gcp_project_id.placeholder"
                outlined filled disabled
              ></v-text-field>   
            </template>

            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn text outlined color="grey darken-1" @click="editDialog = false">
                CANCEL
              </v-btn>
              <v-btn text outlined color="green darken-1" :loading="loading" @click="handleEditSubmit">
                <template v-if="gcpForm.newGCP">Regist</template>
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
              <v-list-item-title v-text="gcpModel.gcp_project_id"></v-list-item-title>
              <v-list-item-subtitle>GCP Project ID</v-list-item-subtitle>
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
        newGCP: false,
        valid: false,
        gcp_id: { label: 'ID', placeholder: '-' },
        name: { label: 'Name *', placeholder: 'something', validator:[
            v => !!v || 'Name is required',
            v => !v || v.length <= 200 || 'Name must be less than 200 characters',
          ]
        },
        gcp_organization_id: { label: 'GCP Organization ID', placeholder: 'your-org', validator:[
            v => !v || v.length <= 128 || 'GCP Organization ID must be less than 128 characters',
          ]
        },
        gcp_project_id: { label: 'GCP Project ID *', placeholder: 'your-project', validator:[
            v => !!v || 'GCP Project ID is required',
            v => !v || v.length <= 128 || 'GCP Project ID must be less than 128 characters',
            v => this.isNewGCPProjectID(v) || 'GCP Project ID is already exist.',
          ]
        },
      },
      gcpModel: { gcp_id:'', name:'', gcp_organization_id: '',gcp_project_id:'', updated_at:'' },
      table: {
        selected: [],
        search: '',
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: true, value: 'gcp_id' },
          { text: 'Name', align: 'start', sortable: true, value: 'name' },
          { text: 'GCP OrganizationID', align: 'start', sortable: true, value: 'gcp_organization_id' },
          { text: 'GCP ProjectID', align: 'start', sortable: true, value: 'gcp_project_id' },
          { text: 'Updated', align: 'center', sortable: true, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 5, sortBy: ['gcp_id'] },
        actions: [
          { text: 'Edit Item',  icon: 'mdi-pencil', click: this.handleEditItem },
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
        '/google/list-gcp/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      if ( !res.data.data.gcp ) {
        this.clearList()
        return false
      }
      this.table.items = res.data.data.gcp
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem(gcpID) {
      const param = {
          project_id: this.$store.state.project.project_id,
          gcp_id: gcpID,
      }
      await this.$axios.post('/google/delete-gcp/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Delete.')
    },
    async putItem() {
      const param = { 
        project_id: this.$store.state.project.project_id,
        gcp: {
          project_id: this.$store.state.project.project_id,
          name: this.gcpModel.name,
          gcp_organization_id: this.gcpModel.gcp_organization_id,
          gcp_project_id: this.gcpModel.gcp_project_id,
        },
      }
      await this.$axios.post('/google/put-gcp/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      let msg = 'Success: Updated GCP.'
      if (this.gcpForm.newGCP) {
        msg = 'Success: Created new GCP.'
      }
      this.finish(msg)
    },
    isNewGCPProjectID(pjID) {
      let isNew = true
      this.table.items.some( item => {
        if(item.gcp_project_id == pjID){
          isNew = false
          return true
        }
      })
      return isNew
    },
    handleRowClick(item) {
      this.$router.push('/google/gcp-data-source?gcp_id=' + item.gcp_id)
    },
    handleNewItem() {
      this.gcpModel = { gcp_id:'', name:'', gcp_project_id:'', updated_at:'' }
      this.gcpForm.newGCP = true
      this.editDialog  = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.gcpForm.newGCP = false
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
      this.deleteItem(this.gcpModel.gcp_id)
    },
    assignDataModel(item) {
      this.gcpModel = {}
      this.gcpModel = Object.assign(this.gcpModel, item)
    },

    async finish(msg) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.editDialog  = false
      this.deleteDialog  = false
      this.refleshList()
    },
  }
}
</script>
