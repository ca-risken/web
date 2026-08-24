<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
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
      <v-row dense justify="center" align-content="center">
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
          <v-expansion-panels v-else multiple>
            <v-expansion-panel
              v-for="notification in notificationGroups"
              :key="notification.notification_id"
            >
              <v-expansion-panel-title v-slot="{ expanded }" hide-actions>
                <span class="font-weight-bold">
                  {{ $t(`submenu['OrganizationNotificationName']`) }}
                  {{ notification.name }}
                </span>
                <v-chip class="ml-3" size="small">
                  ID: {{ notification.notification_id }}
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
                  <v-list-item
                    v-for="projectItem in filterProjects(notification.projects)"
                    :key="projectItem.project_id"
                    class="project-row"
                  >
                    <template v-slot:prepend>
                      <v-checkbox-btn
                        :model-value="isProjectChecked(projectItem)"
                        :indeterminate="isProjectIndeterminate(projectItem)"
                        :loading="
                          isSelectionUpdating(
                            notification.notification_id,
                            projectItem.project_id
                          )
                        "
                        :disabled="
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
                    <v-list-item-title>
                      <span class="font-weight-medium">
                        {{ projectItem.name }}
                      </span>
                      <v-chip class="ml-3" size="x-small">
                        ID: {{ projectItem.project_id }}
                      </v-chip>
                    </v-list-item-title>
                    <template v-slot:append>
                      <div class="suppression-select" @click.stop>
                        <v-select
                          :model-value="
                            getUniformCacheSecond(projectItem.cache_seconds)
                          "
                          :items="
                            getSuppressionOptions(projectItem.cache_seconds)
                          "
                          item-title="title"
                          item-value="value"
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
            v-if="!loading && notificationGroups.length === 0"
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
  mixins: [mixin, org_alert, project, organization_helper],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      search: '',
      notificationGroups: [],
      cacheUpdating: {},
      selectionUpdating: {},
    }
  },
  mounted() {
    this.refreshList()
  },
  methods: {
    async refreshList() {
      this.loading = true
      try {
        const [projects, notifications, relations] = await Promise.all([
          this.listProjectAPI(
            `?organization_id=${this.getCurrentOrganizationID()}`
          ),
          this.listOrgAlertNotification(),
          this.listOrgAlertCondNotification(),
        ])
        this.notificationGroups = this.aggregateNotifications(
          projects,
          notifications,
          relations
        )
      } catch (err) {
        this.$refs.snackbar.notifyError(
          this.$t(`view.alert['Failed to load notification relations']`)
        )
      } finally {
        this.loading = false
      }
    },

    aggregateNotifications(projects, notifications, relations) {
      const projectByID = new Map(
        projects.map((projectItem) => [projectItem.project_id, projectItem])
      )

      return notifications.map((notification) => {
        const relationsByProject = new Map()
        for (const relation of relations) {
          if (relation.notification_id !== notification.notification_id) {
            continue
          }
          if (!relationsByProject.has(relation.project_id)) {
            relationsByProject.set(relation.project_id, [])
          }
          relationsByProject.get(relation.project_id).push(relation)
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
                  .filter((cacheSecond) => Number.isInteger(cacheSecond))
              ),
            ],
          }))
          .sort((left, right) => left.project_id - right.project_id)

        return {
          notification_id: notification.notification_id,
          name: notification.name,
          projects: notificationProjects,
        }
      })
    },

    filterProjects(projects) {
      const keyword = this.search.trim().toLowerCase()
      if (!keyword) {
        return projects
      }
      return projects.filter(
        (projectItem) =>
          projectItem.name.toLowerCase().includes(keyword) ||
          String(projectItem.project_id).includes(keyword)
      )
    },

    isProjectChecked(projectItem) {
      return (
        projectItem.relations.length > 0 &&
        projectItem.relations.every((relation) => relation.enabled === true)
      )
    },

    isProjectIndeterminate(projectItem) {
      const enabledCount = projectItem.relations.filter(
        (relation) => relation.enabled === true
      ).length
      return enabledCount > 0 && enabledCount < projectItem.relations.length
    },

    async handleProjectCheck(notification, projectItem, enabled) {
      const key = this.selectionUpdatingKey(
        notification.notification_id,
        projectItem.project_id
      )
      this.selectionUpdating[key] = true
      try {
        await this.updateOrgAlertProjectNotificationEnabled(
          projectItem.project_id,
          notification.notification_id,
          enabled
        )
        for (const relation of projectItem.relations) {
          relation.enabled = enabled === true
        }
        this.$refs.snackbar.notifySuccess(
          this.$t(`view.alert['Notification target updated']`)
        )
      } catch (err) {
        this.$refs.snackbar.notifyError(
          this.$t(`view.alert['Failed to update notification target']`)
        )
        await this.refreshList()
      } finally {
        delete this.selectionUpdating[key]
      }
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
      if (cacheSeconds.length > 1) {
        options.unshift({
          title: this.$t(`view.alert['Multiple suppression settings']`),
          value: null,
          disabled: true,
        })
      }
      return options
    },

    formatCacheSecond(cacheSecond) {
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

    cacheUpdatingKey(notificationID, projectID) {
      return `${notificationID}:${projectID}`
    },

    isCacheUpdating(notificationID, projectID) {
      return (
        this.cacheUpdating[this.cacheUpdatingKey(notificationID, projectID)] ===
        true
      )
    },

    async handleCacheUpdate(notification, projectItem, cacheSecond) {
      if (!Number.isInteger(cacheSecond)) {
        return
      }
      const key = this.cacheUpdatingKey(
        notification.notification_id,
        projectItem.project_id
      )
      this.cacheUpdating[key] = true
      try {
        await this.updateOrgAlertProjectNotificationCache(
          projectItem.project_id,
          notification.notification_id,
          cacheSecond
        )
        for (const relation of projectItem.relations) {
          relation.cache_second = cacheSecond
        }
        projectItem.cache_seconds = [cacheSecond]
        this.$refs.snackbar.notifySuccess(
          this.$t(`view.alert['Notification cache updated']`)
        )
      } catch (err) {
        this.$refs.snackbar.notifyError(
          this.$t(`view.alert['Failed to update notification cache']`)
        )
        await this.refreshList()
      } finally {
        delete this.cacheUpdating[key]
      }
    },
  },
}
</script>

<style scoped>
.suppression-select {
  width: 220px;
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
