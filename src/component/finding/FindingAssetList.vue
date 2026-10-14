<template>
  <div>
    <v-alert v-if="error" type="error" class="my-2">
      {{ $t('assetView.error') }}
      <v-btn variant="text" @click="refresh(options)">{{
        $t('assetView.retry')
      }}</v-btn>
    </v-alert>
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
      show-expand
      @update:options="refresh"
      @update:expanded="expand"
    >
      <template v-slot:[`item.asset_name`]="{ item }">
        <span class="asset-name">{{ item.raw.asset_name }}</span>
      </template>
      <template v-slot:[`item.score`]="{ item }">
        <v-chip variant="flat" :color="scoreColor(item.raw.max_score || 0)">
          {{ formatScore(item.raw.max_score || 0) }}
        </v-chip>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
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
              class="mb-4"
            >
              <div class="d-flex align-center">
                <strong
                  >{{ finding.finding_id }} · {{ finding.score || 0 }} ·
                  {{ finding.status }}</strong
                >
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
              <v-divider class="mt-3" />
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
  </div>
</template>
<script>
import { VDataTableServer } from 'vuetify/labs/VDataTable'
export default {
  components: { VDataTableServer },
  props: {
    scoreColor: { type: Function, required: true },
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
    loading: false,
    error: false,
    details: {},
    expanded: [],
    sequence: 0,
    alive: true,
    options: {},
  }),
  computed: {
    headers() {
      return [
        { title: this.$t('assetView.type'), key: 'asset_type' },
        { title: this.$t('assetView.name'), key: 'asset_name' },
        ...(this.organizationMode
          ? [{ title: this.$t('assetView.project'), key: 'project_id' }]
          : []),
        { title: this.$t('assetView.score'), key: 'score' },
        { title: this.$t('assetView.count'), key: 'finding_count' },
      ].map((header) => ({ ...header, align: 'center' }))
    },
  },
  beforeUnmount() {
    this.alive = false
    this.sequence++
  },
  methods: {
    async refresh(options) {
      this.options = options
      const sequence = ++this.sequence
      this.loading = true
      this.error = false
      this.assets = []
      this.details = {}
      this.expanded = []
      try {
        const list = await this.loadAssets(options)
        if (!this.alive || sequence !== this.sequence) return
        this.assets = (list.assets || []).map((a) => ({
          ...a,
          rowKey: JSON.stringify([a.project_id, a.asset_type, a.asset_key]),
        }))
        this.total = list.total || 0
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
    vulnerability(data) {
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
        for (const c of [
          f.container,
          ...(f.kubernetes?.objects || []).flatMap((o) => o.containers || []),
        ]) {
          if (c?.image_id || c?.uri)
            lines.push(
              this.$t('assetView.image') +
                ': ' +
                [c.uri, c.image_id].filter(Boolean).join(' / ')
            )
        }
        for (const file of [
          ...(f.files || []),
          ...(v.offending_package?.files || []),
        ]) {
          if (file.path)
            lines.push(this.$t('assetView.files') + ': ' + file.path)
        }
        return [...new Set(lines)]
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
  text-align: left;
  min-width: 280px;
  max-width: 320px;
  overflow-wrap: anywhere;
}
.asset-table :deep(th) {
  white-space: nowrap;
}
.asset-table :deep(td:last-of-type) {
  white-space: nowrap;
}
</style>
