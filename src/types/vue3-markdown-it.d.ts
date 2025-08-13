declare module 'vue3-markdown-it' {
  import { Component } from 'vue'

  interface VueMarkdownItProps {
    source: string
    plugins?: any[]
    [key: string]: any
  }

  const VueMarkdownIt: Component<VueMarkdownItProps>
  export default VueMarkdownIt
}
