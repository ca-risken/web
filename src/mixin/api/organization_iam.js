const organization_iam = {
  data: () => {
    return {}
  },
  methods: {
    getCurrentOrganizationID() {
      // Try to get organization ID from store first
      let organizationId = this.$store.state.organization?.organization_id || null
      
      // If not found in store, try to get from route params
      if (!organizationId && this.$route && this.$route.params && this.$route.params.organizationId) {
        organizationId = this.$route.params.organizationId
      }
      
      // If still not found, try to get from query params
      if (!organizationId && this.$route && this.$route.query && this.$route.query.organization_id) {
        organizationId = this.$route.query.organization_id
      }
      
      return organizationId
    },
    async listOrganizationRoleAPI(organization_id) {
      const param = organization_id ? `?organization_id=${organization_id}` : ''
      const res = await this.$axios
        .get('/organization/list-organization-role' + param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.role_id) {
        return []
      }
      return res.data.data.role_id
    },
    async listOrganizationPolicyAPI(organization_id) {
      const param = organization_id ? `?organization_id=${organization_id}` : ''
      const res = await this.$axios
        .get('/organization/list-organization-policy' + param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.policy_id) {
        return []
      }
      return res.data.data.policy_id
    },

    async getOrganizationRoleAPI(organization_id, role_id) {
      const param = organization_id
        ? `?organization_id=${organization_id}&role_id=${role_id}`
        : ''
      const res = await this.$axios
        .get('/organization/get-organization-role' + param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.role) {
        return []
      }
      return res.data.data.role
    },
    async putOrganizationRoleAPI(organization_id, name) {
      const param = {
        organization_id: organization_id,
        name: name,
      }
      const res = await this.$axios
        .post('/organization/put-organization-role', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.policy) {
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
    async getOrganizationPolicyAPI(organization_id, policy_id) {
      const param = organization_id
        ? `?organization_id=${organization_id}&policy_id=${policy_id}`
        : ''
      const res = await this.$axios
        .get('/organization/get-organization-policy' + param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.policy) {
        return []
      }
      return res.data.data.policy
    },
    async putOrganizationPolicyAPI(organization_id, name, action_ptn) {
      const param = {
        organization_id: organization_id,
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
      }
      const res = await this.$axios
        .post('/organization/attach-organization-policy', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.role
    },
    async detachOrganizationPolicyAPI(policy_id, role_id) {
      const param = {
        policy_id: policy_id,
        role_id: role_id,
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
