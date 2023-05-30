<template>
  <Pie :data="chartData" :options="options" />
</template>

<script>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

export default {
  name: 'PieChart',
  components: { Pie },
  props: {
    chartData: {
      type: Object,
      default: () => {
        return {
          labels: ['Red', 'Yellow', 'Blue'],
          datasets: [
            {
              data: [10, 20, 30],
            },
          ],
        }
      },
    },
    options: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
}
</script>
