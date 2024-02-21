const alert = {
  data: () => {
    return {}
  },
  methods: {
    // AlertAPI
    async listAlert(statusParam) {
      const res = await this.$axios
        .get(
          '/alert/list-alert/?project_id=' +
            this.getCurrentProjectID() +
            statusParam
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.alert) {
        return []
      }
      return res.data.data.alert
    },

    async listAlertHistory(alert_id) {
      const res = await this.$axios
        .get(
          '/alert/list-history/?alert_id=' +
            alert_id +
            '&project_id=' +
            this.getCurrentProjectID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.alert_history) {
        return []
      }
      return res.data.data.alert_history
    },

    async listRelAlertFinding(alert_id) {
      const res = await this.$axios
        .get(
          '/alert/list-rel_alert_finding/?alert_id=' +
            alert_id +
            '&project_id=' +
            this.getCurrentProjectID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.rel_alert_finding) {
        return []
      }
      return res.data.data.rel_alert_finding
    },

    async putAlert(param) {
      await this.$axios.post('/alert/put-alert/', param).catch((err) => {
        return Promise.reject(err)
      })
    },

    async putAlertFirstViewedAt(project_id) {
      const param = {
        project_id: project_id,
      }
      await this.$axios
        .post('/alert/put-alert-first-viewed-at/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },

    // AlertCondition
    async listAlertCondition(enabledOnly) {
      let enabledParam = ''
      if (enabledOnly) {
        enabledParam = '&enabled=true'
      }
      const res = await this.$axios
        .get(
          '/alert/list-condition/?project_id=' +
            this.getCurrentProjectID() +
            enabledParam
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.alert_condition) {
        return []
      }
      return res.data.data.alert_condition
    },

    async listAlertConditionRule(alert_condition_id) {
      const rules = await this.$axios
        .get(
          '/alert/list-condition_rule/?project_id=' +
            this.getCurrentProjectID() +
            '&alert_condition_id=' +
            alert_condition_id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!rules.data.data.alert_cond_rule) {
        return []
      }
      return rules.data.data.alert_cond_rule
    },

    async listAlertConditionNotification(alert_condition_id) {
      const notis = await this.$axios
        .get(
          '/alert/list-condition_notification/?project_id=' +
            this.getCurrentProjectID() +
            '&alert_condition_id=' +
            alert_condition_id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!notis.data.data.alert_cond_notification) {
        return []
      }
      return notis.data.data.alert_cond_notification
    },

    async deleteAlertCondition(alert_condition_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        alert_condition_id: alert_condition_id,
      }
      await this.$axios.post('/alert/delete-condition/', param).catch((err) => {
        return Promise.reject(err)
      })
    },

    async putAlertCondition(param) {
      const res = await this.$axios
        .post('/alert/put-condition/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.alert_condition
    },
    async putDefaultAlertCondition() {
      const param = {
        project_id: this.getCurrentProjectID(),
        alert_condition: {
          project_id: this.getCurrentProjectID(),
          description: 'RISKEN Alert',
          severity: 'medium',
          and_or: 'and',
          enabled: true,
        },
      }
      const res = await this.$axios
        .post('/alert/put-condition/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.alert_condition
    },
    async putAlertConditionRule(alert_condition_id, alert_rule_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        alert_cond_rule: {
          project_id: this.getCurrentProjectID(),
          alert_condition_id: alert_condition_id,
          alert_rule_id: alert_rule_id,
        },
      }
      const res = await this.$axios
        .post('/alert/put-condition_rule/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },

    // AlertRule
    async listAlertRule() {
      const res = await this.$axios
        .get('/alert/list-rule/?project_id=' + this.getCurrentProjectID())
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.alert_rule) {
        return []
      }
      return res.data.data.alert_rule
    },

    async deleteAlertRule(alert_rule_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        alert_rule_id: alert_rule_id,
      }
      await this.$axios.post('/alert/delete-rule/', param).catch((err) => {
        return Promise.reject(err)
      })
    },

    async putAlertRule(param) {
      await this.$axios.post('/alert/put-rule/', param).catch((err) => {
        return Promise.reject(err)
      })
    },
    async putDefaultAlertRule() {
      const param = {
        project_id: this.getCurrentProjectID(),
        alert_rule: {
          project_id: this.getCurrentProjectID(),
          name: 'over0.8',
          score: 0.8,
          resource_name: '',
          tag: '',
          finding_cnt: 1,
        },
      }
      const res = await this.$axios
        .post('/alert/put-rule/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.alert_rule) {
        return {}
      }
      return res.data.data.alert_rule
    },

    // AlertNotification
    async listAlertNotification() {
      const res = await this.$axios
        .get(
          '/alert/list-notification/?project_id=' + this.getCurrentProjectID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.notification) {
        return []
      }
      return res.data.data.notification
    },

    async deleteAlertNotification(notification_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        notification_id: notification_id,
      }
      await this.$axios
        .post('/alert/delete-notification/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },

    async putAlertNotification(param) {
      await this.$axios.post('/alert/put-notification/', param).catch((err) => {
        return Promise.reject(err)
      })
    },

    async testAlertNotification(notification_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        notification_id: notification_id,
      }
      await this.$axios
        .post('/alert/test-notification/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },

    async requestAuthzAlertNotification(user_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        user_id: user_id,
      }
      await this.$axios
        .post('/alert/request-authz-notification/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },

    // Analyze
    async analyzeAlert(alert_condition_id) {
      const cond_ids = [alert_condition_id]
      const param = {
        project_id: this.getCurrentProjectID(),
        alert_condition_id: cond_ids,
      }
      await this.$axios.post('/alert/analyze-alert/', param).catch((err) => {
        return Promise.reject(err)
      })
    },
  },
}

export default alert
