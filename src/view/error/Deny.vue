<template>
  <div class="exception">
    <v-container fluid fill-height>
      <v-layout>
        <div class="text-md-center">
          <h1>403</h1>
          <h2 class="my-3 text-h5">
            {{
              $t(
                `error['Sorry, access denied or time out your session... Please retry after signin.']`
              )
            }}
          </h2>
          <div>
            <v-btn color="primary" @click="requestAuthorization">{{
              $t(`btn['REQUEST']`)
            }}</v-btn>
          </div>
        </div>
      </v-layout>
    </v-container>
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import mixin from '@/mixin'
import alert from '@/mixin/api/alert'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
export default {
  name: 'ErrorDeny',
  mixins: [mixin, alert],
  components: {
    BottomSnackBar,
  },
  methods: {
    requestAuthorization() {
      // const alerts = await this.testAlertNotification();
      this.$refs.snackbar.notifySuccess('request succeed')
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
