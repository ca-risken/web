<template>
  <v-app class="exception">
    <v-container fluid fill-height>
      <v-layout>
        <v-main>
          <div class="text-md-center">
            <h1>404</h1>
            <h2 class="my-3 text-h5">
              {{ $t(`error['Sorry, page not found']`) }}
            </h2>
            <div>
              <v-btn color="primary" @click="goHome">{{
                $t(`btn['HOME']`)
              }}</v-btn>
            </div>
          </div>
        </v-main>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'ErrorNotFound',
  methods: {
    goHome() {
      this.$router.push({ path: '/' })
    },
  },
}
</script>
<style lang="sass" scoped>
h1
  font-size: 150px
  line-height: 150px
  font-weight: 700
  color: #252932
  text-shadow: rgba(61, 61, 61, 0.3) 1px 1px, rgba(61, 61, 61, 0.2) 2px 2px, rgba(61, 61, 61, 0.3) 3px 3px
</style>
