<template>
  <div class="exception">
    <v-container fluid fill-height>
      <div class="text-md-center">
        <h1>403</h1>
        <h2 class="my-3 text-h5" style="white-space: pre-line">
          {{
            $t(
              `error['Session expired. Please return to the HOME screen and try accessing again. If this is your first time accessing the project, please REQUEST PROJECT ROLE with the administrator.']`
            )
          }}
        </h2>
      </div>
      <div class="text-md-center">
        <div>
          <v-btn class="mt-3" color="primary" @click="goHome">{{
            $t(`btn['HOME']`)
          }}</v-btn>
        </div>
        <div>
          <v-btn
            class="mt-3"
            color="blue-darken-1"
            @click="requestProjectRole"
            :loading="loading"
            >{{ $t(`btn['REQUEST PROJECT ROLE']`) }}</v-btn
          >
        </div>
        <v-spacer />
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
      let project_id = undefined
      if (this.$route.query.project_id) {
        project_id = Number(this.$route.query.project_id)
      } else if (this.$store.state.project.project_id) {
        project_id = this.$store.state.project.project_id
      }
      if (!project_id) {
        this.finishError(
          this.$t(
            `error['Project not selected. Click [P] on the menu bar on the screen and select a project.']`
          )
        )
        return
      }
      await this.requestProjectRoleAlertNotification(
        store.state.user.user_id,
        project_id
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
