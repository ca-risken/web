<template>
  <div>
    <!-- Open/Close -->
    <v-btn
      icon
      color="cyan-darken-1"
      class="chat-fab"
      elevation="8"
      @click="showChat = true"
      v-if="!showChat"
    >
      <v-icon>mdi-message-text</v-icon>
    </v-btn>

    <!-- Chat Window -->
    <v-sheet
      v-if="showChat"
      id="ai-chat-window"
      class="chat-window pa-0 ma-2"
      elevation="16"
      rounded="lg"
      width="460"
      max-width="95vw"
      max-height="70vh"
      @mousedown.stop
      @click.stop
    >
      <v-card flat>
        <v-card-title class="px-2 d-flex align-center" style="min-height: 40px">
          <v-icon size="small" color="grey-lighten-1" class="mx-2"
            >mdi-message-text</v-icon
          >
          <span class="text-subtitle-1 font-weight-bold">{{
            $t('view.ai["Chat Title"]')
          }}</span>
          <v-spacer />
          <v-btn
            icon
            variant="tonal"
            v-show="!minimized"
            @click="minimized = true"
            size="x-small"
            class="mx-1"
          >
            <v-icon color="grey-darken-1">mdi-window-minimize</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="tonal"
            v-show="minimized"
            @click="minimized = false"
            size="x-small"
            class="mx-1"
          >
            <v-icon color="grey-darken-1">mdi-window-restore</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="tonal"
            @click="showChat = false"
            class="mx-1"
            size="x-small"
          >
            <v-icon color="grey-darken-1">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text v-show="!minimized" class="pa-3">
          <v-container class="pa-0">
            <v-row class="chat-messages-container mt-1 mb-1">
              <v-col cols="12" class="pa-0">
                <v-list lines="three" class="chat-messages-list">
                  <v-list-item
                    v-for="(msg, index) in messages"
                    v-show="!msg.hidden"
                    density
                    :key="index"
                    :class="[
                      'px-2',
                      'pb-0',
                      'my-4',
                      'chat-message',
                      msg.role === this.RoleUser
                        ? 'user-message'
                        : 'ai-message',
                    ]"
                  >
                    <v-list-item-title
                      :class="[
                        'font-weight-bold',
                        msg.role === this.RoleUser ? 'text-right' : 'text-left',
                        'pb-2',
                        'mx-2',
                      ]"
                    >
                      <v-icon
                        v-if="msg.role === this.RoleAI"
                        size="small"
                        color="grey-darken-1"
                        >mdi-robot-outline</v-icon
                      >
                      {{ msg.role === this.RoleUser ? 'You' : 'AI' }}
                      <v-icon
                        v-if="msg.role === this.RoleUser"
                        size="small"
                        color="grey-darken-1"
                        >mdi-emoticon-outline</v-icon
                      >
                    </v-list-item-title>
                    <MarkdownDisplay
                      breaks
                      linkify
                      class="mx-2"
                      :source="msg.content"
                    />
                  </v-list-item>
                </v-list>
                <div v-if="loading" class="loading-placeholder">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </div>
              </v-col>
            </v-row>
            <v-row no-gutters align="center">
              <v-col>
                <v-textarea
                  v-model="userInput"
                  :loading="loading"
                  :label="$t(`view.ai['Type your message...']`)"
                  variant="solo"
                  rows="1"
                  auto-grow
                  clearable
                  dense
                  hide-details
                  :disabled="loading"
                  @keydown.enter.exact="handleEnter"
                  class="ma-0 pa-0"
                ></v-textarea>
              </v-col>
              <v-col cols="auto" class="d-flex align-center ma-0 pa-0">
                <v-btn
                  icon
                  color="cyan-darken-1"
                  @click="sendMessage(userInput)"
                  :loading="loading"
                  :disabled="!userInput.trim() || loading"
                  variant="tonal"
                  class="ml-2 mb-4"
                >
                  <v-icon color="cyan-darken-2">mdi-send</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-sheet>
  </div>
</template>

<script>
import ai from '@/mixin/api/ai'
import MarkdownDisplay from '@/component/text/Markdown.vue'

export default {
  name: 'AI',
  mixins: [ai],
  components: {
    MarkdownDisplay,
  },
  data() {
    return {
      showChat: false,
      userInput: '',
      messages: [],
      loading: false,
      initialContext: '',
      minimized: false,
    }
  },
  methods: {
    open(context) {
      if (context) {
        this.initialContext = context
      }
      this.showChat = true
    },
    close() {
      this.showChat = false
      this.messages = []
      this.userInput = ''
    },
    handleEnter(event) {
      if (event.isComposing) {
        return // IME exchange
      }
      if (event.shiftKey) {
        return
      }
      event.preventDefault()
      this.sendMessage(this.userInput)
      this.userInput = ''
    },
    async sendMessage(userMessageText) {
      if (!userMessageText || !userMessageText.trim() || this.loading) return
      this.loading = true
      try {
        // Shallow copy
        const historyForAPI = [...this.messages]
        this.messages.push({
          role: this.RoleUser,
          content: userMessageText,
        })
        const answer = await this.chatAI(userMessageText, historyForAPI)
        this.messages.push({
          role: this.RoleAI,
          content: answer,
        })
      } catch (error) {
        console.error(error)
        this.messages.push({
          role: this.RoleAI,
          content: 'An error occurred. Please try again.',
        })
      } finally {
        this.loading = false
        this.userInput = ''
      }
    },
    initializeChat() {
      this.messages = []
      if (this.initialContext) {
        this.messages.push({
          role: this.RoleAI,
          content: this.initialContext,
          hidden: true,
        })
      }
      this.messages.push({
        role: this.RoleAI,
        content: this.$t('view.ai["Chat Greeting"]'),
      })
    },
  },
  watch: {
    showChat(newVal) {
      if (newVal) {
        this.initializeChat()
      }
    },
    initialContext(newContext, oldContext) {
      if (this.showChat && newContext && newContext !== oldContext) {
        this.initializeChat()
      }
    },
  },
}
</script>

<style scoped>
.chat-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 99999;
}

.chat-window {
  position: fixed;
  right: 8px;
  bottom: 8px;
  z-index: 99999;
}

.chat-messages-container {
  min-height: 180px;
  max-height: 40vh;
  overflow-y: scroll;
}

.chat-messages-list {
  padding: 8px;
}

.chat-message {
  padding: 6px 6px;
  margin-bottom: 8px;
  border-radius: 12px;
  word-wrap: break-word;
  white-space: pre-wrap;
  max-width: 90%;
  min-width: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-message {
  background-color: #f7f7f7;
  text-align: left;
  max-width: 60%;
  margin-left: auto;
}

.ai-message {
  background-color: #dddcdc;
  border: 1px solid #e0e0e0;
  margin-right: auto;
}

.v-textarea textarea {
  line-height: 1.5;
}

.v-btn--icon.v-btn--density-default {
  width: calc(var(--v-btn-height) + 0px);
  height: calc(var(--v-btn-height) + 0px);
}

.loading-placeholder {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
