const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const { test } = require('node:test')
const path = require('node:path')

const source = fs.readFileSync(
  path.join(__dirname, '../src/view/analysis/Finding.vue'),
  'utf8'
)
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
const context = { component: null }
for (const match of script.matchAll(/^import (\w+) from /gm)) {
  context[match[1]] = {}
}
vm.runInNewContext(
  script.replace(/^import .*$/gm, '').replace('export default', 'component ='),
  context
)
const component = context.component

for (const organization of [false, true]) {
  for (const [name, rows, total, aws] of [
    ['known category', [['aws:guardduty', 2]], 2, 2],
    [
      'custom category mixed with known',
      [
        ['custom:scanner', 3],
        ['aws:guardduty', 2],
      ],
      5,
      2,
    ],
    ['Azure category', [['azure:sentinel', 3]], 3, 0],
    ['empty category', [['', 4]], 4, 0],
    ['empty response', [], 0, 0],
  ]) {
    test(`${organization ? 'Org' : 'Project'}: ${name}`, async () => {
      const state = Object.assign(component.data(), component.methods, {
        isOrganizationMode: organization,
        selectedProjectIDs: [2],
        getCurrentOrganizationID: () => 1,
        getCurrentProjectID: () => 2,
        fromDate: '2026-09-01',
        toDate: '2026-09-07',
        $axios: {
          get: async (url) => {
            assert.ok(
              url.includes(
                organization
                  ? 'get-report-finding-for-organization/'
                  : 'get-report-finding/?'
              )
            )
            return {
              data: {
                data: {
                  report_finding: rows.map(([data_source, count]) => ({
                    data_source,
                    count,
                    score: 0.1,
                    report_date: '2026-09-07',
                  })),
                },
              },
            }
          },
        },
      })
      await state.setReportFinding(state.refreshSequence)
      assert.equal(state.categoryFinding.total.Low, total)
      assert.equal(state.categoryFinding.aws.Low, aws)
      assert.equal(state.ReportFindings.length, rows.length)
    })
  }
}
