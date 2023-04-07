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
              {{ $t(`submenu['Notification']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
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

          <v-spacer />
          <v-btn
            class="mt-1 mr-4"
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
                item-key="notification_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar icon class="ma-1">
                    <v-icon large class="pr-2" color="brown darken-2"
                      >mdi-slack</v-icon
                    >
                  </v-avatar>
                </template>
                <template v-slot:[`item.updated_at`]="{ item }">
                  <v-chip>{{ item.updated_at | formatTime }}</v-chip>
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

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <v-icon large class="pr-2" color="red lighten-2">mdi-alert</v-icon>
          <span class="mx-4 headline">{{ $t(`submenu['Notification']`) }}</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.notification_id"
              :label="$t(`item['` + form.notification_id.label + `']`) + ' *'"
              :placeholder="form.notification_id.placeholder"
              outlined
              filled
              disabled
            ></v-text-field>
            <v-text-field
              v-model="dataModel.name"
              :counter="200"
              :rules="form.name.validator"
              :label="$t(`item['` + form.name.label + `']`) + ' *'"
              :placeholder="form.name.placeholder"
              outlined
              required
            ></v-text-field>
            <v-combobox
              outlined
              required
              clearable
              v-model="dataModel.type"
              :rules="form.type.validator"
              :label="$t(`item['` + form.type.label + `']`) + ' *'"
              :placeholder="form.type.placeholder"
              :items="form.type.list"
            />
            <v-text-field
              v-model="dataModel.webhook_url"
              :counter="200"
              :rules="form.webhook_url.validator"
              :label="$t(`item['` + form.webhook_url.label + `']`) + ' *'"
              :placeholder="form.webhook_url.placeholder"
              outlined
              required
            ></v-text-field>
            <v-alert
              v-if="
                dataModel.masked_webhook_url != '' &&
                dataModel.masked_webhook_url != null
              "
              dense
              outlined
              type="info"
            >
              <p class="text-caption">
                {{
                  $t(
                    `view.alert['Currently, the following webhook URL (masked) is registered. If webhook_url is blank when editing, it will be not updated.']`
                  )
                }}
              </p>
              <p>{{ dataModel.masked_webhook_url | formatSmartMaskString }}</p>
            </v-alert>

            <v-checkbox
              v-model="form.show_option"
              :label="$t(`view.alert['Show options']`)"
            />

            <v-text-field
              v-show="form.show_option"
              v-model="dataModel.custom_message"
              :counter="128"
              :rules="form.custom_message.validator"
              :label="$t(`item['` + form.custom_message.label + `']`)"
              :placeholder="form.custom_message.placeholder"
              outlined
            ></v-text-field>
            <v-text-field
              v-show="form.show_option"
              v-model="dataModel.channel"
              :counter="60"
              :rules="form.channel.validator"
              :label="$t(`item['` + form.channel.label + `']`)"
              :placeholder="form.channel.placeholder"
              outlined
            ></v-text-field>
            <v-alert
              v-show="form.show_option"
              v-if="dataModel.channel != '' && dataModel.channel != null"
              dense
              outlined
              type="error"
            >
              {{ $t(`view.alert['The specific channel setting is ']`) }}
              <strong>{{ $t(`view.alert['deprecated']`) }}</strong>
              {{
                $t(
                  `view.alert['... It is recommended to use the default channels.']`
                )
              }}
            </v-alert>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-btn
                text
                outlined
                color="blue darken-1"
                @click="handleTestSubmit"
                :disabled="form.new"
              >
                {{ $t(`btn['TEST NOTIFICATION']`) }}
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
          </v-form>
        </v-card-text>
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
              <v-list-item-title>
                {{ dataModel.notification_id }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Notification ID']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ dataModel.name }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Name']`)
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
    <v-dialog v-model="testDialog" max-width="40%">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">
            {{ $t(`message['Do you want to send a test notification?']`) }}
          </span>
        </v-card-title>
        <v-list two-line>
          <v-list-item>
            <v-list-item-avatar
              ><v-icon>mdi-identifier</v-icon></v-list-item-avatar
            >
            <v-list-item-content>
              <v-list-item-title>
                {{ dataModel.notification_id }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Notification ID']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ dataModel.name }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Name']`)
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
            @click="testDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            outlined
            :loading="loading"
            @click="handleTestSubmit"
          >
            {{ $t(`btn['SEND']`) }}
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
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  name: 'AlertNotification',
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
        show_option: false,
        notification_id: { label: 'ID', placeholder: '-' },
        name: {
          label: 'Name',
          placeholder: 'something',
          validator: [
            (v) => !!v || 'Name is required',
            (v) =>
              !v || v.length <= 200 || 'Name must be less than 200 characters',
          ],
        },
        type: {
          label: 'Type',
          placeholder: 'slack',
          list: ['slack'],
          validator: [
            (v) => !!v || 'Type is required',
            (v) => v === 'slack' || 'Type is invalid type',
          ],
        },
        webhook_url: {
          label: 'Webhook URL',
          placeholder: 'https://xxx',
          validator: [
            (v) =>
              !!v || !!this.dataModel.notification_id || 'Webhook is required',
          ],
        },
        custom_message: {
          label: 'Custom Message',
          placeholder: '<!here> <@user_id> Hello user!',
          validator: [],
        },
        channel: {
          label: 'Channel',
          placeholder: '#your-channel',
          validator: [],
        },
      },
      dataModel: {
        notification_id: 0,
        name: '',
        type: 'slack',
        notify_setting: {},
        masked_webhook_url: '',
        webhook_url: '',
        custom_message: '',
        channel: '',
        updated_at: '',
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 5, sortBy: ['notification_id'] },
        actions: [
          {
            text: 'Test Notification',
            icon: 'mdi-bell-outline',
            click: this.handleTestItem,
          },
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteItem,
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
      deleteDialog: false,
      editDialog: false,
      testDialog: false,
    }
  },
  computed: {
    headers() {
      return [
        {
          text: this.$i18n.t('item[""]'),
          align: 'center',
          width: '10%',
          sortable: false,
          value: 'avator',
        },
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
        {
          text: this.$i18n.t('item["Updated"]'),
          align: 'center',
          sortable: true,
          value: 'updated_at',
        },
        {
          text: this.$i18n.t('item["Action"]'),
          align: 'center',
          sortable: false,
          value: 'action',
        },
      ]
    },
  },
  mounted() {
    this.refleshList()
  },
  methods: {
    // list
    async refleshList() {
      this.loading = true
      this.clearList()
      const notification = await this.listAlertNotification().catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.table.items = notification
      this.loading = false
    },
    clearList() {
      this.table.items = []
    },

    // delete
    async deleteItem() {
      await this.deleteAlertNotification(this.dataModel.notification_id).catch(
        (err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        }
      )
      this.finishSuccess('Success: Delete.')
    },

    // test
    async testNotification() {
      await this.testAlertNotification(this.dataModel.notification_id).catch(
        (err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        }
      )
      this.finishSuccess('Success: Send Test Notification.')
    },

    // put
    async putItem() {
      const param = {
        project_id: this.getCurrentProjectID(),
        notification: {
          project_id: this.getCurrentProjectID(),
          notification_id: this.dataModel.notification_id,
          type: this.dataModel.type,
          name: this.dataModel.name,
          notify_setting: JSON.stringify({
            webhook_url: this.dataModel.webhook_url,
            data: {
              channel: this.dataModel.channel,
              message: this.dataModel.custom_message,
            },
          }),
        },
      }

      await this.putAlertNotification(param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      let msg = 'Success: Updated Notification.'
      if (this.form.new) {
        msg = 'Success: Created new Notification.'
      }
      this.finishSuccess(msg)
    },

    handleNewItem() {
      this.dataModel = {
        notification_id: 0,
        name: '',
        type: 'slack',
        masked_webhook_url: '',
        webhook_url: '',
        custom_message: '',
        channel: '',
        updated_at: '',
      }
      this.form.valid = false
      this.form.new = true
      this.editDialog = true
    },
    handleRowClick(item) {
      this.handleEditItem(item)
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.dataModel.masked_webhook_url = this.dataModel.webhook_url
      this.dataModel.webhook_url = ''
      this.form.valid = false
      this.form.new = false
      this.editDialog = true
    },
    handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      this.putItem()
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.form.valid = false
      this.deleteDialog = true
    },
    handleDeleteSubmit() {
      this.loading = true
      this.deleteItem()
    },
    handleTestItem(item) {
      this.assignDataModel(item)
      this.form.valid = false
      this.testDialog = true
    },
    handleTestSubmit() {
      this.loading = true
      this.testNotification()
    },
    assignDataModel(item) {
      this.dataModel = {}
      this.dataModel = Object.assign(this.dataModel, item)

      const setting = JSON.parse(this.dataModel.notify_setting)
      // slack
      if (this.dataModel.type === 'slack') {
        if (setting.webhook_url) {
          this.dataModel.webhook_url = setting.webhook_url
        }
        if (setting.data && setting.data.channel) {
          this.dataModel.channel = setting.data.channel
        }
        if (setting.data && setting.data.message) {
          this.dataModel.custom_message = setting.data.message
        }
      }
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
