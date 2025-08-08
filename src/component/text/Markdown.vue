<template>
  <v-sheet
    v-if="card"
    :class="['pa-8', 'rounded-lg', cardElevation ? 'elevation-1' : '']"
    :color="cardColor"
    :style="{ maxWidth: maxWidth, width: '100%' }"
  >
    <div
      :class="[
        'markdown-display',
        'text-body-1',
        { 'markdown-compact': compact },
      ]"
    >
      <vue-markdown-it
        :source="source"
        :plugins="markdownPlugins"
        v-bind="$attrs"
      />
    </div>
  </v-sheet>
  <div
    v-else
    :class="[
      'markdown-display',
      'text-body-1',
      { 'markdown-compact': compact },
    ]"
  >
    <vue-markdown-it
      :source="source"
      :plugins="markdownPlugins"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import VueMarkdownIt from 'vue3-markdown-it'

export default {
  name: 'MarkdownDisplay',
  components: {
    VueMarkdownIt,
  },
  props: {
    source: {
      type: String,
      default: '',
    },
    compact: {
      type: Boolean,
      default: false,
    },
    card: {
      type: Boolean,
      default: false,
    },
    cardColor: {
      type: String,
      default: 'white',
    },
    cardElevation: {
      type: Boolean,
      default: true,
    },
    maxWidth: {
      type: String,
      default: '800px',
    },
  },
  data() {
    return {
      markdownPlugins: [],
    }
  },
  mounted() {
    this.loadMermaid()
  },
  updated() {
    this.processMermaidBlocks()
  },
  methods: {
    async loadMermaid() {
      if (!window.mermaid) {
        const script = document.createElement('script')
        script.src =
          'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js'
        script.onload = () => {
          this.initMermaid()
          this.processMermaidBlocks()
        }
        document.head.appendChild(script)
      } else {
        this.initMermaid()
        this.processMermaidBlocks()
      }
    },

    initMermaid() {
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        })
      }
    },

    processMermaidBlocks() {
      // マークダウンレンダリング後にmermaidブロックを処理
      setTimeout(() => {
        const codeBlocks = this.$el.querySelectorAll(
          'pre code.language-mermaid'
        )
        codeBlocks.forEach((block, index) => {
          const mermaidDiv = document.createElement('div')
          mermaidDiv.className = 'mermaid'
          mermaidDiv.id = `mermaid-${index}-${Date.now()}`
          mermaidDiv.textContent = block.textContent
          block.parentElement.replaceWith(mermaidDiv)
        })
        this.renderMermaid()
      }, 100)
    },

    async renderMermaid() {
      if (!window.mermaid) return

      await this.$nextTick()

      const mermaidElements = this.$el.querySelectorAll(
        '.mermaid:not([data-processed])'
      )

      for (let i = 0; i < mermaidElements.length; i++) {
        const element = mermaidElements[i]

        try {
          const graphDefinition = element.textContent.trim()
          const uniqueId = `mermaid-${Date.now()}-${i}`

          const { svg } = await window.mermaid.render(uniqueId, graphDefinition)
          element.innerHTML = svg
          element.setAttribute('data-processed', 'true')
        } catch (error) {
          // エラー時は元のコードをフォールバック表示
          console.warn('Mermaid rendering failed:', error.message)
          element.innerHTML = `<pre class="mermaid-fallback">${element.textContent}</pre>`
          element.setAttribute('data-processed', 'true')
        }
      }
    },
  },
}
</script>

<style scoped>
/* VuetifyのUIクラスとテーマカラーを活用したMarkdownスタイル */
.markdown-display {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: rgb(var(--v-theme-on-surface));
}

/* 見出し */
.markdown-display :deep(h1) {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface));
}

.markdown-display :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
  color: rgb(var(--v-theme-on-surface));
}

.markdown-display :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.25rem 0 0.75rem 0;
  color: rgb(var(--v-theme-on-surface));
}

/* 段落とリスト */
.markdown-display :deep(p) {
  margin: 0 0 1rem 0;
  color: rgb(var(--v-theme-on-surface));
}

.markdown-display :deep(ul),
.markdown-display :deep(ol) {
  margin: 0 0 1rem 0;
  padding-left: 2rem;
}

.markdown-display :deep(li) {
  margin: 0.25rem 0;
}

/* コードブロック */
.markdown-display :deep(code) {
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas,
    monospace;
}

.markdown-display :deep(pre) {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
  font-size: 0.875rem;
}

.markdown-display :deep(pre code) {
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  padding: 0;
}

/* 引用 */
.markdown-display :deep(blockquote) {
  border-left: 4px solid rgb(var(--v-theme-primary));
  margin: 1rem 0;
  padding: 0 1rem;
  color: rgb(var(--v-theme-on-surface-variant));
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 0 4px 4px 0;
}

/* テーブル */
.markdown-display :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 4px;
  overflow: hidden;
}

.markdown-display :deep(th),
.markdown-display :deep(td) {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.markdown-display :deep(th) {
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 600;
}

/* Mermaid図表 */
.markdown-display :deep(.mermaid) {
  text-align: center;
  margin: 1rem 0;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
}

.markdown-display :deep(.mermaid svg) {
  max-width: 100%;
  height: auto;
}

.markdown-display :deep(.mermaid-fallback) {
  background: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 6px;
  padding: 0.75rem;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  white-space: pre-wrap;
  margin: 1rem 0;
  text-align: left;
}

/* コンパクトモード - AIPanelなどで使用 */
.markdown-compact :deep(h1) {
  font-size: 1.375rem;
  margin: 0 0 0.375rem 0;
  padding-bottom: 0.25rem;
}

.markdown-compact :deep(h2) {
  font-size: 1.125rem;
  margin: 0.5rem 0 0.375rem 0;
  padding-bottom: 0.125rem;
}

.markdown-compact :deep(h3) {
  font-size: 1rem;
  margin: 0.375rem 0 0.25rem 0;
}

.markdown-compact :deep(p) {
  margin: 0 0 0.375rem 0;
}

.markdown-compact :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-compact :deep(ul),
.markdown-compact :deep(ol) {
  margin: 0 0 0.375rem 0;
  padding-left: 1.25rem;
}

.markdown-compact :deep(ul:last-child),
.markdown-compact :deep(ol:last-child) {
  margin-bottom: 0;
}

.markdown-compact :deep(li) {
  margin: 0 0;
  line-height: 1.4;
}

.markdown-compact :deep(pre) {
  padding: 0.375rem;
  margin: 0.375rem 0;
  font-size: 0.8125rem;
}

.markdown-compact :deep(code) {
  font-size: 0.8125rem;
  padding: 0.0625rem 0.25rem;
}

.markdown-compact :deep(blockquote) {
  margin: 0.375rem 0;
  padding: 0.25rem 0.5rem;
}

.markdown-compact :deep(table) {
  margin: 0.375rem 0;
}

.markdown-compact :deep(th),
.markdown-compact :deep(td) {
  padding: 0.25rem 0.375rem;
  font-size: 0.875rem;
}

.markdown-compact :deep(.mermaid) {
  margin: 0.375rem 0;
  padding: 0.375rem;
}

.markdown-compact :deep(.mermaid-fallback) {
  margin: 0.375rem 0;
  padding: 0.25rem;
  font-size: 0.8125rem;
  text-align: left;
}
.markdown-compact :deep(> *:first-child) {
  margin-top: 0;
}
</style>
