<template>
  <div>
    <v-alert v-if="error" type="error" class="my-2">
      {{ $t('assetView.error') }}
      <v-btn variant="text" @click="refresh(options)">{{
        $t('assetView.retry')
      }}</v-btn>
    </v-alert>
    <p
      v-if="!loading && !error && totalFindingCount !== null"
      class="asset-summary"
      role="status"
    >
      <v-icon size="18" aria-hidden="true">mdi-layers-triple-outline</v-icon>
      {{
        $t('assetView.summary', {
          findings: Number(totalFindingCount).toLocaleString(),
          assets: total.toLocaleString(),
        })
      }}
    </p>
    <v-data-table-server
      class="asset-table"
      :headers="headers"
      :items="assets"
      :items-length="total"
      :loading="loading"
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :items-per-page-options="[
        { value: 20, title: '20' },
        { value: 50, title: '50' },
        { value: 100, title: '100' },
      ]"
      v-model:sort-by="sortBy"
      item-value="rowKey"
      show-expand
      v-model:expanded="expanded"
      @update:options="refresh"
      @update:expanded="expand"
    >
      <template v-slot:[`item.asset_type`]="{ item }">
        <span class="asset-type"
          ><v-icon size="20" aria-hidden="true">{{
            {
              Image: 'mdi-docker',
              VM: 'mdi-server',
              Workload: 'mdi-kubernetes',
              Resource: 'mdi-cube-outline',
              Unknown: 'mdi-help-circle-outline',
            }[item.raw.asset_type] || 'mdi-cube-outline'
          }}</v-icon
          ><span>{{ item.raw.asset_type }}</span></span
        >
      </template>
      <template v-slot:[`item.asset_name`]="{ item }">
        <div class="d-flex align-start asset-name-cell">
          <button
            class="asset-name"
            :class="{ 'asset-name-full': fullNames[item.raw.rowKey] }"
            :aria-label="item.raw.asset_name"
            :aria-expanded="!!fullNames[item.raw.rowKey]"
            @click="fullNames[item.raw.rowKey] = !fullNames[item.raw.rowKey]"
          >
            <span class="asset-short-name">{{ shortName(item.raw) }}</span>
            <span
              v-if="item.raw.asset_name !== shortName(item.raw)"
              class="asset-path"
              >{{
                fullNames[item.raw.rowKey]
                  ? item.raw.asset_name
                  : displayName(item.raw)
              }}</span
            >
          </button>
          <v-btn
            icon="mdi-content-copy"
            variant="text"
            size="x-small"
            :aria-label="$t('assetView.copyName')"
            @click="copyName(item.raw.asset_name)"
          />
        </div>
      </template>
      <template v-slot:[`item.finding_count`]="{ item }">
        <span class="asset-count">{{
          $t('assetView.countValue', { count: item.raw.finding_count })
        }}</span>
      </template>
      <template
        v-slot:[`item.data-table-expand`]="{ item, isExpanded, toggleExpand }"
      >
        <v-btn
          :icon="isExpanded(item) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          variant="text"
          size="small"
          :aria-label="
            $t('assetView.showFindings', { count: item.raw.finding_count })
          "
          :aria-expanded="isExpanded(item)"
          @click="toggleExpand(item)"
        />
      </template>
      <template v-slot:[`item.data_source`]="{ item }">
        <span v-if="!item.raw.data_sources?.length">—</span>
        <v-tooltip
          v-for="source in item.raw.data_sources || []"
          :key="source"
          :text="source"
        >
          <template v-slot:activator="{ props }">
            <v-avatar
              v-if="source === 'RISKEN'"
              v-bind="props"
              size="30"
              class="mx-1"
            >
              <img src="/static/m.png" :alt="source" />
            </v-avatar>
            <v-icon
              v-else
              v-bind="props"
              :color="dataSourceIconColor(source)"
              :aria-label="source"
              class="mx-1"
            >
              {{ dataSourceIcon(source) }}
            </v-icon>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:[`item.score`]="{ item }">
        <v-chip variant="flat" :color="scoreColor(item.raw.max_score || 0)">
          {{ formatScore(item.raw.max_score || 0) }}
        </v-chip>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr class="asset-detail-row">
          <td :colspan="columns.length" class="asset-detail-cell">
            <div class="candidate-heading">
              <v-icon size="20" color="primary" aria-hidden="true"
                >mdi-wrench-outline</v-icon
              >
              <h3>{{ $t('assetView.remediationCandidates') }}</h3>
              <span
                v-if="
                  details[item.raw.rowKey] &&
                  !details[item.raw.rowKey].loading &&
                  !details[item.raw.rowKey].error
                "
                class="candidate-total"
                >{{
                  $t('assetView.categoryCount', {
                    count: details[item.raw.rowKey].total,
                  })
                }}</span
              >
            </div>
            <v-progress-linear
              v-if="details[item.raw.rowKey]?.loading"
              indeterminate
            />
            <v-alert v-if="details[item.raw.rowKey]?.error" type="error">
              {{ $t('assetView.error') }}
              <v-btn variant="text" @click="loadDetail(item.raw, 1)">{{
                $t('assetView.retry')
              }}</v-btn>
            </v-alert>
            <finding-package-list
              :key="
                JSON.stringify([
                  item.raw.rowKey,
                  details[item.raw.rowKey]?.page,
                ])
              "
              :asset="item.raw"
              :packages="details[item.raw.rowKey]?.packages || []"
              :load-details="loadDetails"
              :actions="actions"
              :score-color="scoreColor"
              :format-score="formatScore"
              :status-color="statusColor"
              :vulnerability="vulnerability"
            />
            <div
              v-if="details[item.raw.rowKey]?.total > 20"
              class="d-flex justify-end align-center mt-2"
            >
              <v-btn
                variant="text"
                :disabled="
                  details[item.raw.rowKey].page <= 1 ||
                  details[item.raw.rowKey].loading
                "
                @click="loadDetail(item.raw, details[item.raw.rowKey].page - 1)"
                >{{ $t('assetView.previous') }}</v-btn
              >
              <span
                >{{ details[item.raw.rowKey].page }} /
                {{
                  Math.max(1, Math.ceil(details[item.raw.rowKey].total / 20))
                }}</span
              >
              <v-btn
                variant="text"
                :disabled="
                  details[item.raw.rowKey].page * 20 >=
                    details[item.raw.rowKey].total ||
                  details[item.raw.rowKey].loading
                "
                @click="loadDetail(item.raw, details[item.raw.rowKey].page + 1)"
                >{{ $t('assetView.next') }}</v-btn
              >
            </div>
          </td>
        </tr>
      </template>
    </v-data-table-server>
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>
<script>
import FindingPackageList from './FindingPackageList.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
export default {
  components: { VDataTableServer, BottomSnackBar, FindingPackageList },
  props: {
    scoreColor: { type: Function, required: true },
    dataSourceIcon: { type: Function, required: true },
    dataSourceIconColor: { type: Function, required: true },
    formatScore: { type: Function, required: true },
    statusColor: { type: Function, required: true },
    loadAssets: { type: Function, required: true },
    loadDetails: { type: Function, required: true },
    loadPackages: { type: Function, required: true },
    actions: { type: Function, required: true },
    organizationMode: Boolean,
  },
  data: () => ({
    page: 1,
    itemsPerPage: 20,
    sortBy: [{ key: 'score', order: 'desc' }],
    assets: [],
    total: 0,
    totalFindingCount: null,
    loading: false,
    error: false,
    details: {},
    expanded: [],
    fullNames: {},
    sequence: 0,
    alive: true,
    options: {},
  }),
  computed: {
    headers() {
      return [
        { title: this.$t('assetView.type'), key: 'asset_type' },
        { title: this.$t('assetView.name'), key: 'asset_name', width: 352 },
        {
          title: this.$t('assetView.dataSource'),
          key: 'data_source',
          sortable: false,
        },
        ...(this.organizationMode
          ? [{ title: this.$t('assetView.project'), key: 'project_id' }]
          : []),
        { title: this.$t('assetView.score'), key: 'score' },
        { title: this.$t('assetView.count'), key: 'finding_count' },
      ].map((header) => ({
        ...header,
        align: header.key === 'asset_name' ? 'start' : 'center',
      }))
    },
  },
  beforeUnmount() {
    this.alive = false
    this.sequence++
  },
  methods: {
    async copyName(name) {
      try {
        await navigator.clipboard.writeText(name)
        this.$refs.snackbar.notifyInfo(this.$t('assetView.nameCopied'))
      } catch {
        this.$refs.snackbar.notifyError(this.$t('assetView.copyFailed'))
      }
    },
    async refresh(options) {
      this.options = options
      const sequence = ++this.sequence
      this.loading = true
      this.error = false
      this.totalFindingCount = null
      this.assets = []
      this.details = {}
      this.expanded = []
      this.fullNames = {}
      try {
        const list = await this.loadAssets(options)
        if (!this.alive || sequence !== this.sequence) return
        this.assets = (list.assets || []).map((a) => ({
          ...a,
          rowKey: JSON.stringify([a.project_id, a.asset_type, a.asset_key]),
        }))
        this.total = list.total || 0
        this.totalFindingCount = list.total_finding_count ?? null
      } catch {
        if (this.alive && sequence === this.sequence) this.error = true
      } finally {
        if (this.alive && sequence === this.sequence) this.loading = false
      }
    },
    expand(keys) {
      for (const key of keys) {
        const asset = this.assets.find((a) => a.rowKey === key)
        if (asset && !this.details[key]) this.loadDetail(asset, 1)
      }
    },
    async loadDetail(asset, page) {
      const sequence = this.sequence
      this.details[asset.rowKey] = {
        loading: true,
        error: false,
        items: [],
        total: 0,
        page,
      }
      const entry = this.details[asset.rowKey]
      try {
        const result = await this.loadPackages(asset, page)
        if (
          !this.alive ||
          sequence !== this.sequence ||
          this.details[asset.rowKey] !== entry
        )
          return
        Object.assign(entry, result)
      } catch {
        entry.error = true
      } finally {
        entry.loading = false
      }
    },
    shortName(asset) {
      return (
        this.displayName(asset)?.split('/').filter(Boolean).pop() ||
        asset.asset_name
      )
    },
    displayName(asset) {
      if (asset.asset_type !== 'Image') return asset.asset_name
      return (asset.asset_name || '').replace(
        /(@sha256:)([a-fA-F0-9]{64})/g,
        (_, prefix, hash) => prefix + hash.slice(0, 12) + '…'
      )
    },
    vulnerability(data, additional = false) {
      try {
        const report = typeof data === 'string' ? JSON.parse(data) : data
        const f = report?.finding || {}
        const v = f.vulnerability || {}
        const lines = []
        if (v.cve?.id) lines.push(v.cve.id)
        for (const [label, pkg] of [
          ['package', v.offending_package],
          ['fixedPackage', v.fixed_package],
        ]) {
          if (pkg?.package_name || pkg?.packageName)
            lines.push(
              this.$t('assetView.' + label) +
                ': ' +
                [
                  pkg.package_name || pkg.packageName,
                  pkg.package_version || pkg.packageVersion,
                ]
                  .filter(Boolean)
                  .join(' / ')
            )
        }
        const locations = []
        for (const c of [
          f.container,
          ...(f.kubernetes?.objects || []).flatMap((o) => o.containers || []),
        ]) {
          if (c?.image_id || c?.uri)
            locations.push(
              this.$t('assetView.image') +
                ': ' +
                [...new Set([c.uri, c.image_id].filter(Boolean))].join(' / ')
            )
        }
        for (const file of [
          ...(f.files || []),
          ...(v.offending_package?.files || []),
        ]) {
          if (file.path)
            locations.push(this.$t('assetView.files') + ': ' + file.path)
        }
        return [...new Set(additional ? locations : lines)]
      } catch {
        return []
      }
    },
  },
}
</script>
<style scoped>
.asset-name {
  display: block;
  cursor: pointer;
  color: inherit;
  text-align: left;
  flex: 1;
  min-width: 0;
  max-width: 320px;
  overflow-wrap: anywhere;
}
.asset-name-cell {
  width: 320px;
  gap: 4px;
  padding: 16px 0;
}
.asset-short-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
}
.asset-path {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 5px;
  font-size: 0.75rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.asset-name-full .asset-path {
  display: block;
  -webkit-line-clamp: unset;
}
.asset-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 12px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.asset-type {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.asset-count {
  display: inline-block;
  min-width: 52px;
  padding: 4px 12px;
  border-radius: 14px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  font-size: 0.8125rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.asset-table {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}
.asset-table :deep(.v-data-table__thead > tr > th) {
  background: rgba(var(--v-theme-on-surface), 0.025);
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.asset-table :deep(.v-data-table__tbody > tr:not(.asset-detail-row):hover) {
  background: rgba(var(--v-theme-primary), 0.035);
}
.asset-table :deep(th) {
  white-space: nowrap;
}
.asset-table :deep(td:last-of-type) {
  white-space: nowrap;
}
.asset-name:hover {
  text-decoration: underline;
}
.asset-name:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
.asset-table :deep(tr:has(+ .asset-detail-row)) {
  background: rgba(var(--v-theme-primary), 0.06);
}
.asset-detail-row {
  background: rgba(var(--v-theme-on-surface), 0.025);
}
.asset-detail-cell {
  padding: 24px !important;
}
.candidate-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.candidate-heading h3 {
  font-size: 1rem;
  font-weight: 700;
}
.candidate-total {
  margin-left: auto;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.75rem;
}
@media (max-width: 600px) {
  .asset-detail-cell {
    padding: 16px 12px !important;
  }
}
.finding-detail {
  padding: 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
}
.asset-table :deep(.asset-detail-row > td) {
  white-space: normal;
}
.finding-detail-heading {
  gap: 8px;
}
summary {
  cursor: pointer;
  color: inherit;
}
.wrap {
  overflow-wrap: anywhere;
}
</style>
