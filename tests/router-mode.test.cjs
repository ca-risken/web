const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { test } = require('node:test')
const vm = require('node:vm')

const MODE = { PROJECT: 'project', ORGANIZATION: 'organization' }
const source = readFileSync('src/router/index.js', 'utf8')
  .replace(/^import .*\n/gm, '')
  .replace('export default router', '')

function setup({ mode = MODE.PROJECT, authenticated = true, result, error } = {}) {
  const state = {
    mode,
    user: authenticated ? { user_id: 7 } : {},
    project: { project_id: 1 },
    organization: { organization_id: 2 },
    interval: {},
  }
  const calls = []
  const commits = []
  const reloads = []
  const router = {
    beforeEach(fn) { this.guard = fn },
    afterEach(fn) { this.after = fn },
    go(value) { reloads.push(value) },
  }
  vm.runInNewContext(source, {
    MODE, commonRoute: [], appRoute: [], createRouter: () => router,
    createWebHistory: () => ({}), NProgress: { start() {}, done() {} },
    clearInterval,
    store: {
      state,
      commit(name, value) {
        commits.push(name)
        const keys = { updateMode: 'mode', updateProject: 'project', updateOrganization: 'organization', updateInterval: 'interval' }
        state[keys[name]] = value
      },
    },
    axios: {
      async get(url) {
        calls.push(url)
        if (error) throw error
        if (url.startsWith('/iam/')) return { data: { data: { ok: false } } }
        const scope = url.startsWith('/organization/') ? 'organization' : 'project'
        const id = Number(new URL(url, 'http://test').searchParams.get(scope + '_id'))
        return { data: { data: { [scope]: result === undefined ? [{ [scope + '_id']: id }] : result } } }
      },
    },
  })
  async function navigate(query, { path = '/analysis/finding', mounted = false } = {}) {
    let to = { path, query, hash: '', matched: [{}] }
    const from = { path: mounted ? path : '/', matched: mounted ? [{}] : [] }
    for (let i = 0; i < 5; i++) {
      const outcomes = []
      await router.guard(to, from, value => outcomes.push(value))
      assert.equal(outcomes.length, 1, 'guard must settle once')
      const outcome = outcomes[0]
      if (outcome === undefined) {
        router.after(to, from)
        return JSON.parse(JSON.stringify(to))
      }
      if (typeof outcome === 'string' || outcome.path !== to.path) return JSON.parse(JSON.stringify(outcome))
      to = { ...to, ...outcome, query: Object.fromEntries(Object.entries(outcome.query).map(([key, value]) => [key, String(value)])) }
    }
    assert.fail('navigation redirect loop')
  }
  return { state, calls, commits, reloads, navigate, router }
}

for (const [scope, other, id] of [['project', 'organization', 1], ['organization', 'project', 2]]) {
  for (const targetId of [id, id + 10]) {
    test(`${other} to ${scope}, target ${targetId}`, async () => {
      const app = setup({ mode: other })
      const route = await app.navigate({ [scope + '_id']: String(targetId), filter: 'keep' })
      assert.equal(app.state.mode, scope)
      assert.equal(app.state[scope][scope + '_id'], targetId)
      assert.equal(route.query.filter, 'keep')
      assert.ok(app.calls[1].includes(`/${scope}/list-${scope}/?${scope}_id=${targetId}&user_id=7`))
      assert.deepEqual(app.reloads, [])
    })
  }
  test(`mounted ${scope} same-ID mode change refreshes once`, async () => {
    const app = setup({ mode: other })
    await app.navigate({ [scope + '_id']: String(id) }, { mounted: true })
    assert.deepEqual(app.reloads, [0])
    await app.navigate({ [scope + '_id']: String(id) }, { mounted: true })
    assert.deepEqual(app.reloads, [0])
  })
  test(`${scope} no-ID fallback writes shareable query`, async () => {
    const app = setup({ mode: scope })
    const route = await app.navigate({ filter: 'keep' })
    assert.equal(route.query[scope + '_id'], String(id))
    assert.equal(route.query.filter, 'keep')
  })
  test(`${scope} unauthenticated link preserves query`, async () => {
    const app = setup({ authenticated: false })
    const query = { [scope + '_id']: String(id) }
    assert.deepEqual(await app.navigate(query), { path: '/', query })
    assert.deepEqual(app.calls, [])
  })
}

test('mixed IDs select organization and keep filters', async () => {
  const app = setup()
  const route = await app.navigate({ organization_id: '2', project_id: '1', filter: 'keep' }, { mounted: true })
  assert.deepEqual(route.query, { organization_id: '2', filter: 'keep' })
  assert.equal(app.state.mode, MODE.ORGANIZATION)
  assert.deepEqual(app.reloads, [0])
})

test('back and forward between scope links refresh both times', async () => {
  const app = setup()
  await app.navigate({ organization_id: '2' }, { mounted: true })
  await app.navigate({ project_id: '1' }, { mounted: true })
  assert.deepEqual(app.reloads, [0, 0])
  assert.equal(app.state.mode, MODE.PROJECT)
})

for (const result of [[], null, [{ organization_id: 999 }]]) {
  test(`unavailable target ${JSON.stringify(result)} stops without mutation`, async () => {
    const app = setup({ result })
    assert.equal(await app.navigate({ organization_id: '2' }), '/403')
    assert.deepEqual(app.commits, [])
    assert.equal(app.state.mode, MODE.PROJECT)
  })
}
for (const [error, path] of [[new Error('network'), '/timeout'], [{ response: { status: 403 } }, '/403'], [{ response: { status: 303 } }, '/'], [{ response: { status: 401 } }, '/iam/profile']]) {
  test(`lookup failure routes to ${path} exactly once`, async () => {
    const app = setup({ error })
    const query = { organization_id: '2' }
    const outcome = await app.navigate(query)
    assert.deepEqual(outcome, path === '/' || path === '/iam/profile' ? { path, query } : path)
    assert.deepEqual(app.commits, [])
  })
}
for (const id of ['', null, ['2', '3'], 'bad']) {
  test(`invalid ID ${JSON.stringify(id)} is rejected`, async () => {
    const app = setup()
    assert.equal(await app.navigate({ organization_id: id }), '/403')
    assert.deepEqual(app.calls, [])
  })
}
for (const path of ['/', '/auth/signin', '/403', '/timeout', '/iam/profile']) {
  test(`${path} does not resolve scope recursively`, async () => {
    const app = setup()
    await app.navigate({ organization_id: '2' }, { path })
    assert.deepEqual(app.calls, [])
  })
}

test('Signin and Home preserve the shared query through authentication', async () => {
  function component(path) {
    const script = readFileSync(path, 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
      .replace(/^import .*\n/gm, '').replace('export default', 'module.exports =')
    const context = { module: {}, mixin: {}, signin: {}, iam: {}, setTimeout: fn => fn() }
    vm.runInNewContext(script, context)
    return context.module.exports
  }
  const destinations = []
  const query = { organization_id: '2', filter: 'keep' }
  const instance = { $route: { query }, $router: { push: route => destinations.push(JSON.parse(JSON.stringify(route))) }, reSign: async () => {} }
  component('src/view/auth/Signin.vue').methods.signin.call(instance)
  const home = component('src/view/Home.vue')
  instance.redirectDashBoard = home.methods.redirectDashBoard.bind(instance)
  await home.mounted.call(instance)
  assert.deepEqual(destinations, [{ path: '/', query }, { path: '/dashboard', query }])
})

// Run the real Vue Router and the application's actual Axios interceptors together.
function integration(adapter) {
  const { createRouter, createMemoryHistory, isNavigationFailure, NavigationFailureType } = require('vue-router')
  const Axios = require('axios')
  const state = { mode: MODE.PROJECT, user: { user_id: 7 }, project: { project_id: 1 }, organization: { organization_id: 2 }, interval: {} }
  const reloads = []
  let router
  const axiosContext = {
    Axios, setInterval, clearInterval, console,
    router: { push: (...args) => router.push(...args), get currentRoute() { return router.currentRoute } },
  }
  const axiosSource = readFileSync('src/axios/index.js', 'utf8').replace(/^import .*\n/gm, '').replace('export default axios', 'globalThis.client = axios')
  vm.runInNewContext(axiosSource, axiosContext)
  const client = axiosContext.client
  client.defaults.adapter = adapter
  vm.runInNewContext(source, {
    MODE, axios: client, clearInterval, isNavigationFailure, NavigationFailureType,
    NProgress: { start() {}, done() {} },
    commonRoute: [{ path: '/:pathMatch(.*)*', component: {} }], appRoute: [],
    createWebHistory: createMemoryHistory,
    createRouter: options => {
      router = createRouter(options)
      router.go = value => reloads.push(value)
      return router
    },
    store: { state, commit(name, value) {
      const keys = { updateMode: 'mode', updateProject: 'project', updateOrganization: 'organization', updateInterval: 'interval' }
      state[keys[name]] = value
    } },
  })
  return { router, state, reloads, client }
}
function response(config) {
  if (config.url.startsWith('/iam/')) return { config, data: { data: { ok: false } } }
  const scope = config.url.startsWith('/organization/') ? 'organization' : 'project'
  const id = Number(new URL(config.url, 'http://test').searchParams.get(scope + '_id'))
  return { config, data: { data: { [scope]: [{ [scope + '_id']: id }] } } }
}
function deferred() {
  let resolve
  const promise = new Promise(r => { resolve = r })
  return { promise, resolve }
}

for (const stage of ['/iam/', '/organization/']) {
  for (const status of [null, 303, 401, 403, 'network']) {
    test(`real router ignores superseded ${stage} ${status ?? 'success'}`, async () => {
      const entered = deferred()
      const release = deferred()
      let pending = true
      const app = integration(async config => {
        if (pending && config.url.startsWith(stage)) {
          pending = false
          entered.resolve()
          await release.promise
          if (status !== null) throw { config, ...(status === 'network' ? {} : { response: { status } }) }
        }
        return response(config)
      })
      await app.router.push('/analysis/finding?project_id=1')
      const oldNavigation = app.router.push('/analysis/finding?organization_id=2')
      await entered.promise
      await app.router.push('/analysis/finding?project_id=11')
      assert.equal(app.state.project.project_id, 11)
      assert.deepEqual(app.reloads, [0])
      release.resolve()
      await oldNavigation
      assert.equal(app.router.currentRoute.value.fullPath, '/analysis/finding?project_id=11')
      assert.equal(app.state.mode, MODE.PROJECT)
      assert.equal(app.state.project.project_id, 11)
      assert.deepEqual(app.reloads, [0])
      await app.router.push('/dashboard?project_id=11')
      assert.deepEqual(app.reloads, [0], 'canceled navigation must not schedule a later reload')
    })
  }
}
for (const [status, destination] of [[303, '/?organization_id=2'], [401, '/iam/profile?organization_id=2'], [403, '/403']]) {
  test(`real Axios lookup ${status} keeps intended destination`, async () => {
    const app = integration(async config => { throw { config, response: { status } } })
    await app.router.push('/analysis/finding?project_id=1')
    await app.router.push('/analysis/finding?organization_id=2')
    assert.equal(app.router.currentRoute.value.fullPath, destination)
    assert.equal(app.state.mode, MODE.PROJECT)
    assert.deepEqual(app.reloads, [])
  })
}
test('real router mixed-ID canonicalization owns only one refresh', async () => {
  const app = integration(async config => response(config))
  await app.router.push('/analysis/finding?project_id=1')
  await app.router.push('/analysis/finding?organization_id=2&project_id=1&filter=keep')
  assert.equal(app.router.currentRoute.value.fullPath, '/analysis/finding?organization_id=2&filter=keep')
  assert.equal(app.state.mode, MODE.ORGANIZATION)
  assert.deepEqual(app.reloads, [0])
  await app.router.push('/dashboard?organization_id=2')
  assert.deepEqual(app.reloads, [0])
})

test('real router duplicate navigation cancels pending scope lookup', async () => {
  const entered = deferred()
  const release = deferred()
  const app = integration(async config => {
    if (config.url.startsWith('/organization/')) {
      entered.resolve()
      await release.promise
    }
    return response(config)
  })
  await app.router.push('/analysis/finding?project_id=1')
  const pending = app.router.push('/analysis/finding?organization_id=2')
  await entered.promise
  await app.router.push('/analysis/finding?project_id=1')
  release.resolve()
  await pending
  assert.equal(app.router.currentRoute.value.fullPath, '/analysis/finding?project_id=1')
  assert.equal(app.state.mode, MODE.PROJECT)
  assert.deepEqual(app.reloads, [])
})
