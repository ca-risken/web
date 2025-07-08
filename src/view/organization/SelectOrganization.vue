<template>
  <div>
    <v-container>
      <page-header
        icon="mdi-account-group"
        :title="$t(`menu['Organization']`)"
      />

      <v-row dense justify="center" align-content="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="pa-8 text-center">
            <v-card-text>
              <v-icon size="120" color="grey-lighten-1" class="mb-6">
                mdi-account-group-outline
              </v-icon>

              <h2 class="text-h4 mb-4 grey--text text--darken-2">
                {{ $t('message["Please select an organization"]') }}
              </h2>

              <p class="text-body-1 grey--text text--darken-1 mb-6">
                {{
                  $t(
                    'message["You need to select an organization to continue."]'
                  )
                }}
              </p>

              <v-btn
                color="primary"
                size="large"
                variant="elevated"
                @click="handleSelectOrganization"
                prepend-icon="mdi-account-group"
              >
                {{ $t('btn["Select Organization"]') }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Organization Select Dialog -->
    <project-org-select-dialog
      v-model="organizationDialog"
      entity-type="organization"
      :items="organizationList"
      :loading="organizationListLoading"
      @item-selected="handleOrganizationSelected"
      @create-entity="handleNewOrganization"
    />

    <!-- Snackbar -->
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import PageHeader from '@/component/widget/toolbar/PageHeader.vue'
import ProjectOrgSelectDialog from '@/component/dialog/ProjectOrgSelectDialog.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import mixin from '@/mixin'
import organization from '@/mixin/api/organization'
import store from '@/store'

export default {
  name: 'OrganizationPrompt',
  mixins: [mixin, organization],
  components: {
    PageHeader,
    ProjectOrgSelectDialog,
    BottomSnackBar,
  },
  data() {
    return {
      organizationDialog: false,
      organizationList: [],
      organizationListLoading: false,
    }
  },
  methods: {
    async handleSelectOrganization() {
      this.organizationDialog = true
      await this.loadOrganizationList()
    },
    async loadOrganizationList() {
      this.organizationListLoading = true
      const listOrganizationParam = '?user_id=' + store.state.user.user_id
      this.organizationList = await this.listOrganizationAPI(
        listOrganizationParam
      ).catch((err) => {
        console.error('Error loading organizations:', err)
        this.$refs.snackbar.notifyError('Failed to load organizations')
        return Promise.reject(err)
      })
      this.organizationListLoading = false
    },
    async handleOrganizationSelected(organization) {
      await store.commit('updateOrganization', organization)
      const query = { organization_id: organization.organization_id }
      this.$refs.snackbar.notifySuccess(
        `Organization selected: ${organization.name}`
      )
      await this.$router.push({
        path: '/organization/project',
        query: query,
      })
    },
    handleNewOrganization() {
      this.$router.push('/organization/new')
    },
  },
}
</script>

<style scoped>
.v-card {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
