<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="red lighten-2"
                >mdi-alert</v-icon
              >
              {{ $t(`submenu['Condition']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="6">
            <v-text-field
              outlined
              clearable
              dense
              background-color="white"
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
              v-model="table.enabledOnly"
              :label="$t(`view.alert['Enabled Only']`)"
              @change="searchCondition"
            ></v-checkbox>
          </v-col>
          <v-spacer />

          <v-btn
            class="mt-3 mr-4"
            color="primary darken-3"
            fab
            dense
            small
            @click="handleNewItem"
          >
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
                :headers="headers"
                :items="table.items"
                :options.sync="table.options"
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="alert_condition_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar icon class="ma-1">
                    <v-icon large class="pr-2" color="darken-2">mdi-cog</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.enabled`]="{ item }">
                  <v-icon v-if="item.enabled == true" color="success"
                    >mdi-check-circle</v-icon
                  >
                  <v-icon v-else color="grey">mdi-cancel</v-icon>
                </template>
                <template v-slot:[`item.severity`]="{ item }">
                  <v-chip
                    class="ma-1"
                    dark
                    :color="getSeverityColor(item.severity)"
                    >{{ item.severity }}</v-chip
                  >
                </template>
                <template v-slot:[`item.and_or`]="{ item }">
                  <template v-if="item.and_or == 'and'">
                    <v-icon left color="teal lighten-2">mdi-set-center</v-icon
                    >AND
                  </template>
                  <template v-else>
                    <v-icon left color="teal lighten-2">mdi-set-all</v-icon> OR
                  </template>
                </template>
                <template v-slot:[`item.action`]="{ item }">
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
                        @click="action.click(item)"
                      >
                        <v-list-item-icon class="mr-2">
                          <v-icon small>{{ action.icon }}</v-icon>
                        </v-list-item-icon>
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

    <v-dialog v-model="editDialog" max-width="65%">
      <v-card>
        <!-- Alert Condition -->
        <v-card-title>
          <v-icon large class="pr-2" color="grey darken-2">mdi-cog</v-icon>
          <span class="mx-4 headline"
            >{{ $t(`submenu['Alert']`) }} {{ $t(`submenu['Condition']`) }}</span
          >
          <v-chip dark label color="primary darken-3">
            <v-icon left>mdi-identifier</v-icon>
            {{ dataModel.alert_condition_id }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-row>
              <v-col cols="10">
                <v-text-field
                  v-model="dataModel.description"
                  :counter="200"
                  :rules="form.description.validator"
                  :label="$t(`item['` + form.description.label + `']`) + ' *'"
                  :placeholder="form.description.placeholder"
                  outlined
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-combobox
                  outlined
                  required
                  v-model="dataModel.severity"
                  :rules="form.severity.validator"
                  :label="$t(`item['` + form.severity.label + `']`) + ' *'"
                  :placeholder="form.severity.placeholder"
                  :items="form.severity.list"
                />
              </v-col>
              <v-col cols="4">
                <v-combobox
                  outlined
                  required
                  v-model="dataModel.and_or"
                  :rules="form.and_or.validator"
                  :label="$t(`item['` + form.and_or.label + `']`) + ' *'"
                  :placeholder="form.and_or.placeholder"
                  :items="form.and_or.list"
                />
              </v-col>
              <v-col cols="3">
                <v-checkbox
                  required
                  v-model="dataModel.enabled"
                  :rules="form.enabled.validator"
                  :label="$t(`item['` + form.enabled.label + `']`) + ' *'"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-divider class="mt-3 mb-3"></v-divider>
          </v-form>
        </v-card-text>

        <!-- Alert Rule -->
        <v-card-title>
          <v-icon large color="brown darken-2">mdi-book-open-variant</v-icon>
          <span class="mx-4 headline"
            >{{ $t(`submenu['Alert']`) }} {{ $t(`submenu['Rule']`) }}</span
          >
          <v-chip outliend class="mx-4" v-if="dataModel.and_or == 'and'">
            <v-icon left color="teal lighten-2">mdi-set-center</v-icon>
            AND
          </v-chip>
          <v-chip outliend class="mx-4" v-else>
            <v-icon left color="teal lighten-2">mdi-set-all</v-icon>
            OR
          </v-chip>
          <v-spacer />
          <v-btn text outlined link to="/alert/rule/">
            {{ $t(`btn['CREATE NEW RULE']`) }}
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- Rule List -->
          <v-toolbar flat color="white">
            <v-text-field
              text
              solo
              flat
              prepend-icon="mdi-magnify"
              placeholder="Type something"
              v-model="ruleTable.search"
              hide-details
              class="hidden-sm-and-down"
            />
            <v-btn icon>
              <v-icon>mdi-filter</v-icon>
            </v-btn>
          </v-toolbar>
          <v-divider></v-divider>

          <v-data-table
            v-model="ruleTable.selected"
            :search="ruleTable.search"
            :headers="ruleHeaders"
            :footer-props="ruleTable.footer"
            :items="ruleTable.items"
            :options.sync="ruleTable.options"
            :loading="loading"
            locale="ja-jp"
            loading-text="Loading..."
            no-data-text="No data."
            class="elevation-1"
            item-key="alert_rule_id"
            show-select
          >
            <template v-slot:[`item.resource_name`]="{ item }">
              <template v-if="item.resource_name">
                <v-chip label
                  ><v-icon left>mdi-file-find-outline</v-icon
                  >{{ item.resource_name | cutString }}</v-chip
                >
              </template>
              <template v-else>-</template>
            </template>
            <template v-slot:[`item.tag`]="{ item }">
              <template v-if="item.tag">
                <v-chip label
                  ><v-icon left>mdi-label</v-icon
                  >{{ item.tag | cutString }}</v-chip
                >
              </template>
              <template v-else>-</template>
            </template>
            <template v-slot:[`item.score`]="{ item }">
              <v-chip :color="getColorByScore(item.score)" dark>{{
                item.score
              }}</v-chip>
            </template>
            <template v-slot:[`item.finding_cnt`]="{ item }">
              <v-chip :color="getColorByCount(item.finding_cnt)" dark>{{
                item.finding_cnt
              }}</v-chip>
            </template>
          </v-data-table>
          <v-divider class="mt-3 mb-3"></v-divider>
        </v-card-text>

        <!-- Alert Notification -->
        <v-card-title>
          <v-icon large color="brown darken-2">mdi-email</v-icon>
          <span class="mx-4 headline"
            >{{ $t(`submenu['Alert']`) }}
            {{ $t(`submenu['Notification']`) }}</span
          >
          <v-spacer />
          <v-btn text outlined link to="/alert/notification/">
            {{ $t(`btn['CREATE NEW NOTIFICATION']`) }}
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- Notification List -->
          <v-container class="pb-0 mb-0">
            <v-row>
              <v-col cols="4">
                <v-combobox
                  outlined
                  required
                  dense
                  v-model="dataModel.noti_cache"
                  :rules="form.noti_cache.validator"
                  :label="$t(`item['` + form.noti_cache.label + `']`) + ' *'"
                  :placeholder="form.noti_cache.placeholder"
                  :items="form.noti_cache.list"
                />
              </v-col>
              <v-col cols="8">
                <v-alert
                  dense
                  border="left"
                  colored-border
                  type="info"
                  elevation="2"
                  v-if="Number(dataModel.next_noti_time) > Number(nowUnix)"
                >
                  {{ $t(`view.alert['The next notification will be after']`) }}
                  <strong>{{ dataModel.next_noti_time | formatTime }}</strong> .
                </v-alert>
              </v-col>
            </v-row>
          </v-container>
          <v-toolbar flat color="white">
            <v-text-field
              text
              solo
              flat
              prepend-icon="mdi-magnify"
              placeholder="Type something"
              v-model="notiTable.search"
              hide-details
              class="hidden-sm-and-down"
            />
            <v-btn icon>
              <v-icon>mdi-filter</v-icon>
            </v-btn>
          </v-toolbar>
          <v-divider></v-divider>

          <v-data-table
            v-model="notiTable.selected"
            :search="notiTable.search"
            :headers="notiHeaders"
            :footer-props="notiTable.footer"
            :items="notiTable.items"
            :options.sync="notiTable.options"
            :loading="loading"
            locale="ja-jp"
            loading-text="Loading..."
            no-data-text="No data."
            class="elevation-1"
            item-key="notification_id"
            show-select
          >
          </v-data-table>
          <v-divider class="mt-3 mb-3"></v-divider>
        </v-card-text>

        <v-card-text>
          <v-alert dense outlined type="info" v-if="!form.new">
            {{
              $t(
                "view.alert['If you want to check the alert rule conditions, you can use the ANALYZE button to see the related findings.']"
              )
            }}
            {{
              $t("view.alert['Running ANALYZE will move to the alert screen.']")
            }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="pb-12">
          <v-btn
            v-if="!form.new"
            text
            outlined
            color="red darken-1"
            @click="handleAnalyze()"
          >
            ANALYZE
          </v-btn>
          <v-spacer />
          <v-btn
            text
            outlined
            color="grey darken-1"
            @click="editDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            text
            outlined
            color="green darken-1"
            :loading="loading"
            @click="handleEditSubmit"
          >
            <template v-if="form.new">{{ $t(`btn['REGIST']`) }}</template>
            <template v-else>{{ $t(`btn['EDIT']`) }}</template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar
              ><v-icon>mdi-identifier</v-icon></v-list-item-avatar
            >
            <v-list-item-content>
              <v-list-item-title
                v-text="dataModel.alert_condition_id"
              ></v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Alert Condition ID']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                v-text="dataModel.description"
              ></v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Description']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            outlined
            color="grey darken-1"
            @click="deleteDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            outlined
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
import alert from '@/mixin/api/alert'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  mixins: [mixin, alert],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      form: {
        new: false,
        valid: false,
        alert_condition_id: { label: 'ID', placeholder: '-' },
        description: {
          label: 'Description',
          placeholder: 'description',
          validator: [
            (v) => !!v || 'Description is required',
            (v) => v.length <= 200 || 'Name must be less than 200 characters',
          ],
        },
        severity: {
          label: 'Severity',
          placeholder: 'high',
          list: ['high', 'medium', 'low'],
          validator: [
            (v) => !!v || 'Severity is required',
            (v) =>
              !v ||
              v === 'high' ||
              v === 'medium' ||
              v === 'low' ||
              'Severity is invalid',
          ],
        },
        and_or: {
          label: 'And Or',
          placeholder: 'and',
          list: ['and', 'or'],
          validator: [
            (v) => !!v || 'AND/OR is required',
            (v) => !v || v === 'and' || v === 'or' || 'AND/OR is invalid',
          ],
        },
        noti_cache: {
          label: 'Notification cache term',
          placeholder: '1 hour',
          list: ['No Cache', '1 hour', '1 day', '1 week', '1 month'],
          validator: [
            (v) => !!v || 'Notification cache term is required',
            (v) =>
              !v ||
              v === 'No Cache' ||
              v === '1 hour' ||
              v === '1 day' ||
              v === '1 week' ||
              v === '1 month' ||
              'Notification cache term is invalid',
          ],
        },
        enabled: { label: 'Enabled', placeholder: 'true' },
      },
      nowUnix: Math.floor(new Date().getTime() / 1000),
      dataModel: {
        alert_condition_id: 0,
        description: '',
        severity: '',
        and_or: 'and',
        noti_cache: '1 hour',
        next_noti_time: -1,
        enabled: false,
        rules: [],
        notifications: [],
        updated_at: '',
      },
      table: {
        selected: [],
        search: '',
        enabledOnly: true,
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_condition_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteItem,
          },
          {
            text: 'Analyze Alert',
            icon: 'mdi-magnify-scan',
            click: this.handleAnalyze,
          },
        ],
        footer: {
          disableItemsPerPage: false,
          itemsPerPageOptions: [20, 50, 100],
          itemsPerPageText: 'Rows/Page',
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      ruleTable: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_rule_id'] },
        total: 0,
        footer: {
          disableItemsPerPage: false,
          itemsPerPageOptions: [10, 20, 50],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      notiTable: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 10, sortBy: ['alert_rule_id'] },
        total: 0,
        footer: {
          disableItemsPerPage: false,
          itemsPerPageOptions: [10, 20, 50],
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
          text: this.$i18n.t('item[""]'),
          align: 'center',
          width: '5%',
          sortable: false,
          value: 'avator',
        },
        {
          text: this.$i18n.t('item["Enabled"]'),
          align: 'start',
          sortable: true,
          value: 'enabled',
        },
        {
          text: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          value: 'alert_condition_id',
        },
        {
          text: this.$i18n.t('item["Description"]'),
          align: 'start',
          sortable: true,
          value: 'description',
        },
        {
          text: this.$i18n.t('item["Severity"]'),
          align: 'center',
          sortable: true,
          value: 'severity',
        },
        {
          text: this.$i18n.t('item["And Or"]'),
          align: 'start',
          sortable: true,
          value: 'and_or',
        },
        {
          text: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          value: 'action',
        },
      ]
    },
    ruleHeaders() {
      return [
        {
          text: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          value: 'alert_rule_id',
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          value: 'name',
        },
        {
          text: this.$i18n.t('item["Resource Name"]'),
          align: 'start',
          sortable: true,
          value: 'resource_name',
        },
        {
          text: this.$i18n.t('item["Tag"]'),
          align: 'start',
          sortable: true,
          value: 'tag',
        },
        {
          text: this.$i18n.t('item["Finding Count"]'),
          align: 'center',
          sortable: true,
          value: 'finding_cnt',
        },
        {
          text: this.$i18n.t('item["Score"]'),
          align: 'center',
          sortable: true,
          value: 'score',
        },
      ]
    },
    notiHeaders() {
      return [
        {
          text: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: true,
          value: 'notification_id',
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          value: 'name',
        },
        {
          text: this.$i18n.t('item["Type"]'),
          align: 'start',
          sortable: true,
          value: 'type',
        },
      ]
    },
  },
  mounted() {
    this.handleSearchList()
  },
  methods: {
    // List Condition
    async searchCondition() {
      this.clearList()
      const alert_condition = await this.listAlertCondition(
        this.table.enabledOnly
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      alert_condition.forEach(async (cond) => {
        const item = {
          alert_condition_id: cond.alert_condition_id,
          description: cond.description,
          severity: cond.severity,
          and_or: cond.and_or,
          enabled: cond.enabled,
          updated_at: cond.updated_at,
        }
        this.table.items.push(item)
      })
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },

    // Delete Condition
    async deleteItem() {
      await this.deleteAlertCondition(this.dataModel.alert_condition_id).catch(
        (err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        }
      )
      this.finishSuccess('Success: Delete.')
    },

    // Put Condition
    async putItem() {
      const param = {
        project_id: this.$store.state.project.project_id,
        alert_condition: {
          project_id: this.$store.state.project.project_id,
          alert_condition_id: this.dataModel.alert_condition_id,
          description: this.dataModel.description,
          severity: this.dataModel.severity,
          and_or: this.dataModel.and_or,
          enabled: this.dataModel.enabled,
        },
      }
      const res = await this.putAlertCondition(param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      if (res) {
        // update `alert_condition_id` for NEW condition data
        this.dataModel.alert_condition_id = res.alert_condition_id
      }
    },

    // List Rule
    async listRule() {
      this.clearRuleList()
      const alert_rule = await this.listAlertRule().catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      let rules = []
      if (this.dataModel.alert_condition_id != 0) {
        rules = await this.listAlertConditionRule(
          this.dataModel.alert_condition_id
        )
      }
      this.dataModel.rules = rules.map((item) => item.alert_rule_id)
      alert_rule.forEach(async (rule) => {
        this.ruleTable.items.push(rule)
        if (this.dataModel.rules.indexOf(rule.alert_rule_id) !== -1) {
          this.ruleTable.selected.push(rule)
        }
      })
      this.loading = false
    },
    clearRuleList() {
      this.ruleTable.selected = []
      this.ruleTable.items = []
    },

    // Put Rules
    async putRule() {
      this.ruleTable.items.forEach(async (item) => {
        // Set param for delete request.
        let uri = '/alert/delete-condition_rule/'
        let param = {
          project_id: this.$store.state.project.project_id,
          alert_condition_id: this.dataModel.alert_condition_id,
          alert_rule_id: item.alert_rule_id,
        }
        this.ruleTable.selected.some((selected) => {
          if (item.alert_rule_id === selected.alert_rule_id) {
            // If the rule is selected, change to param for put request.
            uri = '/alert/put-condition_rule/'
            param = {
              project_id: this.$store.state.project.project_id,
              alert_cond_rule: {
                project_id: this.$store.state.project.project_id,
                alert_condition_id: this.dataModel.alert_condition_id,
                alert_rule_id: item.alert_rule_id,
              },
            }
            return true
          }
        })
        await this.$axios.post(uri, param).catch((err) => {
          this.finishError(err)
          return Promise.reject(err)
        })
      })
    },

    // List Notifications
    async listNotification() {
      this.clearNotiList()
      const notification = await this.listAlertNotification().catch((err) => {
        return Promise.reject(err)
      })
      let notis = []
      if (this.dataModel.alert_condition_id != 0) {
        notis = await this.listAlertConditionNotification(
          this.dataModel.alert_condition_id
        )
      }
      this.dataModel.notifications = notis.map((item) => item.notification_id)
      let noti_cache = ''
      if (notis[0] && notis[0].cache_second) {
        noti_cache = this.getNotiCacheText(notis[0].cache_second)
      }
      if (noti_cache == '') {
        noti_cache = '1 hour'
      }
      let next_noti_time = -1
      if (
        notis[0] &&
        Util.isNumber(notis[0].cache_second) &&
        Util.isNumber(notis[0].notified_at)
      ) {
        next_noti_time =
          Number(notis[0].notified_at) + Number(notis[0].cache_second)
      }
      this.dataModel.noti_cache = noti_cache
      this.dataModel.next_noti_time = next_noti_time

      notification.forEach(async (noti) => {
        this.notiTable.items.push(noti)
        if (this.dataModel.notifications.indexOf(noti.notification_id) !== -1) {
          this.notiTable.selected.push(noti)
        }
      })
      this.loading = false
    },
    clearNotiList() {
      this.notiTable.selected = []
      this.notiTable.items = []
    },

    // Put Notifications
    async putNotification() {
      this.notiTable.items.forEach(async (item) => {
        // Set param for delete request.
        let uri = '/alert/delete-condition_notification/'
        let param = {
          project_id: this.$store.state.project.project_id,
          alert_condition_id: this.dataModel.alert_condition_id,
          notification_id: item.notification_id,
        }
        this.notiTable.selected.some((selected) => {
          if (item.notification_id === selected.notification_id) {
            // If the rule is selected, change to param for put request.
            uri = '/alert/put-condition_notification/'
            param = {
              project_id: this.$store.state.project.project_id,
              alert_cond_notification: {
                project_id: this.$store.state.project.project_id,
                alert_condition_id: this.dataModel.alert_condition_id,
                notification_id: item.notification_id,
                cache_second: this.getNotiCacheSecound(
                  this.dataModel.noti_cache
                ),
                notified_at: 0,
              },
            }
            return true
          }
        })
        await this.$axios.post(uri, param).catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      })
    },

    // Analyze Alert
    async analyze(alertConditionID) {
      if (alertConditionID == '') {
        this.finishError('AlertConditionID must be required.')
        return
      }
      await this.analyzeAlert(alertConditionID).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishAnalyze(
        'Analyze Started: You will be redirected to the alert result soon...'
      )
    },

    // handler
    handleSearchList() {
      this.loading = true
      this.searchCondition()
    },
    async handleNewItem() {
      this.dataModel = {
        alert_condition_id: 0,
        description: '',
        severity: 'medium',
        and_or: 'and',
        noti_cache: '1 hour',
        enabled: true,
        rules: [],
        notifications: [],
        updated_at: '',
      }
      await this.listRule()
      await this.listNotification()
      this.form.new = true
      this.editDialog = true
    },
    handleRowClick(item) {
      this.handleEditItem(item)
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.listRule()
      this.listNotification()
      this.form.new = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      await this.putItem()
      await this.putRule()
      await this.putNotification()
      this.finishSuccess('Success: Put alert condition.')
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    handleDeleteSubmit() {
      this.loading = true
      this.deleteItem()
    },
    handleAnalyze(item) {
      this.loading = true
      let alertConditionID = ''
      if (!item) {
        alertConditionID = this.dataModel.alert_condition_id
      } else if (item.alert_condition_id) {
        alertConditionID = item.alert_condition_id
      }
      this.analyze(alertConditionID)
    },
    assignDataModel(item) {
      this.dataModel = {}
      this.dataModel = Object.assign(this.dataModel, item)
    },

    // Notification Cache
    getNotiCacheText(sec) {
      switch (sec) {
        case 1:
          return 'No Cache'
        case 60 * 60:
          return '1 hour'
        case 60 * 60 * 24:
          return '1 day'
        case 60 * 60 * 24 * 7:
          return '1 week'
        case 60 * 60 * 24 * 7 * 30:
          return '1 month'
        default:
          return ''
      }
    },
    getNotiCacheSecound(text) {
      switch (text) {
        case 'No Cache':
          return 1
        case '1 hour':
          return 60 * 60
        case '1 day':
          return 60 * 60 * 24
        case '1 week':
          return 60 * 60 * 24 * 7
        case '1 month':
          return 60 * 60 * 24 * 7 * 30
        default:
          return 60 * 60
      }
    },

    // finish process
    async finishAnalyze(msg) {
      this.$refs.snackbar.notifyInfo(msg)
      await new Promise((resolve) => setTimeout(resolve, 750))
      this.$router.push('/alert/alert/')
    },
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
      this.ruleDialog = false
      this.notiDialog = false
      if (reflesh) {
        this.searchCondition()
      }
    },
  },
}
</script>
