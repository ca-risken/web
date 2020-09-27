<template>
  <div class="list-table">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar color="white" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon class="pr-2">mdi-account-multiple</v-icon>
              Policy
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row>
          <v-col cols="12" sm="4" md="4">
            <v-combobox
              outlined dense clearable
              :label="searchForm.policyName.label"
              :placeholder="searchForm.policyName.placeholder"
              :items="policyNameList"
              v-model="searchModel.policyName"
            />
          </v-col>

          <v-spacer />
          <v-btn class="mt-3 mr-4" fab @click="handleSearch">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn class="mt-3 mr-4" color="primary darken-3" dark fab  @click="handleNewItem">
            <v-icon x-large>mdi-new-box</v-icon>
          </v-btn>
        </v-row>
      </v-form>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                :headers="table.headers"
                :items="table.items"
                :options.sync="table.options"
                :server-items-length="table.total"
                :loading="table.loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="読込中"
                no-data-text="データがありません。"
                class="elevation-1"
                item-key="id"
                @click:row="handleEditItem"
                @update:page="loadList"
                v-model="table.selected"
              >
                <template v-slot:item.avator="">
                  <v-avatar class="ma-3">
                    <v-icon>mdi-certificate-outline</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:item.action_ptn="{ item }">
                  <v-card
                    label outliend
                    elevation="1"
                    color="red lighten-5"
                    class="mx-auto"
                  >
                    <v-card-text class="font-weight-bold">
                      {{ item.action_ptn }}
                    </v-card-text>
                  </v-card>
                </template>
                <template v-slot:item.resource_ptn="{ item }">
                  <v-card
                    label outliend
                    elevation="1"
                    color="red lighten-5"
                    class="mx-auto"
                  >
                    <v-card-text class="font-weight-bold">
                      {{ item.resource_ptn }}
                    </v-card-text>
                  </v-card>
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
        <v-card-title><span class="headline">Policy</span></v-card-title>
        <v-card-text>
          <v-form v-model="policyForm.valid" ref="form">
            <v-text-field
              v-model="policyModel.policy_id"
              :label="policyForm.policy_id.label"
              :placeholder="policyForm.policy_id.placeholder"
              filled disabled
            ></v-text-field>
            <template v-if="policyForm.newPolicy">
              <v-text-field
                v-model="policyModel.name"
                :counter="64"
                :rules="policyForm.name.validator"
                :label="policyForm.name.label"
                :placeholder="policyForm.name.placeholder"
                required
              ></v-text-field>
            </template>
            <template v-else>
              <v-text-field
                v-model="policyModel.name"
                :counter="64"
                :rules="policyForm.name.validator"
                :label="policyForm.name.label"
                :placeholder="policyForm.name.placeholder"
                filled disabled
              ></v-text-field>   
            </template>

            <v-text-field
              v-model="policyModel.action_ptn"
              :rules="policyForm.action_ptn.validator"
              :label="policyForm.action_ptn.label"
              :placeholder="policyForm.action_ptn.placeholder"
              required
            ></v-text-field>
            <v-text-field
              v-model="policyModel.resource_ptn"
              :rules="policyForm.resource_ptn.validator"
              :label="policyForm.resource_ptn.label"
              :placeholder="policyForm.resource_ptn.placeholder"
              required
            ></v-text-field>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn text outlined color="green darken-1" @click="putItem">
                <template v-if="policyForm.newPolicy">Regist</template>
                <template v-else>Edit</template>
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="deleteDialog"
      max-width="290px"
    >
      <v-card>
        <v-card-title class="headline">削除しますか?</v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar><v-icon>mdi-identifier</v-icon></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="policyModel.policy_id"></v-list-item-title>
              <v-list-item-subtitle>Policy ID</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-certificate-outline</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="policyModel.name"></v-list-item-title>
              <v-list-item-subtitle>Policy Name</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text outlined
            @click="deleteItem(policyModel.policy_id)"
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
      searchModel: {
        policyName: null,
      },
      searchForm: {
        policyName: { label: 'Policy Name', placeholder: 'Filter for policy name' },
      },
      policyForm: {
        newPolicy: false,
        valid: false,
        policy_id: { label: 'ID', placeholder: '-' },
        name: { label: 'Name *', placeholder: 'something-policy', validator:[
            v => !!v || 'Name is required',
            v => v.length <= 64 || 'Name must be less than 64 characters',
          ]
        },
        action_ptn: { label: 'Action Pattern *', placeholder: '`.*` for all aciotns', validator:[
            v => !!v || 'Action Pattern is required',
            v => this.compilableRegexp(v) || 'Action Pattern must be compilable regular expression',
          ]
        },
        resource_ptn: { label: 'Resource Pattern *', placeholder: '`.*` for all resources', validator:[
            v => !!v || 'Resource Pattern is required',
            v => this.compilableRegexp(v) || 'Resource Pattern must be compilable regular expression',
          ]
        },
      },
      policyNameList: [],
      policyModel: { policy_id:'', name:'', action_ptn:'', resource_ptn:'', updated_at:'' },
      search: '',
      table: {
        selected: [],
        headers: [
          { text: '', align: 'center', width: '10%', sortable: false, value: 'avator' },
          { text: 'ID',  align: 'start', sortable: false, value: 'policy_id' },
          { text: 'Name', align: 'start', sortable: false, value: 'name' },
          { text: 'Action Pattern', align: 'start', sortable: false, value: 'action_ptn' },
          { text: 'Resource Pattern', align: 'start', sortable: false, value: 'resource_ptn' },
          { text: 'Updated', align: 'center', sortable: false, value: 'updated_at' },
          { text: 'Action', align: 'center', sortable: false, value: 'action' }
        ],
        options: {
          page: 1,
          itemsPerPage: 20,
          sortBy: ['id'],
        },
        loading: false,
        actions: [
          { text: 'Edit Item',  icon: 'mdi-pencil', click: this.handleEditItem },
          { text: 'Delete Item', icon: 'mdi-trash-can-outline', click: this.handleDeleteItem },
        ],
        total: 0,
        footer: {
          disableItemsPerPage: true,
          itemsPerPageOptions: [20],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: []
      },
      policies: [],
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
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      const res = await this.$axios.get(
        '/iam/list-policy/?project_id=' + this.$store.state.project.project_id + searchCond
      ).catch((err) =>  {
        this.clearList()
        return Promise.reject(err)
      })
      const list = res.data
      if ( !list || !list.data || !list.data.policy_id ) {
        this.clearList()
        return false
      }
      this.table.total = list.data.policy_id.length
      this.policies = list.data.policy_id
      this.loadList()
    },
    async loadList() {
      this.table.loading = true
      var items = []
      var policyNames = []
      const from = (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.policies.slice(from, to)
      ids.forEach( async id => {
        const res = await this.$axios.get(
          '/iam/get-policy/?project_id='+ this.$store.state.project.project_id +'&policy_id=' + id
        ).catch((err) =>  {
          this.clearList()
          return Promise.reject(err)
        })
        items.push(res.data.data.policy)
        policyNames.push(res.data.data.policy.name)
      })
      this.table.items = items
      this.policyNameList = policyNames
      this.table.loading = false
    },
    clearList() {
      this.policies = []
      this.table.total = 0
      this.table.items = []
      this.policyNameList = []
    },
    async deleteItem(policyID) {
      const param = {
          project_id: this.$store.state.project.project_id,
          policy_id: policyID,
      }
      await this.$axios.post('/iam/delete-policy/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.$refs.snackbar.notifySuccess('Success: delete policy.')

      this.deleteDialog  = false
      this.handleSearch()
    },
    async putItem() {
      const param = { 
        project_id: this.$store.state.project.project_id,
        policy: {
          name: this.policyModel.name,
          project_id: this.$store.state.project.project_id,
          action_ptn: this.policyModel.action_ptn,
          resource_ptn: this.policyModel.resource_ptn,
        },
      }
      const res = await this.$axios.post('/iam/put-policy/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
console.log(res)
      this.$refs.snackbar.notifySuccess('Success: put policy.')

      this.editDialog  = false
      this.handleSearch()
    },
    compilableRegexp(ptn) {
      try {
        new RegExp(ptn)
      } catch(e) {
        console.log('Regexp complie error: ' + e )
        return false
      }
      return true
    },
    handleNewItem() {
      this.policyModel = { policy_id:'', name:'', action_ptn:'', resource_ptn:'', updated_at:'' }
      this.policyForm.newPolicy = true
      this.editDialog  = true
    },
    handleEditItem(item) {
      this.policyModel = Object.assign(this.policyModel, item)
      this.policyForm.newPolicy = false
      this.editDialog  = true
    },
    handleDeleteItem(item) {
      this.policyModel = Object.assign(this.policyModel, item)
      this.deleteDialog  = true
    },
    handleSearch() {
      var searchCond = ''
      if (this.searchModel.policyName) {
        searchCond += '&name=' + this.searchModel.policyName
      }
      this.refleshList(searchCond)
    },
  }
}
</script>
