<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-certificate-outline</v-icon>
              {{ $t(`submenu['Policy']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>

      <search-toolbar
        v-model="searchModel"
        :loading="loading"
        :name-field-items="policyNameList"
        name-field-key="policyName"
        :show-id-field="false"
        :show-create-button="true"
        button-size="large"
        create-button-icon="mdi-new-box"
        create-button-color="primary-darken-3"
        :search-form-config="{
          nameField: searchForm.policyName,
        }"
        @search="handleSearch"
        @create="handleNewItem"
      />

      <data-table
        :table-data="tableData"
        :loading="loading"
        :headers="headers"
        :actions="table.actions"
        item-key="policy_id"
        @update-options="updateOptions"
      >
        <template v-slot:[`item.avator`]>
          <v-avatar class="ma-3" size="48px">
            <v-icon size="x-large">mdi-certificate-outline</v-icon>
          </v-avatar>
        </template>
        <template v-slot:[`item.action_ptn`]="{ item }">
          <v-card label elevation="1" color="teal-lighten-5" class="mx-auto">
            <v-card-text class="font-weight-bold">
              {{ item.value.action_ptn }}
            </v-card-text>
          </v-card>
        </template>
        <template v-slot:[`item.updated_at`]="{ item }">
          <v-chip>{{ formatTime(item.value.updated_at) }}</v-chip>
        </template>
      </data-table>
    </v-container>

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <v-icon large>mdi-certificate-outline</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['Policy']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="policyForm.valid" ref="form">
            <v-text-field
              v-model="policyModel.policy_id"
              :label="$t(`item['` + policyForm.policy_id.label + `']`)"
              :placeholder="policyForm.policy_id.placeholder"
              disabled
            ></v-text-field>
            <template v-if="policyForm.newPolicy">
              <v-text-field
                v-model="policyModel.name"
                :counter="64"
                :rules="policyForm.name.validator"
                :label="$t(`item['` + policyForm.name.label + `']`) + ' *'"
                :placeholder="policyForm.name.placeholder"
                required
              ></v-text-field>
            </template>
            <template v-else>
              <v-text-field
                v-model="policyModel.name"
                :counter="64"
                :rules="policyForm.name.validator"
                :label="$t(`item['` + policyForm.name.label + `']`)"
                :placeholder="policyForm.name.placeholder"
                disabled
              ></v-text-field>
            </template>

            <v-text-field
              v-model="policyModel.action_ptn"
              :rules="policyForm.action_ptn.validator"
              :label="$t(`item['` + policyForm.action_ptn.label + `']`) + ' *'"
              :placeholder="policyForm.action_ptn.placeholder"
              required
            ></v-text-field>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn
                variant="outlined"
                color="grey-darken-1"
                @click="editDialog = false"
              >
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                variant="outlined"
                color="green-darken-1"
                :loading="loading"
                @click="putItem"
              >
                <template v-if="policyForm.newPolicy">Regist</template>
                <template v-else>Edit</template>
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <delete-dialog
      v-model="deleteDialog"
      :title="$t(`message['Do you really want to delete this?']`)"
      :item-data="{ id: policyModel.policy_id, name: policyModel.name }"
      item-icon="mdi-certificate-outline"
      :loading="loading"
      @confirm="deleteItem(policyModel.policy_id)"
      @cancel="deleteDialog = false"
    />

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import organization_iam from '@/mixin/api/organization_iam'
import organization_base from '@/mixin/util/organization_base'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import DeleteDialog from '@/component/dialog/DeleteDialog.vue'
import SearchToolbar from '@/component/widget/toolbar/SearchToolbar.vue'
import DataTable from '@/component/widget/table/DataTable.vue'

export default {
  name: 'OrganizationPolicy',
  mixins: [mixin, organization_iam, organization_base],
  components: {
    BottomSnackBar,
    DeleteDialog,
    SearchToolbar,
    DataTable,
  },
  data() {
    return {
      loading: false,
      searchModel: { policyName: null },
      searchForm: {
        policyName: {
          label: 'Policy Name',
          placeholder: 'Filter for policy name',
        },
      },
      policyForm: {
        newPolicy: false,
        valid: false,
        policy_id: { label: 'ID', placeholder: '-' },
        name: {
          label: 'Name',
          placeholder: 'something-policy',
          validator: [
            (v) => !!v || 'Name is required',
            (v) => v.length <= 64 || 'Name must be less than 64 characters',
          ],
        },
        action_ptn: {
          label: 'Action Pattern',
          placeholder: '`.*` for all aciotns',
          validator: [
            (v) => !!v || 'Action Pattern is required',
            (v) =>
              this.compilableRegexp(v) ||
              'Action Pattern must be compilable regular expression',
          ],
        },
      },
      policyNameList: [],
      policyModel: {
        policy_id: '',
        name: '',
        action_ptn: '',
        updated_at: '',
      },
      table: {
        options: {
          page: 1,
          itemsPerPage: 10,
          sortBy: ['policy_id'],
        },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteItem,
          },
        ],
        total: 0,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      policies: [],
      deleteDialog: false,
      editDialog: false,
    }
  },
  computed: {
    tableData() {
      return {
        items: this.table.items,
        total: this.table.total,
        options: this.table.options,
        footer: this.table.footer,
      }
    },
    headers() {
      return [
        {
          title: this.$i18n.t('item[""]'),
          align: 'center',
          width: '10%',
          sortable: false,
          key: 'avator',
        },
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: false,
          key: 'policy_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Action Pattern"]'),
          align: 'start',
          sortable: false,
          key: 'action_ptn',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: false,
          key: 'updated_at',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          key: 'action',
        },
      ]
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(searchCond) {
      const policies = await this.listOrganizationPolicyAPI(searchCond).catch(
        (err) => {
          this.clearList()
          return Promise.reject(err)
        }
      )
      this.table.total = policies.length
      this.policies = policies
      this.loadList()
    },
    async loadList() {
      this.loading = true
      let items = []
      let policyNames = []
      await Promise.all(
        this.policies.map(async (id) => {
          const policy = await this.getOrganizationPolicyAPI(id).catch(
            (err) => {
              this.clearList()
              return Promise.reject(err)
            }
          )
          items.push(policy)
          policyNames.push(policy.name)
        })
      )
      this.table.items = items
      this.policyNameList = policyNames
      this.loading = false
    },
    clearList() {
      this.policies = []
      this.table.total = 0
      this.table.items = []
      this.policyNameList = []
    },
    async deleteItem(policyID) {
      await this.deleteOrganizationPolicyAPI(policyID).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.$refs.snackbar.notifySuccess('Success: Deleting policy.')
      this.deleteDialog = false
      this.handleSearch()
    },
    async putItem() {
      const param = {
        policy_id: this.policyModel.policy_id,
        name: this.policyModel.name,
        action_ptn: this.policyModel.action_ptn,
      }
      await this.putOrganizationPolicyAPI(param).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.$refs.snackbar.notifySuccess('Success: Updated policy.')
      this.editDialog = false
      this.handleSearch()
    },
    compilableRegexp(ptn) {
      try {
        new RegExp(ptn)
      } catch (e) {
        console.log('Regexp complie error: ' + e)
        return false
      }
      return true
    },
    handleNewItem() {
      this.policyModel = {
        policy_id: '',
        name: '',
        action_ptn: '',
        updated_at: '',
      }
      this.policyForm.newPolicy = true
      this.editDialog = true
    },
    handleRowClick(event, policies) {
      this.handleEditItem(policies.item)
    },
    handleEditItem(item) {
      this.assignDataModel(item.value)
      this.policyForm.newPolicy = false
      this.editDialog = true
    },
    handleDeleteItem(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true
    },
    handleSearch() {
      let searchCond = ''
      if (this.searchModel.policyName) {
        searchCond += '&name=' + this.searchModel.policyName
      }
      this.refleshList(searchCond)
    },
    assignDataModel(item) {
      this.policyModel = {
        policy_id: '',
        name: '',
        action_ptn: '',
        updated_at: '',
      }
      this.policyModel = Object.assign(this.policyModel, item)
    },
    updateOptions(options) {
      this.table.options = options
    },
  },
}
</script>
