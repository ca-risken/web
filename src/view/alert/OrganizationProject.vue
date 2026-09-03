<template>
  <div>
    <v-container :class="{ 'pa-0': embedded }">
      <v-row v-if="!embedded" dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2" color="red-lighten-2">
                mdi-alert
              </v-icon>
              {{ $t(`submenu['OrganizationNotificationProjectSelect']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row v-if="!embedded" dense justify="center" align-content="center">
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="search"
            variant="outlined"
            clearable
            density="compact"
            bg-color="white"
            prepend-icon="mdi-magnify"
            placeholder="Type something..."
            hide-details
          />
        </v-col>
        <v-spacer />
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-progress-linear v-if="loading" indeterminate color="primary" />
          <v-expansion-panels v-else multiple :model-value="expandedPanels">
            <v-expansion-panel
              v-for="notification in displayedNotificationGroups"
              :key="notification.notification_id"
              :value="notification.notification_id"
            >
              <v-expansion-panel-title
                v-if="!embedded"
                v-slot="{ expanded }"
                hide-actions
              >
                <span class="font-weight-bold">
                  {{ $t(`submenu['OrganizationNotificationName']`) }}
                  {{ notification.name }}
                </span>
                <v-chip class="ml-3" size="small">
                  {{ $t(`item['Organization Notification ID']`) }}:
                  {{ notification.notification_id }}
                </v-chip>
                <v-spacer />
                <v-chip size="small" variant="outlined" class="mr-3">
                  <v-icon
                    start
                    size="small"
                    class="project-list-icon"
                    :class="{ 'project-list-icon--expanded': expanded }"
                  >
                    mdi-chevron-down
                  </v-icon>
                  {{ $t(`submenu['OrganizationProject']`) }}
                </v-chip>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-list>
                  <v-list-item class="project-row pl-0">
                    <template v-slot:prepend>
                      <v-checkbox-btn
                        :model-value="areAllProjectsChecked(notification)"
                        :indeterminate="areSomeProjectsChecked(notification)"
                        :disabled="saving"
                        class="mr-3"
                        @update:modelValue="
                          handleAllProjectsCheck(notification, $event)
                        "
                      />
                    </template>
                    <v-list-item-title class="font-weight-medium">
                      {{ $t(`btn['All Projects']`) }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-for="projectItem in paginatedProjects(
                      notification.projects,
                      notification.notification_id
                    )"
                    :key="projectItem.project_id"
                    class="project-row"
                  >
                    <template v-slot:prepend>
                      <v-checkbox-btn
                        :model-value="
                          isProjectChecked(notification, projectItem)
                        "
                        :indeterminate="
                          isProjectIndeterminate(notification, projectItem)
                        "
                        :loading="
                          isSelectionUpdating(
                            notification.notification_id,
                            projectItem.project_id
                          )
                        "
                        :disabled="
                          saving ||
                          isSelectionUpdating(
                            notification.notification_id,
                            projectItem.project_id
                          )
                        "
                        class="mr-3"
                        @update:modelValue="
                          handleProjectCheck(notification, projectItem, $event)
                        "
                      />
                    </template>
                    <v-list-item-title class="project-info">
                      <div class="project-title-row">
                        <v-chip class="project-id" size="x-small">
                          {{ $t(`item['ID']`) }}:
                          {{ projectItem.project_id }}
                        </v-chip>
                        <span
                          class="project-name text-body-2 font-weight-medium"
                        >
                          {{ projectItem.name }}
                        </span>
                      </div>
                    </v-list-item-title>
                    <div
                      class="notification-timing text-body-2 text-medium-emphasis mt-1"
                    >
                      {{ $t(`item['Last notified at']`) }}:
                      {{ formatLastNotifiedAt(projectItem.relations) }}
                    </div>
                    <template v-slot:append>
                      <div class="suppression-select" @click.stop>
                        <v-select
                          :model-value="
                            getUniformCacheSecond(
                              getProjectCacheSeconds(notification, projectItem)
                            )
                          "
                          :items="
                            getSuppressionOptions(
                              getProjectCacheSeconds(notification, projectItem)
                            )
                          "
                          item-title="title"
                          item-value="value"
                          item-props
                          density="compact"
                          variant="outlined"
                          hide-details
                          :label="$t(`item['Suppression time']`)"
                          :loading="
                            isCacheUpdating(
                              notification.notification_id,
                              projectItem.project_id
                            )
                          "
                          :disabled="
                            saving ||
                            !isProjectChecked(notification, projectItem) ||
                            isCacheUpdating(
                              notification.notification_id,
                              projectItem.project_id
                            )
                          "
                          @update:modelValue="
                            handleCacheUpdate(notification, projectItem, $event)
                          "
                        />
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
                <v-pagination
                  v-if="projectPageCount(notification.projects) > 1"
                  :model-value="getProjectPage(notification.notification_id)"
                  :length="projectPageCount(notification.projects)"
                  :total-visible="5"
                  density="compact"
                  class="mt-4"
                  @update:modelValue="
                    setProjectPage(notification.notification_id, $event)
                  "
                />
                <v-alert
                  v-if="filterProjects(notification.projects).length === 0"
                  type="info"
                  variant="text"
                >
                  No data.
                </v-alert>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-alert
            v-if="!loading && displayedNotificationGroups.length === 0"
            type="info"
            variant="tonal"
          >
            No data.
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import org_alert from '@/mixin/api/org_alert'
import project from '@/mixin/api/project'
import organization_helper from '@/mixin/helper/organization_helper'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'

export default {
  name: 'OrganizationAlertProject',
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
    notificationId: {
      type: Number,
      default: 0,
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [mixin, org_alert, project, organization_helper],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      search: '',
      notificationGroups: [],
      projectPages: {},
      projectsPerPage: 5,
      pendingSelections: {},
      pendingCacheUpdates: {},
      cacheUpdating: {},
      selectionUpdating: {},
      refreshSequence: 0,
    }
  },
  computed: {
    expandedPanels() {
      return this.embedded ? [this.notificationId] : undefined
    },
    displayedNotificationGroups() {
      if (!this.notificationId) {
        return this.notificationGroups
      }
      return this.notificationGroups.filter(
        (notification) => notification.notification_id === this.notificationId
      )
    },
  },
  mounted() {
    this.refreshList()
  },
  watch: {
    search() {
      this.resetProjectPages()
    },
    async notificationId() {
      this.resetProjectPages()
      this.discardPendingSelections()
      await this.refreshList()
    },
  },
  methods: {
    async refreshList() {
      const refreshSequence = ++this.refreshSequence
      this.loading = true
      try {
        const [projects, notifications, relations] = await Promise.all([
          this.listProjectAPI(
            `?organization_id=${encodeURIComponent(
              this.getCurrentOrganizationID()
            )}`
          ),
          this.listOrgAlertNotification(),
          this.listOrgAlertCondNotification(),
        ])
        if (refreshSequence !== this.refreshSequence) {
          return
        }
        this.notificationGroups = this.aggregateNotifications(
          projects,
          notifications,
          relations
        )
        this.resetProjectPages()
      } catch {
        if (refreshSequence !== this.refreshSequence) {
          return
        }
        this.notificationGroups = []
        this.resetProjectPages()
        this.$refs.snackbar.notifyError(
          this.$t(`view.alert['Failed to load notification relations']`)
        )
      } finally {
        if (refreshSequence === this.refreshSequence) {
          this.loading = false
        }
      }
    },

    aggregateNotifications(projects, notifications, relations) {
      const projectByID = new Map(
        projects.map((projectItem) => [
          Number(projectItem.project_id),
          projectItem,
        ])
      )

      return notifications.map((notification) => {
        const notificationID = Number(notification.notification_id)
        const relationsByProject = new Map()
        for (const relation of relations) {
          const relationNotificationID = Number(relation.notification_id)
          const relationProjectID = Number(relation.project_id)
          if (relationNotificationID !== notificationID) {
            continue
          }
          if (!projectByID.has(relationProjectID)) {
            continue
          }
          if (!relationsByProject.has(relationProjectID)) {
            relationsByProject.set(relationProjectID, [])
          }
          relationsByProject.get(relationProjectID).push(relation)
        }

        const notificationProjects = [...relationsByProject.entries()]
          .map(([projectID, projectRelations]) => ({
            project_id: projectID,
            name: projectByID.get(projectID)?.name || '-',
            relations: projectRelations,
            cache_seconds: [
              ...new Set(
                projectRelations
                  .map((relation) => Number(relation.cache_second))
                  .filter(
                    (cacheSecond) =>
                      Number.isInteger(cacheSecond) &&
                      cacheSecond >= 1 &&
                      cacheSecond <= 31536000
                  )
              ),
            ],
          }))
          .sort((left, right) => left.project_id - right.project_id)

        return {
          notification_id: notificationID,
          name: notification.name,
          projects: notificationProjects,
        }
      })
    },

    filterProjects(projects) {
      const keyword = (this.search || '').trim().toLowerCase()
      if (!keyword) {
        return projects
      }
      return projects.filter(
        (projectItem) =>
          projectItem.name.toLowerCase().includes(keyword) ||
          String(projectItem.project_id).includes(keyword)
      )
    },

    paginatedProjects(projects, notificationID) {
      const filteredProjects = this.filterProjects(projects)
      const start =
        (this.getProjectPage(notificationID) - 1) * this.projectsPerPage
      return filteredProjects.slice(start, start + this.projectsPerPage)
    },

    projectPageCount(projects) {
      return Math.ceil(
        this.filterProjects(projects).length / this.projectsPerPage
      )
    },

    getProjectPage(notificationID) {
      return this.projectPages[notificationID] || 1
    },

    setProjectPage(notificationID, page) {
      this.projectPages[notificationID] = page
    },

    resetProjectPages() {
      this.projectPages = {}
    },

    pendingSelectionKey(notificationID, projectID) {
      return `${notificationID}:${projectID}`
    },

    getPendingSelection(notificationID, projectID) {
      return this.pendingSelections[
        this.pendingSelectionKey(notificationID, projectID)
      ]
    },

    isProjectChecked(notification, projectItem) {
      const pendingSelection = this.getPendingSelection(
        notification.notification_id,
        projectItem.project_id
      )
      if (pendingSelection) {
        return pendingSelection.enabled
      }
      return (
        projectItem.relations.length > 0 &&
        projectItem.relations.every((relation) => relation.enabled === true)
      )
    },

    isProjectIndeterminate(notification, projectItem) {
      if (
        this.getPendingSelection(
          notification.notification_id,
          projectItem.project_id
        )
      ) {
        return false
      }
      const enabledCount = projectItem.relations.filter(
        (relation) => relation.enabled === true
      ).length
      return enabledCount > 0 && enabledCount < projectItem.relations.length
    },

    handleProjectCheck(notification, projectItem, enabled) {
      const key = this.pendingSelectionKey(
        notification.notification_id,
        projectItem.project_id
      )
      this.pendingSelections[key] = {
        notification,
        projectItem,
        enabled: enabled === true,
      }
    },

    areAllProjectsChecked(notification) {
      return (
        notification.projects.length > 0 &&
        notification.projects.every((projectItem) =>
          this.isProjectChecked(notification, projectItem)
        )
      )
    },

    areSomeProjectsChecked(notification) {
      return (
        !this.areAllProjectsChecked(notification) &&
        notification.projects.some(
          (projectItem) =>
            this.isProjectChecked(notification, projectItem) ||
            this.isProjectIndeterminate(notification, projectItem)
        )
      )
    },

    handleAllProjectsCheck(notification, enabled) {
      const checked = enabled === true
      for (const projectItem of notification.projects) {
        if (
          this.isProjectChecked(notification, projectItem) !== checked ||
          this.isProjectIndeterminate(notification, projectItem)
        ) {
          this.handleProjectCheck(notification, projectItem, checked)
        }
      }
    },

    async savePendingSelections() {
      const selections = Object.values(this.pendingSelections)
      const cacheUpdates = Object.values(this.pendingCacheUpdates)
      let completedUpdates = 0
      let errorMessage = this.$t(
        `view.alert['Failed to update notification target']`
      )
      try {
        for (const selection of selections) {
          const { notification, projectItem, enabled } = selection
          const key = this.selectionUpdatingKey(
            notification.notification_id,
            projectItem.project_id
          )
          this.selectionUpdating[key] = true
          await this.updateOrgAlertProjectNotificationEnabled(
            projectItem.project_id,
            notification.notification_id,
            enabled
          )
          completedUpdates += 1
          for (const relation of projectItem.relations) {
            relation.enabled = enabled
          }
          delete this.pendingSelections[key]
          delete this.selectionUpdating[key]
        }
        errorMessage = this.$t(
          `view.alert['Failed to update notification cache']`
        )
        for (const cacheUpdate of cacheUpdates) {
          const { notification, projectItem, cacheSecond } = cacheUpdate
          const key = this.cacheUpdatingKey(
            notification.notification_id,
            projectItem.project_id
          )
          this.cacheUpdating[key] = true
          await this.updateOrgAlertProjectNotificationCache(
            projectItem.project_id,
            notification.notification_id,
            cacheSecond
          )
          completedUpdates += 1
          delete this.pendingCacheUpdates[key]
          delete this.cacheUpdating[key]
        }
        if (selections.length > 0 || cacheUpdates.length > 0) {
          await this.refreshList()
        }
        return completedUpdates
      } catch (err) {
        this.selectionUpdating = {}
        this.cacheUpdating = {}
        this.discardPendingSelections()
        await this.refreshList()
        this.$refs.snackbar.notifyError(
          completedUpdates > 0
            ? this.$t(
                `view.alert['Some notification settings may have been updated']`
              )
            : errorMessage
        )
        throw err
      }
    },

    discardPendingSelections() {
      this.pendingSelections = {}
      this.pendingCacheUpdates = {}
    },

    selectionUpdatingKey(notificationID, projectID) {
      return `${notificationID}:${projectID}`
    },

    isSelectionUpdating(notificationID, projectID) {
      return (
        this.selectionUpdating[
          this.selectionUpdatingKey(notificationID, projectID)
        ] === true
      )
    },

    getUniformCacheSecond(cacheSeconds) {
      return cacheSeconds.length === 1 ? cacheSeconds[0] : null
    },

    getProjectCacheSeconds(notification, projectItem) {
      const pendingCacheUpdate =
        this.pendingCacheUpdates[
          this.cacheUpdatingKey(
            notification.notification_id,
            projectItem.project_id
          )
        ]
      return pendingCacheUpdate
        ? [pendingCacheUpdate.cacheSecond]
        : projectItem.cache_seconds
    },

    getSuppressionOptions(cacheSeconds) {
      const options = [
        {
          title: this.$t(`view.alert['No suppression']`),
          value: 1,
        },
        { title: this.formatCacheSecond(30 * 60), value: 30 * 60 },
        { title: this.formatCacheSecond(60 * 60), value: 60 * 60 },
        {
          title: this.formatCacheSecond(60 * 60 * 24),
          value: 60 * 60 * 24,
        },
        {
          title: this.formatCacheSecond(60 * 60 * 24 * 7),
          value: 60 * 60 * 24 * 7,
        },
        {
          title: this.formatCacheSecond(60 * 60 * 24 * 30),
          value: 60 * 60 * 24 * 30,
        },
        {
          title: this.formatCacheSecond(60 * 60 * 24 * 90),
          value: 60 * 60 * 24 * 90,
        },
        {
          title: this.formatCacheSecond(60 * 60 * 24 * 365),
          value: 60 * 60 * 24 * 365,
        },
      ]
      if (
        cacheSeconds.length === 1 &&
        cacheSeconds[0] >= 1 &&
        cacheSeconds[0] <= 31536000 &&
        !options.some((option) => option.value === cacheSeconds[0])
      ) {
        options.unshift({
          title: this.formatCacheSecond(cacheSeconds[0]),
          value: cacheSeconds[0],
        })
      }
      if (cacheSeconds.length > 1) {
        options.unshift({
          title: this.$t(`view.alert['Multiple suppression settings']`),
          value: null,
          props: { disabled: true },
        })
      }
      return options
    },

    formatCacheSecond(cacheSecond) {
      if (cacheSecond % 60 !== 0) {
        return this.$t(`view.alert['seconds']`, {
          seconds: cacheSecond,
        })
      }
      if (cacheSecond % (60 * 60 * 24) === 0) {
        return this.$t(`view.alert['days']`, {
          count: cacheSecond / (60 * 60 * 24),
        })
      }
      if (cacheSecond % (60 * 60) === 0) {
        return this.$t(`view.alert['hours']`, {
          count: cacheSecond / (60 * 60),
        })
      }
      return this.$t(`view.alert['minutes']`, {
        count: cacheSecond / 60,
      })
    },

    formatLastNotifiedAt(relations) {
      const notifiedAt = Math.max(
        0,
        ...relations
          .map((relation) => Number(relation.notified_at))
          .filter((value) => Number.isFinite(value) && value > 0)
      )
      if (notifiedAt === 0) {
        return this.$t(`view.alert['Never notified']`)
      }
      return this.formatTime(notifiedAt)
    },

    cacheUpdatingKey(notificationID, projectID) {
      return `${notificationID}:${projectID}`
    },

    isCacheUpdating(notificationID, projectID) {
      return (
        this.cacheUpdating[this.cacheUpdatingKey(notificationID, projectID)] ===
        true
      )
    },

    handleCacheUpdate(notification, projectItem, cacheSecond) {
      if (
        !Number.isInteger(cacheSecond) ||
        cacheSecond < 1 ||
        cacheSecond > 31536000
      ) {
        return
      }
      const key = this.cacheUpdatingKey(
        notification.notification_id,
        projectItem.project_id
      )
      this.pendingCacheUpdates[key] = {
        notification,
        projectItem,
        cacheSecond,
      }
    },
  },
}
</script>

<style scoped>
.suppression-select {
  flex-shrink: 0;
  width: 140px;
}

.project-info {
  min-width: 0;
  overflow: visible;
}

.project-title-row {
  align-items: center;
  display: flex;
  min-width: 0;
}

.project-id {
  flex-shrink: 0;
  margin-right: 12px;
}

.project-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-timing {
  overflow: visible;
  text-overflow: unset;
  white-space: normal;
}

.project-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.project-list-icon {
  transition: transform 0.2s ease;
}

.project-list-icon--expanded {
  transform: rotate(180deg);
}
</style>
