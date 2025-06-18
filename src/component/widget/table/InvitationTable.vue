<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">{{ config.icon }}</v-icon>
              {{ $t(`submenu['${config.titleKey}']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="8" sm="4" md="4">
            <v-combobox
              variant="outlined"
              density="compact"
              clearable
              bg-color="white"
              :label="$t(`item['${config.searchLabel}']`)"
              :placeholder="config.searchPlaceholder"
              :items="searchItems"
              v-model="searchModel"
            />
          </v-col>
          <v-spacer />
          <v-btn
            class="mt-3 mr-4"
            size="large"
            density="compact"
            :loading="loading"
            @click="handleSearch"
            icon="mdi-magnify"
          />
          <v-btn
            v-if="config.showInviteButton"
            class="mt-3 mr-4"
            color="primary-darken-3"
            size="large"
            density="compact"
            @click="$emit('invite')"
            icon="mdi-send"
          />
        </v-row>
      </v-form>
      <v-row dense>
        <v-col cols="12">
          <v-card>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table-server
                :headers="headers"
                :items-length="table.total"
                :items="table.items"
                :loading="loading"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :items-per-page-text="table.footer.itemsPerPageText"
                :show-current-page="table.footer.showCurrentPage"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                :item-key="config.itemKey"
                @update:options="updateOptions"
              >
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip
                    :color="getStatusColor(item.value.status)"
                    variant="flat"
                    size="small"
                  >
                    {{ getStatusText(item.value.status) }}
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
                        v-for="action in table.actions"
                        :key="action.text"
                        @click="action.click(item.value)"
                        :prepend-icon="action.icon"
                      >
                        <v-list-item-title>{{
                          $t(`action['` + action.text + `']`)
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table-server>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

export default {
  name: 'InvitationTable',
  mixins: [mixin],
  components: {
    BottomSnackBar,
    VDataTableServer,
  },
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        icon: 'mdi-email-multiple',
        titleKey: 'OrganizationInvitation',
        searchLabel: 'Organization',
        searchPlaceholder: 'Filter for organization name',
        showInviteButton: false,
        itemKey: 'organization_id',
        idKey: 'organization_id',
      }),
    },
    actions: {
      type: Array,
      required: true,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    tableData: {
      type: Object,
      required: true,
      default: () => ({
        items: [],
        total: 0,
        options: { page: 1, itemsPerPage: 10, sortBy: [] },
      }),
    },
    searchItems: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['search', 'invite', 'update-options'],
  data() {
    return {
      searchModel: null,
      table: {
        options: this.tableData.options,
        actions: this.actions,
        total: this.tableData.total,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: this.tableData.items,
      },
    }
  },
  computed: {
    headers() {
      return [
        {
          title:
            this.config.idKey === 'project_id'
              ? 'Project ID'
              : 'Organization ID',
          align: 'start',
          sortable: false,
          key: this.config.idKey,
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Status"]'),
          align: 'center',
          sortable: false,
          key: 'status',
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
  watch: {
    actions: {
      handler(newActions) {
        this.table.actions = newActions
      },
      immediate: true,
    },
    tableData: {
      handler(newData) {
        this.table.items = newData.items
        this.table.total = newData.total
        this.table.options = newData.options
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchModel)
    },
    updateOptions(options) {
      this.table.options = options
      this.$emit('update-options', options)
    },
    getStatusText(status) {
      const numStatus =
        typeof status === 'string' ? parseInt(status, 10) : status
      switch (numStatus) {
        case 1:
          return 'PENDING'
        case 2:
          return 'ACCEPTED'
        case 3:
          return 'REJECTED'
        default:
          console.warn(
            'Unknown status value:',
            status,
            'converted to:',
            numStatus
          )
          return 'UNKNOWN'
      }
    },
    getStatusColor(status) {
      const statusText = this.getStatusText(status)
      switch (statusText) {
        case 'PENDING':
          return 'orange'
        case 'ACCEPTED':
          return 'green'
        case 'REJECTED':
          return 'red'
        default:
          return 'grey'
      }
    },
    formatTime(time) {
      return Util.formatDate(new Date(time * 1000), 'yyyy/MM/dd HH:mm:ss')
    },
  },
}
</script>
