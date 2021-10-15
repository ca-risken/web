import Util from '@/util'
const diagnosis = {
  data: () => {
    return {}
  },
  methods: {
    async getWPScanDataSourceAPI() {
      const res = await this.$axios.get(
        '/diagnosis/get-datasource/'
          + '?diagnosis_data_source_id=' + this.wpscan_datasource_id 
          + '&project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.diagnosis_data_source ) {
        return false
      }
      return res.data.data.diagnosis_data_source
    },
    async listWPScanSettingAPI() {
      const res = await this.$axios.get(
        '/diagnosis/list-wpscan-setting/'
          + '?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data || !res.data.data || !res.data.data.wpscan_setting ) {
        return []
      }
      return res.data.data.wpscan_setting
    },
    async putWPScanSettingAPI(wpscan_setting_id,target_url,options,scan_at) {
      const param = {
        project_id: this.$store.state.project.project_id,
        wpscan_setting: {
          project_id: this.$store.state.project.project_id,
          wpscan_setting_id: wpscan_setting_id,
          diagnosis_data_source_id: this.wpscan_datasource_id,
          target_url: target_url,
          options: options,
          status: 2, // CONFIGURED
          status_detail: 'Configured at: ' + Util.formatDate(new Date(), 'yyyy/MM/dd HH:mm'),
          scan_at: scan_at,
        },
      }
      await this.$axios.post('/diagnosis/put-wpscan-setting/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      return
    },
    async deleteWPScanSettingAPI(wpscan_setting_id) {
      const param = {
          project_id: this.$store.state.project.project_id,
          wpscan_setting_id: wpscan_setting_id,
      }
      await this.$axios.post('/diagnosis/delete-wpscan-setting/', param).catch((err) =>  {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      return
    },
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
    async listApplicationScanAPI() {
      const res = await this.$axios.get(
        '/diagnosis/list-application-scan/?project_id=' + this.$store.state.project.project_id
      ).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.application_scan ) {
        return []
      }
      return res.data.data.application_scan  
    },
    async putApplicationScanAPI(diagnosisDataSourceID,applicationScanSettingID,name,scanType) {
      const param = { 
        project_id: this.$store.state.project.project_id,
        application_scan: {
          project_id: this.$store.state.project.project_id,
          diagnosis_data_source_id: diagnosisDataSourceID,
          application_scan_id: applicationScanSettingID,
          name: name,
          scan_type: scanType,
          status: 2, //CONFIGURED
        },
      }
      const res = await this.$axios.post('/diagnosis/put-application-scan/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      var newApplicationScanID = res.data.data.application_scan.application_scan_id
      return newApplicationScanID
    },
    async deleteApplicationScanAPI(applicationScanSettingID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        application_scan_id: applicationScanSettingID,
      }
      const res = await this.$axios.post('/diagnosis/delete-application-scan/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
    async getApplicationScanBasicSettingAPI(application_scan_id) {
      var url = '/diagnosis/get-application-scan-basic-setting/?project_id=' + this.$store.state.project.project_id
      if (application_scan_id != 0) {
        url = url + '&application_scan_id=' + application_scan_id
      } 
      const res = await this.$axios.get(url).catch((err) =>  {
        return Promise.reject(err)
      })
      if ( !res.data.data.application_scan_basic_setting ) {
        return null
      }
      return res.data.data.application_scan_basic_setting  
    },
    async putApplicationScanBasicSettingAPI(applicationScanSettingID,applicationScanBasicSettingID,target,max_depth,max_children) {
      const param = { 
        project_id: this.$store.state.project.project_id,
        application_scan_basic_setting: {
          project_id: this.$store.state.project.project_id,
          application_scan_id: applicationScanSettingID,
          application_scan_basic_setting_id: applicationScanBasicSettingID,
          target: target,
          max_depth: max_depth,
          max_children: max_children,
          status: 2, // CONFIGURED
        },
      }
      const res = await this.$axios.post('/diagnosis/put-application-scan-basic-setting/', param).catch((err) =>  {
        return Promise.reject(err)
      })
      return res
    },
    async deleteApplicationScanBasicSettingAPI(applicationScanBasicSettingID) {
      const param = {
        project_id: this.$store.state.project.project_id,
        application_scan_basic_setting_id: applicationScanBasicSettingID,
      }
      const res = await this.$axios.post('/diagnosis/delete-application-scan-basic-setting/', param).catch((err) =>  {
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
