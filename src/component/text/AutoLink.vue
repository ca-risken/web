<script>
import { h } from 'vue'
export default {
  name: 'AutoLink',
  props: {
    text: {
      type: String,
      default: null,
    },
  },
  render: function () {
    let a = this.text.split(/(https?:\/\/[\w!?/+-_~=;.,*&@#$%()']+)/g)
    let vnodes = a.map(function (x, i) {
      if (i % 2) {
        return h('a', { href: x }, x)
      } else {
        return x
      }
    }, this)
    return h('span', vnodes)
  },
}
</script>

<style scoped>
.auto-link {
  white-space: pre-line;
  line-height: 1.5;
}
</style>
