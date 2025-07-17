<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-alpha-p-box</v-icon>
              {{ $t(`menu['Project']`) }}
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense justify="center" align-content="center">
        <v-col cols="10">
          <v-card>
            <!-- Profile -->
            <v-card-text>
              <v-form v-model="projectForm.valid" ref="form">
                <v-text-field
                  v-model="projectModel.project_id"
                  :label="$t(`item['` + projectForm.ID.label + `']`)"
                  :placeholder="projectForm.ID.placeholder"
                  variant="outlined"
                  disabled
                ></v-text-field>
                <v-text-field
                  v-model="projectModel.name"
                  :label="$t(`item['` + projectForm.name.label + `']`) + ' *'"
                  :placeholder="projectForm.name.placeholder"
                  :counter="64"
                  :rules="projectForm.name.validator"
                  required
                  variant="outlined"
                ></v-text-field>
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

            <!-- TAG -->
            <v-card-text>
              <v-chip
                v-for="t in projectModel.tag"
                :key="t.tag"
                :color="t.color"
                class="ma-2 text-white"
                :closable="true"
                variant="flat"
                @click="handleEditProjectTag(t)"
                @click:close.stop.prevent="handleDeleteTag(t)"
              >
                {{ t.tag }}
              </v-chip>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  variant="outlined"
                  color="blue-darken-1"
                  :loading="loading"
                  @click="handleNewProjectTag"
                >
                  {{ $t(`btn['NEW TAG']`) }}
                </v-btn>
                <project-tag
                  :tagDialog="projectTagDialog"
                  @projectTagCancel="projectTagDialog = false"
                  @projectTagUpdated="handleProjectTagUpdated"
                />
              </v-card-actions>
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
    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="text-h5">
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="deleteDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            :loading="loading"
            color="red-darken-1"
            text
            variant="outlined"
            @click="handleDeleteSubmit"
          >
            {{ $t(`btn['DELETE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import mixin from '@/mixin'
import store from '@/store'
import project from '@/mixin/api/project'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import ProjectTag from '@/component/widget/tag/ProjectTag.vue'
export default {
  name: 'ProjectSetting',
  mixins: [mixin, project],
  components: {
    BottomSnackBar,
    ProjectTag,
  },
  data() {
    return {
      loading: false,
      tagDialog: false,
      deleteDialog: false,
      projectModel: {
        project_id: '',
        name: '',
        tag: [],
        created_at: '',
        updated_at: '',
      },
      projectForm: {
        valid: false,
        ID: { label: 'ID', placeholder: '-', validator: [] },
        name: {
          label: 'Name',
          placeholder: 'your-project',
          validator: [
            (v) => !!v || 'Name is required',
            (v) =>
              !v || v.length <= 64 || 'Name must be less than 64 characters',
          ],
        },
      },
    }
  },
  async mounted() {
    this.loading = true
    await this.setProject()
    this.loading = false
  },
  methods: {
    async setProject() {
      if (!store.state.project.project_id) {
        return
      }
      this.projectModel = { ...store.state.project }
      const param = '?project_id=' + this.projectModel.project_id
      const project = await this.listProjectAPI(param).catch((err) => {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      if (!project[0]) return
      this.projectModel.tag = project[0].tag
    },
    async editProject() {
      const project = await this.updateProjectAPI(this.projectModel.name).catch(
        (err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          this.loading = false
          return Promise.reject(err)
        }
      )
      if (!project.project_id) {
        this.$refs.snackbar.notifyError('Failed to get new porject.')
      }
      store.commit('updateProject', project)
    },
    async untagProject(tag) {
      await this.untagProjectAPI(tag).catch((err) => {
        this.$refs.snackbar.notifyError(err)
        return Promise.reject(err)
      })
    },
    async deleteProject() {
      await this.deleteProjectAPI().catch((err) => {
        this.$refs.snackbar.notifyError(err)
        return Promise.reject(err)
      })
    },

    // Handler
    handleEdit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.loading = true
      this.editProject()
      this.$refs.snackbar.notifySuccess('Success: updated.')
      this.loading = false
    },

    async handleDeleteTag(tag) {
      this.loading = true
      await this.untagProject(tag.tag)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await this.setProject()
      this.$refs.snackbar.notifySuccess('Success: Untag project.')
      this.loading = false
    },

    // Updated method
    async handleProjectTagUpdated(message) {
      await this.setProject()
      this.$refs.snackbar.notifySuccess(message)
      this.projectTagDialog = false
    },
    handleDelete() {
      this.deleteDialog = true
    },
    async handleDeleteSubmit() {
      this.loading = true
      await this.deleteProject()
      store.commit('updateProject', {})
      this.$refs.snackbar.notifySuccess('Success: Delete project.')
      await new Promise((resolve) => setTimeout(resolve, 2000))
      this.loading = false
      this.reload()
    },
  },
}
</script>
