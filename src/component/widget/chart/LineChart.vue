<template>
  <Line :data="chartData" :options="options" />
</template>

<script>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale
)

export default {
  name: 'LineChart',
  /* eslint vue/no-reserved-component-names: 0 */
  components: { Line },
  props: {
    chartData: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      default: () => {
        return {
          scales: {
            x: {
              time: {
                displayFormats: {
                  day: 'MM/DD',
                },
                unit: 'day',
              },
            },
          },
        }
      },
    },
  },
}
</script>
