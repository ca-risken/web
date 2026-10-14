const organization_iam = {
  data: () => {
    return {}
  },
  methods: {
    async listOrganizationRoleAPI(searchCond) {
      const res = await this.$axios
        .get(
          '/organization-iam/list-role/?organization_id=' +
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
          '/organization-iam/list-policy/?organization_id=' +
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
          '/organization-iam/get-role/?organization_id=' +
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
        .post('/organization-iam/put-role', param)
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
        .post('/organization-iam/delete-role', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.role
    },
    async getOrganizationPolicyAPI(policy_id) {
      const res = await this.$axios
        .get(
          '/organization-iam/get-policy/?organization_id=' +
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
    async putOrganizationPolicyAPI(name, action_ptn, project_ptn) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        name: name,
        action_ptn: action_ptn,
        project_ptn: project_ptn,
      }
      const res = await this.$axios
        .post('/organization-iam/put-policy', param)
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
        .post('/organization-iam/delete-policy', param)
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
        .post('/organization-iam/attach-role', param)
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
        .post('/organization-iam/detach-role', param)
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
        .post('/organization-iam/attach-policy', param)
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
        .post('/organization-iam/detach-policy', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.role
    },
    async listOrganizationUserReservedAPI(searchCond) {
      const res = await this.$axios
        .get(
          '/organization-iam/list-user-reserved/?organization_id=' +
            this.getCurrentOrganizationID() +
            searchCond
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.user_reserved) {
        return []
      }
      return res.data.data.user_reserved
    },
    async putOrganizationUserReservedAPI(reserved_id, user_idp_key, role_id) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        reserved_id: reserved_id,
        user_idp_key: user_idp_key,
        role_id: role_id,
      }
      const res = await this.$axios
        .post('/organization-iam/put-user-reserved/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async deleteOrganizationUserReservationAPI(reserved_id) {
      const param = {
        reserved_id: reserved_id,
        organization_id: this.getCurrentOrganizationID(),
      }
      const res = await this.$axios
        .post('/organization-iam/delete-user-reserved', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async listOrgAccessTokenAPI(searchCond) {
      const res = await this.$axios
        .get(
          '/organization-iam/list-access-token/?organization_id=' +
            this.getCurrentOrganizationID() +
            searchCond
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.access_token) {
        return []
      }
      return res.data.data.access_token
    },
    async generateOrgAccessTokenAPI(param) {
      const res = await this.$axios
        .post('/organization-iam/generate-access-token', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data
    },
    async updateOrgAccessTokenAPI(param) {
      const res = await this.$axios
        .post('/organization-iam/update-access-token', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async deleteOrgAccessTokenAPI(accessTokenID) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        access_token_id: accessTokenID,
      }
      const res = await this.$axios
        .post('/organization-iam/delete-access-token', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async attachOrgAccessTokenRoleAPI(accessTokenID, roleID) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        access_token_id: accessTokenID,
        role_id: roleID,
      }
      const res = await this.$axios
        .post('/organization-iam/attach-access-token-role', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async detachOrgAccessTokenRoleAPI(accessTokenID, roleID) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        access_token_id: accessTokenID,
        role_id: roleID,
      }
      const res = await this.$axios
        .post('/organization-iam/detach-access-token-role', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
  },
}

export default organization_iam
