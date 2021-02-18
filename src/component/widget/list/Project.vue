<template>
  <v-card>
    <v-card-title class="text-caption">Select your project</v-card-title>
    <v-divider></v-divider>
    <v-card-text class="pa-0">
      <v-list class="pa-0">
        <v-list-item
          v-for="(pj, index) in projects"
          :key="pj.project_id"
          @click="handleClick(pj)"
        >
          <template v-if="index < 9">
            <v-list-item-avatar>
              <v-icon color="black">mdi-numeric-{{ index + 1 }}-box-outline</v-icon>
            </v-list-item-avatar>
          </template>
          <template v-else>
            <v-list-item-content>{{ index + 1 }}</v-list-item-content>
          </template>
          <v-list-item-content class="text-h6">{{ pj.name }}</v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>
        <v-list-item @click="handleNewProject">
          <v-list-item-content>
            <span class="text-caption">... or create new project</span>
          </v-list-item-content>
          <v-icon color="teal lighten-2" left >mdi-new-box</v-icon>
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
      if ( !store.state.user || !store.state.user.user_id ) {
        this.$refs.snackbar.notifyError( 'Error: Try again after signin.' )
        return
      }
      const admin = await this.$axios.get('/iam/is-admin/?user_id=' + store.state.user.user_id ).catch((err) =>  {
        return Promise.reject(err)
      })
      let listUserID = store.state.user.user_id
      if (admin.data.data.ok) {
        listUserID = ''
      }
      const res = await this.$axios.get('/project/list-project/?user_id=' + listUserID ).catch((err) =>  {
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
