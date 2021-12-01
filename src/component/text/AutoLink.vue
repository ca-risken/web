<script>
export default {
  name: 'AutoLink',
  props: {
    text: {
      type: String,
      default: null,
    },
  },
  render: function (createElement) {
    var a = this.text.split(/(https?:\/\/([\w!?/+-_~=;.,*&@#$%()']|\[\])+)/i)
    var vnodes = a.map(function (x, i) {
      if (i % 2) {
        return createElement(
          'a',
          { attrs: { href: x, target: '_blank', rel: 'noopener' } },
          x
        )
      } else if (!x) {
        return this._v('')
      } else {
        return this._v(x)
      }
    }, this)
    return createElement('span', { attrs: { class: 'auto-link' } }, vnodes)
  },
}
</script>

<style scoped>
.auto-link {
  white-space: pre-line;
}
</style>
