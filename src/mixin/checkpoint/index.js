import finding from '@/mixin/api/finding'

const checkpoint = {
  mixins: [finding],
  data: () => {
    return {}
  },
  methods: {
    async getResourceCheckPoint(namespace, resourceType, resourceName) {
      if (namespace === '' || resourceType === '' || resourceName === '') {
        return null
      }
      // Only the following combinations are supported
      if (namespace === 'aws' && resourceType === 's3') {
        return this.getAWSS3CheckPoint(resourceName)
      }
      if (namespace === 'aws' && resourceType === 'iam') {
        return this.getAWSIAMCheckPoint(resourceName)
      }
      if (namespace === 'aws' && resourceType === 'guardduty') {
        return this.getAWSGuardDutyCheckPoint(resourceName)
      }
      if (namespace === 'google' && resourceType === 'iam') {
        return this.getGCPIAMCheckPoint(resourceName)
      }
      if (namespace === 'code' && resourceType === 'repository') {
        return this.getCodeRepositoryCheckPoint(resourceName)
      }

      return null
    },

    // AWS
    async getAWSS3CheckPoint(resourceName) {
      const fList = await this.listFinding(
        '&data_source=aws:access-analyzer&resource_name=' + resourceName
      )
      if (!fList || !fList.finding_id || fList.finding_id.length === 0) {
        return null
      }
      const f = await this.getFinding(fList.finding_id[0])
      const d = JSON.parse(f.data)
      let cp = { IsPublic: d.IsPublic }
      if (d.Action) {
        cp.AllowedActions = d.Action.length
      }
      return cp
    },
    async getAWSIAMCheckPoint(resourceName) {
      const fList = await this.listFinding(
        '&data_source=aws:admin-checker&resource_name=' + resourceName
      )
      if (!fList || !fList.finding_id || fList.finding_id.length === 0) {
        return null
      }
      const f = await this.getFinding(fList.finding_id[0])
      const d = JSON.parse(f.data)
      let cp = { AdminUser: false }
      if (d.is_user_admin || d.is_grorup_admin) {
        cp.AdminUser = true
      }
      return cp
    },
    async getAWSGuardDutyCheckPoint(resourceName) {
      const fList = await this.listFinding(
        '&data_source=aws:guard-duty&resource_name=' + resourceName
      )
      if (!fList || !fList.finding_id || fList.finding_id.length === 0) {
        return null
      }
      const f = await this.getFinding(fList.finding_id[0])
      const d = JSON.parse(f.data)
      return { Severity: d.Severity, Type: d.Type }
    },

    // Google
    async getGCPIAMCheckPoint(resourceName) {
      const fList = await this.listFinding(
        '&data_source=google:asset&resource_name=' + resourceName
      )
      if (!fList || !fList.finding_id || fList.finding_id.length === 0) {
        return null
      }
      const f = await this.getFinding(fList.finding_id[0])
      const d = JSON.parse(f.data)
      let cp = { HasKey: d.has_key }
      if (d.asset) {
        cp.State = d.asset.state
      }
      return cp
    },

    // Code
    async getCodeRepositoryCheckPoint(resourceName) {
      const fList = await this.listFinding(
        '&data_source=code:gitleaks&resource_name=' + resourceName
      )
      if (!fList || !fList.finding_id || fList.finding_id.length === 0) {
        return null
      }
      const f = await this.getFinding(fList.finding_id[0])
      const d = JSON.parse(f.data)
      let c = { language: d.language, visibility: d.visibility }
      if (d.leak_findings) {
        c.leaks = d.leak_findings.length
      }
      return c
    },
  },
}

export default checkpoint
