<template>
  <v-dialog v-model="internalDialog" max-width="60%">
    <v-card>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-list-item prepend-icon="mdi-chat">
              <v-list-item-title class="text-h5">{{
                $t(`view.ai['Chat Title']`)
              }}</v-list-item-title>
            </v-list-item>
          </v-col>
        </v-row>

        <!-- Chat Messages Container -->
        <v-row class="chat-messages-container mt-3 mb-3">
          <v-col cols="12">
            <v-list lines="three" class="chat-messages-list">
              <v-list-item
                v-for="(msg, index) in messages"
                v-show="!msg.hidden"
                :key="index"
                :prepend-icon="msg.role === this.RoleAI && 'mdi-robot-outline'"
                :append-icon="
                  msg.role === this.RoleUser && 'mdi-emoticon-outline'
                "
                :class="[
                  'my-4',
                  'chat-message',
                  msg.role === this.RoleUser ? 'user-message' : 'ai-message',
                ]"
              >
                <v-list-item-title class="font-weight-bold">{{
                  msg.role === this.RoleUser ? 'You' : 'AI'
                }}</v-list-item-title>
                <MarkdownDisplay breaks linkify :source="msg.content" />
              </v-list-item>
            </v-list>
            <div v-if="loading" class="text-center pa-2">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>
          </v-col>
        </v-row>

        <!-- Message Input Area -->
        <v-row>
          <v-col cols="10" sm="11">
            <v-textarea
              v-model="userInput"
              :loading="loading"
              :label="$t(`view.ai['Type your message...']`)"
              variant="solo"
              rows="1"
              auto-grow
              clearable
              @keydown.enter.exact="handleEnter"
            ></v-textarea>
          </v-col>
          <v-col cols="2" sm="1" class="d-flex align-center">
            <v-btn
              icon
              color="cyan-darken-1"
              @click="sendMessage(userInput)"
              :loading="loading"
              :disabled="!userInput.trim() || loading"
            >
              <v-icon color="cyan-lighten-4">mdi-send</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
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
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    initialContext: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      userInput: '',
      messages: [],
      loading: false,
    }
  },
  computed: {
    internalDialog: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      },
    },
  },
  methods: {
    close() {
      this.internalDialog = false
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
    modelValue(newVal, oldVal) {
      if (newVal && !oldVal) {
        if (this.initialContext) {
          this.initializeChat()
        }
      }
    },
    initialContext(newContext, oldContext) {
      if (this.modelValue && newContext && newContext !== oldContext) {
        this.initializeChat()
      }
    },
  },
}
</script>

<style scoped>
.chat-messages-container {
  max-height: 80%;
  overflow-y: auto;
}

.chat-messages-list {
  padding: 8px;
}

.chat-message {
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  word-wrap: break-word;
  white-space: pre-wrap;
  max-width: 80%;
  min-width: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-message {
  background-color: #f7f7f7;
  margin: auto;
  text-align: right;
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
</style>
