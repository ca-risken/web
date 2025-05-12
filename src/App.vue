<template>
  <v-app :dark="true">
    <router-view></router-view>
    <!-- setting drawer -->
    <v-navigation-drawer
      class="setting-drawer"
      temporary
      right
      v-model="rightDrawer"
      hide-overlay
      fixed
    >
    </v-navigation-drawer>
    <!-- global snackbar -->
    <v-snackbar
      :timeout="3000"
      bottom
      right
      :color="snackbar.color"
      v-model="snackbar.show"
    >
      {{ snackbar.text }}
      <v-btn dark text @click="snackbar.show = false" icon>
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
    <AIChat ref="aiChatRef" />
  </v-app>
</template>

<script>
import AIChat from '@/component/widget/chat/AI.vue'
export default {
  components: { AIChat },
  data() {
    return {
      rightDrawer: false,
      snackbar: {
        show: false,
        text: '',
        color: '',
      },
      showChat: false,
      initialContext: '',
    }
  },
  mounted() {},
  created() {},
  methods: {
    open(context) {
      if (context) {
        this.initialContext = context
      }
      this.showChat = true
    },
  },
}
</script>

<style lang="sass" scoped>
.setting-fab
  top: 50% !important
  right: 0
  border-radius: 0
</style>
