<template>
  <v-card max-width="600" class="mx-auto" >
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="headline">Project</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-card-text>
      <v-form v-model="projectForm.valid" ref="form">
        <v-text-field
          v-model="projectModel.name"
          :label="projectForm.name.label"
          :placeholder="projectForm.name.placeholder"
          :counter="64"
          :rules="projectForm.name.validator"
          required
        ></v-text-field>
        <v-divider class="mt-3 mb-3"></v-divider>
        <v-card-actions>
          <v-spacer />
          <v-btn text outlined color="green darken-1" :loading="loading" @click="handleCreate">Create</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
    <bottom-snack-bar ref="snackbar" />
  </v-card>
</template>

<script>
import store from '@/store'
import mixin from '@/mixin'

import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  mixins: [mixin],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      projectModel: {project_id:'', name:'', created_at:'', updated_at:'' },
      projectForm: {
        valid: false,
        name: { label: 'Name *', placeholder: 'your-project', validator:[
            v => !!v || 'Name is required',
            v => v.length <= 64 || 'Name must be less than 64 characters',
          ]
        },
      },
    }
  },
  methods: {
    async createProject() {
      if ( !store.state.user ) {
        this.$refs.snackbar.notifyError( 'Error: Try again after signin.' )
        this.loading = false
        return
      }
      const param = {
        user_id: store.state.user.user_id,
        name: this.projectModel.name,
      }
      const res = await this.$axios.post('/project/create-project/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        this.loading = false
        return Promise.reject(err)
      })
      if ( !res.data.data.project ) {
        this.$refs.snackbar.notifyError('Failed to get new porject.')
      }
     store.commit('updateProject', res.data.data.project)
      this.$refs.snackbar.notifySuccess( 'Success: Created new project.' )
      setTimeout(() => {
        this.$router.push('/')
      }, 1000)
    },
    handleCreate() {
      if (this.$refs.form.validate()) {
        this.loading = true
        this.createProject()
      }
    },
  }
}
</script>
