<template>
  <v-container class="page-signin" fill-height>
    <v-row>
      <v-col>
        <v-card class="pa-3 page-signin__card" tile>
          <v-card-title>
            <img src="/static/m.png" alt="RISKEN" width="55" />
            <h1 class="primary--text display-1">RISKEN</h1>
          </v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-btn large tile color="primary" @click="signin" :loading="loading">
              Signin
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'PageSignin',
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    prefix() {
      return ''
    }
  },
  methods: {
    signin() {
      this.loading = true
      setTimeout(() => {
        this.$router.push('/')
      }, 1000)
    }
  },
  }
</script>

<style lang="sass" scoped>
.page-signin__card
  max-width: 600px
  margin: 0 auto
</style>
