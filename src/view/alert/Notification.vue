<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="red lighten-2">mdi-alert</v-icon>
              Notification
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
                item-key="notification_id"
                @click:row="handleRowClick"
              >
                <template v-slot:item.avator="">
                  <v-avatar icon class="ma-1">
                    <v-icon large class="pr-2" color="brown darken-2">mdi-slack</v-icon>
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
          <v-icon large class="pr-2" color="red lighten-2">mdi-alert</v-icon>
          <span class="mx-4 headline">Notification</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.notification_id"
              :label="form.notification_id.label"
              :placeholder="form.notification_id.placeholder"
              outlined filled disabled
            ></v-text-field>
            <v-text-field
              v-model="dataModel.name"
              :counter="200"
              :rules="form.name.validator"
              :label="form.name.label"
              :placeholder="form.name.placeholder"
              outlined required
            ></v-text-field>
            <v-combobox
              outlined required clearable
              v-model="dataModel.type"
              :rules="form.type.validator"
              :label="form.type.label"
              :placeholder="form.type.placeholder"
              :items="form.type.list"
            />
            <v-text-field
              v-model="dataModel.webhook_url"
              :counter="200"
              :rules="form.webhook_url.validator"
              :label="form.webhook_url.label"
              :placeholder="form.webhook_url.placeholder"
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
              <v-list-item-title v-text="dataModel.notification_id"></v-list-item-title>
              <v-list-item-subtitle>Notification ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="dataModel.name"></v-list-item-title>
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
      form: {
        new: false,
        valid: false,
        notification_id: { label: 'ID', placeholder: '-' },
        name: { label: 'Name *', placeholder: 'something', validator:[
            v => !!v || 'Name is required',
            v => v.length <= 200 || 'Name must be less than 200 characters',
          ]
        },
        type: { label: 'Type *', placeholder: 'slack',
          list: ['slack'],
          validator:[
            v => !!v || 'Type is required',
            v => v === 'slack' || 'Type is invalid type',
          ]
        },
        webhook_url: { label: 'Webhook URL *', placeholder: 'https://xxx', validator:[
            v => !!v || 'Webhook is required',
          ]
        },
      },
      dataModel: { notification_id:0, name:'', type:'', notify_setting: {}, webhook_url:'', updated_at:'' },
      table: {
        selected: [],
        search: '',
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: true, value: 'notification_id' },
          { text: 'Name', align: 'start', sortable: true, value: 'name' },
          { text: 'type', align: 'start', sortable: true, value: 'type' },
          { text: 'Updated', align: 'center', sortable: true, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 5, sortBy: ['notification_id'] },
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
    // list
    async refleshList() {
      const res = await this.$axios.get(
        '/alert/list-notification/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.notification ) {
        this.clearList()
        return false
      }
      this.table.items = list.data.notification
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },

    // delete
    async deleteItem() {
      const param = {
          project_id: this.$store.state.project.project_id,
          notification_id: this.dataModel.notification_id,
      }
      await this.$axios.post('/alert/delete-notification/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Delete.')
    },

    // put
    async putItem() {
      const param = { 
        project_id: this.$store.state.project.project_id,
        notification: {
          project_id: this.$store.state.project.project_id,
          notification_id: this.dataModel.notification_id,
          type: this.dataModel.type,
          name: this.dataModel.name,
          notify_setting: JSON.stringify({
            webhook_url: this.dataModel.webhook_url
          }), 
        },
      }
      await this.$axios.post('/alert/put-notification/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      let msg = 'Success: Updated Notification.'
      if (this.form.new) {
        msg = 'Success: Created new Notification.'
      }
      this.finishSuccess(msg)
    },

    handleNewItem() {
      this.dataModel = { notification_id:0, name:'', type:'', webhook_url:'', updated_at:'' }
      this.form.new = true
      this.editDialog  = true
    },
    handleRowClick(item) {
      this.handleEditItem(item)
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
      this.deleteItem()
    },
    assignDataModel(item) {
      this.dataModel = {}
      this.dataModel = Object.assign(this.dataModel, item)

      const setting = JSON.parse(this.dataModel.notify_setting)
      // slack
      if (this.dataModel.type === 'slack' && setting.webhook_url) {
        this.dataModel.webhook_url = setting.webhook_url
      }
    },

    // finish process
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
        this.refleshList()
      }
    },
  }
}
</script>
