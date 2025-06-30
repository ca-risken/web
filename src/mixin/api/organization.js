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
    async ListOrganizationAPI(param) {
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
    async ListOrganizationInvitationAPI(searchCond) {
      const res = await this.$axios
        .get(
          '/organization/list-organization-invitation?organization_id=' +
            this.getCurrentOrganizationID() +
            searchCond
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.organization_invitations) {
        return []
      }
      return res.data.data.organization_invitations
    },
    async ListUserOrganizationInvitationAPI(user_id) {
      const param = user_id ? `?user_id=${user_id}` : ''
      const res = await this.$axios
        .get('/organization/list-user-organization-invitation' + param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.organization_invitations) {
        return []
      }
      return res.data.data.organization_invitations
    },
    async PutOrganizationInvitationAPI(organization_id, project_id, status) {
      let statusValue = status
      if (typeof status === 'string') {
        const statusMap = {
          PENDING: 1,
          ACCEPTED: 2,
          REJECTED: 3,
        }
        statusValue = statusMap[status.toUpperCase()] || status
      }

      const param = {
        organization_id: organization_id,
        project_id: project_id,
        status: statusValue,
      }
      const res = await this.$axios
        .post('/organization/put-organization-invitation', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.organization_invitations
    },

    async DeleteOrganizationInvitationAPI(organization_id, project_id) {
      const param = {
        organization_id: organization_id,
        project_id: project_id,
      }
      const res = await this.$axios
        .post('/organization/delete-organization-invitation', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.organization_invitations
    },

    async ReplyOrganizationInvitationAPI(organization_id, project_id, status) {
      let statusValue = status
      if (typeof status === 'string') {
        const statusMap = {
          PENDING: 1,
          ACCEPTED: 2,
          REJECTED: 3,
        }
        statusValue = statusMap[status.toUpperCase()] || status
      }

      const param = {
        organization_id: organization_id,
        project_id: project_id,
        status: statusValue,
      }
      const res = await this.$axios
        .post('/project/reply-organization-invitation', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.organization_invitation
    },
    async ListProjectInOrganizationAPI(searchCond) {
      const res = await this.$axios
        .get(
          '/organization/list-project-in-organization?organization_id=' +
            this.getCurrentOrganizationID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.project) {
        return []
      }
      // 検索条件がある場合は、検索条件を適用。APIに実装がないので一時的な対応。
      if (searchCond) {
        const name = searchCond.slice(6)
        res.data.data.project = res.data.data.project.filter((project) => {
          return project.name == name
        })
      }
      console.log(res.data.data.project)
      return res.data.data.project
    },
  },
}

export default organization
