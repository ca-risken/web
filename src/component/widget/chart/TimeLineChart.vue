<script>
import { Line, mixins } from 'vue-chartjs'
import 'chartjs-plugin-colorschemes'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: {
    chartData: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: () => {
        return {
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                displayFormats: {
                  day: 'MM/DD'
                },
                unit: 'day'
              },
              scaleLabel: {
                display: true,
                labelString: 'Week'
              }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }],
          },
          plugins: {
            colorschemes: {
              // scheme: 'brewer.Set3-12'
              scheme: 'tableau.NurielStone9',
            }
          },
        }
      }
    },
  },
  mounted () {
    // this.addPlugin(this.plugins)
    this.renderChart(this.chartData, this.options)
  }
}
</script>
