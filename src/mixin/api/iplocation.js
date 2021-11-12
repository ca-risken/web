import axios from 'axios'
import isPrivateIP from 'private-ip'
import Util from '@/util'
const iplocation = {
  data: () => {
    return {}
  },
  methods: {
    async getIPlocation(ip) {
      if (!this.checkIpFormat(ip) || isPrivateIP(ip)) {
        return {}
      }
      // {"country_name":"JAPAN","country_code":"JP","city":"-","ip":"60.112.136.197"}
      const res = await axios
        .get('https://api.hostip.info/get_json.php?ip=' + ip, { timeout: 500 })
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data) {
        return {}
      }
      return res.data
    },
    checkIpFormat(ip) {
      if (Util.isEmptyString(ip)) return false
      for (const block of ip.split('.')) {
        if (!Util.isNumber(block) || Number(block) < 0 || Number(block) > 255) {
          return false
        }
      }
      return true
    },
  },
}

export default iplocation
