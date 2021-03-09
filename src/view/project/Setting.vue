<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">mdi-alpha-p-box</v-icon>
              Project
            </v-toolbar-title>
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row dense justify="center" align-content="center">
        <v-col cols="10">
          <v-card>
            <v-card-text>
              <v-form v-model="projectForm.valid" ref="form">
                <v-text-field
                  v-model="projectModel.project_id"
                  :label="projectForm.ID.label"
                  :placeholder="projectForm.ID.placeholder"
                  filled disabled outlined
                ></v-text-field>
                <v-text-field
                  v-model="projectModel.name"
                  :label="projectForm.name.label"
                  :placeholder="projectForm.name.placeholder"
                  :counter="64"
                  :rules="projectForm.name.validator"
                  required outlined
                ></v-text-field>
                <v-card-actions>
                  <v-spacer />
                  <v-btn text outlined color="green darken-1" :loading="loading" @click="handleEdit">Edit</v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
            <v-divider />
            <v-card-text>
              <v-chip
                v-for="t in projectModel.tag"
                :key="t.tag"
                :color="t.color"
                class="ma-2"
                close dark
                @click="handleTag(t)"
                @click:close="handleDeleteTag(t)"
              >
                {{ t.tag }}
              </v-chip>
              <v-card-actions>
                <v-spacer />
                <v-btn text outlined color="blue darken-1" :loading="loading" @click="handleTag">ADD TAG</v-btn>
              </v-card-actions>
            </v-card-text>
            <bottom-snack-bar ref="snackbar" />
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Tag -->
    <v-dialog v-model="tagDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">
          <span class="mx-4">Project Tag</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="projectTagForm.valid" ref="tagForm">
            <v-text-field
              v-model="projectTagModel.tag"
              :label="projectTagForm.tag.label"
              :placeholder="projectTagForm.tag.placeholder"
              :counter="64"
              :rules="projectTagForm.tag.validator"
              outlined
            ></v-text-field>
            <v-color-picker
              v-model="projectTagModel.color"
              dot-size="9"
              hide-sliders
              mode="hexa"
              :swatches="projectTagForm.swatches"
              show-swatches
              width="500"
              swatches-max-height="150"
            ></v-color-picker>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text outlined color="grey darken-1" @click="tagDialog = false">
            CANCEL
          </v-btn>
          <v-btn
            color="blue darken-1"
            text outlined
            :loading="loading"
            @click="handleTagSubmit"
          >
            TAG
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
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  mixins: [mixin, project],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      projectModel: {project_id:'', name:'', tag: [], created_at:'', updated_at:'' },
      projectForm: {
        valid: false,
        ID : { label: 'ID', placeholder: '-', validator:[]},
        name: { label: 'Name *', placeholder: 'your-project', validator:[
            v => !!v || 'Name is required',
            v => !v || v.length <= 64 || 'Name must be less than 64 characters',
          ]
        },
      },
      tagDialog: false,
      projectTagModel: {project_id:'', tag:'', created_at:'', updated_at:'',
        color: {
          types: ['hex', 'hexa', 'rgba', 'hsla', 'hsva'],
          type: 'hex',
          hex: '#FF00FF',
          hexa: '#FF00FFFF',
          rgba: { r: 255, g: 0, b: 255, a: 1 },
          hsla: { h: 300, s: 1, l: 0.5, a: 1 },
          hsva: { h: 300, s: 1, v: 1, a: 1 },
        },
      },
      projectTagForm: {
        valid: false,
        tag: { label: 'Tag *', placeholder: 'key:value', validator:[
            v => !!v || 'Tag is required',
            v => !v || v.length <= 64 || 'Tag must be less than 64 characters',
          ]
        },
        // color: { label: 'Color', placeholder: '#123456', validator:[
        //     v => !v || v.length <= 32 || 'Color must be less than 32 characters',
        //   ]
        // },
        swatches: [
          ['#F44336'],['#E91E63'],['#9C27B0'],['#673AB7'],['#3F51B5'],['#2196F3'],
          ['#03A9F4'],['#00BCD4'],['#009688'],['#4CAF50'],['#8BC34A'],['#CDDC39'],
          ['#FFEB3B'],['#FFC107'],['#FF9800'],['#FF5722'],['#795548'],['#9E9E9E'],
        ]
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
      this.projectModel = store.state.project
      const param = '?project_id=' + this.projectModel.project_id
      const project = await this.listProjectAPI(param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      if (!project[0]) return
      this.projectModel.tag = project[0].tag
    },
    async editProject() {
      const res = await this.updateProjectAPI(this.projectModel.name).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        this.loading = false
        return Promise.reject(err)
      })
      if ( !res.data.data.project ) {
        this.$refs.snackbar.notifyError('Failed to get new porject.')
      }
      store.commit('updateProject', res.data.data.project)
      this.$refs.snackbar.notifySuccess( 'Success: Updated project.' )
    },
    async tagProject() {
      await this.tagProjectAPI(this.projectTagModel.tag, this.projectTagModel.color.hexa).catch((err) =>  {
        this.$refs.snackbar.notifyError(err)
        return Promise.reject(err)
      })
      this.$refs.snackbar.notifySuccess( 'Success: tag project.' )
    },
    async untagProject() {
      await this.untagProjectAPI(this.projectTagModel.tag).catch((err) =>  {
        this.$refs.snackbar.notifyError(err)
        return Promise.reject(err)
      })
      this.$refs.snackbar.notifySuccess( 'Success: untag project.' )
    },

    // Handler
    handleEdit() {
      if ( !this.$refs.form.validate() ) {
        return
      }
      this.loading = true
      this.editProject()
      this.loading = false
    },
    handleTag(tag) {
      this.projectTagModel = {project_id:this.projectModel.project_id, tag:'', color: '', created_at:'', updated_at:'' }
      if (tag) {
        this.projectTagModel = {project_id:this.projectModel.project_id, tag:tag.tag}
      }
      this.tagDialog = true
    },
    async handleTagSubmit() {
      if ( !this.$refs.tagForm.validate() ) {
        return
      }
      this.loading = true
      await this.tagProject()
      await new Promise(resolve => setTimeout(resolve, 1000))
      await this.setProject()
      this.loading = false
      this.tagDialog = false
    },
    async handleDeleteTag(tag) {
      this.projectTagModel = {
        project_id:this.projectModel.project_id,
        tag:tag.tag,
      }
      await this.untagProject()
      await this.setProject()
      this.loading = false
    }
  }
}
</script>
