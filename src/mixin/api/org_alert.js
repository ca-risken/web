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
      const res = await this.$axios
        .get(
          '/organization-alert/list-alert-cond-notification/?organization_id=' +
            this.getCurrentOrganizationID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.alert_cond_notification) {
        return []
      }
      return res.data.data.alert_cond_notification
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
