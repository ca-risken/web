<template>
  <div class="border-e">
    <v-toolbar color="background" flat density="compact">
      <v-toolbar-title class="text-subtitle-1">
        <v-icon class="pr-2" color="blue-lighten-2">
          mdi-file-document-outline
        </v-icon>
        {{ $t(`menu['Report']`) }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        class="mr-4"
        color="grey-darken-2"
        size="default"
        density="compact"
        icon="mdi-refresh"
        variant="plain"
        :loading="loading"
        @click="handleList"
      />
      <v-btn
        color="grey-darken-2"
        variant="outlined"
        @click="handleNewReport"
        size="small"
      >
        <v-icon left>mdi-plus</v-icon>
        {{ $t(`btn['NEW']`) }}
      </v-btn>
    </v-toolbar>

    <v-card flat class="mx-2">
      <v-text-field
        v-model="searchQuery"
        density="compact"
        variant="outlined"
        clearable
        hide-details
        placeholder="Search reports by keyword..."
        prepend-inner-icon="mdi-magnify"
      />
    </v-card>

    <v-card flat class="mt-2">
      <v-card-text class="pa-1">
        <div v-if="loading" class="text-center pa-4">
          <v-progress-circular indeterminate size="24"></v-progress-circular>
          <div class="mt-4 text-caption">Loading reports...</div>
        </div>

        <div v-else-if="reportList.length === 0" class="text-center pa-4">
          <v-icon size="48" color="grey-lighten-2">
            mdi-file-document-outline
          </v-icon>
          <div class="text-subtitle-2 mt-2 grey--text">No reports found</div>
          <div class="text-caption grey--text">
            Click "NEW" to create your first report
          </div>
        </div>

        <v-list v-else class="pa-0" density="compact">
          <v-list-item
            v-for="item in filteredReportList"
            :key="item.report_id"
            @click="handleSelectReport(item)"
            :class="{ 'bg-blue-lighten-5': selectedReportId == item.report_id }"
            class="border-b-thin"
          >
            <template v-slot:prepend>
              <v-icon color="blue-lighten-2" size="default">
                mdi-file-document-outline
              </v-icon>
            </template>

            <v-list-item-title class="text-subtitle-1">
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ formatDate(item.updated_at) }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                class="mr-1"
              >
                {{ item.status }}
              </v-chip>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    v-bind="props"
                    variant="text"
                    size="small"
                    @click.stop
                  >
                    <v-icon size="small">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="handleReGenerate(item)">
                    <v-list-item-title>
                      <v-icon size="small" class="mr-2">mdi-robot</v-icon>
                      {{ $t(`btn['Re-generate']`) }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import mixin from '@/mixin'
import report from '@/mixin/api/report'

export default {
  name: 'ReportList',
  mixins: [mixin, report],
  props: {
    selectedReportId: {
      type: [String, Number],
      default: null,
    },
  },
  emits: ['select-report', 'create-report', 're-generate', 'error'],
  data() {
    return {
      loading: false,
      reportList: [],
      searchQuery: '',
    }
  },
  mounted() {
    this.loadReportList()
  },
  computed: {
    filteredReportList() {
      if (!this.searchQuery) {
        return this.reportList
      }
      const query = this.searchQuery.toLowerCase()
      return this.reportList.filter((report) => {
        const nameMatch = report.name.toLowerCase().includes(query)
        const dateMatch = this.formatDate(report.updated_at)
          .toLowerCase()
          .includes(query)
        const contentMatch =
          report.content && report.content.toLowerCase().includes(query)
        return nameMatch || dateMatch || contentMatch
      })
    },
  },
  methods: {
    async loadReportList() {
      this.loading = true
      try {
        const reports = await this.listReport()
        this.reportList = reports.sort((a, b) => {
          return (b.updated_at || 0) - (a.updated_at || 0)
        })
      } catch (error) {
        this.$emit('error', error)
      } finally {
        this.loading = false
      }
    },

    handleSelectReport(report) {
      this.$emit('select-report', report)
    },

    handleNewReport() {
      this.$emit('create-report')
    },

    handleReGenerate(report) {
      this.$emit('re-generate', report)
    },

    handleList() {
      this.loadReportList()
    },

    refreshList() {
      this.loadReportList()
    },

    getStatusColor(status) {
      switch (status) {
        case 'OK':
          return 'green'
        case 'IN_PROGRESS':
          return 'orange'
        case 'ERROR':
          return 'red'
        default:
          return 'grey'
      }
    },

    formatDate(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp * 1000)
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    },
  },
}
</script>
