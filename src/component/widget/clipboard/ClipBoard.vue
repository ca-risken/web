<template>
  <div class="inline-block">
    <v-icon  class="mx-2" @click="copy" :size="size">mdi-content-copy</v-icon>
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  components: {
    BottomSnackBar,
  },
  props: {
    name: String,
    text:  String,
    size: {
      type: String,
      default: 'lerge',
    },
  },
  methods: {
    async copy() {
      navigator.clipboard.writeText(this.text).catch((err) => {
        this.$refs.snackbar.notifyError(err)
        return Promise.reject(err)
      })
      this.$refs.snackbar.notifyInfo('Copied! ' + this.name)
    }
  }
}
</script>
<style scoped>
.inline-block {
  display: inline-block;
}
</style>
