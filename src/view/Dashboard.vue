<template>
  <div class="page-dashboard">
    <v-container>
      <v-row>
        <!-- mini statistic start -->
        <v-col cols="3">
          <mini-statistic
            icon="mdi-alert"
            title="100+"
            sub-title="alert"
            color="red"
          />
        </v-col>
        <v-col cols="3">
          <mini-statistic
            icon="mdi-amazon"
            title="150+"
            sub-title="resource"
            color="orange"
          />
        </v-col>
        <v-col cols="3">
          <mini-statistic
            icon="mdi-github"
            title="200+"
            sub-title="resource"
            color="black"
          />
        </v-col>
        <v-col cols="3">
          <mini-statistic
            icon="mdi-google"
            title="50+"
            sub-title="resource"
            color="blue"
          />
        </v-col>
        <!-- mini statistic  end -->
        <!-- statistic section -->
        <v-col cols="3">
          <linear-statistic
            title="Sales"
            sub-title="Sales increase"
            icon="trending_up"
            color="success"
            :value="15"
          />
          <linear-statistic
            class="my-4"
            title="Orders"
            sub-title="Increase"
            icon="trending_up"
            color="pink"
            :value="30"
          />
        </v-col>
        <!-- Circle statistic -->
        <v-col
          cols="3"
          v-for="(item, index) in trending"
          :key="'c-trending' + index"
        >
          <circle-statistic
            :title="item.subheading"
            :sub-title="item.headline"
            :caption="item.caption"
            :icon="item.icon.label"
            :color="item.linear.color"
            :value="item.linear.value"
          />
        </v-col>
        <v-col cols="12">
          <plain-table />
        </v-col>
        <v-col cols="12">
          <plain-table-order />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import API from '@/api'
import MiniStatistic from '@/component/widget/statistic/MiniStatistic'
import PlainTable from '@/component/widget/list/PlainTable'
import PlainTableOrder from '@/component/widget/list/PlainTableOrder'
import Material from 'vuetify/es5/util/colors'
import CircleStatistic from '@/component/widget/statistic/CircleStatistic'
import LinearStatistic from '@/component/widget/statistic/LinearStatistic'
export default {
  name: 'PageDashboard',
  components: {
    MiniStatistic,
    CircleStatistic,
    LinearStatistic,
    PlainTable,
    PlainTableOrder
  },
  data: () => ({
    color: Material,
    selectedTab: 'tab-1',
    linearTrending: [
      {
        subheading: 'Sales',
        headline: '2,55',
        caption: 'increase',
        percent: 15,
        icon: {
          label: 'trending_up',
          color: 'success'
        },
        linear: {
          value: 15,
          color: 'success'
        }
      },
      {
        subheading: 'Revenue',
        headline: '6,553',
        caption: 'increase',
        percent: 10,
        icon: {
          label: 'trending_down',
          color: 'error'
        },
        linear: {
          value: 15,
          color: 'error'
        }
      },
      {
        subheading: 'Orders',
        headline: '5,00',
        caption: 'increase',
        percent: 50,
        icon: {
          label: 'arrow_upward',
          color: 'info'
        },
        linear: {
          value: 50,
          color: 'info'
        }
      }
    ],
    trending: [
      {
        subheading: 'Tasks',
        headline: '90%',
        caption: 'tasks completed.',
        percent: 90,
        icon: {
          label: 'list',
          color: 'primary'
        },
        linear: {
          value: 90,
          color: 'success'
        }
      },
      {
        subheading: 'Issues',
        headline: '100%',
        caption: 'issues fixed.',
        percent: 100,
        icon: {
          label: 'bug_report',
          color: 'primary'
        },
        linear: {
          value: 100,
          color: 'error'
        }
      }
    ]
  }),
  computed: {
    activity() {
      return API.getActivity()
    },
    posts() {
      return API.getPost(3)
    },
    siteTrafficData() {
      return API.getMonthVisit
    },
    locationData() {
      return API.getLocation
    }
  }
}
</script>
