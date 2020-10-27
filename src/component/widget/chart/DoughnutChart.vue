<script>
import { Doughnut, mixins } from 'vue-chartjs'
import 'chartjs-plugin-colorschemes'
const { reactiveProp } = mixins

export default {
  extends: Doughnut,
  mixins: [reactiveProp],
  props: {
    chartdata: {
      type: Object,
      default: () => {
        return {
          labels: ['Red', 'Yellow', 'Blue'],
          datasets: [{
            data: [10, 20, 30]
          }],
        }
      }
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
      }
    },
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>
