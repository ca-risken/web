<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-account-group</v-icon>
              {{ $t(`submenu['OrganizationList']`) }}
            </v-toolbar-title>
            <v-spacer />
            <v-btn
              color="primary-darken-3"
              density="compact"
              @click="handleNew"
              icon="mdi-new-box"
            />
          </v-toolbar>
        </v-col>
      </v-row>

      <v-form ref="searchForm">
        <v-row dense justify="center" align-content="center">
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              variant="outlined"
              density="compact"
              clearable
              bg-color="white"
              prepend-icon="mdi-magnify"
              placeholder="Search organizations..."
              v-model="searchModel.name"
              hide-details
            />
          </v-col>
          <v-spacer />
          <v-btn
            class="mt-3 mr-4"
            density="compact"
            :loading="loading"
            @click="handleSearch"
            icon="mdi-magnify"
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
                :items="table.items"
                v-model:options="table.options"
                :items-length="table.total"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page="table.options.itemsPerPage"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :showCurrentPage="table.footer.showCurrentPage"
                :loading="loading"
                :footer-props="table.footer"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="organization_id"
                @click:row="handleRowClick"
                @update:options="updateOptions"
              >
                <template v-slot:[`item.created_at`]="{ item }">
                  <v-chip>{{ formatTime(item.value.created_at) }}</v-chip>
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
                        <v-list-item-title>
                          {{ $t(`action['` + action.text + `']`) }}
                        </v-list-item-title>
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
import mixin from '@/mixin'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

export default {
  name: 'OrganizationList',
  mixins: [mixin],
  components: {
    BottomSnackBar,
    VDataTableServer,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        name: '',
      },
      table: {
        options: {
          page: 1,
          itemsPerPage: 10,
          sortBy: [{ key: 'organization_id', order: 'asc' }],
        },
        actions: [
          { text: 'Edit Item', icon: 'mdi-pencil', click: this.handleEdit },
          { text: 'Delete Item', icon: 'mdi-delete', click: this.handleDelete },
        ],
        total: 0,
        footer: {
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
      organizations: [],
    }
  },
  computed: {
    headers() {
      return [
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: false,
          key: 'organization_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["Description"]'),
          align: 'start',
          sortable: false,
          key: 'description',
        },
        {
          title: this.$i18n.t('item["Created"]'),
          align: 'center',
          sortable: false,
          key: 'created_at',
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
    this.loadList()
  },
  methods: {
    async loadList() {
      this.loading = true
      try {
        // TODO: Implement organization list API
        // For now, use mock data
        const mockOrganizations = [
          {
            organization_id: 1,
            name: 'Sample Organization 1',
            description: 'This is a sample organization description 1.',
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
          },
          {
            organization_id: 2,
            name: 'Sample Organization 2',
            description: 'This is a sample organization description 2.',
            created_at: new Date('2024-02-01'),
            updated_at: new Date('2024-02-15'),
          },
        ]

        this.table.items = mockOrganizations
        this.table.total = mockOrganizations.length
        this.organizations = mockOrganizations
      } catch (err) {
        this.$refs.snackbar.notifyError(
          err.response?.data || 'Failed to load organizations'
        )
      } finally {
        this.loading = false
      }
    },

    handleNew() {
      this.$router.push('/organization/setting?new=true')
    },

    handleRowClick(event, organization) {
      this.handleEdit(organization.item)
    },

    handleEdit(item) {
      this.$router.push(
        `/organization/setting?id=${item.value.organization_id}`
      )
    },

    handleDelete(item) {
      // TODO: Implement delete functionality
      console.log('Delete organization:', item.value.organization_id)
      this.$refs.snackbar.notifyInfo('Delete functionality not implemented yet')
    },

    handleSearch() {
      // TODO: Implement search functionality
      this.loadList()
    },

    updateOptions(options) {
      this.table.options.page = options.page
      this.loadList()
    },
  },
}
</script>
