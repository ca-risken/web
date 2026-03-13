const organization_alert = {
  data: () => {
    return {}
  },
  methods: {
    // Organization Notification
    async listOrgNotification() {
      const res = await this.$axios
        .get(
          '/organization/list-organization-notification/?organization_id=' +
            this.getCurrentOrganizationID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.org_notification) {
        return []
      }
      return res.data.data.org_notification
    },

    async deleteOrgNotification(notification_id) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        notification_id: notification_id,
      }
      await this.$axios
        .post('/organization/delete-organization-notification/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },

    async putOrgNotification(param) {
      await this.$axios
        .post('/organization/put-organization-notification/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },

    async testOrgNotification(notification_id) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        notification_id: notification_id,
      }
      await this.$axios
        .post('/organization/test-organization-notification/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
  },
}

export default organization_alert
