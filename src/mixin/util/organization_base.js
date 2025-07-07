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
      switch (numStatus) {
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
        case INVITATION_STATUS.PENDING:
          return 'PENDING'
        case INVITATION_STATUS.ACCEPTED:
          return 'ACCEPTED'
        case INVITATION_STATUS.REJECTED:
          return 'REJECTED'
        default:
          console.warn(
            'Unknown status value:',
            status,
            'converted to:',
            numStatus
          )
          return 'UNKNOWN'
      }
    },
  },
}

export default organization_iam
