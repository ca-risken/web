<template>
  <vue-markdown-it :source="source" v-bind="$attrs" />
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
  },
}
</script>

<style scoped>
.markdown {
  ul,
  ol {
    padding-left: 20px;
    margin-top: -20px;
    margin-bottom: -20px;
  }

  li {
    margin-top: -5px;
    margin-bottom: -5px;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}
</style>
