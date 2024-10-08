<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col>
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon size="large" color="blue-darken-1"
                >mdi-microsoft-azure</v-icon
              >
              {{ $t(`submenu['Azure']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              bg-color="white"
              prepend-icon="mdi-magnify"
              placeholder="Type something..."
              v-model="table.search"
              hide-details
              class="hidden-sm-and-down"
            />
          </v-col>

          <v-spacer />
          <v-btn
            variant="outlined"
            class="mr-4 mt-1"
            color="blue-darken-1"
            @click="handleNewProjectTag"
          >
            {{ $t(`btn['TAG']`) }}
          </v-btn>
          <project-tag
            :tagDialog="projectTagDialog"
            @projectTagCancel="projectTagDialog = false"
            @projectTagUpdated="handleProjectTagUpdated"
          />

          <v-btn
            class="mr-4"
            size="large"
            density="compact"
            color="primary-darken-3"
            @click="handleNewItem"
            icon="mdi-new-box"
          />
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
                :headers="headers"
                :items="table.items"
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
                item-key="azure_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3" size="48px">
                    <v-icon
                      color="blue-darken-1"
                      size="x-large"
                      icon="mdi-microsoft-azure"
                    ></v-icon>
                  </v-avatar>
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

    <v-dialog v-model="editDialog" max-width="56%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue-darken-1">mdi-microsoft-azure</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['Azure']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="azureForm.valid" ref="form">
            <v-row class="mt-1">
              <v-col cols="1">
                <clip-board
                  class="pt-4 pl-6"
                  :name="$t(`item['` + azureForm.azure_id.label + `']`)"
                  :text="String(azureModel.azure_id)"
                  size="x-large"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-model="azureModel.azure_id"
                  :label="$t(`item['` + azureForm.azure_id.label + `']`)"
                  :placeholder="azureForm.azure_id.placeholder"
                  variant="outlined"
                  filled
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row class="mt-1">
              <v-col cols="1">
                <clip-board
                  class="pt-4 pl-6"
                  :name="$t(`item['` + azureForm.name.label + `']`)"
                  :text="String(azureModel.name)"
                  size="x-large"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-model="azureModel.name"
                  :counter="200"
                  :rules="azureForm.name.validator"
                  :label="$t(`item['` + azureForm.name.label + `']`) + ' *'"
                  :placeholder="azureForm.name.placeholder"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row class="mt-1">
              <v-col cols="1">
                <clip-board
                  class="pt-4 pl-6"
                  :name="$t(`item['` + azureForm.subscription_id.label + `']`)"
                  :text="String(azureModel.subscription_id)"
                  size="x-large"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-model="azureModel.subscription_id"
                  :counter="128"
                  :rules="azureForm.subscription_id.validator"
                  :label="
                    $t(`item['` + azureForm.subscription_id.label + `']`) + ' *'
                  "
                  :placeholder="azureForm.subscription_id.placeholder"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row class="mt-1">
              <v-col cols="1">
                <clip-board
                  class="pt-4 pl-6"
                  :name="
                    $t(`item['` + azureForm.verification_code.label + `']`)
                  "
                  :text="String(azureModel.verification_code)"
                  size="x-large"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-if="azureForm.verification_code.visible"
                  v-model="azureModel.verification_code"
                  :counter="128"
                  :rules="azureForm.verification_code.validator"
                  :label="
                    $t(`item['` + azureForm.verification_code.label + `']`) +
                    ' *'
                  "
                  :placeholder="azureForm.verification_code.placeholder"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense class="my-0">
              <v-col cols="1" />
              <v-col cols="11">
                <v-btn
                  variant="text"
                  color="purple-darken-2"
                  @click="handleGenerateCode"
                >
                  {{ $t(`btn['AUTO GENERATE VERIFICATION CODE']`) }}
                </v-btn>
                <v-alert variant="outlined" type="info">
                  <p class="text-subtitle-2">
                    {{
                      $t(
                        `view.azure['Register the verification code in the tag of your Azure subscrption with the key \`risken\`.']`
                      )
                    }}
                  </p>
                </v-alert>
              </v-col>
            </v-row>

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
                @click="handleEditSubmit"
              >
                <template v-if="azureForm.newAzure">
                  {{ $t(`btn['REGIST']`) }}
                </template>
                <template v-else>
                  {{ $t(`btn['SAVE']`) }}
                </template>
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="text-h5">
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-identifier">
            <v-list-item-title>
              {{ azureModel.azure_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Azure ID']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ azureModel.name }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Name']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-microsoft-azure">
            <v-list-item-title>
              {{ azureModel.subscription_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Subscription ID']`)
            }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="deleteDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red-darken-1"
            variant="outlined"
            :loading="loading"
            @click="handleDeleteSubmit"
          >
            {{ $t(`btn['DELETE']`) }}
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
import project from '@/mixin/api/project'
import azure from '@/mixin/api/azure'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ProjectTag from '@/component/widget/tag/ProjectTag.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'AzureProject',
  mixins: [mixin, project, azure],
  components: {
    BottomSnackBar,
    ClipBoard,
    ProjectTag,
    VDataTable,
  },
  data() {
    return {
      loading: false,
      azureForm: {
        newAzure: false,
        valid: false,
        azure_id: { label: 'ID', placeholder: '-' },
        name: {
          label: 'Name',
          placeholder: 'something',
          validator: [
            (v) => !!v || 'Name is required',
            (v) =>
              !v || v.length <= 200 || 'Name must be less than 200 characters',
          ],
        },
        subscription_id: {
          label: 'Subscription ID',
          placeholder: 'your-project',
          validator: [
            (v) => !!v || 'Subscription ID is required',
            (v) =>
              !v ||
              v.length <= 128 ||
              'Subscription ID must be less than 128 characters',
          ],
        },
        verification_code: {
          label: 'Verification Code',
          placeholder: '',
          validator: [
            (v) => !!v || 'Verification Code is required',
            (v) =>
              !v ||
              (8 <= v.length && v.length <= 128) ||
              'Verification Code must be between 8 and 128 characters',
          ],
          visible: true,
        },
      },
      azureModel: {
        azure_id: '',
        name: '',
        subscription_id: '',
        verification_code: '',
        updated_at: '',
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 5, sortBy: ['azure_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteItem,
          },
        ],
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
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
          sortable: true,
          key: 'azure_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Subscription ID"]'),
          align: 'start',
          sortable: true,
          key: 'subscription_id',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: true,
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
    this.loading = true
    this.refleshList('')
  },
  methods: {
    async refleshList() {
      const azure = await this.listAzureAPI().catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      if (!azure) {
        this.clearList()
        return false
      }
      this.table.items = azure
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem(azureID) {
      await this.deleteAzureAPI(azureID).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Delete.')
    },
    async putItem() {
      const param = {
        project_id: this.getCurrentProjectID(),
        azure: {
          project_id: this.getCurrentProjectID(),
          name: this.azureModel.name,
          subscription_id: this.azureModel.subscription_id,
          verification_code: this.azureModel.verification_code,
        },
      }
      await this.putAzureAPI(param).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      let msg = 'Success: Updated Azure.'
      if (this.azureForm.newAzure) {
        msg = 'Success: Created new Azure.'
      }
      this.finish(msg)
    },

    isNewAzureProjectID(pjID) {
      let isNew = true
      this.table.items.some((item) => {
        if (item.subscription_id == pjID) {
          isNew = false
          return true
        }
      })
      return isNew
    },

    handleGenerateCode() {
      this.azureModel.verification_code = Util.generateVerificationCode()
      // v-modelの値を更新してもうまくレンダリングされない時があるため、v-ifを切り替えて強制的にレンダリングさせる
      this.azureForm.verification_code.visible = false
      this.azureForm.verification_code.visible = true
    },
    handleRowClick(event, azure) {
      this.$router.push(
        '/azure/azure-data-source?azure_id=' + azure.item.value.azure_id
      )
    },
    handleNewItem() {
      ;(this.azureModel = {
        azure_id: '',
        name: '',
        subscription_id: '',
        verification_code: '',
        updated_at: '',
      }),
        (this.azureForm.newAzure = true)
      this.editDialog = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.azureForm.newAzure = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      await this.putItem()
      await this.tagProjectAPI(
        'azure:' + this.azureModel.subscription_id,
        'light-blue-darken-1'
      )
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.untagProjectAPI('azure:' + this.azureModel.subscription_id)
      await this.deleteItem(this.azureModel.azure_id)
    },
    assignDataModel(item) {
      this.azureModel = {}
      this.azureModel = Object.assign(this.azureModel, item.value)
    },

    async finish(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
      this.editDialog = false
      this.deleteDialog = false
      this.refleshList()
    },
  },
}
</script>
