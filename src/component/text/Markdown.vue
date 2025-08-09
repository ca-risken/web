<template>
  <v-sheet
    :color="cardColor || 'transparent'"
    :elevation="cardElevation ? 1 : 0"
    :max-width="maxWidth"
    :class="compact ? 'pa-0' : 'pa-8'"
    rounded
  >
    <vue-markdown-it
      :source="source"
      :plugins="markdownPlugins"
      v-bind="$attrs"
    />
  </v-sheet>
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
    cardColor: {
      type: String,
      default: '',
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
          console.warn('Mermaid rendering failed:', error.message)
          element.innerHTML = `<pre style="text-align: left;">${element.textContent}</pre>`
          element.setAttribute('data-processed', 'true')
        }
      }
    },
  },
}
</script>

<style scoped>
:deep(h1) {
  font-size: 2rem;
  font-weight: 500;
  line-height: 1.3;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
  word-wrap: break-word;
  overflow-wrap: break-word;
}

:deep(h2) {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.3;
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
  word-wrap: break-word;
  overflow-wrap: break-word;
}

:deep(h3) {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.3;
  margin: 1.25rem 0 0.75rem 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

:deep(p) {
  margin: 0 0 1rem 0;
}

:deep(ul),
:deep(ol) {
  margin: 0 0 1rem 0;
  padding-left: 2rem;
}

:deep(li) {
  margin: 0.25rem 0;
}

:deep(code) {
  background: rgb(var(--v-theme-surface-variant));
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: 'Roboto Mono', monospace;
}

:deep(pre) {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

:deep(pre code) {
  background: transparent;
  padding: 0;
}

:deep(blockquote) {
  border-left: 4px solid rgb(var(--v-theme-primary));
  margin: 1rem 0;
  padding: 0 1rem;
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 0 4px 4px 0;
}

:deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

:deep(th),
:deep(td) {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  padding: 0.5rem 0.75rem;
  text-align: left;
}

:deep(th) {
  background: rgb(var(--v-theme-surface-variant));
  font-weight: 500;
}

:deep(.mermaid) {
  margin: 1rem 0;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
}

:deep(.mermaid:has(svg)) {
  text-align: center;
}

:deep(.mermaid svg) {
  max-width: 100%;
  height: auto;
}

/* Compact mode */
.pa-0 :deep(h1) {
  font-size: 1.375rem;
  line-height: 1.3;
  margin: 0 0 0.375rem 0;
  padding-bottom: 0.25rem;
}

.pa-0 :deep(h2) {
  font-size: 1.125rem;
  line-height: 1.3;
  margin: 0.5rem 0 0.375rem 0;
  padding-bottom: 0.125rem;
}

.pa-0 :deep(h3) {
  font-size: 1rem;
  line-height: 1.3;
  margin: 0.375rem 0 0.25rem 0;
}

.pa-0 :deep(p) {
  margin: 0 0 0.375rem 0;
}

.pa-0 :deep(ul),
.pa-0 :deep(ol) {
  margin: 0 0 0.375rem 0;
  padding-left: 1.25rem;
}

.pa-0 :deep(li) {
  margin: 0;
}

.pa-0 :deep(pre) {
  padding: 0.375rem;
  margin: 0.375rem 0;
  font-size: 0.8125rem;
}

.pa-0 :deep(code) {
  font-size: 0.8125rem;
  padding: 0.0625rem 0.25rem;
}

.pa-0 :deep(blockquote) {
  margin: 0.375rem 0;
  padding: 0.25rem 0.5rem;
}

.pa-0 :deep(table) {
  margin: 0.375rem 0;
}

.pa-0 :deep(th),
.pa-0 :deep(td) {
  padding: 0.25rem 0.375rem;
  font-size: 0.875rem;
}

.pa-0 :deep(.mermaid) {
  margin: 0.375rem 0;
  padding: 0.375rem;
}

:deep(> *:first-child) {
  margin-top: 0;
}

.pa-0 :deep(> *:last-child) {
  margin-bottom: 0;
}
</style>
