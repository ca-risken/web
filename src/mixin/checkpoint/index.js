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
      return null
    },

    async getAWSS3CheckPoint(resourceName) {
      const fList = await this.listFinding(
        '&data_source=aws:access-analyzer&resource_name=' + resourceName
      )
      if (!fList || !fList.finding_id || fList.finding_id.length === 0) {
        return null
      }
      const f = await this.getFinding(fList.finding_id[0])
      const d = JSON.parse(f.data)
      if (d.IsPublic && d.Action) {
        return { IsPublic: d.IsPublic, AllowedActions: d.Action.length }
      } else {
        return { IsPublic: d.IsPublic }
      }
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
      if (d.is_user_admin || d.is_grorup_admin) {
        return { IsAdmin: true }
      } else {
        return { IsAdmin: false }
      }
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
      let serverity = ''
      if (d.Severity) {
        serverity = d.Severity
      }
      let type = ''
      if (d.Type) {
        type = d.Type
      }
      return { Severity: serverity, Type: type }
    },
    async getGCPIAMCheckPoint(resourceName) {
      const fList = await this.listFinding(
        '&data_source=google:asset&resource_name=' + resourceName
      )
      if (!fList || !fList.finding_id || fList.finding_id.length === 0) {
        return null
      }
      const f = await this.getFinding(fList.finding_id[0])
      const d = JSON.parse(f.data)
      if (d.asset) {
        return { State: d.asset.state, HasKey: d.has_key }
      }
      return null
    },
  },
}

export default checkpoint
