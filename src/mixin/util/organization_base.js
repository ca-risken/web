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
  },
}

export default organization_iam
