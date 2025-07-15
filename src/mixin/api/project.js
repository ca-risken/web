const project = {
  data: () => {
    return {}
  },
  methods: {
    async listProjectAPI(param) {
      if (!param) {
        param = ''
      }
      const res = await this.$axios
        .get('/project/list-project/' + param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.project) {
        return []
      }
      return res.data.data.project
    },

    async createProjectAPI(name) {
      const param = {
        user_id: this.$store.state.user.user_id,
        name: name,
      }
      const res = await this.$axios
        .post('/project/create-project/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.project) {
        return {}
      }
      return res.data.data.project
    },

    async updateProjectAPI(name) {
      const param = {
        project_id: this.getCurrentProjectID(),
        name: name,
      }
      const res = await this.$axios
        .post('/project/update-project/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.project) {
        return {}
      }
      return res.data.data.project
    },

    async tagProjectAPI(tag, color) {
      const param = {
        project_id: this.getCurrentProjectID(),
        tag: tag,
        color: color,
      }
      const res = await this.$axios
        .post('/project/tag-project/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async untagProjectAPI(tag) {
      const param = {
        project_id: this.getCurrentProjectID(),
        tag: tag,
      }
      const res = await this.$axios
        .post('/project/untag-project/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async deleteProjectAPI() {
      const param = {
        project_id: this.getCurrentProjectID(),
      }
      const res = await this.$axios
        .post('/project/delete-project/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res
    },
    async listProjectOrganizationInvitationAPI() {
      const res = await this.$axios
        .get(
          '/project/list-organization-invitation?project_id=' +
            this.getCurrentProjectID()
        )
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data.organization_invitations) {
        return []
      }
      return res.data.data.organization_invitations
    },
    async replyOrganizationInvitationAPI(organization_id, statusNum) {
      const param = {
        organization_id: organization_id,
        project_id: this.getCurrentProjectID(),
        status: statusNum,
      }
      const res = await this.$axios
        .post('/project/reply-organization-invitation', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      return res.data.data.organization_invitation
    },
  },
}

export default project
