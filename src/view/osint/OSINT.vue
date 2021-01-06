<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="green">http</v-icon>
              OSINT
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
                loading-text="読込中"
                no-data-text="データがありません。"
                class="elevation-1"
                item-key="osint_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-3">
                    <v-icon color="green" large>http</v-icon>
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
          <v-icon large color="green">http</v-icon>
          <span class="mx-4 headline">OSINT</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.osint_id"
              :label="form.osint_id.label"
              :placeholder="form.osint_id.placeholder"
              outlined filled disabled
            ></v-text-field>
            <v-combobox
              v-model="dataModel.resource_type"
              :rules="form.resource_type.validator"
              :label="form.resource_type.label"
              :placeholder="form.resource_type.placeholder"
              :items="form.resource_type.list"
              outlined required clearable
            />
            <v-text-field
              v-model="dataModel.resource_name"
              :counter="200"
              :rules="form.resource_name.validator"
              :label="form.resource_name.label"
              :placeholder="form.resource_name.placeholder"
              outlined required
            ></v-text-field>

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
              <v-list-item-title v-text="dataModel.osint_id"></v-list-item-title>
              <v-list-item-subtitle>OSINT ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="dataModel.resource_type"></v-list-item-title>
              <v-list-item-subtitle>Resource Type</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>http</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="dataModel.resource_name"></v-list-item-title>
              <v-list-item-subtitle>Resource Name</v-list-item-subtitle>
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
        osint_id: { label: 'ID', placeholder: '-' },
        resource_type: { label: 'ResourceType *', placeholder: 'something', list: ['Domain'], validator:[
            v => !!v || 'ResourceType is required',
            v => !v  || v == 'Domain' || 'ResourceType is not valid type',
          ]
        },
        resource_name: { label: 'ResourceName *', placeholder: 'something', validator:[
            v => !!v || 'ResourceName is required',
            v => !v  || v.length <= 200 || 'ResourceName must be less than 200 characters',
          ]
        },
      },
      dataModel: { osint_id:'', resource_type:'', resource_name:'', updated_at:'' },
      table: {
        selected: [],
        search: '',
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: false, value: 'osint_id' },
          { text: 'ResourceType', align: 'start', sortable: false, value: 'resource_type' },
          { text: 'ResourceName', align: 'start', sortable: false, value: 'resource_name' },
          { text: 'Updated', align: 'center', sortable: false, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 5, sortBy: ['osint_id'] },
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
    this.listItem()
  },
  methods: {
    async listItem() {
      const res = await this.$axios.get(
        '/osint/list-osint/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      if ( !res.data.data.osint ) {
        this.clearList()
        return false
      }
      this.table.items = res.data.data.osint
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem(osintID) {
      const param = {
          project_id: this.$store.state.project.project_id,
          osint_id: osintID,
      }
      await this.$axios.post('/osint/delete-osint/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Delete OSINT.')
    },
    async putItem() {
      const param = { 
        project_id: this.$store.state.project.project_id,
        osint: {
          osint_id: this.dataModel.osint_id,
          project_id: this.$store.state.project.project_id,
          resource_type: this.dataModel.resource_type,
          resource_name: this.dataModel.resource_name,
        },
      }
      await this.$axios.post('/osint/put-osint/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Updated OSINT.')
    },
    handleRowClick(item) {
      this.$router.push('/osint/data-source?osint_id=' + item.osint_id)
    },
    handleNewItem() {
      this.dataModel = { osint_id:'', resource_type:'', resource_name:'', updated_at:'' }
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
      this.putItem()
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog  = true
    },
    handleDeleteSubmit() {
      this.loading = true
      this.deleteItem(this.dataModel.osint_id)
    },
    assignDataModel(item) {
      this.dataModel = {}
      this.dataModel = Object.assign(this.dataModel, item)
    },

    // finish
    async finishError(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifyError(msg)
      this.finish()
    },
    async finishSuccess(msg) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.$refs.snackbar.notifySuccess(msg)
      this.finish()
    },
    async finish() {
      this.loading = false
      this.editDialog  = false
      this.deleteDialog  = false
      this.listItem()
    },
  }
}
</script>
