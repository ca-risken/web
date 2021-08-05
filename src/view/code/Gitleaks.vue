<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="black">mdi-github</v-icon>
              {{ $t(`submenu['Gitleaks']`) }}
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
            text
            outlined
            class="mt-1 mr-4"
            color="blue darken-1"
            @click="projectTagDialog = true"
          >
            {{ $t(`btn['TAG']`) }}
          </v-btn>
          <project-tag
            :tagDialog="projectTagDialog"
            @projectTagCancel="projectTagDialog = false"
            @projectTagUpdated="handleProjectTagUpdated"
          />

          <v-btn
            class="mt-1 mr-4"
            color="grey darken-2"
            dense
            small
            icon
            fab
            outlined
            :loading="loading"
            @click="handleList"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
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
                item-key="diagnosis_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-3">
                    <v-icon color="black" large>mdi-github</v-icon>
                  </v-avatar>
                </template>
                <template v-slot:[`item.type_text`]="{ item }">
                  <v-chip dark label outlined color="blue darken-2">{{
                    item.type_text
                  }}</v-chip>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    v-if="item.status"
                    :color="getDataSourceStatusColor(item.status)"
                    dark
                  >
                    <v-progress-circular
                      v-if="isInProgressDataSourceStatus(item.status)"
                      indeterminate
                      size="20"
                      width="2"
                      color="white"
                      class="mr-2"
                    ></v-progress-circular>
                    <v-icon v-else small color="white" class="mr-2">{{
                      getDataSourceStatusIcon(item.status)
                    }}</v-icon>
                    {{ getDataSourceStatusText(item.status) }}
                  </v-chip>
                  <v-chip v-else color="grey" dark>Not configured</v-chip>
                </template>
                <template v-slot:[`item.scan_at`]="{ item }">
                  <v-chip v-if="item.scan_at">{{
                    item.scan_at | formatTime
                  }}</v-chip>
                  <v-chip v-else>Not yet scan...</v-chip>
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

    <v-dialog v-model="editDialog" max-width="70%">
      <v-card>
        <v-card-title>
          <v-icon large color="black">mdi-github</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['Gitleaks']`) }}
          </span>
        </v-card-title>
        <v-container fluid>
          <v-row dense>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Data Source ID']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ codeDataSourceModel.code_data_source_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Data Source']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ codeDataSourceModel.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Description']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ codeDataSourceModel.description }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="3" v-if="gitleaksModel.gitleaks_id">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['Gitleaks ID']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    {{ gitleaksModel.gitleaks_id }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="3" v-if="gitleaksModel.status">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    <v-list-item-subtitle>
                      {{ $t(`item['Status']`) }}
                    </v-list-item-subtitle>
                    <v-chip
                      dark
                      :color="getDataSourceStatusColor(gitleaksModel.status)"
                    >
                      {{ getDataSourceStatusText(gitleaksModel.status) }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="4" v-if="gitleaksModel.scan_at">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['ScanAt']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip color="grey lighten-3">
                      {{ gitleaksModel.scan_at | formatTime }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="2">
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ $t(`item['MAX Score']`) }}
                  </v-list-item-subtitle>
                  <v-list-item-title class="headline">
                    <v-chip outlined>
                      {{ codeDataSourceModel.max_score }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" v-if="gitleaksModel.status_detail">
              <v-card>
                <v-card-title>
                  <v-icon left>mdi-pin-outline</v-icon>
                  <span class="font-weight-light">
                    {{ $t(`item['Status Detail']`) }}
                  </span>
                </v-card-title>
                <v-card-text>
                  {{ gitleaksModel.status_detail }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-text>
          <v-form v-model="gitleaksForm.valid" ref="form">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  outlined
                  v-model="gitleaksModel.name"
                  :counter="64"
                  :rules="gitleaksForm.name.validator"
                  :label="$t(`item['` + gitleaksForm.name.label + `']`) + ' *'"
                  :placeholder="gitleaksForm.name.placeholder"
                  :disabled="gitleaksForm.readOnly || !gitleaksForm.isNew"
                  :filled="gitleaksForm.readOnly || !gitleaksForm.isNew"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-combobox
                  required
                  clearable
                  outlined
                  v-model="gitleaksModel.type_text"
                  :rules="gitleaksForm.type.validator"
                  :label="$t(`item['` + gitleaksForm.type.label + `']`) + ' *'"
                  :placeholder="gitleaksForm.type.placeholder"
                  :items="gitleaksForm.type.list"
                  :disabled="gitleaksForm.readOnly"
                  :filled="gitleaksForm.readOnly"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  outlined
                  v-model="gitleaksModel.base_url"
                  :counter="128"
                  :rules="gitleaksForm.base_url.validator"
                  :label="$t(`item['` + gitleaksForm.base_url.label + `']`)"
                  :placeholder="gitleaksForm.base_url.placeholder"
                  :disabled="gitleaksForm.readOnly"
                  :filled="gitleaksForm.readOnly"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  required
                  outlined
                  v-model="gitleaksModel.target_resource"
                  :counter="128"
                  :rules="gitleaksForm.target_resource.validator"
                  :label="
                    $t(`item['` + gitleaksForm.target_resource.label + `']`) +
                    ' *'
                  "
                  :placeholder="gitleaksForm.target_resource.placeholder"
                  :disabled="gitleaksForm.readOnly"
                  :filled="gitleaksForm.readOnly"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  outlined
                  v-model="gitleaksModel.repository_pattern"
                  :counter="128"
                  :rules="gitleaksForm.repository_pattern.validator"
                  :label="
                    $t(`item['` + gitleaksForm.repository_pattern.label + `']`)
                  "
                  :placeholder="gitleaksForm.repository_pattern.placeholder"
                  :disabled="gitleaksForm.readOnly"
                  :filled="gitleaksForm.readOnly"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  outlined
                  v-model="gitleaksModel.github_user"
                  :counter="64"
                  :rules="gitleaksForm.github_user.validator"
                  :label="$t(`item['` + gitleaksForm.github_user.label + `']`)"
                  :placeholder="gitleaksForm.github_user.placeholder"
                  :disabled="gitleaksForm.readOnly"
                  :filled="gitleaksForm.readOnly"
                ></v-text-field>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  outlined
                  v-model="gitleaksModel.personal_access_token"
                  :counter="255"
                  :rules="gitleaksForm.personal_access_token.validator"
                  :label="
                    $t(
                      `item['` + gitleaksForm.personal_access_token.label + `']`
                    )
                  "
                  :placeholder="gitleaksForm.personal_access_token.placeholder"
                  :disabled="gitleaksForm.readOnly"
                  :filled="gitleaksForm.readOnly"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="3">
                <v-checkbox
                  v-model="gitleaksModel.scan_public"
                  :label="$t(`item['` + gitleaksForm.scan_public.label + `']`)"
                  :placeholder="gitleaksForm.scan_public.placeholder"
                  :disabled="gitleaksForm.readOnly"
                  :filled="gitleaksForm.readOnly"
                ></v-checkbox>
              </v-col>
              <v-col cols="3">
                <v-checkbox
                  v-model="gitleaksModel.scan_internal"
                  :label="
                    $t(`item['` + gitleaksForm.scan_internal.label + `']`)
                  "
                  :placeholder="gitleaksForm.scan_internal.placeholder"
                  :disabled="gitleaksForm.readOnly"
                  :filled="gitleaksForm.readOnly"
                ></v-checkbox>
              </v-col>
              <v-col cols="3">
                <v-checkbox
                  v-model="gitleaksModel.scan_private"
                  :label="$t(`item['` + gitleaksForm.scan_private.label + `']`)"
                  :placeholder="gitleaksForm.scan_private.placeholder"
                  :disabled="gitleaksForm.readOnly"
                  :filled="gitleaksForm.readOnly"
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-card-actions>
              <v-btn
                text
                outlined
                color="blue darken-1"
                v-if="gitleaksForm.readOnly"
                :loading="loading"
                @click="handleScan"
              >
                {{ $t(`btn['SCAN']`) }}
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
                v-if="!gitleaksForm.readOnly"
                :loading="loading"
                @click="handleEditSubmit"
              >
                {{ $t(`btn['EDIT']`) }}
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
                v-text="gitleaksModel.gitleaks_id"
              ></v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Gitleaks ID']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                v-text="gitleaksModel.name"
              ></v-list-item-title>
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
import Util from "@/util"
import mixin from "@/mixin"
import project from "@/mixin/api/project"
import BottomSnackBar from "@/component/widget/snackbar/BottomSnackBar"
import ProjectTag from "@/component/widget/tag/ProjectTag"
export default {
  mixins: [mixin, project],
  components: {
    BottomSnackBar,
    ProjectTag,
  },
  data() {
    return {
      loading: false,
      gitleaksForm: {
        readOnly: false,
        isNew: false,
        valid: false,
        name: {
          label: "Name",
          placeholder: "Gitleaks setting name",
          validator: [
            (v) => !!v || "Name is required",
            (v) =>
              !v || v.length <= 64 || "Name must be less than 64 characters",
          ],
        },
        type: {
          label: "Type",
          placeholder: "-",
          list: ["Organization", "User"],
          validator: [
            (v) => !!v || "Type is required",
            (v) =>
              !v || v === "Organization" || v === "User" || "Type is invalid",
          ],
        },
        base_url: {
          label: "Base URL",
          placeholder: "[Optional] https://hostname/api/v3/",
          validator: [
            (v) =>
              !v ||
              v.length <= 128 ||
              "TargetResource must be less than 128 characters",
          ],
        },
        target_resource: {
          label: "TargetResource",
          placeholder: "OrganizationName or UserName",
          validator: [
            (v) => !!v || "TargetResource is required",
            (v) =>
              !v ||
              v.length <= 128 ||
              "TargetResource must be less than 128 characters",
          ],
        },
        repository_pattern: {
          label: "RepositoryPattern",
          placeholder: "-",
          validator: [
            (v) =>
              !v ||
              v.length <= 128 ||
              "RepositoryPattern must be less than 128 characters",
          ],
        },
        github_user: {
          label: "GitHubUser",
          placeholder: "-",
          validator: [
            (v) =>
              !v ||
              v.length <= 64 ||
              "GitHubUser must be less than 64 characters",
          ],
        },
        personal_access_token: {
          label: "PersonalAccessToken",
          placeholder: "-",
          validator: [
            (v) =>
              !v ||
              v.length <= 255 ||
              "PersonalAccessToken must be less than 255 characters",
          ],
        },
        scan_public: {
          label: "Scan Public Repository",
          placeholder: "-",
          validator: [],
        },
        scan_internal: {
          label: "Scan Internal Repository",
          placeholder: "-",
          validator: [],
        },
        scan_private: {
          label: "Scan Private Repository",
          placeholder: "-",
          validator: [],
        },
      },
      codeDataSourceModel: {
        code_data_source_id: "",
        name: "",
        description: "",
        max_score: "",
        updated_at: "",
      },
      gitleaksModel: {
        gitleaks_id: "",
        code_data_source_id: "",
        name: "",
        type: "",
        base_url: "",
        type_text: "",
        target_resource: "",
        repository_pattern: "",
        github_user: "",
        personal_access_token: "",
        scan_public: "",
        scan_internal: "",
        scan_private: "",
        gitleaks_config: "",
        status: "",
        status_detail: "",
        scan_at: "",
        updated_at: "",
      },
      table: {
        selected: [],
        search: "",
        options: { page: 1, itemsPerPage: 10, sortBy: ["gitleaks_id"] },
        actions: [
          { text: "View Item", icon: "mdi-eye", click: this.handleViewItem },
          { text: "Edit Item", icon: "mdi-pencil", click: this.handleEditItem },
          {
            text: "Delete Item",
            icon: "mdi-trash-can-outline",
            click: this.handleDeleteItem,
          },
          { text: "Scan", icon: "mdi-magnify-scan", click: this.handleScan },
        ],
        footer: {
          itemsPerPageOptions: [10],
          showCurrentPage: true,
          showFirstLastPage: true,
        },
        items: [],
      },
      deleteDialog: false,
      editDialog: false,
    }
  },
  created() {
    this.$setInterval(async () => {
      await this.listGitleaks()
    }, 3000)
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
          value: "gitleaks_id",
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: this.$i18n.t('item["Type"]'),
          align: "start",
          sortable: true,
          value: "type_text",
        },
        // {
        //   text: this.$i18n.t('item["Base URL"]'),
        //   align: "start",
        //   sortable: true,
        //   value: "base_url",
        // },
        {
          text: this.$i18n.t('item["Target"]'),
          align: "start",
          sortable: true,
          value: "target_resource",
        },
        {
          text: this.$i18n.t('item["Repository"]'),
          align: "start",
          sortable: true,
          value: "repository_pattern",
        },
        {
          text: this.$i18n.t('item["Status"]'),
          align: "start",
          sortable: true,
          value: "status",
        },
        {
          text: this.$i18n.t('item["ScanAt"]'),
          align: "start",
          sortable: true,
          value: "scan_at",
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
  async mounted() {
    this.loading = true
    await this.getGitleaksDataSource()
    await this.listGitleaks()
  },
  methods: {
    async getGitleaksDataSource() {
      const res = await this.$axios
        .get(
          "/code/list-datasource/" +
            "?code_data_source_id=" +
            this.gitleaks_datasource_id
        )
        .catch((err) => {
          this.clearList()
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.code_data_source) {
        this.clearList()
        return false
      }
      this.codeDataSourceModel = res.data.data.code_data_source[0]
      this.loading = false
    },
    async listGitleaks() {
      const res = await this.$axios
        .get(
          "/code/list-gitleaks/" +
            "?code_data_source_id=" +
            this.gitleaks_datasource_id +
            "&project_id=" +
            this.$store.state.project.project_id
        )
        .catch((err) => {
          this.clearList()
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.gitleaks) {
        this.clearList()
        return false
      }
      // this.table.items = res.data.data.gitleaks
      let items = []
      res.data.data.gitleaks.forEach(async (gitleaks) => {
        const item = {
          gitleaks_id: gitleaks.gitleaks_id,
          code_data_source_id: gitleaks.code_data_source_id,
          name: gitleaks.name,
          type: gitleaks.type,
          base_url: gitleaks.base_url,
          type_text: this.getGitleaksTypeText(gitleaks.type),
          target_resource: gitleaks.target_resource,
          repository_pattern: gitleaks.repository_pattern,
          github_user: gitleaks.github_user,
          personal_access_token: gitleaks.personal_access_token,
          scan_public: gitleaks.scan_public,
          scan_internal: gitleaks.scan_internal,
          scan_private: gitleaks.scan_private,
          gitleaks_config: gitleaks.gitleaks_config,
          status: gitleaks.status,
          status_detail: gitleaks.status_detail,
          scan_at: gitleaks.scan_at,
          updated_at: gitleaks.updated_at,
        }
        items.push(item)
      })
      this.table.items = items
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem() {
      const param = {
        project_id: this.$store.state.project.project_id,
        gitleaks_id: this.gitleaksModel.gitleaks_id,
      }
      await this.$axios.post("/code/delete-gitleaks/", param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess("Success: Deleted.")
    },
    async putItem() {
      let scan_at = 0
      if (this.gitleaksModel.scan_at > 0) {
        scan_at = this.gitleaksModel.scan_at
      }
      const param = {
        project_id: this.$store.state.project.project_id,
        gitleaks: {
          gitleaks_id: this.gitleaksModel.gitleaks_id,
          code_data_source_id: this.gitleaks_datasource_id,
          name: this.gitleaksModel.name,
          project_id: this.$store.state.project.project_id,
          type: this.getGitleaksTypeCode(this.gitleaksModel.type_text),
          base_url: this.gitleaksModel.base_url,
          target_resource: this.gitleaksModel.target_resource,
          repository_pattern: this.gitleaksModel.repository_pattern,
          github_user: this.gitleaksModel.github_user,
          personal_access_token: this.gitleaksModel.personal_access_token,
          scan_public: Boolean(this.gitleaksModel.scan_public),
          scan_internal: Boolean(this.gitleaksModel.scan_internal),
          scan_private: Boolean(this.gitleaksModel.scan_private),
          gitleaks_config: this.gitleaksModel.gitleaks_config,
          status: 2, // CONFIGURED
          status_detail:
            "Configured at: " + Util.formatDate(new Date(), "yyyy/MM/dd HH:mm"),
          scan_at: scan_at,
        },
      }
      await this.$axios.post("/code/put-gitleaks/", param).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess("Success: Updated.")
    },
    getGitleaksTypeCode(typeText) {
      switch (typeText) {
        case "Enterprise":
          return 1
        case "Organization":
          return 2
        case "User":
          return 3
        default:
          return 0 // Unknown
      }
    },
    getGitleaksTypeText(typeCode) {
      switch (typeCode) {
        case 1:
          return "Enterprise"
        case 2:
          return "Organization"
        case 3:
          return "User"
        default:
          return "Unknown" // Unknown
      }
    },
    async scanDataSource() {
      const param = {
        project_id: this.$store.state.project.project_id,
        gitleaks_id: this.gitleaksModel.gitleaks_id,
      }
      await this.$axios
        .post("/code/invoke-scan-gitleaks/", param)
        .catch((err) => {
          this.finishError(err.response.data)
          return Promise.reject(err)
        })
      this.finishSuccess("Success: Invoke scan for Data Source.")
    },

    // Handler
    async handleList() {
      this.loading = true
      await this.listGitleaks()
      this.finishInfo("Reflesh list")
    },
    handleRowClick(item) {
      this.handleViewItem(item)
    },
    handleViewItem(item) {
      this.assignDataModel(item)
      this.gitleaksForm.readOnly = true
      this.editDialog = true
    },
    handleNewItem() {
      this.gitleaksModel = {
        scan_public: true,
        scan_internal: true,
        scan_private: false,
      }
      this.gitleaksForm.isNew = true
      this.gitleaksForm.readOnly = false
      this.editDialog = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.gitleaksForm.isNew = false
      this.gitleaksForm.readOnly = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      await this.putItem()
      await this.tagProjectAPI(
        "github:" + this.gitleaksModel.target_resource,
        "black"
      )
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.untagProjectAPI("github:" + this.gitleaksModel.target_resource)
      await this.deleteItem()
    },
    handleScan(item) {
      this.loading = true
      if (item && item.gitleaks_id) {
        this.assignDataModel(item)
      }
      this.scanDataSource()
    },

    assignDataModel(item) {
      this.gitleaksModel = {}
      this.gitleaksModel = Object.assign(this.gitleaksModel, item)
    },

    async finishInfo(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyInfo(msg)
      this.finish(true)
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
      if (reflesh) {
        this.listGitleaks()
      }
    },
  },
}
</script>
