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
            <!-- Profile -->
            <v-card-text>
              <v-form v-model="organizationForm.valid" ref="form">
                <v-text-field
                  v-model="organizationModel.organization_id"
                  :label="$t(`item['` + organizationForm.ID.label + `']`)"
                  :placeholder="organizationForm.ID.placeholder"
                  variant="outlined"
                  disabled
                ></v-text-field>
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
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    variant="outlined"
                    color="green-darken-1"
                    :loading="loading"
                    @click="handleEdit"
                  >
                    {{ $t(`btn['SAVE']`) }}
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
            <v-divider />

            <!-- DELETE -->
            <v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  variant="outlined"
                  color="red-darken-1"
                  :loading="loading"
                  @click="handleDelete"
                >
                  {{ $t(`btn['DELETE']`) }}
                </v-btn>
              </v-card-actions>
            </v-card-text>

            <bottom-snack-bar ref="snackbar" />
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Delete Dialog -->
    <delete-dialog
      v-model="deleteDialog"
      :title="$t(`message['Do you really want to delete this?']`)"
      :item-data="{
        id: organizationModel.organization_id,
        name: organizationModel.name,
      }"
      item-icon="mdi-account-group"
      :loading="loading"
      @confirm="handleDeleteSubmit"
      @cancel="deleteDialog = false"
    />
  </div>
</template>

<script>
import mixin from '@/mixin'
import store from '@/store'
import organization from '@/mixin/api/organization'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import organization_base from '@/mixin/util/organization_base'
import DeleteDialog from '@/component/dialog/DeleteDialog.vue'
import PageHeader from '@/component/widget/toolbar/PageHeader.vue'

export default {
  name: 'OrganizationSetting',
  mixins: [mixin, organization, organization_base],
  components: {
    BottomSnackBar,
    DeleteDialog,
    PageHeader,
  },
  data() {
    return {
      loading: false,
      deleteDialog: false,
      organizationModel: {
        organization_id: '',
        name: '',
        description: '',
        created_at: '',
        updated_at: '',
      },
      organizationForm: {
        valid: false,
        ID: { label: 'ID', placeholder: '-', validator: [] },
        name: {
          label: 'Name',
          placeholder: 'your-organization',
          validator: [
            (v) => !!v || 'Name is required',
            (v) =>
              !v || v.length <= 64 || 'Name must be less than 64 characters',
          ],
        },
        description: {
          label: 'Description',
          placeholder: 'Enter organization description',
        },
      },
    }
  },
  async mounted() {
    this.loading = true
    this.organizationModel = store.state.organization
    this.loading = false
  },
  methods: {
    async editOrganization() {
      const organization = await this.updateOrganizationAPI(
        this.organizationModel.name,
        this.organizationModel.description
      ).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        this.loading = false
        return Promise.reject(err)
      })
      if (!organization.organization_id) {
        this.$refs.snackbar.notifyError('Failed to get organization.')
      }
      store.commit('updateOrganization', organization)
    },
    async deleteOrganization() {
      await this.deleteOrganizationAPI().catch((err) => {
        this.$refs.snackbar.notifyError(err)
        return Promise.reject(err)
      })
    },
    handleEdit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      this.editOrganization()
      this.$refs.snackbar.notifySuccess('Success: updated.')
      this.loading = false
    },
    handleDelete() {
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.deleteOrganization()
      this.deleteDialog = false
      this.$refs.snackbar.notifySuccess('Success: Organization deleted.')
      store.commit('updateOrganization', {})
      this.$router.push('/organization/list')
      this.loading = false
    },
  },
}
</script>
