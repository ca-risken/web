<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large color="green" icon="md:http"></v-icon>
              {{ $t(`submenu['OSINT']`) }}
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
                item-key="osint_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar class="ma-3" size="48px">
                    <v-icon color="green" size="36px" icon="md:http"></v-icon>
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
          <v-icon large color="green">http</v-icon>
          <span class="mx-4 text-h5">
            {{ $t(`submenu['OSINT']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.osint_id"
              :label="$t(`item['` + form.osint_id.label + `']`)"
              :placeholder="form.osint_id.placeholder"
              variant="outlined"
              filled
              disabled
            ></v-text-field>
            <v-combobox
              v-model="dataModel.resource_type"
              :rules="form.resource_type.validator"
              :label="$t(`item['` + form.resource_type.label + `']`) + ' *'"
              :placeholder="form.resource_type.placeholder"
              :items="form.resource_type.list"
              variant="outlined"
              required
              clearable
            />
            <v-text-field
              v-model="dataModel.resource_name"
              :counter="200"
              :rules="form.resource_name.validator"
              :label="$t(`item['` + form.resource_name.label + `']`) + ' *'"
              :placeholder="form.resource_name.placeholder"
              variant="outlined"
              required
            ></v-text-field>
            <v-checkbox
              v-model="ActivateDataSource"
              variant="outlined"
              :label="$t(`view.osint['Activate DataSource']`)"
            ></v-checkbox>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                variant="outlined"
                color="grey-darken-1"
                @click="editDialog = false"
              >
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                text
                variant="outlined"
                color="green-darken-1"
                :loading="loading"
                @click="handleEditSubmit"
              >
                <template v-if="form.new">
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
              {{ dataModel.osint_id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['ID']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ dataModel.resource_type }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['ResourceType']`) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="md:http">
            <v-list-item-title>
              {{ dataModel.resource_name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t(`item['ResourceName']`) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="deleteDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red-darken-1"
            text
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
import project from '@/mixin/api/project'
import osint from '@/mixin/api/osint'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ProjectTag from '@/component/widget/tag/ProjectTag.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'OSINTTarget',
  mixins: [mixin, project, osint],
  components: {
    BottomSnackBar,
    ProjectTag,
    VDataTable,
  },
  data() {
    return {
      loading: false,
      form: {
        new: false,
        valid: false,
        osint_id: { label: 'ID', placeholder: '-' },
        resource_type: {
          label: 'ResourceType',
          placeholder: 'something',
          list: ['Domain', 'Website'],
          validator: [
            (v) => !!v || 'ResourceType is required',
            (v) =>
              !v ||
              v == 'Domain' ||
              v == 'Website' ||
              'ResourceType is not valid type',
          ],
        },
        resource_name: {
          label: 'ResourceName',
          placeholder: 'something',
          validator: [
            (v) => !!v || 'ResourceName is required',
            (v) =>
              !v ||
              v.length <= 200 ||
              'ResourceName must be less than 200 characters',
          ],
        },
      },
      dataModel: {
        osint_id: '',
        resource_type: '',
        resource_name: '',
        updated_at: '',
      },
      ActivateDataSource: true,
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 20, sortBy: ['osint_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteItem,
          },
        ],
        footer: {
          itemsPerPageOptions: [
            { value: 20, title: '20' },
            { value: 50, title: '50' },
            { value: 100, title: '100' },
          ],
          itemsPerPageText: 'Rows/Page',
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
          key: 'osint_id',
        },
        {
          title: this.$i18n.t('item["ResourceType"]'),
          align: 'start',
          sortable: false,
          key: 'resource_type',
        },
        {
          title: this.$i18n.t('item["ResourceName"]'),
          align: 'start',
          sortable: false,
          key: 'resource_name',
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
    this.displayList()
  },
  methods: {
    async displayList() {
      var isSuccess = true
      const list = await this.listOSINT(this.getCurrentProjectID()).catch(
        (err) => {
          this.finishError(err.response.data)
          this.clearList()
          isSuccess = false
          return
        }
      )
      if (!isSuccess || !list.osint) {
        this.clearList()
        return
      }
      this.table.items = list.osint
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem(osintID) {
      var isSuccess = true
      await this.deleteOSINT(this.getCurrentProjectID(), osintID).catch(
        (err) => {
          this.finishError(err.response.data)
          isSuccess = false
        }
      )
      if (!isSuccess) {
        return
      }
      this.finishSuccess('Success: Delete OSINT.')
    },
    async putItem() {
      const res = await this.putOSINT(
        this.getCurrentProjectID(),
        this.dataModel.osint_id,
        this.dataModel.resource_type,
        this.dataModel.resource_name
      )
      if (!this.ActivateDataSource || !res.osint) {
        return
      }
      await this.AttachReferenceDataSource(
        this.getCurrentProjectID(),
        res.osint.osint_id,
        this.dataModel.resource_type
      )
    },
    handleRowClick(event, osint) {
      this.$router.push(
        '/osint/data-source?osint_id=' + osint.item.value.osint_id
      )
    },
    handleNewItem() {
      this.dataModel = {
        osint_id: '',
        resource_type: '',
        resource_name: '',
        updated_at: '',
      }
      this.ActivateDataSource = true
      this.form.new = true
      this.editDialog = true
    },
    handleEditItem(item) {
      this.assignDataModel(item.value)
      this.ActivateDataSource = false
      this.form.new = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      var isSuccess = true
      await this.putItem().catch((err) => {
        this.finishError(err.response.data)
        isSuccess = false
      })
      if (!isSuccess) {
        return
      }
      await this.tagProjectAPI(
        this.dataModel.resource_type.toLowerCase() +
          ':' +
          this.dataModel.resource_name,
        'green-darken-1'
      ).catch((err) => {
        this.finishError(err.response.data)
        isSuccess = false
      })
      if (!isSuccess) {
        return
      }
      this.finishSuccess('Success: Updated OSINT.')
    },
    handleDeleteItem(item) {
      this.assignDataModel(item.value)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.untagProjectAPI(
        this.dataModel.resource_type.toLowerCase() +
          ':' +
          this.dataModel.resource_name
      )
      await this.deleteItem(this.dataModel.osint_id)
    },
    assignDataModel(item) {
      this.dataModel = {}
      this.dataModel = Object.assign(this.dataModel, item)
    },

    // finish
    async finishError(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyError(msg)
      this.finish()
    },
    async finishSuccess(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.finish()
    },
    async finish() {
      this.loading = false
      this.editDialog = false
      this.deleteDialog = false
      this.displayList()
    },
  },
}
</script>
