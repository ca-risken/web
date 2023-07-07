<template>
  <div style="height: 694px">
    <v-container>
      <v-form ref="searchForm" v-model="searchModel.valid">
        <v-row dense class="justify-start">
          <v-col cols="1">
            <v-select
              label="Cloud Type"
              v-model="searchModel.cloudType"
              :items="['aws']"
              variant="outlined"
              density="comfortable"
              bg-color="white"
              readonly
              :loading="loading"
            ></v-select>
          </v-col>
          <v-col cols="2">
            <v-select
              label="Cloud ID"
              v-model="searchModel.cloudID"
              :items="cloudList"
              item-title="cloud_name"
              item-value="cloud_id"
              variant="outlined"
              density="comfortable"
              bg-color="white"
              :loading="loading"
              @update:modelValue="handleChangeCloudID"
              ref="refCloudID"
            ></v-select>
          </v-col>
          <v-col cols="2">
            <v-select
              label="Service"
              :items="[
                'cloudfront',
                'elasticloadbalancing',
                'apigateway',
                'lambda',
                'ec2',
                'apprunner',
                's3',
              ]"
              variant="outlined"
              density="comfortable"
              bg-color="white"
              :loading="loading"
              v-model="searchModel.service"
              @update:modelValue="handleChangeService"
              ref="refService"
            ></v-select>
          </v-col>
          <v-col cols="5">
            <v-combobox
              label="ResourceName"
              variant="outlined"
              density="comfortable"
              bg-color="white"
              clearable
              hide-details
              :items="resourceNameList"
              :loading="loading"
              :rules="searchModel.validator.resourceName"
              v-model="searchModel.resourceName"
              ref="refResourceName"
            />
          </v-col>
          <v-spacer />
          <v-col cols="1">
            <v-btn
              class="mt-0 mr-4"
              size="large"
              density="comfortable"
              :loading="loading"
              @click="handleAnalyze"
              icon="mdi-magnify"
            >
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-container>

    <VueFlow
      class="vue-flow-basic-example"
      :nodes="nodes"
      :edges="edges"
      :default-viewport="{ zoom: 1.2 }"
      :max-zoom="4"
      :min-zoom="0.1"
    >
      <Background :color="'#fff'" />
      <MiniMap />
      <Controls />
    </VueFlow>

    <v-navigation-drawer
      v-model="drawer"
      location="right"
      :width="660"
      style="height: 100%; top: 10"
      temporary
    >
      <v-list-item
        lines="two"
        :prepend-avatar="getServiceIcon(resourceModel.service)"
        :title="resourceModel.service"
        :subtitle="resourceModel.short_name"
      >
        <template v-slot:append>
          <v-btn
            size="large"
            variant="text"
            icon="mdi-close"
            @click="drawer = false"
          ></v-btn>
        </template>
      </v-list-item>
      <v-divider />
      <v-list nav>
        <v-list-item prepend-icon="mdi-note" title="ResourceName"
          >{{ resourceModel.resource_name }}
        </v-list-item>
        <v-list-item prepend-icon="mdi-earth" title="Region">{{
          resourceModel.region
        }}</v-list-item>
        <v-list-item
          prepend-icon="mdi-format-list-bulleted"
          title="MetaData"
          @click="drawerMetaData = !drawerMetaData"
        ></v-list-item>
        <v-card class="ml-16" v-show="drawerMetaData">
          <v-table fixed-header density="compact">
            <thead>
              <tr>
                <th class="text-left text-subtitle-2 font-weight-bold">Key</th>
                <th class="text-left text-subtitle-2 font-weight-bold">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in metaList" :key="item.name">
                <td class="font-weight-medium text-body-2">{{ item.name }}</td>
                <td class="font-weight-regular text-body-2 wrap">
                  {{ formatMetaDataValue(item.value) }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
        <v-list-item
          prepend-icon="mdi-alert"
          title="Findings"
          @click="drawerFindings = !drawerFindings"
        >
        </v-list-item>
        <v-card class="ml-16" v-show="drawerFindings">
          <v-checkbox
            v-model="scoreFilter"
            label="Over 0.6 (score)"
            color="orange darken-3"
            hide-details
            @change="handleScoreFilter"
          ></v-checkbox>
          <v-table fixed-header density="compact">
            <thead>
              <tr>
                <th class="text-left text-subtitle-2 font-weight-bold">ID</th>
                <th class="text-left text-subtitle-2 font-weight-bold">
                  Score
                </th>
                <th class="text-left text-subtitle-2 font-weight-bold">
                  DataSource
                </th>
                <th class="text-left text-subtitle-2 font-weight-bold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in findingList" :key="item.finding_id">
                <td class="font-weight-medium text-body-2">
                  <v-btn
                    variant="text"
                    link
                    style="text-transform: none"
                    :to="{
                      path: '/finding/finding/',
                      query: { finding_id: item.finding_id, from_score: 0 },
                    }"
                    color="grey-darken-3"
                    class="text-decoration-underline red--text text--lighten-1 px-1 mx-0"
                    risken-action-name="search-finding-from-attack-flow"
                  >
                    {{ item.finding_id }}
                  </v-btn>
                </td>
                <td class="font-weight-medium text-body-2">
                  <v-chip
                    variant="flat"
                    size="small"
                    :color="getColorByScore(item.score)"
                  >
                    {{ item.score }}
                  </v-chip>
                </td>
                <td class="font-weight-medium text-body-2">
                  {{ item.data_source }}
                </td>
                <td class="font-italic text-body-2">{{ item.description }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-list>
    </v-navigation-drawer>

    <bottom-snack-bar ref="snackbar" />
  </div>
</template>

<script>
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
import mixin from '@/mixin'
import aws from '@/mixin/api/aws'
import finding from '@/mixin/api/finding'
import datasource from '@/mixin/api/datasource'

const LAYER_INTERNET = 'INTERNET'
const LAYER_EXTERNAL_SERVICE = 'EXTERNAL_SERVICE'
const LAYER_DATASTORE = 'DATASTORE'
const LAYER_LATERAL_MOVEMENT = 'LATERAL_MOVEMENT'
const MSG_COMPLETE_ANALYSIS = 'Success attack flow analysis'
const SERVICE_FILTER = new Map([
  ['cloudfront', ':distribution/'],
  ['lambda', ':function:'],
  ['apigateway', 'apis/'],
  ['ec2', 'instance/'],
  ['elasticloadbalancing', ':loadbalancer/'],
  ['apprunner', ':service/'],
])

export default {
  name: 'AWSAttackFlow',
  mixins: [mixin, aws, finding, datasource],
  components: {
    VueFlow,
    Background,
    MiniMap,
    Controls,
    BottomSnackBar,
  },
  data() {
    return {
      loading: false,
      drawer: false,
      drawerMetaData: true,
      drawerFindings: true,
      cloudList: [],
      resourceNameList: [],
      nodes: [],
      edges: [],
      searchModel: {
        valid: false,
        cloudType: 'aws',
        cloudID: '',
        cloudName: '',
        service: 'cloudfront',
        resourceName: '',
        validator: {
          resourceName: [
            (v) => !!v || 'ResourceName is required',
            (v) =>
              v.length <= 256 ||
              'ResourceName must be less than 256 characters',
          ],
        },
      },
      resourceModel: {
        resource_name: '',
        short_name: '',
        cloud_type: '',
        service: '',
        region: '',
        layer: '',
        meta_data: '',
      },
      metaList: [],
      findingList: [],
      scoreFilter: true,
    }
  },
  async mounted() {
    this.loading = true
    await this.listAWS()
    if (this.cloudList.length < 1) {
      this.loading = false
      return false
    }
    // set default value
    this.searchModel.cloudID = this.cloudList[0].cloud_id
    this.searchModel.cloudName = this.cloudList[0].name

    // refresh resource list
    this.listResource()
    this.loading = false
  },
  methods: {
    // handler
    async handleChangeCloudID() {
      this.loading = true
      await this.listResource()
      this.loading = false
    },
    async handleChangeService() {
      this.loading = true
      await this.listResource()
      this.loading = false
    },
    async handleAnalyze() {
      this.$refs.searchForm.validate()
      if (!this.searchModel.valid) {
        return
      }
      this.$refs.refCloudID.blur()
      this.$refs.refService.blur()
      this.$refs.refResourceName.blur()
      this.loading = true
      await this.generateVueFlow()
      this.loading = false
    },
    async handleClickNode(node) {
      this.metaList = []
      this.findingList = []
      this.drawer = true
      this.drawerMetaData = true
      this.drawerFindings = true
      this.scoreFilter = true
      this.resourceModel = node
      this.parseMetaData(node.meta_data)
      await this.getFindingList()
    },
    async handleScoreFilter() {
      this.loading = true
      await this.getFindingList()
      this.loading = false
    },

    // service
    async listAWS() {
      const aws = await this.listAWSAPI().catch((err) => {
        this.finishError(this.parseAPIErrorMessage(err))
        this.loading = false
        return Promise.reject(err)
      })
      if (!aws) {
        return false
      }
      this.cloudList = []
      aws.forEach(async (a) => {
        this.cloudList.push({
          cloud_id: a.aws_account_id,
          cloud_name: a.name,
        })
      })
      this.loading = false
    },
    async listResource() {
      this.loading = true
      this.resourceNameList = []
      let searchCond = ''
      searchCond += '&namespace=' + this.searchModel.cloudType
      searchCond += '&resource_type=' + this.searchModel.service
      searchCond += '&tag=' + this.searchModel.cloudID
      searchCond += '&resource_name=arn:aws:' + this.searchModel.service
      const list = await this.listResourceID(searchCond)
      if (!list.resource_id || list.resource_id.length == 0) {
        this.loading = false
        return
      }
      let promiseFuncs = []
      const filter = SERVICE_FILTER.get(this.searchModel.service)
      for (const id of list.resource_id) {
        promiseFuncs.push(this.getResourceDetail(id, filter))
      }
      await Promise.all(promiseFuncs) // Parallel API call
      this.loading = false
    },
    async getResourceDetail(id, filter) {
      const resource = await this.getResource(id)
      if (resource.resource_name.includes(filter)) {
        this.resourceNameList.push(resource.resource_name)
      }
    },

    async getFindingList() {
      this.loading = true
      this.findingList = []
      let searchCond = ''
      searchCond += '&tag=' + this.searchModel.cloudID
      searchCond += '&resource_name=' + this.resourceModel.resource_name
      searchCond += '&sort=score&direction=desc'
      if (this.scoreFilter) {
        searchCond += '&from_score=0.6'
      } else {
        searchCond += '&from_score=0.1'
      }
      const list = await this.listFinding(searchCond)
      if (!list.finding_id || list.finding_id.length == 0) {
        this.drawerFindings = false
        this.loading = false
        return
      }
      let findings = []
      for (const id of list.finding_id) {
        findings.push(this.getFindingDetail(id))
      }
      await Promise.all(findings) // Parallel API call
      this.findingList.sort((a, b) => {
        return b.score - a.score
      })
      this.loading = false
    },
    async getFindingDetail(id) {
      const f = await this.getFinding(id)
      this.findingList.push(f)
    },

    async generateVueFlow() {
      const apiResponse = await this.analyzeAttackFlow()
      this.nodes = []
      this.edges = []

      // nodes
      if (!apiResponse.nodes || apiResponse.nodes.length < 1) {
        this.finishSuccess(MSG_COMPLETE_ANALYSIS)
        return
      }
      const positionMap = await this.getPositionMap(apiResponse.edges)
      await apiResponse.nodes.forEach(async (n) => {
        let pos = await positionMap.get(n.resource_name)
        if (!pos) {
          pos = {
            X: 200,
            Y: 200,
          }
        }
        this.nodes.push({
          id: n.resource_name,
          type: this.getNodeType(n.layer),
          label:
            '<img src="' +
            this.getServiceIcon(n.service) +
            '" />' +
            n.short_name,
          position: {
            x: pos.X,
            y: pos.Y,
          },
          class: n.layer === LAYER_INTERNET ? 'node-internet' : 'light',
          sourcePosition: 'bottom',
          targetPosition: 'top',
          events: {
            click: () => {
              this.handleClickNode(n)
            },
          },
        })
      })

      // edges
      if (!apiResponse.edges || apiResponse.edges.length < 1) {
        this.finishSuccess(MSG_COMPLETE_ANALYSIS)
        return
      }
      apiResponse.edges.forEach(async (e) => {
        this.edges.push({
          id: e.relation_id,
          source: e.source_resource_name,
          target: e.target_resource_name,
          type: 'smoothstep',
          label: e.relation_label,
          animated: e.source_resource_name === 'Internet' ? true : false,
          style: {
            stroke:
              e.source_resource_name === 'Internet' ? 'lightblue' : 'lightgrey',
          },
          labelBgStyle: {
            fill:
              e.source_resource_name === 'Internet' ? 'lightblue' : 'lightgrey',
          },
        })
      })

      this.finishSuccess(MSG_COMPLETE_ANALYSIS)
    },

    async getPositionMap(edges) {
      let currentIdx = 0
      let currentPos = new Map() // key: idx, value: {X: 0, Y: 0}
      let posMap = new Map() // key: resource_name, value: {X: 0, Y: 0, idx: 0}

      posMap.set('Internet', { X: 50, Y: 80, Idx: 0 }) // fixed position (Internet)
      currentPos.set(currentIdx, { X: 50, Y: 80 })
      if (!edges || edges.size === 0) {
        return posMap
      }
      edges.forEach(async (e) => {
        if (
          posMap.has(e.source_resource_name) &&
          posMap.has(e.target_resource_name)
        ) {
          return
        }

        if (!posMap.has(e.source_resource_name)) {
          const current = currentPos.get(currentIdx)
          const idx = currentIdx + 1
          if (currentIdx === 0) {
            // first index
            posMap.set(e.source_resource_name, {
              X: 200,
              Y: 200,
              Idx: idx,
            })
            currentPos.set(idx, { X: 200, Y: 200 })
          } else {
            posMap.set(e.source_resource_name, {
              X: current.X + 300,
              Y: 200,
              Idx: idx,
            })
            currentPos.set(idx, { X: current.X + 300, Y: 200 })
          }
          currentIdx = idx
        }

        if (!posMap.has(e.target_resource_name)) {
          const source = posMap.get(e.source_resource_name)
          const idx = source.Idx + 1
          if (currentIdx === 0) {
            // first index
            currentIdx = idx
            posMap.set(e.target_resource_name, {
              X: 200,
              Y: 200,
              Idx: idx,
            })
            currentPos.set(idx, { X: 200, Y: 200 })
          } else if (currentIdx < idx) {
            // last index
            currentIdx = idx
            posMap.set(e.target_resource_name, {
              X: source.X + 300,
              Y: 200,
              Idx: idx,
            })
            currentPos.set(idx, { X: source.X + 300, Y: 200 })
          } else {
            const current = currentPos.get(idx)
            posMap.set(e.target_resource_name, {
              X: source.X + 300,
              Y: current.Y + 150,
              Idx: idx,
            })
            currentPos.set(idx, { X: source.X + 300, Y: current.Y + 150 })
          }
        }
      })
      return posMap
    },
    async analyzeAttackFlow() {
      const resp = await this.getAttackFlowAnalysis(
        this.searchModel.cloudType,
        this.searchModel.cloudID,
        this.searchModel.resourceName
      ).catch((err) => {
        this.finishError(this.parseAPIErrorMessage(err))
        this.loading = false
        return Promise.reject(err)
      })
      if (!resp) {
        return {}
      }
      return resp
    },
    getNodeType(layer) {
      switch (layer) {
        case LAYER_INTERNET:
          return 'input'
        case (LAYER_EXTERNAL_SERVICE, LAYER_DATASTORE, LAYER_LATERAL_MOVEMENT):
          return 'output'
        default:
          return 'default'
      }
    },
    getServiceIcon(service) {
      switch (service) {
        case 'internet':
          return '/static/icon/internet.png'
        case 'apigateway':
          return '/static/aws/apigateway.png'
        case 'cloudfront':
          return '/static/aws/cloudfront.jpeg'
        case 's3':
          return '/static/aws/s3.jpeg'
        case 'lambda':
          return '/static/aws/lambda.png'
        case 'iam':
          return '/static/aws/iam.png'
        case 'sns':
          return '/static/aws/sns.png'
        case 'sqs':
          return '/static/aws/sqs.png'
        case 'events':
          return '/static/aws/eventbridge.png'
        case 'external-service':
          return '/static/icon/internet.png'
        case 'internal-service':
          return '/static/icon/internet.png'
        case 'ec2':
          return '/static/aws/ec2.png'
        case 'elasticloadbalancing':
          return '/static/aws/elb.png'
        case 'apprunner':
          return '/static/aws/apprunner.png'
        default:
          return '/static/aws/default.png'
      }
    },
    parseMetaData() {
      let meta = []
      if (
        !this.resourceModel.meta_data ||
        this.resourceModel.meta_data === ''
      ) {
        this.drawerMetaData = false
        return
      }
      const m = JSON.parse(this.resourceModel.meta_data)
      for (const key in m) {
        meta.push({
          name: key,
          value: m[key],
        })
      }
      this.metaList = meta
    },
    formatMetaDataValue(v) {
      if (Array.isArray(v)) {
        let list = ''
        let idx = 0
        for (const i of v) {
          idx++
          list += '(' + idx + ') ' + this.parseObject(i) + '\n'
        }
        return list
      }
      return this.parseObject(v)
    },
    parseObject(obj) {
      if (obj instanceof Object === true) {
        let ret = ''
        Object.keys(obj).forEach(async (key) => {
          ret += key + ': ' + obj[key] + ', '
        })
        return ret.slice(0, -2)
      }
      return obj
    },

    // finish
    async finishSuccess(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifySuccess(msg)
    },
    async finishError(msg) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.$refs.snackbar.notifyError(msg)
    },
  },
}
</script>

<style lang="scss">
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/minimap/dist/style.css';
@import '@vue-flow/controls/dist/style.css';

.vue-flow__node div img {
  width: 20px;
  vertical-align: middle;
  margin-right: 5px;
}
.node-internet {
  background: lightblue;
  border: 2px solid whitesmoke;
}
.wrap {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
