const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const { reactive, watch, nextTick } = require('vue')
const {
  createRouter,
  createMemoryHistory,
  isNavigationFailure,
  NavigationFailureType,
} = require('vue-router')
const MODE = { PROJECT: 'project', ORGANIZATION: 'organization' }
const root = path.join(__dirname, '..')
const stripImports = (text) =>
  text
    .replace(/^import[\s\S]*?from [^\n]+\n/gm, '')
    .replace(/^import ['"][^\n]+\n/gm, '')
function component(file, globals) {
  const script = readFileSync(path.join(root, file), 'utf8').match(
    /<script>([\s\S]*?)<\/script>/
  )[1]
  const context = {
    component: null,
    AbortController,
    URLSearchParams,
    ...globals,
  }
  for (const item of script.matchAll(/^import (.+?) from /gm)) {
    for (const token of item[1].replace(/[{}]/g, '').split(',')) {
      const name = token.trim()
      if (!(name in context)) context[name] = {}
    }
  }
  vm.runInNewContext(
    stripImports(script).replace('export default', 'component ='),
    context
  )
  return context.component
}
function deferred() {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}
async function setup({
  mode = MODE.ORGANIZATION,
  asset = false,
  filters = {},
  screen = '/finding/finding',
  forbidden = false,
} = {}) {
  const state = reactive({
    mode,
    user: { user_id: 7 },
    project: { project_id: 1011 },
    organization: { organization_id: 1019 },
    interval: {},
  })
  const reloads = [],
    background = [],
    routeWrites = [],
    commits = []
  const store = {
    state,
    commit(name, value) {
      const keys = {
        updateMode: 'mode',
        updateProject: 'project',
        updateOrganization: 'organization',
        updateInterval: 'interval',
      }
      state[keys[name]] = value
      commits.push({ name, value })
    },
  }
  let router, block
  const source = stripImports(
    readFileSync(path.join(root, 'src/router/index.js'), 'utf8')
  ).replace('export default router', '')
  vm.runInNewContext(source, {
    MODE,
    store,
    clearInterval,
    isNavigationFailure,
    NavigationFailureType,
    NProgress: { start() {}, done() {} },
    commonRoute: [{ path: '/:pathMatch(.*)*', component: {} }],
    appRoute: [],
    createWebHistory: createMemoryHistory,
    createRouter(options) {
      router = createRouter(options)
      router.go = (value) => reloads.push(value)
      return router
    },
    axios: {
      async get(url) {
        if (url.startsWith('/iam/')) return { data: { data: { ok: true } } }
        const scope = url.startsWith('/organization/')
          ? 'organization'
          : 'project'
        const id = Number(
          new URL(url, 'http://test').searchParams.get(scope + '_id')
        )
        if (block && block.id === id) {
          block.entered.resolve()
          await block.release.promise
        }
        if (forbidden) throw { response: { status: 403 } }
        return { data: { data: { [scope]: [{ [scope + '_id']: id }] } } }
      },
    },
  })
  await router.push({
    path: screen,
    query: {
      [mode + '_id']: String(mode === MODE.PROJECT ? 1011 : 1019),
      from_score: '0.8',
      status: '1',
      ...(asset ? { asset_view: 'true' } : {}),
      ...filters,
    },
  })
  const finding = component('src/view/finding/Finding.vue', { store })
  const instance = {
    listSequence: 0,
    isInitializing: false,
    displayMode: asset ? 'asset' : 'finding',
    assetRevision: 0,
    searchModel: {
      findingID: '',
      alertID: '',
      dataSource: [],
      resourceName: [],
      tag: [],
      scoreFrom: 0.8,
      status: 1,
    },
    table: {
      selected: [],
      options: { page: 1, itemsPerPage: 20 },
      sort: { key: 'finding_id', direction: 'asc' },
    },
    getCurrentProjectID: () => state.project.project_id,
    getCurrentOrganizationID: () => state.organization.organization_id,
    getFindingStatus: () => 1,
    setStatusTab() {},
    clearList() {},
    listFindingForOrganization: async () => ({ findings: [], total: 0 }),
    listFinding: async () => ({ finding_id: [], total: 0 }),
  }
  Object.defineProperties(instance, {
    $route: { get: () => router.currentRoute.value },
    isOrganizationMode: { get: () => state.mode === MODE.ORGANIZATION },
  })
  instance.$router = {
    push(route) {
      routeWrites.push(route)
      const task = router.push(route)
      background.push(task)
      return task
    },
  }
  for (const name of [
    'parseQuery',
    'getSearchCondition',
    'refleshList',
    'loadList',
    'loadListForOrganization',
    'loadProjectList',
  ])
    instance[name] = finding.methods[name].bind(instance)
  instance.parseQuery()
  const stop =
    screen === '/finding/finding'
      ? watch(
          () => finding.computed.assetScope.call(instance),
          () => finding.watch.assetScope.call(instance)
        )
      : () => {}
  const toolbar = component('src/component/AppToolbar.vue', { store, MODE })
  const toolbarInstance = { $router: router, reload: () => router.go(0) }
  toolbarInstance.setProjectQueryParam =
    toolbar.methods.setProjectQueryParam.bind(toolbarInstance)
  return {
    router,
    state,
    reloads,
    routeWrites,
    commits,
    instance,
    stop,
    async select(scope, id) {
      const method =
        scope === MODE.PROJECT
          ? 'handleProjectSelected'
          : 'handleOrganizationSelected'
      await toolbar.methods[method].call(toolbarInstance, {
        [scope + '_id']: id,
      })
      await nextTick()
      await Promise.all(background)
      await nextTick()
    },
    blockLookup(id) {
      block = { id, entered: deferred(), release: deferred() }
      return block
    },
  }
}
for (const mode of [MODE.ORGANIZATION, MODE.PROJECT]) {
  for (const asset of [false, true]) {
    for (const filters of [
      {},
      { data_source: 'google:' },
      { data_source: '', tag: '', resource_name: '' },
    ]) {
      test(`${mode} switch ${asset ? 'asset' : 'finding'} ${JSON.stringify(
        filters
      )}`, async (t) => {
        const app = await setup({ mode, asset, filters })
        t.after(app.stop)
        const id = mode === MODE.PROJECT ? 1012 : 1002
        await app.select(mode, id)
        assert.equal(
          app.router.currentRoute.value.query[mode + '_id'],
          String(id)
        )
        assert.equal(app.state.mode, mode)
        assert.equal(app.state[mode][mode + '_id'], id)
        assert.equal(
          app.routeWrites.length,
          0,
          'old Finding must not rewrite the route while switching'
        )
        assert.deepEqual(app.reloads, [0], 'router owns the single refresh')
      })
    }
  }
  test(`${mode} denied selection does not overwrite current scope`, async (t) => {
    const app = await setup({ mode, forbidden: true })
    t.after(app.stop)
    const previous = app.state[mode][mode + '_id']
    await app.select(mode, mode === MODE.PROJECT ? 1012 : 1002)
    assert.equal(app.router.currentRoute.value.path, '/403')
    assert.equal(app.state[mode][mode + '_id'], previous)
    assert.deepEqual(app.reloads, [])
  })
  test(`${mode} slow older selection cannot overwrite newer selection`, async (t) => {
    const app = await setup({ mode })
    t.after(app.stop)
    const older = mode === MODE.PROJECT ? 1012 : 1002,
      newer = older + 1
    const block = app.blockLookup(older)
    const pending = app.select(mode, older)
    await block.entered.promise
    await app.select(mode, newer)
    block.release.resolve()
    await pending
    assert.equal(
      app.router.currentRoute.value.query[mode + '_id'],
      String(newer)
    )
    assert.equal(app.state[mode][mode + '_id'], newer)
    assert.deepEqual(app.reloads, [0])
  })
  test(`${mode} ordinary filter edits still update the current URL`, async (t) => {
    const app = await setup({ mode })
    t.after(app.stop)
    app.instance.searchModel.dataSource = ['google:']
    const query = app.instance.getSearchCondition()
    await nextTick()
    assert.equal(app.routeWrites.length, 1)
    assert.equal(String(app.routeWrites[0].query.data_source), 'google:')
    assert.ok(query.includes('data_source=google%3A'))
  })
}
for (const [initial, target] of [
  [MODE.PROJECT, MODE.ORGANIZATION],
  [MODE.ORGANIZATION, MODE.PROJECT],
]) {
  test(`${initial} to ${target} retains the selected scope`, async (t) => {
    const app = await setup({ mode: initial })
    t.after(app.stop)
    const id = target === MODE.PROJECT ? 1012 : 1002
    await app.select(target, id)
    assert.equal(app.state.mode, target)
    assert.equal(app.state[target][target + '_id'], id)
    assert.equal(
      app.router.currentRoute.value.query[target + '_id'],
      String(id)
    )
    assert.equal(app.routeWrites.length, 0)
    assert.deepEqual(app.reloads, [0])
  })
}
test('organization project invitation remains switchable', async (t) => {
  const app = await setup({ screen: '/organization/project' })
  t.after(app.stop)
  await app.select(MODE.ORGANIZATION, 1002)
  assert.equal(app.router.currentRoute.value.query.organization_id, '1002')
  assert.deepEqual(app.reloads, [0])
})
