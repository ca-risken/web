<template>
  <div>
    <v-container>
      <page-header
        icon="mdi-alpha-p-box"
        :title="$t(`submenu['ProjectSelect']`)"
      />

      <v-row dense justify="center" align-content="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="pa-8 text-center">
            <v-card-text>
              <v-icon size="120" color="grey-lighten-1" class="mb-6">
                mdi-folder-outline
              </v-icon>

              <h2 class="text-h4 mb-4 text-grey-darken-2">
                {{ $t('message["Let us start by selecting a project."]') }}
              </h2>

              <p class="text-body-1 text-grey-darken-1 mb-6">
                {{ $t('message["You need to select a project to continue."]') }}
              </p>

              <v-btn
                color="primary"
                size="large"
                variant="elevated"
                prepend-icon="mdi-folder-open-outline"
                @click="handleSelectProject"
              >
                {{ $t('btn["Select Project"]') }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <project-org-select-dialog
      v-model="projectDialog"
      entity-type="project"
      :items="projectList"
      :loading="projectListLoading"
      @item-selected="handleProjectSelected"
      @create-entity="handleNewProject"
    />

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import PageHeader from '@/component/widget/toolbar/PageHeader.vue'
import ProjectOrgSelectDialog from '@/component/dialog/ProjectOrgSelectDialog.vue'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import mixin from '@/mixin'
import iam from '@/mixin/api/iam'
import project from '@/mixin/api/project'
import signin from '@/mixin/api/signin'
import store from '@/store'

export default {
  name: 'ProjectSelect',
  components: {
    PageHeader,
    ProjectOrgSelectDialog,
    BottomSnackBar,
  },
  mixins: [mixin, iam, project, signin],
  data() {
    return {
      projectDialog: false,
      projectList: [],
      projectListLoading: false,
    }
  },
  async mounted() {
    await this.handleSelectProject()
  },
  methods: {
    async handleSelectProject() {
      this.projectDialog = true
      await this.loadProjectList()
    },
    async loadProjectList() {
      this.projectListLoading = true
      try {
        if (!store.state.user?.user_id) {
          await this.signinUser()
        }
        let listProjectParam = '?user_id=' + store.state.user.user_id
        const admin = await this.isAdminAPI(store.state.user.user_id).catch(
          () => false
        )
        if (admin) {
          listProjectParam = ''
        }
        this.projectList = await this.listProjectAPI(listProjectParam)
      } catch (err) {
        console.error('Error loading projects:', err)
        this.$refs.snackbar.notifyError('Failed to load projects')
      } finally {
        this.projectListLoading = false
      }
    },
    async handleProjectSelected(project) {
      await store.commit('updateProject', project)
      await this.$router.push({
        path: '/dashboard',
        query: { project_id: project.project_id },
      })
    },
    handleNewProject() {
      this.$router.push('/project/new')
    },
  },
}
</script>

<style scoped></style>
