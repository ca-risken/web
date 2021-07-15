const diagnosis = {
  data: () => {
    return {}
  },
  methods: {
    async listPortscanSettingAPI() {
      const res = await this.$axios.get(
        '/diagnosis/list-portscan-setting/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.portscan_setting ) {
        return []
      }
      return res.data.data.portscan_setting  
    },
    async putPortscanSettingAPI(diagnosisDataSourceID,portscanSettingID,name,target) {
      const param = { 
        project_id: this.$store.state.project.project_id,
        portscan_setting: {
          project_id: this.$store.state.project.project_id,
          diagnosis_data_source_id: diagnosisDataSourceID,
          portscan_setting_id: portscanSettingID,
          name: name,
        },
      }
      const res = await this.$axios.post('/diagnosis/put-portscan-setting/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      var newPortscanSettingID = res.data.data.portscan_setting.portscan_setting_id
      const k =(/,|\n| /)
      const targets = target.split(k)
      targets.forEach(element => this.putPortscanTargetAPI(newPortscanSettingID,0,element));
      return res
    },
    async deletePortscanSettingAPI(portscanSettingID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        portscan_setting_id: portscanSettingID,
      }
      const res = await this.$axios.post('/diagnosis/delete-portscan-setting/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
    async listPortscanTargetAPI(portscan_setting_id) {
      var url = '/diagnosis/list-portscan-target/?project_id=' + this.$store.state.project.project_id
      if (portscan_setting_id != 0) {
        url = url + '&portscan_setting_id=' + portscan_setting_id
      } 
      const res = await this.$axios.get(url).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.portscan_target ) {
        return []
      }
      return res.data.data.portscan_target  
    },
    async putPortscanTargetAPI(portscanSettingID,portscanTargetID,target) {
      const param = { 
        project_id: this.$store.state.project.project_id,
        portscan_target: {
          project_id: this.$store.state.project.project_id,
          portscan_setting_id: portscanSettingID,
          portscan_target_id: portscanTargetID,
          target: target,
          status: 2, // CONFIGURED
        },
      }
      const res = await this.$axios.post('/diagnosis/put-portscan-target/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
    async deletePortscanTargetAPI(portscanTargetID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        portscan_target_id: portscanTargetID,
      }
      const res = await this.$axios.post('/diagnosis/delete-portscan-target/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
    async invokeDiagnosisScanAPI(setting_id, diagnosis_data_source_id) {
      const param = {
        project_id: this.$store.state.project.project_id,
        setting_id: setting_id,
        diagnosis_data_source_id: diagnosis_data_source_id,
      }
      const res = await this.$axios.post('/diagnosis/invoke-scan/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
  },
}

export default diagnosis 
