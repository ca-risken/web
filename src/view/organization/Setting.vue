<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-account-group</v-icon>
              {{
                isNewMode
                  ? 'New Organization'
                  : $t(`submenu['OrganizationSetting']`)
              }}
            </v-toolbar-title>
            <v-spacer />
            <v-btn variant="outlined" color="grey-darken-1" @click="handleBack">
              {{ $t(`btn['CANCEL']`) }}
            </v-btn>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon large class="pr-2">mdi-domain</v-icon>
              {{ isNewMode ? 'Create New Organization' : 'Edit Organization' }}
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-form ref="organizationForm">
                <v-text-field
                  v-model="organizationModel.name"
                  :label="$t(`item['Name']`)"
                  :placeholder="organizationForm.name.placeholder"
                  :counter="64"
                  :rules="organizationForm.name.validator"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                ></v-text-field>

                <v-textarea
                  v-model="organizationModel.description"
                  :label="$t(`item['Description']`)"
                  :placeholder="organizationForm.description.placeholder"
                  :counter="255"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  class="mb-4"
                ></v-textarea>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                variant="outlined"
                color="grey-darken-1"
                @click="handleBack"
              >
                {{ $t(`btn['CANCEL']`) }}
              </v-btn>
              <v-btn
                variant="outlined"
                color="primary-darken-3"
                :loading="loading"
                @click="handleSave"
              >
                {{ $t(`btn['SAVE']`) }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import organization from '@/mixin/api/organization'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import store from '@/store'

export default {
  name: 'OrganizationSetting',
  mixins: [mixin, organization],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      organizationModel: {
        organization_id: null,
        name: '',
        description: '',
      },
      organizationForm: {
        name: {
          placeholder: 'Enter organization name',
          validator: [
            (v) => !!v || 'Organization name is required',
            (v) =>
              (v && v.length <= 64) || 'Name must be less than 64 characters',
          ],
        },
        description: {
          placeholder: 'Enter organization description (optional)',
        },
      },
    }
  },
  computed: {
    isNewMode() {
      return this.$route.query.new === 'true'
    },
    isEditMode() {
      return (
        !this.isNewMode &&
        (this.organizationId || store.state.organization.organization_id)
      )
    },
    organizationId() {
      return this.$route.query.id
    },
    currentOrganization() {
      return store.state.organization
    },
  },
  watch: {
    // Watch for organization changes in store
    currentOrganization: {
      handler(newOrganization, oldOrganization) {
        console.log('Organization changed in store:', {
          newOrganization,
          oldOrganization,
        })

        // Only update if we're in edit mode and organization actually changed
        if (
          !this.isNewMode &&
          newOrganization &&
          (!oldOrganization ||
            newOrganization.organization_id !== oldOrganization.organization_id)
        ) {
          console.log('Updating form with new organization data')
          this.organizationModel = {
            organization_id: newOrganization.organization_id,
            name: newOrganization.name || '',
            description: newOrganization.description || '',
          }
        }
      },
      deep: true,
      immediate: false,
    },
  },
  mounted() {
    console.log('Organization Setting mounted:', {
      isNewMode: this.isNewMode,
      organizationId: this.organizationId,
      storeOrganization: store.state.organization,
    })

    if (this.isNewMode) {
      this.initializeNewOrganization()
    } else if (this.organizationId) {
      this.loadOrganizationData(this.organizationId)
    } else {
      this.loadOrganizationData()
    }
  },
  methods: {
    initializeNewOrganization() {
      this.organizationModel = {
        organization_id: null,
        name: '',
        description: '',
      }
    },

    async loadOrganizationData(id = null) {
      this.loading = true
      try {
        if (id) {
          // TODO: Implement organization API calls for specific ID
          // For now, use mock data based on ID
          this.organizationModel = {
            organization_id: id,
            name: `Organization ${id}`,
            description: `This is organization ${id} description.`,
          }
        } else {
          // Load current organization from store for editing
          const currentOrganization = store.state.organization
          if (currentOrganization && currentOrganization.organization_id) {
            this.organizationModel = {
              organization_id: currentOrganization.organization_id,
              name: currentOrganization.name || '',
              description: currentOrganization.description || '',
            }
          } else {
            // Fallback if no organization in store
            this.organizationModel = {
              organization_id: null,
              name: '',
              description: '',
            }
            this.$refs.snackbar.notifyWarning(
              'No organization selected for editing'
            )
          }
        }
      } catch (err) {
        this.$refs.snackbar.notifyError(
          err.response?.data || 'Failed to load organization data'
        )
      } finally {
        this.loading = false
      }
    },

    async handleSave() {
      if (!this.$refs.organizationForm.validate()) {
        return
      }

      this.loading = true
      try {
        if (this.isNewMode) {
          // Check user state
          if (!store.state.user) {
            this.$refs.snackbar.notifyError('Error: Try again after signin.')
            this.loading = false
            return
          }
          // Call createOrganizationAPI from mixin
          const organization = await this.createOrganizationAPI(
            this.organizationModel.name,
            this.organizationModel.description
          ).catch((err) => {
            this.$refs.snackbar.notifyError(err.response.data)
            this.loading = false
            return Promise.reject(err)
          })
          if (!organization.organization_id) {
            this.$refs.snackbar.notifyError('Failed to get new organization.')
          }
          store.commit('updateOrganization', organization)
          store.commit('updateMode', 'organization')
          this.$refs.snackbar.notifySuccess(
            'Success: Created new organization.'
          )
          setTimeout(() => {
            this.$router.push('/organization/list')
          }, 1000)
        } else {
          // TODO: Implement organization update API
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

          // Update organization in store with new values
          const updatedOrganization = {
            organization_id: this.organizationModel.organization_id,
            name: this.organizationModel.name,
            description: this.organizationModel.description,
          }
          store.commit('updateOrganization', updatedOrganization)

          this.$refs.snackbar.notifySuccess('Organization updated successfully')

          // Navigate back to list after successful update (not for new organization)
          setTimeout(() => {
            this.handleBack()
          }, 1000)
        }
      } catch (err) {
        this.$refs.snackbar.notifyError(
          err.response?.data || 'Failed to save organization'
        )
      } finally {
        this.loading = false
      }
    },

    handleBack() {
      this.$router.push('/dashboard')
    },
  },
}
</script>
