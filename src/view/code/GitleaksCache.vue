<template>
  <v-dialog max-width="50%" v-model="showDialog">
    <v-card>
      <v-card-title>
        {{ $t(`view.code['Repository List']`) }}
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Filter"
          single-line
          hide-details
          clearable
          density="compact"
        ></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="table.items"
          :loading="loading"
          :items-per-page-options="table.footer.itemsPerPageOptions"
          :items-per-page="table.options.itemsPerPage"
          :sort-by="table.options.sortBy"
          :showCurrentPage="table.footer.showCurrentPage"
          :search="search"
          locale="ja-jp"
          loading-text="Loading..."
          no-data-text="No data."
          class="elevation-1"
          item-key="user_id"
        >
          <template v-slot:[`item.scan_at`]="{ item }">
            <v-chip>{{ formatTime(item.value.scan_at) }}</v-chip>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" color="grey-darken-1" @click="handleCancel">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import mixin from '@/mixin'
import code from '@/mixin/api/code'
import { VDataTable } from 'vuetify/labs/VDataTable'
export default {
  mixins: [mixin, code],
  components: {
    VDataTable,
  },
  name: 'GitleaksCache',
  props: {
    gitleaksCacheDialog: Boolean,
    githubSettingID: Number,
  },
  data() {
    return {
      loading: false,
      search: '',
      table: {
        options: {
          page: 1,
          itemsPerPage: 10,
          sortBy: ['repository_full_name'],
        },
        total: 0,
        footer: {
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
    }
  },
  computed: {
    showDialog: {
      get() {
        return this.gitleaksCacheDialog
      },
      set() {
        this.handleCancel()
      },
    },
    headers() {
      return [
        {
          title: this.$i18n.t('item["Repository"]'),
          align: 'start',
          sortable: false,
          key: 'repository_full_name',
        },
        {
          title: this.$i18n.t('item["ScanAt"]'),
          align: 'start',
          sortable: false,
          key: 'scan_at',
        },
      ]
    },
  },
  mounted() {
    this.loading = true
    this.loadList('')
    this.loading = false
  },
  methods: {
    async loadList() {
      const gitleaksCaches = await this.listGitleaksCacheAPI(
        this.githubSettingID
      ).catch((err) => {
        return Promise.reject(err)
      })
      if (!gitleaksCaches) {
        return
      }
      this.table.items = gitleaksCaches
    },
    handleCancel() {
      this.$emit('handleGitleaksCacheResponse', false)
    },
  },
}
</script>
