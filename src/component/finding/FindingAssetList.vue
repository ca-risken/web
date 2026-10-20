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
      class="text-body-2 my-3"
      role="status"
    >
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
      v-model:expanded="expanded"
      @update:options="refresh"
      @update:expanded="expand"
    >
      <template v-slot:[`item.asset_name`]="{ item }">
        <div class="d-flex align-start asset-name-cell">
          <button
            class="asset-name"
            :class="{ 'asset-name-full': fullNames[item.raw.rowKey] }"
            :aria-expanded="!!fullNames[item.raw.rowKey]"
            @click="fullNames[item.raw.rowKey] = !fullNames[item.raw.rowKey]"
          >
            {{
              fullNames[item.raw.rowKey]
                ? item.raw.asset_name
                : displayName(item.raw)
            }}
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
      <template
        v-slot:[`item.finding_count`]="{ item, isExpanded, toggleExpand }"
      >
        <v-btn
          variant="text"
          :aria-label="
            $t('assetView.showFindings', { count: item.raw.finding_count })
          "
          :aria-expanded="isExpanded(item)"
          @click="toggleExpand(item)"
        >
          {{ $t('assetView.countValue', { count: item.raw.finding_count }) }}
        </v-btn>
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
          <td :colspan="columns.length" class="pa-4">
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
            <div
              v-for="finding in details[item.raw.rowKey]?.items || []"
              :key="finding.finding_id"
              class="finding-detail mb-4"
            >
              <div class="finding-detail-heading d-flex flex-wrap align-center">
                <strong>#{{ finding.finding_id }}</strong>
                <v-chip
                  size="small"
                  variant="flat"
                  :color="scoreColor(finding.score || 0)"
                >
                  {{ formatScore(finding.score || 0) }}
                </v-chip>
                <span class="text-caption">{{ finding.status }}</span>
                <v-btn
                  variant="text"
                  @click="
                    actions({ value: finding })[0].click({ value: finding })
                  "
                  >{{ $t('assetView.open') }}</v-btn
                >
                <v-menu
                  ><template v-slot:activator="{ props }"
                    ><v-btn
                      v-bind="props"
                      icon="mdi-dots-vertical"
                      variant="text"
                  /></template>
                  <v-list
                    ><v-list-item
                      v-for="action in actions({ value: finding })"
                      :key="action.text"
                      @click="action.click({ value: finding })"
                    >
                      <v-list-item-title>{{
                        $t(`action['${action.text}']`)
                      }}</v-list-item-title>
                    </v-list-item></v-list
                  >
                </v-menu>
              </div>
              <div class="text-body-2 wrap">{{ finding.description }}</div>
              <div
                v-for="line in vulnerability(finding.data)"
                :key="line"
                class="text-body-2 wrap"
              >
                {{ line }}
              </div>
              <details
                v-if="vulnerability(finding.data, true).length"
                class="mt-2 text-body-2"
              >
                <summary>{{ $t('assetView.locations') }}</summary>
                <div
                  v-for="line in vulnerability(finding.data, true)"
                  :key="line"
                  class="wrap mt-1"
                >
                  {{ line }}
                </div>
              </details>
            </div>
            <div v-if="details[item.raw.rowKey]" class="d-flex align-center">
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
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
export default {
  components: { VDataTableServer, BottomSnackBar },
  props: {
    scoreColor: { type: Function, required: true },
    dataSourceIcon: { type: Function, required: true },
    dataSourceIconColor: { type: Function, required: true },
    formatScore: { type: Function, required: true },
    loadAssets: { type: Function, required: true },
    loadDetails: { type: Function, required: true },
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
        const result = await this.loadDetails(asset, page)
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  padding: 8px 0;
}
.asset-name-full {
  display: block;
  -webkit-line-clamp: unset;
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
  background: rgb(var(--v-theme-surface));
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
