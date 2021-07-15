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
              {{ $t(`submenu['Rule']`) }}
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
                item-key="alert_rule_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar icon class="ma-1">
                    <v-icon large class="pr-2" color="brown darken-2"
                      >mdi-book-open-variant</v-icon
                    >
                  </v-avatar>
                </template>
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

    <v-dialog v-model="editDialog" max-width="50%">
      <v-card>
        <v-card-title>
          <v-icon large class="pr-2" color="red lighten-2">mdi-alert</v-icon>
          <span class="mx-4 headline">{{ $t(`submenu['Rule']`) }}</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="form.valid" ref="form">
            <v-text-field
              v-model="dataModel.alert_rule_id"
              :label="$t(`item['` + form.alert_rule_id.label + `']`)"
              :placeholder="form.alert_rule_id.placeholder"
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
              v-model="dataModel.resource_name"
              :loading="loading"
              :counter="255"
              :rules="form.resource_name.validator"
              :label="$t(`item['` + form.resource_name.label + `']`)"
              :placeholder="form.resource_name.placeholder"
              :items="resourceNameCombobox"
              @keydown="listResourceNameForCombobox"
              persistent-hint
              outlined
              required
            />

            <v-combobox
              outlined
              clearable
              small-chips
              :label="$t(`item['` + form.tag.label + `']`)"
              :placeholder="form.tag.placeholder"
              :items="form.tag.list"
              item-text="tag"
              item-value="finding_tag_id"
              v-model="dataModel.tag"
            />
            <v-text-field
              v-model="dataModel.finding_cnt"
              :rules="form.finding_cnt.validator"
              :label="$t(`item['` + form.finding_cnt.label + `']`)"
              :placeholder="form.finding_cnt.placeholder"
              type="number"
              outlined
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
                  outlined
                ></v-slider>
              </v-col>
            </v-row>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
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
              <v-list-item-title
                v-text="dataModel.alert_rule_id"
              ></v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Alert Rule ID']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="dataModel.name"></v-list-item-title>
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
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>
<script>
import mixin from "@/mixin"
import alert from "@/mixin/api/alert"
import finding from "@/mixin/api/finding"
import BottomSnackBar from "@/component/widget/snackbar/BottomSnackBar"
export default {
  mixins: [mixin, alert, finding],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      form: {
        new: false,
        valid: false,
        alert_rule_id: { label: "ID", placeholder: "-" },
        name: {
          label: "Name",
          placeholder: "something",
          validator: [
            (v) => !!v || "Name is required",
            (v) => v.length <= 200 || "Name must be less than 200 characters",
          ],
        },
        score: {
          label: "Score",
          placeholder: "Select score ( 0.0 ~ 1.0 )",
          validator: [
            (v) => !!v || "Score is required",
            (v) =>
              !v ||
              (0.0 <= v && v <= 1.0) ||
              "Score is must between 0.0 and 1.0",
          ],
        },
        resource_name: {
          label: "Resource Name",
          placeholder: "resource pattern (Partial Match)",
          validator: [
            (v) =>
              !v ||
              v.length <= 255 ||
              "Resource Name must be less than 255 characters",
          ],
        },
        tag: {
          label: "Tag",
          placeholder: "key:value",
          list: [],
          validator: [
            (v) =>
              !v || v.length <= 64 || "Tag must be less than 64 characters",
          ],
        },
        finding_cnt: {
          label: "Finding Count",
          placeholder: "1",
          validator: [
            (v) => !!v || "Finding Count is required",
            (v) => !v || 1 <= v || "finding_cnt must be 1 or more",
          ],
        },
      },
      dataModel: {
        alert_rule_id: 0,
        name: "",
        score: 0,
        resource_name: "",
        tag: "",
        finding_cnt: 0,
        updated_at: "",
      },
      table: {
        selected: [],
        search: "",
        options: { page: 1, itemsPerPage: 10, sortBy: ["alert_rule_id"] },
        actions: [
          { text: "Edit Item", icon: "mdi-pencil", click: this.handleEditItem },
          {
            text: "Delete Item",
            icon: "mdi-trash-can-outline",
            click: this.handleDeleteItem,
          },
        ],
        footer: {
          disableItemsPerPage: false,
          itemsPerPageOptions: [20, 50, 100],
          itemsPerPageText: "Rows/Page",
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
          align: "center",
          width: "10%",
          sortable: false,
          value: "avator",
        },
        {
          text: this.$i18n.t('item["ID"]'),
          align: "start",
          sortable: true,
          value: "alert_rule_id",
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: this.$i18n.t('item["Resource Name"]'),
          align: "start",
          sortable: true,
          value: "resource_name",
        },
        {
          text: this.$i18n.t('item["Tag"]'),
          align: "start",
          sortable: true,
          value: "tag",
        },
        {
          text: this.$i18n.t('item["Finding Count"]'),
          align: "center",
          sortable: true,
          value: "finding_cnt",
        },
        {
          text: this.$i18n.t('item["Score"]'),
          align: "center",
          sortable: true,
          value: "score",
        },
        {
          text: this.$i18n.t('item["Action"]'),
          align: "center",
          sortable: false,
          value: "action",
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
      this.finishSuccess("Success: Delete.")
    },

    // put
    async putItem() {
      const param = {
        project_id: this.$store.state.project.project_id,
        alert_rule: {
          project_id: this.$store.state.project.project_id,
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
      let msg = "Success: Updated alert rule."
      if (this.form.new) {
        msg = "Success: Created new alert rule."
      }
      this.finishSuccess(msg)
    },

    // handler
    handleNewItem() {
      this.dataModel = {
        alert_rule_id: 0,
        name: "",
        score: 0.6,
        resource_name: "",
        tag: "",
        finding_cnt: 1,
        updated_at: "",
      }
      this.form.new = true
      this.editDialog = true
    },
    handleRowClick(item) {
      this.handleEditItem(item)
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
      this.putItem()
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
      this.dataModel = Object.assign(this.dataModel, item)
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
