<template>
  <div class="work-list">
    <details v-for="work in workGroups" :key="work.key" class="work-group">
      <summary class="work-heading">
        <span class="work-icon"
          ><v-icon size="20" aria-hidden="true">{{
            {
              app: 'mdi-code-braces',
              os: 'mdi-server',
              location: 'mdi-package-variant-closed',
              unknown: 'mdi-help-circle-outline',
            }[work.type]
          }}</v-icon></span
        >
        <span class="work-title">{{
          $t('assetView.workTypes.' + work.type)
        }}</span>
        <span class="work-count">{{
          $t('assetView.countValue', { count: work.count })
        }}</span>
        <v-icon class="expand-icon" size="small">mdi-chevron-down</v-icon>
      </summary>
      <div class="work-content">
        <p
          v-if="work.type === 'os' && work.location"
          class="text-caption px-4 py-2 mb-0 wrap"
        >
          {{ work.location }}
        </p>
        <v-table density="comfortable" class="package-table">
          <thead>
            <tr>
              <th>{{ $t('assetView.packageName') }}</th>
              <th>{{ $t('assetView.packageType') }}</th>
              <th>{{ $t('assetView.fixedVersion') }}</th>
              <th class="text-center">{{ $t('assetView.count') }}</th>
              <th class="expand-column">
                <span class="sr-only">{{ $t('assetView.details') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in work.packages" :key="group.package_key">
              <tr
                :class="{
                  'package-selected': expandedPackages[group.package_key],
                }"
              >
                <td class="package-name">
                  <span class="font-weight-medium">{{
                    group.package_name || $t('assetView.unknownPackage')
                  }}</span>
                  <div
                    v-if="work.type === 'location'"
                    class="text-caption text-medium-emphasis wrap"
                  >
                    {{ group.work_location }}
                  </div>
                </td>
                <td class="text-medium-emphasis">
                  {{ group.package_type || '—' }}
                </td>
                <td class="version-cell">
                  <div
                    v-for="version in fixedVersions(group)"
                    :key="version.fixed_version"
                    class="fixed-version"
                  >
                    <span>{{
                      version.fixed_version || $t('assetView.noFixedVersion')
                    }}</span>
                    <span
                      v-if="fixedVersions(group).length > 1"
                      class="text-caption text-medium-emphasis"
                      >{{
                        $t('assetView.countValue', {
                          count: version.finding_count,
                        })
                      }}</span
                    >
                  </div>
                </td>
                <td class="text-center">{{ group.finding_count }}</td>
                <td class="expand-column">
                  <v-btn
                    :icon="
                      expandedPackages[group.package_key]
                        ? 'mdi-chevron-up'
                        : 'mdi-chevron-down'
                    "
                    size="small"
                    variant="text"
                    :aria-label="
                      $t('assetView.showPackageFindings', {
                        package:
                          group.package_name || $t('assetView.unknownPackage'),
                      })
                    "
                    :aria-expanded="!!expandedPackages[group.package_key]"
                    @click="toggle(group)"
                  />
                </td>
              </tr>
              <tr
                v-if="expandedPackages[group.package_key]"
                class="package-expanded"
              >
                <td colspan="5" class="pa-0">
                  <div class="package-content">
                    <v-progress-linear
                      v-if="entries[group.package_key]?.loading"
                      indeterminate
                    />
                    <v-alert
                      v-if="entries[group.package_key]?.error"
                      type="error"
                      variant="tonal"
                      class="my-2"
                      >{{ $t('assetView.error')
                      }}<v-btn variant="text" @click="load(group, 1)">{{
                        $t('assetView.retry')
                      }}</v-btn></v-alert
                    >
                    <v-table
                      v-if="entries[group.package_key]?.items.length"
                      density="comfortable"
                      class="finding-table"
                    >
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th class="text-center">
                            {{ $t('assetView.status') }}
                          </th>
                          <th class="text-center">
                            {{ $t('assetView.findingScore') }}
                          </th>
                          <th>{{ $t('assetView.findingDescription') }}</th>
                          <th class="expand-column">
                            <span class="sr-only">{{
                              $t('assetView.actions')
                            }}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="finding in entries[group.package_key]?.items ||
                          []"
                          :key="finding.finding_id"
                          class="finding-row"
                          tabindex="0"
                          :aria-label="
                            $t('assetView.showAISummary', {
                              description:
                                finding.description || finding.finding_id,
                            })
                          "
                          @click="
                            actions({ value: finding })[0].click({
                              value: finding,
                            })
                          "
                          @keydown.enter.self="
                            actions({ value: finding })[0].click({
                              value: finding,
                            })
                          "
                          @keydown.space.self.prevent="
                            actions({ value: finding })[0].click({
                              value: finding,
                            })
                          "
                        >
                          <td>
                            <v-btn
                              variant="text"
                              size="small"
                              class="finding-id px-0"
                              @click.stop="
                                actions({ value: finding })[0].click({
                                  value: finding,
                                })
                              "
                              >{{ finding.finding_id }}</v-btn
                            >
                          </td>
                          <td class="text-center">
                            <v-icon
                              :color="statusColor(finding.status)"
                              :aria-label="finding.status"
                              role="img"
                              >mdi-check-circle</v-icon
                            >
                          </td>
                          <td class="text-center">
                            <v-chip
                              size="small"
                              variant="flat"
                              :color="scoreColor(finding.score || 0)"
                              >{{ formatScore(finding.score || 0) }}</v-chip
                            >
                          </td>
                          <td class="finding-description">
                            <button
                              type="button"
                              class="finding-description-link wrap"
                              :aria-label="
                                $t('assetView.showAISummary', {
                                  description:
                                    finding.description || finding.finding_id,
                                })
                              "
                              @click.stop="
                                actions({ value: finding })[0].click({
                                  value: finding,
                                })
                              "
                            >
                              {{ finding.description || finding.finding_id }}
                            </button>
                            <div
                              class="text-caption text-medium-emphasis wrap"
                              v-for="line in vulnerability(finding.data).slice(
                                0,
                                1
                              )"
                              :key="line"
                            >
                              {{ line }}
                            </div>
                            <details
                              v-if="vulnerability(finding.data, true).length"
                              class="finding-locations text-caption mt-1"
                              @click.stop
                            >
                              <summary>{{ $t('assetView.locations') }}</summary>
                              <div
                                v-for="line in vulnerability(
                                  finding.data,
                                  true
                                )"
                                :key="line"
                                class="wrap mt-1"
                              >
                                {{ line }}
                              </div>
                            </details>
                          </td>
                          <td @click.stop>
                            <v-menu
                              ><template v-slot:activator="{ props }"
                                ><v-btn
                                  v-bind="props"
                                  icon="mdi-dots-vertical"
                                  variant="text"
                                  size="small"
                                  :aria-label="
                                    $t('assetView.actions')
                                  " /></template
                              ><v-list density="compact"
                                ><v-list-item
                                  v-for="action in actions({ value: finding })"
                                  :key="action.text"
                                  :prepend-icon="action.icon"
                                  @click="action.click({ value: finding })"
                                  ><v-list-item-title>{{
                                    $t(`action['${action.text}']`)
                                  }}</v-list-item-title></v-list-item
                                ></v-list
                              ></v-menu
                            >
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                    <div
                      v-if="entries[group.package_key]?.total > 20"
                      class="d-flex justify-end align-center mt-2"
                    >
                      <v-btn
                        variant="text"
                        :disabled="
                          entries[group.package_key].page <= 1 ||
                          entries[group.package_key].loading
                        "
                        @click="
                          load(group, entries[group.package_key].page - 1)
                        "
                        >{{ $t('assetView.previous') }}</v-btn
                      >
                      <span class="text-body-2"
                        >{{ entries[group.package_key].page }} /
                        {{
                          Math.max(
                            1,
                            Math.ceil(entries[group.package_key].total / 20)
                          )
                        }}</span
                      >
                      <v-btn
                        variant="text"
                        :disabled="
                          entries[group.package_key].page * 20 >=
                            entries[group.package_key].total ||
                          entries[group.package_key].loading
                        "
                        @click="
                          load(group, entries[group.package_key].page + 1)
                        "
                        >{{ $t('assetView.next') }}</v-btn
                      >
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </v-table>
      </div>
    </details>
  </div>
</template>
<script>
export default {
  props: {
    asset: { type: Object, required: true },
    packages: { type: Array, required: true },
    loadDetails: { type: Function, required: true },
    actions: { type: Function, required: true },
    scoreColor: { type: Function, required: true },
    formatScore: { type: Function, required: true },
    statusColor: { type: Function, required: true },
    vulnerability: { type: Function, required: true },
  },
  computed: {
    workGroups() {
      const groups = new Map()
      for (const pkg of this.packages) {
        const type = ['app', 'os', 'location'].includes(pkg.work_type)
          ? pkg.work_type
          : 'unknown'
        const location = type === 'location' ? '' : pkg.work_location || ''
        const key = JSON.stringify([type, location])
        if (!groups.has(key))
          groups.set(key, {
            key,
            type,
            location,
            count: 0,
            packages: [],
          })
        const group = groups.get(key)
        group.count += Number(pkg.finding_count || 0)
        group.packages.push(pkg)
      }
      return [...groups.values()]
    },
  },
  data: () => ({ entries: {}, expandedPackages: {}, alive: true }),
  beforeUnmount() {
    this.alive = false
  },
  methods: {
    fixedVersions(group) {
      const versions = new Map()
      for (const version of group.versions || []) {
        const key = version.fixed_version || ''
        if (!versions.has(key))
          versions.set(key, { fixed_version: key, finding_count: 0 })
        versions.get(key).finding_count += Number(version.finding_count || 0)
      }
      return [...versions.values()]
    },
    toggle(group) {
      const key = group.package_key
      this.expandedPackages[key] = !this.expandedPackages[key]
      if (this.expandedPackages[key] && !this.entries[key]) this.load(group, 1)
    },
    async load(group, page) {
      this.entries[group.package_key] = {
        loading: true,
        error: false,
        items: [],
        total: group.finding_count,
        page,
      }
      const entry = this.entries[group.package_key]
      try {
        const result = await this.loadDetails(
          this.asset,
          page,
          group.package_key
        )
        if (this.alive && this.entries[group.package_key] === entry)
          Object.assign(entry, result)
      } catch {
        entry.error = true
      } finally {
        entry.loading = false
      }
    },
  },
}
</script>
<style scoped>
.work-list {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}
.work-group {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.work-group:last-child {
  border-bottom: 0;
}
.work-heading {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto 24px;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  list-style: none;
}
.work-heading::-webkit-details-marker {
  display: none;
}
.work-heading:hover,
.package-table :deep(tbody > tr:not(.package-expanded):hover) {
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.work-heading:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
}
.work-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.work-title {
  font-size: 0.875rem;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.work-count {
  min-width: 48px;
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-align: center;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}
.expand-icon {
  justify-self: center;
}
.work-group[open] > .work-heading .expand-icon {
  transform: rotate(180deg);
}
.work-group[open] > .work-heading {
  background: rgba(var(--v-theme-primary), 0.05);
}
.work-content {
  padding: 0 20px 20px 68px;
}
.package-table :deep(th),
.finding-table :deep(th) {
  white-space: nowrap;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-weight: 500;
}
.package-table :deep(td),
.finding-table :deep(td) {
  font-size: 0.875rem;
}
.package-name {
  min-width: 160px;
  max-width: 320px;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  overflow-wrap: anywhere;
}
.version-cell {
  max-width: 200px;
  overflow-wrap: anywhere;
}
.expand-column {
  width: 48px;
}
.package-selected {
  background: rgba(var(--v-theme-primary), 0.04);
}
.package-content {
  margin: 12px 12px 20px;
  padding: 0 0 0 12px;
  border-left: 2px solid rgba(var(--v-theme-primary), 0.2);
}
.package-table :deep(thead),
.finding-table :deep(thead) {
  background: rgba(var(--v-theme-on-surface), 0.025);
}
.fixed-version {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 3px 0;
}
@media (max-width: 600px) {
  .work-heading {
    padding: 12px;
    gap: 8px;
  }
  .work-content {
    padding: 0 12px 12px;
  }
}
.finding-row {
  cursor: pointer;
}
.finding-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.finding-row:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
}
.finding-description {
  min-width: 240px;
  max-width: 560px;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
.finding-description-link {
  color: rgb(var(--v-theme-primary));
  text-align: left;
  cursor: pointer;
}
.finding-description-link:hover {
  text-decoration: underline;
}
.finding-description-link:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
.finding-id {
  text-transform: none;
  font-variant-numeric: tabular-nums;
}
.finding-locations summary {
  cursor: pointer;
  color: rgb(var(--v-theme-primary));
}
.wrap {
  overflow-wrap: anywhere;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
