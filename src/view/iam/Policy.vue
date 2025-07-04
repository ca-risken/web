<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-account-multiple</v-icon>
              {{ $t(`submenu['Policy']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
            <v-combobox
              variant="outlined"
              clearable
              density="compact"
              bg-color="white"
              :label="$t(`item['` + searchForm.policyName.label + `']`)"
              :placeholder="searchForm.policyName.placeholder"
              :items="policyNameList"
              v-model="searchModel.policyName"
            />
          </v-col>

          <v-spacer />
          <v-btn
            class="mt-3 mr-4"
            size="large"
            density="compact"
            :loading="loading"
            @click="handleSearch"
            icon="mdi-magnify"
          />
          <v-btn
            class="mt-3 mr-4"
            color="primary-darken-3"
            size="large"
            density="compact"
            @click="handleNewItem"
            icon="mdi-new-box"
          />
        </v-row>
      </v-form>
      <v-row dense>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                :headers="headers"
                :items="table.items"
                :server-items-length="table.total"
                :loading="loading"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :items-per-page-text="table.footer.itemsPerPageText"
                :showCurrentPage="table.footer.showCurrentPage"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="policy_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3" size="48px">
                    <v-icon size="x-large">mdi-certificate-outline</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.action_ptn`]="{ item }">
                  <v-card
                    label
                    elevation="1"
                    color="teal-lighten-5"
                    class="mx-auto"
                  >
                    <v-card-text class="font-weight-bold">
                      {{ item.value.action_ptn }}
                    </v-card-text>
                  </v-card>
                </template>
                <template v-slot:[`item.resource_ptn`]="{ item }">
                  <v-card
                    label
                    elevation="1"
                    color="light-green-lighten-5"
                    class="mx-auto"
                  >
                    <v-card-text class="font-weight-bold">
                      {{ item.value.resource_ptn }}
                    </v-card-text>
                  </v-card>
                </template>
                <template v-slot:[`item.updated_at`]="{ item }">
                  <v-chip>{{ formatTime(item.value.updated_at) }}</v-chip>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-dots-vertical"></v-icon>
                    </template>
                    <v-list class="pa-0" dense>
                      <v-list-item
                        v-for="action in table.actions"
                        :key="action.text"
                        @click="action.click(item)"
                        :prepend-icon="action.icon"
                      >
                        <v-list-item-title>{{
                          $t(`action['` + action.text + `']`)
                        }}</v-list-item-title>
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
            <v-text-field
              v-model="policyModel.resource_ptn"
              :rules="policyForm.resource_ptn.validator"
              :label="
                $t(`item['` + policyForm.resource_ptn.label + `']`) + ' *'
              "
              :placeholder="policyForm.resource_ptn.placeholder"
              disabled
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
import iam from '@/mixin/api/iam'
import organization_iam from '../../mixin/api/organization_iam'
import organization_base from '../../mixin/util/organization_base'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import DeleteDialog from '@/component/dialog/DeleteDialog.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'PolicyList',
  mixins: [mixin, iam, organization_iam, organization_base],
  components: {
    BottomSnackBar,
    DeleteDialog,
    VDataTable,
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
        resource_ptn: {
          label: 'Resource Pattern',
          placeholder: '`.*` for all resources',
          validator: [
            (v) => !!v || 'Resource Pattern is required',
            (v) =>
              this.compilableRegexp(v) ||
              'Resource Pattern must be compilable regular expression',
          ],
        },
      },
      policyNameList: [],
      policyModel: {
        policy_id: '',
        name: '',
        action_ptn: '',
        resource_ptn: '.*', // fixed
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
          title: this.$i18n.t('item["Resource Pattern"]'),
          align: 'start',
          sortable: false,
          key: 'resource_ptn',
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
  watch: {
    '$route.query.organization_id'() {
      if (this.isOrganizationMode) {
        this.editDialog = false
        this.deleteDialog = false
        this.refleshList('')
      }
    },
  },
  methods: {
    async refleshList(searchCond) {
      let policies
      if (this.isOrganizationMode) {
        policies = await this.listOrganizationPolicyAPI(searchCond).catch(
          (err) => {
            this.clearList()
            return Promise.reject(err)
          }
        )
      } else {
        policies = await this.listPolicyAPI(searchCond).catch((err) => {
          this.clearList()
          return Promise.reject(err)
        })
      }
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
          let policy
          if (this.isOrganizationMode) {
            policy = await this.getOrganizationPolicyAPI(id).catch((err) => {
              this.clearList()
              return Promise.reject(err)
            })
          } else {
            policy = await this.getPolicyAPI(id).catch((err) => {
              this.clearList()
              return Promise.reject(err)
            })
          }
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
      if (this.isOrganizationMode) {
        await this.deleteOrganizationPolicyAPI(policyID).catch((err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        })
      } else {
        await this.deletePolicyAPI(policyID).catch((err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        })
      }
      this.$refs.snackbar.notifySuccess('Success: Deleting policy.')
      this.deleteDialog = false
      this.handleSearch()
    },
    async putItem() {
      let param
      if (this.isOrganizationMode) {
        param = {
          organization_id: this.getCurrentOrganizationID(),
          policy: {
            name: this.policyModel.name,
            organization_id: this.getCurrentOrganizationID(),
            action_ptn: this.policyModel.action_ptn,
            resource_ptn: '.*', //this.policyModel.resource_ptn,
          },
        }
        await this.putOrganizationPolicyAPI(param).catch((err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        })
      } else {
        param = {
          project_id: this.getCurrentProjectID(),
          policy: {
            name: this.policyModel.name,
            project_id: this.getCurrentProjectID(),
            action_ptn: this.policyModel.action_ptn,
            resource_ptn: '.*', //this.policyModel.resource_ptn,
          },
        }
        await this.putPolicyAPI(param).catch((err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        })
      }
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
        resource_ptn: '.*',
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
        resource_ptn: '.*',
        updated_at: '',
      }
      this.policyModel = Object.assign(this.policyModel, item)
    },
  },
}
</script>
