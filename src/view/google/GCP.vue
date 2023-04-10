<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="blue darken-1"
                >mdi-google-cloud</v-icon
              >
              {{ $t(`submenu['GCP']`) }}
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
                item-key="gcp_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.avator`]="">
                  <v-avatar class="ma-3">
                    <v-icon color="blue darken-1" large
                      >mdi-google-cloud</v-icon
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

    <v-dialog v-model="editDialog" max-width="56%">
      <v-card>
        <v-card-title>
          <v-icon large color="blue darken-1">mdi-google-cloud</v-icon>
          <span class="mx-4 headline">
            {{ $t(`submenu['GCP']`) }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="gcpForm.valid" ref="form">
            <v-row class="mt-1">
              <v-col cols="1">
                <clip-board
                  class="pt-4 pl-6"
                  :name="$t(`item['` + gcpForm.gcp_id.label + `']`)"
                  :text="String(gcpModel.gcp_id)"
                  size="x-large"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-model="gcpModel.gcp_id"
                  :label="$t(`item['` + gcpForm.gcp_id.label + `']`)"
                  :placeholder="gcpForm.gcp_id.placeholder"
                  outlined
                  filled
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row class="mt-1">
              <v-col cols="1">
                <clip-board
                  class="pt-4 pl-6"
                  :name="$t(`item['` + gcpForm.name.label + `']`)"
                  :text="String(gcpModel.name)"
                  size="x-large"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-model="gcpModel.name"
                  :counter="200"
                  :rules="gcpForm.name.validator"
                  :label="$t(`item['` + gcpForm.name.label + `']`) + ' *'"
                  :placeholder="gcpForm.name.placeholder"
                  outlined
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row class="mt-1">
              <v-col cols="1">
                <clip-board
                  class="pt-4 pl-6"
                  :name="
                    $t(`item['` + gcpForm.gcp_organization_id.label + `']`)
                  "
                  :text="String(gcpModel.gcp_organization_id)"
                  size="x-large"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-model="gcpModel.gcp_organization_id"
                  :counter="128"
                  :rules="gcpForm.gcp_organization_id.validator"
                  :label="
                    $t(`item['` + gcpForm.gcp_organization_id.label + `']`)
                  "
                  :placeholder="gcpForm.gcp_organization_id.placeholder"
                  outlined
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row class="mt-1">
              <v-col cols="1">
                <clip-board
                  class="pt-4 pl-6"
                  :name="$t(`item['` + gcpForm.gcp_project_id.label + `']`)"
                  :text="String(gcpModel.gcp_project_id)"
                  size="x-large"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-model="gcpModel.gcp_project_id"
                  :counter="128"
                  :rules="gcpForm.gcp_project_id.validator"
                  :label="
                    $t(`item['` + gcpForm.gcp_project_id.label + `']`) + ' *'
                  "
                  :placeholder="gcpForm.gcp_project_id.placeholder"
                  outlined
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row class="mt-1">
              <v-col cols="1">
                <clip-board
                  class="pt-4 pl-6"
                  :name="$t(`item['` + gcpForm.verification_code.label + `']`)"
                  :text="String(gcpModel.verification_code)"
                  size="x-large"
                />
              </v-col>
              <v-col cols="11">
                <v-text-field
                  v-if="gcpForm.verification_code.visible"
                  v-model="gcpModel.verification_code"
                  :counter="128"
                  :rules="gcpForm.verification_code.validator"
                  :label="
                    $t(`item['` + gcpForm.verification_code.label + `']`) + ' *'
                  "
                  :placeholder="gcpForm.verification_code.placeholder"
                  outlined
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense class="my-0">
              <v-col cols="1" />
              <v-col cols="11">
                <v-btn
                  text
                  dense
                  color="purple darken-2"
                  @click="handleGenerateCode"
                >
                  {{ $t(`btn['AUTO GENERATE VERIFICATION CODE']`) }}
                </v-btn>
                <v-alert outlined type="info">
                  <p class="text-subtitle-2">
                    {{
                      $t(
                        `view.gcp['Register the verification code in the label of your GCP project with the key \`risken\`.']`
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
                <template v-if="gcpForm.newGCP">
                  {{ $t(`btn['REGIST']`) }}
                </template>
                <template v-else>
                  {{ $t(`btn['EDIT']`) }}
                </template>
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
                {{ gcpModel.gcp_id }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['GCP ID']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>account_box</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ gcpModel.name }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Name']`)
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-google-cloud</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ gcpModel.gcp_project_id }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['GCP ProjectID']`)
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
import project from '@/mixin/api/project'
import google from '@/mixin/api/google'
import ClipBoard from '@/component/widget/clipboard/ClipBoard.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
import ProjectTag from '@/component/widget/tag/ProjectTag'
export default {
  name: 'GCPProject',
  mixins: [mixin, project, google],
  components: {
    BottomSnackBar,
    ClipBoard,
    ProjectTag,
  },
  data() {
    return {
      loading: false,
      gcpForm: {
        newGCP: false,
        valid: false,
        gcp_id: { label: 'ID', placeholder: '-' },
        name: {
          label: 'Name',
          placeholder: 'something',
          validator: [
            (v) => !!v || 'Name is required',
            (v) =>
              !v || v.length <= 200 || 'Name must be less than 200 characters',
          ],
        },
        gcp_organization_id: {
          label: 'GCP OrganizationID',
          placeholder: 'your-org',
          validator: [
            (v) =>
              !v ||
              v.length <= 128 ||
              'GCP Organization ID must be less than 128 characters',
          ],
        },
        gcp_project_id: {
          label: 'GCP ProjectID',
          placeholder: 'your-project',
          validator: [
            (v) => !!v || 'GCP Project ID is required',
            (v) =>
              !v ||
              v.length <= 128 ||
              'GCP Project ID must be less than 128 characters',
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
      gcpModel: {
        gcp_id: '',
        name: '',
        gcp_organization_id: '',
        gcp_project_id: '',
        verification_code: '',
        updated_at: '',
      },
      table: {
        selected: [],
        search: '',
        options: { page: 1, itemsPerPage: 5, sortBy: ['gcp_id'] },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEditItem },
          {
            text: 'Delete Item',
            icon: 'mdi-trash-can-outline',
            click: this.handleDeleteItem,
          },
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
          value: 'gcp_id',
        },
        {
          text: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: true,
          value: 'name',
        },
        {
          text: this.$i18n.t('item["GCP OrganizationID"]'),
          align: 'start',
          sortable: true,
          value: 'gcp_organization_id',
        },
        {
          text: this.$i18n.t('item["GCP ProjectID"]'),
          align: 'start',
          sortable: true,
          value: 'gcp_project_id',
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
    this.loading = true
    this.refleshList('')
  },
  methods: {
    async refleshList() {
      const gcp = await this.listGCPAPI().catch((err) => {
        this.clearList()
        return Promise.reject(err)
      })
      if (!gcp) {
        this.clearList()
        return false
      }
      this.table.items = gcp
      this.loading = false
    },
    clearList() {
      this.table.items = []
      this.loading = false
    },
    async deleteItem(gcpID) {
      await this.deleteGCPAPI(gcpID).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      this.finish('Success: Delete.')
    },
    async putItem() {
      const param = {
        project_id: this.getCurrentProjectID(),
        gcp: {
          project_id: this.getCurrentProjectID(),
          name: this.gcpModel.name,
          gcp_organization_id: this.gcpModel.gcp_organization_id,
          gcp_project_id: this.gcpModel.gcp_project_id,
          verification_code: this.gcpModel.verification_code,
        },
      }
      await this.putGCPAPI(param).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      let msg = 'Success: Updated GCP.'
      if (this.gcpForm.newGCP) {
        msg = 'Success: Created new GCP.'
      }
      this.finish(msg)
    },

    isNewGCPProjectID(pjID) {
      let isNew = true
      this.table.items.some((item) => {
        if (item.gcp_project_id == pjID) {
          isNew = false
          return true
        }
      })
      return isNew
    },

    handleGenerateCode() {
      this.gcpModel.verification_code = Util.generateVerificationCode()
      // v-modelの値を更新してもうまくレンダリングされない時があるため、v-ifを切り替えて強制的にレンダリングさせる
      this.gcpForm.verification_code.visible = false
      this.gcpForm.verification_code.visible = true
    },
    handleRowClick(item) {
      this.$router.push('/google/gcp-data-source?gcp_id=' + item.gcp_id)
    },
    handleNewItem() {
      ;(this.gcpModel = {
        gcp_id: '',
        name: '',
        gcp_organization_id: '',
        gcp_project_id: '',
        verification_code: '',
        updated_at: '',
      }),
        (this.gcpForm.newGCP = true)
      this.editDialog = true
    },
    handleEditItem(item) {
      this.assignDataModel(item)
      this.gcpForm.newGCP = false
      this.editDialog = true
    },
    async handleEditSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      await this.putItem()
      await this.tagProjectAPI(
        'gcp:' + this.gcpModel.gcp_project_id,
        'light-blue darken-1'
      )
    },
    handleDeleteItem(item) {
      this.assignDataModel(item)
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.untagProjectAPI('gcp:' + this.gcpModel.gcp_project_id)
      await this.deleteItem(this.gcpModel.gcp_id)
    },
    assignDataModel(item) {
      this.gcpModel = {}
      this.gcpModel = Object.assign(this.gcpModel, item)
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
