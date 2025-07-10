const organization = {
  data: () => {
    return {}
  },
  methods: {
    async createOrganizationAPI(name, description) {
      const param = {
        user_id: this.$store.state.user.user_id,
        name: name,
        description: description,
      }
      const res = await this.$axios
        .post('/organization/create-organization', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.organization) {
        return {}
      }
      return res.data.data.organization
    },
    async updateOrganizationAPI(name, description) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        name: name,
        description: description,
      }
      const res = await this.$axios
        .post('/organization/update-organization/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.organization) {
        return {}
      }
      return res.data.data.organization
    },
    async listOrganizationAPI(param) {
      if (!param) {
        param = ''
      }
      const res = await this.$axios
        .get('/organization/list-organization' + param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.organization) {
        return []
      }
      return res.data.data.organization
    },
    async deleteOrganizationAPI() {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
      }
      const res = await this.$axios
        .post('/organization/delete-organization/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async listOrganizationInvitationAPI() {
      const res = await this.$axios
        .get(
          '/organization/list-organization-invitation?organization_id=' +
            this.getCurrentOrganizationID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.organization_invitations) {
        return []
      }
      return res.data.data.organization_invitations
    },
    async putOrganizationInvitationAPI(project_id, statusNum) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        project_id: project_id,
        status: statusNum,
      }
      const res = await this.$axios
        .post('/organization/put-organization-invitation', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.organization_invitations
    },
    async deleteOrganizationInvitationAPI(project_id) {
      const param = {
        organization_id: this.getCurrentOrganizationID(),
        project_id: project_id,
      }
      const res = await this.$axios
        .post('/organization/delete-organization-invitation', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.organization_invitations
    },
  },
}

export default organization
