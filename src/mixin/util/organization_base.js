const organization_iam = {
  data: () => {
    return {}
  },
  computed: {
    isOrganizationMode() {
      return this.$store.state.mode === 'organization'
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
          case 'PENDING':
            return 'orange'
          case 'ACCEPTED':
            return 'green'
          case 'REJECTED':
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
            return 'PENDING'
          case 2:
            return 'ACCEPTED'
          case 3:
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
