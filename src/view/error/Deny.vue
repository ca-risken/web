<template>
  <div class="exception">
    <v-container fluid fill-height>
      <div class="text-md-center">
        <h1>403</h1>
        <h2 class="my-3 text-h5">
          {{
            $t(
              `error['Sorry, access denied or time out your session... Please request access rights to the administrator if necessary.']`
            )
          }}
        </h2>
      </div>
      <div class="text-md-center">
        <v-btn
          class="mt-3 mr-4"
          color="blue-darken-1"
          @click="requestProjectRole"
          :loading="loading"
          >{{ $t(`btn['REQUEST PROJECT ROLE']`) }}</v-btn
        >
        <v-btn class="mt-3 mr-4" color="primary" @click="goHome">{{
          $t(`btn['HOME']`)
        }}</v-btn>
      </div>
    </v-container>
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import store from '@/store'
import alert from '@/mixin/api/alert'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
export default {
  name: 'ErrorDeny',
  mixins: [mixin, alert],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    requestProjectRole() {
      this.loading = true
      this.submitRequest()
    },

    async submitRequest() {
      await this.requestProjectRoleAlertNotification(
        store.state.user.user_id
      ).catch((err) => {
        this.finishError(err.response.data)
        return Promise.reject(err)
      })
      this.finishSuccess('Success: Request Project Role.')
    },

    async finishSuccess(msg) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      this.$refs.snackbar.notifySuccess(msg)
      this.loading = false
    },

    async finishError(msg) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      this.$refs.snackbar.notifyError(msg)
      this.loading = false
    },

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
