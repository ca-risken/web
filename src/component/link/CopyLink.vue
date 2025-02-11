<template>
  <div>
    <v-btn
      variant="text"
      class="mx-1 px-2"
      style="min-width: 0"
      @click="copyToClipboard"
    >
      <v-icon class="mx-0" color="grey-darken-2">mdi-link-variant</v-icon>
      <v-tooltip activator="parent" location="bottom"> Copy Link </v-tooltip>
    </v-btn>
    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'

export default {
  name: 'CopyLink',
  components: {
    BottomSnackBar,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  methods: {
    copyToClipboard() {
      navigator.clipboard.writeText(this.url)
      this.$refs.snackbar.notifyInfo('Copied! URL link')
    },
  },
}
</script>
