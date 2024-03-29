<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="orange">mdi-aws</v-icon>
              {{ $t(`submenu['AWS']`) }}
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
            class="mr-4"
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
            color="primary-darken-3"
            size="large"
            density="compact"
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
                item-key="aws_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3" size="48px">
                    <v-icon color="orange-darken-1" size="36px">mdi-aws</v-icon>
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

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <v-icon large color="orange-darken-1">mdi-aws</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['AWS']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="awsForm.valid" ref="form">
            <v-text-field
              v-model="awsModel.aws_id"
              :label="$t(`item['` + awsForm.aws_id.label + `']`)"
              :placeholder="awsForm.aws_id.placeholder"
              disabled
            ></v-text-field>
            <v-text-field
              v-model="awsModel.name"
              :counter="200"
              :rules="awsForm.name.validator"
              :label="$t(`item['` + awsForm.name.label + `']`) + ' *'"
              :placeholder="awsForm.name.placeholder"
              required
            ></v-text-field>
            <template v-if="awsForm.newAWS">
              <v-text-field
                v-model="awsModel.aws_account_id"
                :counter="12"
                :rules="awsForm.aws_account_id.validator"
                :label="
                  $t(`item['` + awsForm.aws_account_id.label + `']`) + ' *'
                "
                :placeholder="awsForm.aws_account_id.placeholder"
                required
              ></v-text-field>
            </template>
            <template v-else>
              <v-text-field
                v-model="awsModel.aws_account_id"
                :counter="12"
                :rules="awsForm.aws_account_id.validator"
                :label="
                  $t(`item['` + awsForm.aws_account_id.label + `']`) + ' *'
                "
                :placeholder="awsForm.aws_account_id.placeholder"
                disabled
              ></v-text-field>
            </template>

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
                <template v-if="awsForm.newAWS">{{
                  $t(`btn['REGIST']`)
                }}</template>
                <template v-else>{{ $t(`btn['SAVE']`) }}</template>
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
              {{ awsModel.aws_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['AWS ID']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ awsModel.name }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Name']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-aws">
            <v-list-item-title>
              {{ awsModel.aws_account_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['AWS Account ID']`)
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
import mixin from '@/mixin'
import aws from '@/mixin/api/aws'
import project from '@/mixin/api/project'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ProjectTag from '@/component/widget/tag/ProjectTag.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'AWSAccount',
  mixins: [mixin, aws, project],
  components: {
    BottomSnackBar,
    ProjectTag,
    VDataTable,
  },
  data() {
    return {
      loading: false,
      awsForm: {
        newAWS: false,
        valid: false,
        aws_id: { label: 'ID', placeholder: '-' },
        name: {
          label: 'Name',
          placeholder: 'something',
          validator: [
            (v) => !!v || 'Name is required',
            (v) =>
              !v || v.length <= 200 || 'Name must be less than 200 characters',
          ],
        },
        aws_account_id: {
          label: 'AWS Account ID',
          placeholder: '123456789012',
          validator: [
            (v) => !!v || 'AWS Account ID is required',
            (v) =>
              !v || v.length === 12 || 'AWS Account ID must be 12 characters',
            (v) =>
              !v ||
              !this.awsForm.newAWS ||
              this.isNewAccountID(v) ||
              'AWS Account ID is already exist.',
          ],
        },
      },
      awsModel: { aws_id: '', name: '', aws_account_id: '', updated_at: '' },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 5, sortBy: ['aws_id'] },
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
          sortable: false,
          key: 'aws_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["AccountID"]'),
          align: 'start',
          sortable: false,
          key: 'aws_account_id',
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
    this.loading = true
    this.refleshList('')
  },
  methods: {
    async refleshList() {
      const aws = await this.listAWSAPI().catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      if (!aws) {
        this.clearList()
        return false
      }
      this.table.items = aws
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem(awsID) {
      await this.deleteAWSAPI(awsID).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Delete.')
    },
    async putItem() {
      await this.putAWSAPI(
        this.awsModel.name,
        this.awsModel.aws_account_id
      ).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      let msg = 'Success: Updated AWS.'
      if (this.awsForm.newAWS) {
        msg = 'Success: Created new AWS.'
      }
      this.finish(msg)
    },
    isNewAccountID(accountID) {
      let isNew = true
      this.table.items.some((item) => {
        if (item.aws_account_id == accountID) {
          isNew = false
          return
        }
      })
      return isNew
    },
    handleRowClick(event, aws) {
      this.$router.push('/aws/data-source?aws_id=' + aws.item.value.aws_id)
    },
    handleNewItem() {
      this.awsModel = {
        aws_id: '',
        name: '',
        aws_account_id: '',
        updated_at: '',
      }
      this.awsForm.newAWS = true
      this.editDialog = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.awsForm.newAWS = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      await this.putItem()
      await this.tagProjectAPI(
        'aws:' + this.awsModel.aws_account_id,
        'orange-darken-1'
      )
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.untagProjectAPI('aws:' + this.awsModel.aws_account_id)
      await this.deleteItem(this.awsModel.aws_id)
    },
    assignDataModel(item) {
      this.awsModel = {}
      this.awsModel = Object.assign(this.awsModel, item.value)
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
