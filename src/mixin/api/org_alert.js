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
  },
}

export default org_alert
