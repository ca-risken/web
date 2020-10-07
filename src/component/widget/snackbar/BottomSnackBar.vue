<template>
  <v-snackbar
    v-model="snackbar.show"
    :bottom="true"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
  >
    {{ snackbar.text }}
    <template v-slot:action="{ attrs }">
      <v-btn
        dark
        icon
        v-bind="attrs"
        @click="snackbar.show = false"
      >
        <v-icon>close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  data() {
    return {
      snackbar: {
        show: false,
        color: '',
        timeout: 3000,
        text: '',
      },
    }
  },
  methods: {
    notifyInfo(text) {
      this.snackbar.color = 'info'
      this.snackbar.text = text
      this.snackbar.timeout = 1000
      this.snackbar.show = true
    },
    notifySuccess(text) {
      this.snackbar.color = 'success'
      this.snackbar.text = text
      this.snackbar.timeout = 2000
      this.snackbar.show = true
    },
    notifyError(text) {
      this.snackbar.color = 'error'
      this.snackbar.text = text
      this.snackbar.timeout = 5000
      this.snackbar.show = true
    },
  },
}
</script>
