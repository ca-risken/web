<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="red-lighten-2"
                >mdi-alert</v-icon
              >
              {{ $t(`submenu['Rule']`) }}
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
                locale="ja-jp"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :items-per-page-text="table.footer.itemsPerPageText"
                :showCurrentPage="table.footer.showCurrentPage"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="alert_rule_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]>
                  <v-avatar icon class="ma-1" size="48px">
                    <v-icon size="x-large" color="brown-darken-2"
                      >mdi-book-open-variant</v-icon
                    >
                  </v-avatar>
                </template>
                <template v-slot:[`item.resource_name`]="{ item }">
                  <template v-if="item.value.resource_name">
                    <v-chip label
                      ><v-icon left>mdi-file-find-outline</v-icon
                      >{{ cutString(item.value.resource_name) }}</v-chip
                    >
                  </template>
                  <template v-else>-</template>
                </template>
                <template v-slot:[`item.tag`]="{ item }">
                  <template v-if="item.value.tag">
                    <v-chip label
                      ><v-icon left>mdi-label</v-icon
                      >{{ cutString(item.value.tag) }}</v-chip
                    >
                  </template>
                  <template v-else>-</template>
                </template>
                <template v-slot:[`item.score`]="{ item }">
                  <v-chip
                    variant="flat"
                    :color="getColorByScore(item.value.score)"
                    >{{ item.value.score || 0.0 }}</v-chip
                  >
                </template>
                <template v-slot:[`item.finding_cnt`]="{ item }">
                  <v-chip
                    variant="flat"
                    :color="getColorByCount(item.value.finding_cnt)"
                    dark
                    >{{ item.value.finding_cnt }}</v-chip
                  >
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
                        :title="$t(`action['` + action.text + `']`)"
                      />
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="editDialog" max-width="50%">
      <v-card>
        <v-card-title>
          <v-icon large class="pr-2" color="red-lighten-2">mdi-alert</v-icon>
          <span class="mx-4 text-h5">{{ $t(`submenu['Rule']`) }}</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.alert_rule_id"
              :label="$t(`item['` + form.alert_rule_id.label + `']`)"
              :placeholder="form.alert_rule_id.placeholder"
              variant="outlined"
              disabled
            ></v-text-field>
            <v-text-field
              v-model="dataModel.name"
              :counter="200"
              :rules="form.name.validator"
              :label="$t(`item['` + form.name.label + `']`) + ' *'"
              :placeholder="form.name.placeholder"
              variant="outlined"
              required
            ></v-text-field>
            <v-combobox
              v-model="dataModel.resource_name"
              :loading="loading"
              :counter="255"
              :rules="form.resource_name.validator"
              :label="$t(`item['` + form.resource_name.label + `']`)"
              :placeholder="form.resource_name.placeholder"
              :items="resourceNameCombobox"
              @keydown="listResourceNameForCombobox"
              persistent-hint
              variant="outlined"
              required
              ref="resourceComboBox"
            />

            <v-combobox
              variant="outlined"
              clearable
              small-chips
              :label="$t(`item['` + form.tag.label + `']`)"
              :placeholder="form.tag.placeholder"
              :items="form.tag.list"
              item-text="tag"
              item-value="finding_tag_id"
              v-model="dataModel.tag"
              ref="tagComboBox"
            />
            <v-text-field
              v-model="dataModel.finding_cnt"
              :rules="form.finding_cnt.validator"
              :label="$t(`item['` + form.finding_cnt.label + `']`)"
              :placeholder="form.finding_cnt.placeholder"
              type="number"
              variant="outlined"
              required
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
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  :rules="form.score.validator"
                  :label="$t(`item['` + form.score.label + `']`)"
                  :messages="form.score.placeholder"
                  thumb-label="always"
                  thumb-color="red"
                  variant="outlined"
                ></v-slider>
              </v-col>
            </v-row>
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
                <template v-if="form.new">{{ $t(`btn['REGIST']`) }}</template>
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
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item prepend-icon="mdi-identifier">
            <v-list-item-title>
              {{ dataModel.alert_rule_id }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Alert Rule ID']`)
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-box">
            <v-list-item-title>
              {{ dataModel.name }}
            </v-list-item-title>
            <v-list-item-subtitle>{{
              $t(`item['Name']`)
            }}</v-list-item-subtitle>
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
import alert from '@/mixin/api/alert'
import finding from '@/mixin/api/finding'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  name: 'AlertRule',
  mixins: [mixin, alert, finding],
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
        alert_rule_id: { label: 'ID', placeholder: '-' },
        name: {
          label: 'Name',
          placeholder: 'something',
          validator: [
            (v) => !!v || 'Name is required',
            (v) => v.length <= 200 || 'Name must be less than 200 characters',
          ],
        },
        score: {
          label: 'Score',
          placeholder: 'Select score ( 0.0 ~ 1.0 )',
          validator: [
            (v) =>
              !v ||
              (0.0 <= v && v <= 1.0) ||
              'Score is must between 0.0 and 1.0',
          ],
        },
        resource_name: {
          label: 'Resource Name',
          placeholder: 'resource pattern (Partial Match)',
          validator: [
            (v) =>
              !v ||
              v.length <= 255 ||
              'Resource Name must be less than 255 characters',
          ],
        },
        tag: {
          label: 'Tag',
          placeholder: 'tag-name',
          list: [],
          validator: [
            (v) =>
              !v || v.length <= 64 || 'Tag must be less than 64 characters',
          ],
        },
        finding_cnt: {
          label: 'Finding Count',
          placeholder: '1',
          validator: [
            (v) => !!v || 'Finding Count is required',
            (v) => !v || 1 <= v || 'finding_cnt must be 1 or more',
          ],
        },
      },
      dataModel: {
        alert_rule_id: 0,
        name: '',
        score: 0.0,
        resource_name: '',
        tag: '',
        finding_cnt: 0,
        updated_at: '',
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_rule_id'] },
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
          sortable: true,
          key: 'alert_rule_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Resource Name"]'),
          align: 'start',
          sortable: true,
          key: 'resource_name',
        },
        {
          title: this.$i18n.t('item["Tag"]'),
          align: 'start',
          sortable: true,
          key: 'tag',
        },
        {
          title: this.$i18n.t('item["Finding Count"]'),
          align: 'center',
          sortable: true,
          key: 'finding_cnt',
        },
        {
          title: this.$i18n.t('item["Score"]'),
          align: 'center',
          sortable: true,
          key: 'score',
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
    this.listResourceNameForCombobox()
    this.tagList()
    this.refleshList()
  },
  methods: {
    // list
    async tagList() {
      this.loading = true
      this.form.tag.list = []
      const tags = await this.listFindingTagName().catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      tags.forEach(async (tag) => {
        this.form.tag.list.push(tag)
      })
      this.loading = false
    },
    async refleshList() {
      this.loading = true
      this.table.items = []
      const alert_rule = await this.listAlertRule().catch((err) => {
        this.clearList()
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.table.items = alert_rule
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },

    // delete
    async deleteItem() {
      await this.deleteAlertRule(this.dataModel.alert_rule_id).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Delete.')
    },

    // put
    async putItem() {
      const param = {
        project_id: this.getCurrentProjectID(),
        alert_rule: {
          project_id: this.getCurrentProjectID(),
          alert_rule_id: this.dataModel.alert_rule_id,
          name: this.dataModel.name,
          score: this.dataModel.score,
          resource_name: this.dataModel.resource_name,
          tag: this.dataModel.tag,
          finding_cnt: Number(this.dataModel.finding_cnt),
        },
      }
      await this.putAlertRule(param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      let msg = 'Success: Updated alert rule.'
      if (this.form.new) {
        msg = 'Success: Created new alert rule.'
      }
      this.finishSuccess(msg)
    },

    // handler
    handleNewItem() {
      this.dataModel = {
        alert_rule_id: 0,
        name: '',
        score: 0.6,
        resource_name: '',
        tag: '',
        finding_cnt: 1,
        updated_at: '',
      }
      this.form.new = true
      this.editDialog = true
    },
    handleRowClick(event, rules) {
      this.handleEditItem(rules.item)
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.form.new = false
      this.editDialog = true
    },
    handleEditSubmit() {
      this.$refs.resourceComboBox.blur()
      this.$refs.tagComboBox.blur()
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      this.$nextTick(() => {
        this.putItem()
      })
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    handleDeleteSubmit() {
      this.loading = true
      this.deleteItem()
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
        this.refleshList()
      }
    },
  },
}
</script>
