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

      while (hasNext) {
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
        relations.push(...(data.alert_cond_notification || []))
        hasNext = data.has_next === true
        if (hasNext && data.next_page_offset <= pageOffset) {
          throw new Error('Organization alert pagination did not advance')
        }
        pageOffset = data.next_page_offset
      }

      return relations
    },

    async updateOrgAlertCondNotificationCache(relation, cache_second) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        project_id: relation.project_id,
        alert_condition_id: relation.alert_condition_id,
        notification_id: relation.notification_id,
        cache_second: cache_second,
      }
      await this.$axios
        .post(
          '/organization-alert/update-alert-cond-notification-cache/',
          param
        )
        .catch((err) => {
          return Promise.reject(err)
        })
    },
  },
}

export default org_alert
