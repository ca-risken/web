<template>
  <span>
    <v-icon :size="size" :color="color" @click="copy">mdi-content-copy </v-icon>
    <bottom-snack-bar ref="snackbar" />
  </span>
</template>

<script>
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
export default {
  name: 'ClipBoard',
  components: {
    BottomSnackBar,
  },
  props: {
    name: String,
    text: String,
    color: String,
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
    },
  },
}
</script>
<style scoped>
.inline-block {
  display: inline-block;
}
</style>
