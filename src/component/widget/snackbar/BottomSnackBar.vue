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
        text
        v-bind="attrs"
        @click="snackbar.show = false"
      >
        Close
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
    notifySuccess(text) {
      this.snackbar.color = 'success'
      this.snackbar.text = text
      this.snackbar.show = true
    },
    notifyError(text) {
      this.snackbar.color = 'error'
      this.snackbar.text = text
      this.snackbar.show = true
    },
  }
}
</script>
