const iam = {
  data: () => {
    return {}
  },
  methods: {
    async signinAPI() {
      const res = await this.$axios.get('/signin/').catch((err) => {
        return Promise.reject(err)
      })
      if (!res.data.user_id) {
        return
      }
      return res.data.user_id
    },
    // User API
    async isAdminAPI(userID) {
      const res = await this.$axios
        .get('/iam/is-admin/?user_id=' + userID)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.ok
    },
    async listUserAPI(searchCond) {
      const res = await this.$axios
        .get('/iam/list-user/?activated=true' + searchCond)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.user_id) {
        return []
      }
      return res.data.data.user_id
    },
    async getUserAPI(userID) {
      const res = await this.$axios
        .get('/iam/get-user/?user_id=' + userID)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.user
    },
    async putUserAPI(name) {
      const param = {
        user: {
          name: name,
          activated: true,
        },
      }
      const res = await this.$axios
        .post('/iam/put-user/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.user
    },

    // Role API
    async listRoleAPI(searchCond) {
      const res = await this.$axios
        .get(
          '/iam/list-role/?project_id=' +
            this.$store.state.project.project_id +
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
    async listAdminRoleAPI(name) {
      const res = await this.$axios
        .get('/admin/list-admin-role/?name=' + name)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.role_id) {
        return []
      }
      return res.data.data.role_id
    },
    async getRoleAPI(roleID) {
      const res = await this.$axios
        .get(
          '/iam/get-role/?project_id=' +
            this.$store.state.project.project_id +
            '&role_id=' +
            roleID
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.role
    },
    async getAdminRoleAPI(roleID) {
      const res = await this.$axios
        .get('/admin/get-admin-role/?role_id=' + roleID)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.role
    },
    async putRoleAPI(name) {
      const roleParam = {
        project_id: this.$store.state.project.project_id,
        role: {
          name: name,
          project_id: this.$store.state.project.project_id,
        },
      }
      const res = await this.$axios
        .post('/iam/put-role/', roleParam)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.role
    },
    async attachRoleAPI(userID, roleID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        user_id: userID,
        role_id: roleID,
      }
      const res = await this.$axios
        .post('/iam/attach-role/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async attachAdminRoleAPI(userID, roleID) {
      const param = {
        user_id: userID,
        role_id: roleID,
      }
      const res = await this.$axios
        .post('/admin/attach-admin-role/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async detachRoleAPI(userID, roleID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        user_id: userID,
        role_id: roleID,
      }
      const res = await this.$axios
        .post('/iam/detach-role/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async detachAdminRoleAPI(userID, roleID) {
      const param = {
        user_id: userID,
        role_id: roleID,
      }
      const res = await this.$axios
        .post('/admin/detach-admin-role/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async deleteRoleAPI(roleID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        role_id: roleID,
      }
      const res = await this.$axios
        .post('/iam/delete-role/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },

    // Policy API
    async listPolicyAPI(searchCond) {
      const res = await this.$axios
        .get(
          '/iam/list-policy/?project_id=' +
            this.$store.state.project.project_id +
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
    async getPolicyAPI(policyID) {
      const res = await this.$axios
        .get(
          '/iam/get-policy/?project_id=' +
            this.$store.state.project.project_id +
            '&policy_id=' +
            policyID
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.policy
    },
    async attachPolicyAPI(roleID, policyID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        role_id: roleID,
        policy_id: policyID,
      }
      const res = await this.$axios
        .post('/iam/attach-policy/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async detachPolicyAPI(roleID, policyID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        role_id: roleID,
        policy_id: policyID,
      }
      const res = await this.$axios
        .post('/iam/detach-policy/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async deletePolicyAPI(policyID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        policy_id: policyID,
      }
      const res = await this.$axios
        .post('/iam/delete-policy/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async putPolicyAPI(param) {
      const res = await this.$axios
        .post('/iam/put-policy/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },

    // AccessToken API
    async listAccessTokenAPI(searchCond) {
      const res = await this.$axios
        .get(
          '/iam/list-access-token/?project_id=' +
            this.$store.state.project.project_id +
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
    async generateAccessTokenAPI(param) {
      const res = await this.$axios
        .post('/iam/generate-access-token/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data
    },
    async updateAccessTokenAPI(param) {
      const res = await this.$axios
        .post('/iam/update-access-token/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async attachTokenRoleAPI(accessTokenID, roleID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        access_token_id: accessTokenID,
        role_id: roleID,
      }
      const res = await this.$axios
        .post('/iam/attach-access-token/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async detachTokenRoleAPI(accessTokenID, roleID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        access_token_id: accessTokenID,
        role_id: roleID,
      }
      const res = await this.$axios
        .post('/iam/detach-access-token/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },

    async deleteAccessTokenAPI(accessTokenID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        access_token_id: accessTokenID,
      }
      const res = await this.$axios
        .post('/iam/delete-access-token/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
  },
}

export default iam
