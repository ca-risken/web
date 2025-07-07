const organization_iam = {
  data: () => {
    return {}
  },
  methods: {
    async listOrganizationRoleAPI(searchCond) {
      const res = await this.$axios
        .get(
          '/organization/list-organization-role/?organization_id=' +
            this.getCurrentOrganizationID() +
            searchCond
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.role_id) {
        return []
      }
      return res.data.data.role_id
    },
    async listOrganizationPolicyAPI(searchCond) {
      const res = await this.$axios
        .get(
          '/organization/list-organization-policy/?organization_id=' +
            this.getCurrentOrganizationID() +
            searchCond
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.policy_id) {
        return []
      }
      return res.data.data.policy_id
    },
    async getOrganizationRoleAPI(role_id) {
      const res = await this.$axios
        .get(
          '/organization/get-organization-role/?organization_id=' +
            this.getCurrentOrganizationID() +
            '&role_id=' +
            role_id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.role) {
        return []
      }
      return res.data.data.role
    },
    async putOrganizationRoleAPI(name) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        name: name,
      }
      const res = await this.$axios
        .post('/organization/put-organization-role', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.role) {
        return []
      }
      return res.data.data.role
    },
    async deleteOrganizationRoleAPI(role_id) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        role_id: role_id,
      }
      const res = await this.$axios
        .post('/organization/delete-organization-role', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.role
    },
    async getOrganizationPolicyAPI(policy_id) {
      const res = await this.$axios
        .get(
          '/organization/get-organization-policy/?organization_id=' +
            this.getCurrentOrganizationID() +
            '&policy_id=' +
            policy_id
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.policy) {
        return []
      }
      return res.data.data.policy
    },
    async putOrganizationPolicyAPI(name, action_ptn) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        name: name,
        action_ptn: action_ptn,
      }
      const res = await this.$axios
        .post('/organization/put-organization-policy', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.policy) {
        return []
      }
      return res.data.data.policy
    },
    async deleteOrganizationPolicyAPI(policy_id) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        policy_id: policy_id,
      }
      const res = await this.$axios
        .post('/organization/delete-organization-policy', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.policy
    },
    async attachOrganizationRoleAPI(user_id, role_id) {
      const param = {
        user_id: user_id,
        role_id: role_id,
        organization_id: this.getCurrentOrganizationID(),
      }
      const res = await this.$axios
        .post('/organization/attach-organization-role', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.role) {
        return []
      }
      return res.data.data.role
    },
    async detachOrganizationRoleAPI(user_id, role_id) {
      const param = {
        user_id: user_id,
        role_id: role_id,
        organization_id: this.getCurrentOrganizationID(),
      }
      const res = await this.$axios
        .post('/organization/detach-organization-role', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.role
    },
    async attachOrganizationPolicyAPI(role_id, policy_id) {
      const param = {
        role_id: role_id,
        policy_id: policy_id,
        organization_id: this.getCurrentOrganizationID(),
      }
      const res = await this.$axios
        .post('/organization/attach-organization-policy', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.role
    },
    async detachOrganizationPolicyAPI(role_id, policy_id) {
      const param = {
        role_id: role_id,
        policy_id: policy_id,
        organization_id: this.getCurrentOrganizationID(),
      }
      const res = await this.$axios
        .post('/organization/detach-organization-policy', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.role
    },
  },
}

export default organization_iam
