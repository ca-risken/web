<template>
  <v-card tile>
    <v-card-title dense>Select your project</v-card-title>
    <v-divider></v-divider>
    <v-card-text dense class="pa-0">
      <v-list rounded class="pa-0">
        <v-list-item
          v-for="(pj, index) in projects"
          :key="pj.project_id"
          @click="handleClick(pj)"
        >
          <template v-if="index < 9">
            <v-list-item-avatar>
              <v-icon>mdi-numeric-{{ index + 1 }}-box-outline</v-icon>
            </v-list-item-avatar>
          </template>
          <template v-else>
            <v-list-item-content>{{ index + 1 }}</v-list-item-content>
          </template>
          <v-list-item-content>{{ pj.name }}</v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>
        <v-list-item @click="handleNewProject">
          <v-list-item-content>New Project</v-list-item-content>
        </v-list-item>

      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import store from '@/store'
import mixin from '@/mixin'
export default {
  data() {
    return {
      projects: [],
    }
  },
  mounted() {
    this.listProject()
  },
  mixins: [mixin],
  methods: {
    async listProject() {
      if ( !store.state.user ) {
        this.$refs.snackbar.notifyError( 'Error: Try again after signin.' )
        return
      }
      const res = await this.$axios.get('/project/list-project/?user_id=' + store.state.user.user_id ).catch((err) =>  {
        return Promise.reject(err)
      })
      if (res.data.data.project ) {
        this.projects = res.data.data.project
      }
    },
    handleClick(project)  {
      store.commit('updateProject', project)
      this.reload()
    },
    handleNewProject() {
      this.$router.push('/project/new')
    },
  }
}
</script>
