const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const source = fs.readFileSync(
  path.join(__dirname, '../src/component/finding/FindingAssetList.vue'),
  'utf8'
)
const body = source
  .split('    riskGroups(asset) {')[1]
  .split('\n    async openRiskEvidence(')[0]
  .replace(/},\s*$/, '')
const riskGroups = new Function('asset', body)
const context = { $t: (key) => key }
const cases = [
  { name: 'no evidence', evidence: [], count: 0 },
  {
    name: 'public exploit is orange',
    evidence: [{ kind: 'exploit', detail: 'AVAILABLE' }],
    count: 1,
    color: 'orange-darken-3',
    label: 'exploit',
  },
  {
    name: 'KEV is red',
    evidence: [{ kind: 'exploit', detail: 'KEV' }],
    count: 1,
    color: 'red-darken-2',
    label: 'kev',
  },
  {
    name: 'both use one red icon and retain both reasons',
    evidence: [
      { kind: 'exploit', detail: 'AVAILABLE' },
      { kind: 'exploit', detail: 'KEV' },
    ],
    count: 1,
    color: 'red-darken-2',
    label: 'kev',
  },
  {
    name: 'public access stays independent',
    evidence: [
      { kind: 'internet', detail: 'PUBLIC_SQL_INSTANCE' },
      { kind: 'exploit', detail: 'KEV' },
    ],
    count: 2,
    color: 'red-darken-2',
    label: 'kev',
  },
]
for (const item of cases) {
  const groups = riskGroups.call(context, { risk_information: item.evidence })
  assert.equal(groups.length, item.count, item.name)
  const exploit = groups.find((group) => group.kind === 'exploit')
  if (item.color) {
    assert.equal(exploit.color, item.color, item.name)
    assert.equal(exploit.label, 'assetView.riskLabels.' + item.label, item.name)
    assert.deepEqual(
      exploit.evidence,
      item.evidence.filter((e) => e.kind === 'exploit'),
      item.name
    )
  }
}
console.log('asset risk information: 5 cases passed')
