<template>
  <div>
    <v-container>
      <page-header
        icon="mdi-account-group"
        :title="$t(`menu['Organization']`)"
      />
      <v-row dense justify="center" align-content="center">
        <v-col cols="10">
          <v-card>
            <v-card-text>
              <v-form v-model="organizationForm.valid" ref="form">
                <v-text-field
                  v-model="organizationModel.name"
                  :label="
                    $t(`item['` + organizationForm.name.label + `']`) + ' *'
                  "
                  :placeholder="organizationForm.name.placeholder"
                  :counter="64"
                  :rules="organizationForm.name.validator"
                  required
                  variant="outlined"
                ></v-text-field>
                <v-textarea
                  v-model="organizationModel.description"
                  :label="
                    $t(`item['` + organizationForm.description.label + `']`)
                  "
                  :placeholder="organizationForm.description.placeholder"
                  :counter="255"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
                <v-divider class="mt-3 mb-3"></v-divider>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    text
                    variant="outlined"
                    color="green-darken-1"
                    :loading="loading"
                    @click="handleCreate"
                    >Create</v-btn
                  >
                </v-card-actions>
              </v-form>
            </v-card-text>
            <bottom-snack-bar ref="snackbar" />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import store from '@/store'
import mixin from '@/mixin'
import organization from '@/mixin/api/organization'
import organization_helper from '@/mixin/helper/organization_helper'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import PageHeader from '@/component/widget/toolbar/PageHeader.vue'

export default {
  name: 'NewOrganization',
  mixins: [mixin, organization, organization_helper],
  components: {
    BottomSnackBar,
    PageHeader,
  },
  data() {
    return {
      loading: false,
      organizationModel: {
        organization_id: '',
        name: '',
        description: '',
        created_at: '',
        updated_at: '',
      },
      organizationForm: {
        valid: false,
        name: {
          label: 'Name',
          placeholder: 'your-organization',
          validator: [
            (v) => !!v || 'Name is required',
            (v) => v.length <= 64 || 'Name must be less than 64 characters',
            (v) => !this.existsOrganizationName(v) || 'Name is already exists.',
          ],
        },
        description: {
          label: 'Description',
          placeholder: 'Enter organization description',
        },
      },
      organizationList: [],
    }
  },
  async mounted() {
    this.loading = true
    this.organizationList = await this.listOrganizationAPI().catch((err) => {
      this.$refs.snackbar.notifyError(err.response.data)
      this.loading = false
      return Promise.reject(err)
    })
    this.loading = false
  },
  methods: {
    async createOrganization() {
      if (!store.state.user) {
        this.$refs.snackbar.notifyError('Error: Try again after signin.')
        this.loading = false
        return
      }
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
      this.$refs.snackbar.notifySuccess('Success: Created new organization.')
      setTimeout(() => {
        this.$router.push('/organization/project/')
      }, 1000)
    },

    existsOrganizationName(name) {
      if (name === '') {
        return false
      }
      for (const org of this.organizationList) {
        if (org.name == name) return true
      }
      return false
    },

    handleCreate() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      this.createOrganization()
    },
  },
}
</script>
