const org_alert = {
  data: () => {
    return {}
  },
  methods: {
    // Organization Notification
    async listOrgAlertNotification() {
      const res = await this.$axios
        .get(
          '/organization-alert/list-notification/?organization_id=' +
            this.getCurrentOrganizationID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.notification) {
        return []
      }
      return res.data.data.notification
    },

    async deleteOrgAlertNotification(notification_id) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        notification_id: notification_id,
      }
      await this.$axios
        .post('/organization-alert/delete-notification/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },

    async putOrgAlertNotification(param) {
      await this.$axios
        .post('/organization-alert/put-notification/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },

    async testOrgAlertNotification(notification_id) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        notification_id: notification_id,
      }
      await this.$axios
        .post('/organization-alert/test-notification/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },

    async listOrgAlertCondNotification() {
      const relations = []
      let pageOffset = 0
      let hasNext = true
      let pageCount = 0
      const maxPages = 1000

      while (hasNext) {
        if (pageCount >= maxPages) {
          throw new Error('Organization alert pagination exceeded the limit')
        }
        const res = await this.$axios
          .get('/organization-alert/list-alert-cond-notification/', {
            params: {
              organization_id: this.getCurrentOrganizationID(),
              page_size: 100,
              page_offset: pageOffset,
            },
          })
          .catch((err) => {
            return Promise.reject(err)
          })
        const data = res.data.data
        pageCount += 1
        relations.push(...(data.alert_cond_notification || []))
        hasNext = data.has_next === true
        if (
          hasNext &&
          (!Number.isInteger(data.next_page_offset) ||
            data.next_page_offset <= pageOffset)
        ) {
          throw new Error('Organization alert pagination did not advance')
        }
        pageOffset = data.next_page_offset
      }

      return relations
    },

    async updateOrgAlertProjectNotificationEnabled(
      project_id,
      notification_id,
      enabled
    ) {
      if (
        !Number.isInteger(project_id) ||
        project_id < 1 ||
        !Number.isInteger(notification_id) ||
        notification_id < 1
      ) {
        throw new Error('Invalid notification target')
      }
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        project_id: project_id,
        notification_id: notification_id,
        enabled: enabled === true,
      }
      await this.$axios
        .post('/organization-alert/update-project-notification-enabled/', param)
        .catch((err) => Promise.reject(err))
    },

    async updateOrgAlertProjectNotificationCache(
      project_id,
      notification_id,
      cache_second
    ) {
      if (
        !Number.isInteger(project_id) ||
        project_id < 1 ||
        !Number.isInteger(notification_id) ||
        notification_id < 1 ||
        !Number.isInteger(cache_second) ||
        cache_second < 1 ||
        cache_second > 31536000
      ) {
        throw new Error('Invalid notification cache')
      }
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        project_id: project_id,
        notification_id: notification_id,
        cache_second: cache_second,
      }
      await this.$axios
        .post('/organization-alert/update-project-notification-cache/', param)
        .catch((err) => Promise.reject(err))
    },
  },
}

export default org_alert
