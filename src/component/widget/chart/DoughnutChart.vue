<template>
  <doughnut :data="chartData" :options="options" />
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

export default {
  name: 'DoughnutChart',
  components: { Doughnut },
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
        return {
          // plugins: {
          //   colorschemes: {
          //     // scheme: 'brewer.Set3-12'
          //     scheme: 'tableau.NurielStone9',
          //   }
          // },
        }
      },
    },
  },
}
</script>
