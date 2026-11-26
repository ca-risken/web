const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { test } = require('node:test')

function load(relative, sfc = false) {
  let source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')
  if (sfc) source = source.match(/<script>([\s\S]*?)<\/script>/)[1]
  const context = { component: null }
  for (const match of source.matchAll(/^import (\w+) from /gm)) {
    context[match[1]] = match[1] === 'axios' ? { create: () => ({}) } : {}
  }
  vm.runInNewContext(
    source.replace(/^import .*$/gm, '').replace(/export default/, 'component ='),
    context
  )
  return context.component
}
const dashboard = load('src/view/Dashboard.vue', true)
const finding = load('src/mixin/api/finding.js')

for (const [name, org, projectID, expected] of [
  ['Org with stale Project', true, 1, false],
  ['Org without Project', true, undefined, false],
  ['Project without selection', false, undefined, false],
  ['selected Project', false, 1, true],
]) {
  test(name, async () => {
    const calls = []
    await dashboard.mounted.call({
      isOrganizationMode: org,
      $store: { state: { project: { project_id: projectID } } },
      setRawData: async () => calls.push('data'),
      setStatus: () => calls.push('status'),
      setCategory: () => calls.push('category'),
    })
    assert.deepEqual(calls, expected ? ['data', 'status', 'category'] : [])
  })
}

for (const total of [undefined, 0, 345]) {
  test(`count API returns ${total || 0} without fetching a list`, async () => {
    const urls = []
    const state = {
      getCurrentProjectID: () => 1,
      $axios: { get: async (url) => {
        urls.push(url)
        return { data: { data: total === undefined ? {} : { total } } }
      } },
      getFindingCountAPI: finding.methods.getFindingCountAPI,
    }
    const got = await dashboard.methods.getFindingCount.call(state, 0.8, 'aws:')
    assert.equal(got, total || 0)
    assert.deepEqual(urls, ['/finding/get-finding-count/?project_id=1&from_score=0.8&data_source=aws:&status=1'])
  })
}
