@@ -0,0 +1,40 @@
<script>
import { Bar, mixins } from 'vue-chartjs'
import 'chartjs-plugin-colorschemes'
const { reactiveProp } = mixins

export default {
  extends: Bar,
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
            stacked: true,
              time: {
                displayFormats: {
                  day: 'MM/DD'
                },
                unit: 'day'
              },
            }],
            yAxes: [{
                stacked: true,
            }],
          },
        }
      }
    },
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>