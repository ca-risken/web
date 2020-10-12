<template>
  <div class="list-table">
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="white" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="red lighten-2">mdi-alert</v-icon>
              Rule
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
                item-key="alert_rule_id"
                @click:row="handleRowClick"
              >
                <template v-slot:item.avator="">
                  <v-avatar icon class="ma-2">
                    <v-icon large class="pr-2" color="brown darken-2">mdi-book-open-variant</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:item.score="{ item }">
                  <v-chip :color="getColorByScore(item.score)" dark>{{ item.score }}</v-chip>
                </template>
                <template v-slot:item.finding_cnt="{ item }">
                  <v-chip :color="getColorByCount(item.finding_cnt)" dark>{{ item.finding_cnt }}</v-chip>
                </template>
                <template v-slot:item.tag="{ item }">
                  <template v-if="item.tag">
                    <v-chip label><v-icon left>mdi-label</v-icon>{{ item.tag }}</v-chip>
                  </template>
                  <template v-else>
                    -
                  </template>
                </template>
                <!--
                <template v-slot:item.updated_at="{ item }">
                  <v-chip>{{ item.updated_at | formatTime }}</v-chip>
                </template>
                -->
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

    <v-dialog v-model="editDialog" max-width="70%">
      <v-card>
        <v-card-title>
          <v-icon large class="pr-2" color="red lighten-2">mdi-alert</v-icon>
          <span class="mx-4 headline">Rule</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.alert_rule_id"
              :label="form.alert_rule_id.label"
              :placeholder="form.alert_rule_id.placeholder"
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

            <v-row>
              <v-col cols="3">
                <span
                  class="display-2 font-weight-light"
                  v-text="dataModel.score"
                ></span>
                <span class="subheading font-weight-light mr-1">pts over</span>
              </v-col>
              <v-col cols="9">
                <v-slider
                  v-model="dataModel.score"
                  min="0.0" max="1.0" step="0.01"
                  :rules="form.score.validator"
                  :label="form.score.label"
                  :messages="form.score.placeholder"
                  thumb-label="always"
                  thumb-color="red"
                  outlined
                ></v-slider>
              </v-col>
            </v-row>
            <v-text-field
              v-model="dataModel.resource_name"
              :counter="255"
              :rules="form.resource_name.validator"
              :label="form.resource_name.label"
              :placeholder="form.resource_name.placeholder"
              outlined required
            ></v-text-field>
            <v-combobox
              outlined clearable small-chips
              :label="form.tag.label"
              :placeholder="form.tag.placeholder"
              :items="form.tag.list"
              item-text="tag"
              item-value="finding_tag_id"
              v-model="dataModel.tag"
            />
            <v-text-field
              v-model="dataModel.finding_cnt"
              :rules="form.finding_cnt.validator"
              :label="form.finding_cnt.label"
              :placeholder="form.finding_cnt.placeholder"
              type="number"
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
          <span class="mx-4">削除しますか?</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="dataModel.alert_rule_id"></v-list-item-title>
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
            YES
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
        alert_rule_id: { label: 'ID', placeholder: '-' },
        name: { label: 'Name *', placeholder: 'something', validator:[
            v => !!v || 'Name is required',
            v => v.length <= 200 || 'Name must be less than 200 characters',
          ]
        },
        score: { label: 'Score *', placeholder: 'Select score ( 0.0 ~ 1.0 )',
          validator:[
            v => !!v || 'Score is required',
            v => !v || 0.0 <= v && v <= 1.0 || 'Score is must between 0.0 and 1.0',
          ]
        },
        resource_name: { label: 'Resource Name', placeholder: 'resource', validator:[
            v => !v || v.length <= 255 || 'Resource Name must be less than 255 characters',
          ]
        },
        tag: { label: 'Tag', placeholder: 'key:value', 
          list: [],
          validator:[
            v => !v || v.length <= 64 || 'Tag must be less than 64 characters',
          ]
        },
        finding_cnt: { label: 'Finding Count *', placeholder: '1', validator:[
            v => !!v || 'Finding Count is required',
            v => !v || 1 <= v  || 'finding_cnt must be 1 or more',
          ]
        },
      },
      dataModel: { alert_rule_id:0, name:'', score:0, resource_name: '', tag:'', finding_cnt:0, updated_at:'' },
      table: {
        selected: [],
        search: '',
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: true, value: 'alert_rule_id' },
          { text: 'Name', align: 'start', sortable: true, value: 'name' },
          { text: 'Score', align: 'center', sortable: true, value: 'score' },
          { text: 'Resource Name', align: 'start', sortable: true, value: 'resource_name' },
          { text: 'Tag', align: 'start', sortable: true, value: 'tag' },
          { text: 'Finding Count', align: 'center', sortable: true, value: 'finding_cnt' },
          // { text: 'Updated', align: 'center', sortable: true, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_rule_id'] },
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
    this.tagList()
    this.refleshList()
  },
  methods: {
    // list
    async tagList() {
      // TODO: distinct tag from tag API(new API).
      const res = await this.$axios.get(
        '/finding/list-finding-tag/?finding_id=1001&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.tag ) {
        this.form.tag.list = []
        return false
      }
      list.data.tag.forEach( async tag => {
        this.form.tag.list.push(tag.tag)
      })
      this.loading = false
    },
    async refleshList() {
      const res = await this.$axios.get(
        '/alert/list-rule/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.alert_rule ) {
        this.clearList()
        return false
      }
      this.table.items = list.data.alert_rule
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
          alert_rule_id: this.dataModel.alert_rule_id,
      }
      await this.$axios.post('/alert/delete-rule/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Delete.')
    },

    // put
    async putItem() {
      const param = { 
        project_id: this.$store.state.project.project_id,
        alert_rule: {
          project_id: this.$store.state.project.project_id,
          alert_rule_id: this.dataModel.alert_rule_id,
          name: this.dataModel.name,
          score: this.dataModel.score,
          resource_name: this.dataModel.resource_name,
          tag: this.dataModel.tag,
          finding_cnt: Number(this.dataModel.finding_cnt),
        },
      }
      await this.$axios.post('/alert/put-rule/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      var msg = 'Success: Updated alert rule.'
      if (this.form.new) {
        msg = 'Success: Created new alert rule.'
      }
      this.finishSuccess(msg)
    },

    handleNewItem() {
      this.dataModel = { alert_rule_id:0, name:'', score:0, resource_name: '', tag:'', finding_cnt:0, updated_at:'' }
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
