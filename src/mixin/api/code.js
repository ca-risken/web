const code = {
  data: () => {
    return {}
  },
  methods: {
    // API
    async getGitleaksDataSourceAPI() {
      const res = await this.$axios
        .get('/code/list-datasource/')
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.code_data_source) {
        return []
      }
      return res.data.data.code_data_source
    },
    async listGitHubSettingAPI(github_setting_id) {
      let query = '?project_id=' + this.getCurrentProjectID()
      if (github_setting_id) {
        query += '&github_setting_id=' + github_setting_id
      }
      const res = await this.$axios
        .get('/code/list-github-setting/' + query)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.github_setting) {
        return []
      }
      return res.data.data.github_setting
    },
    async putGitHubSettingAPI(github_setting) {
      const paramGitHubSetting = {
        project_id: this.getCurrentProjectID(),
        github_setting: github_setting,
      }
      const res = await this.$axios
        .post('/code/put-github-setting/', paramGitHubSetting)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.github_setting) {
        return {}
      }
      return res.data.data.github_setting
    },
    async deleteGitHubSettingAPI(github_setting_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        github_setting_id: github_setting_id,
      }
      await this.$axios
        .post('/code/delete-github-setting/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async putGitleaksSettingAPI(gitleaks_setting) {
      const paramGitleaksSetting = {
        project_id: this.getCurrentProjectID(),
        gitleaks_setting: gitleaks_setting,
      }
      const res = await this.$axios
        .post('/code/put-gitleaks-setting/', paramGitleaksSetting)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.gitleaks_setting) {
        return {}
      }
      return res.data.data.gitleaks_setting
    },
    async deleteGitleaksSettingAPI(github_setting_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        github_setting_id: github_setting_id,
      }
      await this.$axios
        .post('/code/delete-gitleaks-setting/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async putDependencySettingAPI(dependency_setting) {
      const paramDependencySetting = {
        project_id: this.getCurrentProjectID(),
        dependency_setting: dependency_setting,
      }
      const res = await this.$axios
        .post('/code/put-dependency-setting/', paramDependencySetting)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.dependency_setting) {
        return {}
      }
      return res.data.data.dependency_setting
    },
    async deleteDependencySettingAPI(github_setting_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        github_setting_id: github_setting_id,
      }
      await this.$axios
        .post('/code/delete-dependency-setting/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async listGitleaksCacheAPI(github_setting_id) {
      const query =
        '?project_id=' +
        this.getCurrentProjectID() +
        '&github_setting_id=' +
        github_setting_id

      const res = await this.$axios
        .get('/code/list-gitleaks-cache/' + query)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data || !res.data.data || !res.data.data.gitleaks_cache) {
        return []
      }
      return res.data.data.gitleaks_cache
    },
    async invokeScanGitleaksAPI(github_setting_id, fullscan) {
      const param = {
        project_id: this.getCurrentProjectID(),
        github_setting_id: github_setting_id,
        full_scan: fullscan,
      }
      await this.$axios
        .post('/code/invoke-scan-gitleaks/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    async invokeScanDependencyAPI(github_setting_id) {
      const param = {
        project_id: this.getCurrentProjectID(),
        github_setting_id: github_setting_id,
      }
      await this.$axios
        .post('/code/invoke-scan-dependency/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
    },
  },
}

export default code
