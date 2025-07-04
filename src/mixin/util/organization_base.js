import { MODE } from '@/constants/mode'
import { INVITATION_STATUS } from '@/constants/invitationStatus'

const organization_iam = {
  data: () => {
    return {}
  },
  computed: {
    isOrganizationMode() {
      return this.$store.state.mode === MODE.ORGANIZATION
    },
  },
  methods: {
    getCurrentOrganizationID() {
      if (this.$store.state.organization.organization_id) {
        return this.$store.state.organization.organization_id
      }
      return ''
    },
    getStatusColor(status) {
      const numStatus =
        typeof status === 'string' ? parseInt(status, 10) : status
      const statusText = this.getStatusText(numStatus)
      switch (statusText) {
        case INVITATION_STATUS.PENDING:
          return 'orange'
        case INVITATION_STATUS.ACCEPTED:
          return 'green'
        case INVITATION_STATUS.REJECTED:
          return 'red'
        default:
          return 'grey'
      }
    },
    getStatusText(status) {
      const numStatus =
        typeof status === 'string' ? parseInt(status, 10) : status
      switch (numStatus) {
        case 1:
          return INVITATION_STATUS.PENDING
        case 2:
          return INVITATION_STATUS.ACCEPTED
        case 3:
          return INVITATION_STATUS.REJECTED
        default:
          console.warn(
            'Unknown status value:',
            status,
            'converted to:',
            numStatus
          )
          return INVITATION_STATUS.UNKNOWN
      }
    },
  },
}

export default organization_iam
