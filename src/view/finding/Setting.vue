<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue-lighten-2"
                >mdi-file-find-outline</v-icon
              >
              {{ $t(`submenu['Setting']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense justify="center" align-content="center">
        <v-col cols="6">
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
        <v-col cols="3">
          <v-checkbox
            required
            density="compact"
            v-model="table.activeOnly"
            :label="$t(`view.finding['Active Only']`)"
            @update:modelValue="handleRefleshList"
          ></v-checkbox>
        </v-col>
        <v-spacer />
        <v-btn
          class="mt-3 mr-4"
          color="primary-darken-3"
          size="large"
          density="compact"
          @click="handleNewItem"
          icon="mdi-new-box"
        />
      </v-row>
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
                item-key="alert_id"
                @click:row="handleClickItem"
              >
                <template v-slot:[`item.status`]="{ item }">
                  <v-icon
                    v-if="getAlertStatusText(item.value.status) == 'ACTIVE'"
                    color="success"
                    >mdi-check-circle</v-icon
                  >
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:[`item.score_coefficient`]="{ item }">
                  <v-chip
                    class="ma-2"
                    :color="getCoefficientColor(item.value.score_coefficient)"
                    variant="outlined"
                  >
                    <v-icon left> mdi-calculator </v-icon>
                    x {{ item.value.score_coefficient }}
                  </v-chip>
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
                        v-for="action in getActionList(item)"
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
          <v-icon large class="pr-2" color="blue-lighten-2"
            >mdi-file-find-outline</v-icon
          >
          <span class="mx-4 text-h5">{{ $t(`submenu['Setting']`) }}</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.finding_setting_id"
              :label="$t(`item['` + form.finding_setting_id.label + `']`)"
              :placeholder="form.finding_setting_id.placeholder"
              variant="outlined"
              filled
              disabled
            ></v-text-field>
            <v-combobox
              v-if="form.new"
              v-model="dataModel.resource_name"
              :loading="loading"
              :counter="255"
              :rules="form.resource_name.validator"
              :label="$t(`item['` + form.resource_name.label + `']`) + ' *'"
              :placeholder="form.resource_name.placeholder"
              :items="resourceNameCombobox"
              @keydown="listResourceNameForCombobox"
              persistent-hint
              variant="outlined"
              clearable
            />
            <v-text-field
              v-if="!form.new"
              v-model="dataModel.resource_name"
              :label="$t(`item['` + form.resource_name.label + `']`)"
              :placeholder="form.resource_name.placeholder"
              variant="outlined"
              filled
              disabled
            ></v-text-field>
            <v-text-field
              v-model.number="dataModel.score_coefficient"
              :counter="3"
              :rules="form.score_coefficient.validator"
              :label="$t(`item['` + form.score_coefficient.label + `']`) + ' *'"
              :placeholder="form.score_coefficient.placeholder"
              variant="outlined"
              required
            ></v-text-field>
            <v-alert dense outlined type="info">
              {{
                $t(
                  "view.finding['If you set a `Score Coefficient`, the score will be ']"
                )
              }}
              <strong>{{ $t("view.finding['recalculated']") }}</strong>
              {{
                $t(
                  "view.finding[' against the Resource Name Base Score. The score can be adjusted according to the actual risk of each resource.']"
                )
              }}
            </v-alert>
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
                <template v-if="form.new">Regist</template>
                <template v-else>{{ $t(`btn['EDIT']`) }}</template>
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="text-h5">
          <span class="mx-4">{{
            $t(`message['Do you really want to delete this?']`)
          }}</span>
        </v-card-title>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-identifier">
            <v-list-item-title>
              {{ dataModel.finding_setting_id }}
            </v-list-item-title>
            <v-list-item-subtitle>Finding Setting ID</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ dataModel.resource_name }}
            </v-list-item-title>
            <v-list-item-subtitle>Resource Name</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-calculator">
            <v-list-item-title>
              {{ dataModel.score_coefficient }}
            </v-list-item-title>
            <v-list-item-subtitle>Score Coefficient</v-list-item-subtitle>
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
import finding from '@/mixin/api/finding'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'FindingSetting',
  mixins: [mixin, finding],
  components: {
    BottomSnackBar,
    VDataTable,
  },
  data() {
    return {
      loading: false,
      form: {
        new: false,
        valid: false,
        finding_setting_id: { label: 'ID', placeholder: '-' },
        resource_name: {
          label: 'Resource Name',
          placeholder: 'name',
          validator: [
            (v) => !!v || 'Resource Name is required',
            (v) =>
              !v ||
              v.length <= 255 ||
              'Resource Name must be less than 255 characters',
          ],
        },
        score_coefficient: {
          label: 'Score Coefficient',
          placeholder: '1.5',
          validator: [
            (v) => !!v || 'Score Coefficient is required',
            (v) =>
              !v ||
              (-1 <= v && v <= 100) ||
              'Score Coefficient must be between -1 and 100',
          ],
        },
        resourceNameList: [],
        typing: false,
      },
      dataModel: {
        finding_setting_id: 0,
        resource_name: '',
        status: 0,
        setting: '',
        score_coefficient: 1,
        updated_at: 0,
        created_at: 0,
      },
      table: {
        selected: [],
        search: '',
        activeOnly: true,
        options: { page: 1, itemsPerPage: 10, sortBy: ['finding_setting_id'] },
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [ {value: 10, title: '10'}],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      editDialog: false,
      deleteDialog: false,
    }
  },
  computed: {
    headers() {
      return [
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          key: 'finding_setting_id',
        },
        {
          title: this.$i18n.t('item["Status"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          key: 'status',
        },
        {
          title: this.$i18n.t('item["Resource Name"]'),
          align: 'start',
          width: '50%',
          sortable: true,
          key: 'resource_name',
        },
        {
          title: this.$i18n.t('item["Score Coefficient"]'),
          align: 'start',
          width: '10%',
          sortable: true,
          key: 'score_coefficient',
        },
        {
          title: this.$i18n.t('item["Updated"]'),
          align: 'center',
          width: '10%',
          sortable: true,
          key: 'updated_at',
        },
        {
          title: this.$i18n.t('item["Action"]'),
          align: 'center',
          width: '10%',
          sortable: false,
          key: 'action',
        },
      ]
    },
  },
  async mounted() {
    this.listResourceNameForCombobox()
    await this.handleRefleshList()
  },
  methods: {
    // list
    async listFindingSetting() {
      this.table.items = []
      let statusParam = ''
      if (this.table.activeOnly) {
        statusParam = '&status=' + this.getFindingSettingStatus('ACTIVE')
      }
      const list = await this.listFindingSettingAPI(statusParam)
      list.forEach(async (item) => {
        let coefficient = '-'
        const settingJSON = JSON.parse(item.setting)
        if (settingJSON && settingJSON.score_coefficient) {
          coefficient = settingJSON.score_coefficient
        }
        this.table.items.push({
          finding_setting_id: item.finding_setting_id,
          resource_name: item.resource_name,
          status: item.status,
          setting: item.setting,
          score_coefficient: coefficient,
          updated_at: item.updated_at,
        })
      })
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    getActionList(item) {
      let list = [
        { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
      ]
      if (!item.value.status) {
        list.push({
          text: 'Activate',
          icon: 'mdi-check-circle-outline',
          click: this.handleActivateItem,
        })
      } else if (
        this.getFindingSettingStatusText(item.value.status) == 'ACTIVE'
      ) {
        list.push({
          text: 'Deactivate',
          icon: 'mdi-cancel',
          click: this.handleDeactivateItem,
        })
      }
      list.push({
        text: 'Delete Item',
        icon: 'mdi-trash-can-outline',
        click: this.handleDeleteItem,
      })
      return list
    },
    getCoefficientColor(coefficient) {
      if (!coefficient) return 'grey'
      if (coefficient > 1.0) return 'green'
      if (coefficient < 1.0) return 'blue'
      return 'grey' // 1.0
    },

    // Update
    async putFindingSetting() {
      const param = {
        project_id: this.getCurrentProjectID(),
        finding_setting: {
          project_id: this.getCurrentProjectID(),
          resource_name: this.dataModel.resource_name,
          setting: JSON.stringify({
            score_coefficient: parseFloat(this.dataModel.score_coefficient),
          }),
          status: Number(this.getFindingSettingStatus('ACTIVE')),
        },
      }
      await this.putFindingSettingAPI(param).catch((err) => {
        this.finishError(err)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Updated setting.')
    },
    // Delete
    async deleteFindingSetting() {
      await this.deleteFindingSettingAPI(
        this.dataModel.finding_setting_id
      ).catch((err) => {
        this.finishError(err)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Deleted setting.')
    },

    // Activate/Deactivate
    async putFindingSettingStatus(status) {
      const param = {
        project_id: this.getCurrentProjectID(),
        finding_setting: {
          project_id: this.getCurrentProjectID(),
          resource_name: this.dataModel.resource_name,
          setting: this.dataModel.setting,
          status: Number(this.getFindingSettingStatus(status)),
        },
      }
      await this.putFindingSettingAPI(param).catch((err) => {
        this.finishError(err)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Updated status.')
    },

    // handler
    handleRefleshList() {
      this.loading = true
      this.listFindingSetting()
    },
    handleNewItem() {
      this.dataModel = {}
      this.form.new = true
      this.editDialog = true
    },
    handleClickItem(event, settings) {
      this.handleEditItem(settings.item)
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.form.new = false
      this.editDialog = true
    },
    handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      this.putFindingSetting()
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    handleDeleteSubmit() {
      this.loading = true
      this.deleteFindingSetting()
    },
    handleDeactivateItem(item) {
      this.loading = true
      this.assignDataModel(item)
      this.putFindingSettingStatus('DEACTIVE')
    },
    handleActivateItem(item) {
      this.loading = true
      this.assignDataModel(item)
      this.putFindingSettingStatus('ACTIVE')
    },
    assignDataModel(item) {
      this.dataModel = {}
      this.dataModel = Object.assign(this.dataModel, item.value)
    },

    // finish process
    async finishSuccess(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
      this.finish(true)
    },
    async finishError(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyError(msg)
      this.finish(false)
    },
    async finish(reflesh) {
      this.loading = false
      this.editDialog = false
      this.deleteDialog = false
      if (reflesh) {
        this.listFindingSetting()
      }
    },
  },
}
</script>
