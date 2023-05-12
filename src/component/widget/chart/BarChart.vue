<template>
  <Bar :data="chartData" :options="options" />
</template>

<script>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'BarChart',
  components: { Bar },
  //  mixins: [reactiveProp],
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
              stacked: true,
              time: {
                displayFormats: {
                  day: 'MM/DD',
                },
                unit: 'day',
              },
            },
            y: {
              stacked: true,
            },
          },
        }
      },
    },
  },
}
</script>
