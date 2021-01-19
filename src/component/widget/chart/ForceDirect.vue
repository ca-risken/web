<template>
  <div>
    <svg :width="graphWidth" :height="graphHeight"></svg>
  </div>
</template>
<script>
import * as d3 from 'd3'
export default {
  props: {
    graphWidth: { type: String, default: "960" },
    graphHeight: { type: String, default: "300" },

    nodes: { type: Array, default: null },
    edges: { type: Array, default: null },
  },  data() {
    return {
      g: {},
      width: 0,
      height: 0,
    }
  },
  mounted () {}, 
  watch: {
    nodes: {
      deep: true,
      handler() {
        this.plot()
      },
    },
    // edges: {
    //   deep: true,
    //   handler() { this.plot(); }
    // },
  },
  methods: {
    plot() {
console.log("Called plot()")
      d3.select('svg').empty()

      let marge = { top: 60, bottom: 60, left: 60, right: 60 }
      let svg = d3.select('svg')      
      this.width = svg.attr('width')
      this.height = svg.attr('height')
      this.g = svg.append('g').attr('transform', 'translate(' + marge.top + ',' + marge.left + ')')

      // Color
      let colorScale = d3.scaleOrdinal().domain(d3.range(this.nodes.length)).range(d3.schemeCategory10)
      // Simulation
      let forceSimulation = d3.forceSimulation()
        .force('link', d3.forceLink())
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter())
      // Create node
      forceSimulation.nodes(this.nodes)
        .on('tick', ticked)
      // Side data
      forceSimulation.force('link')
        .links(this.edges)
        .distance(function (d) { // line length
          return d.value * 100
        })
      // center position
      forceSimulation.force('center')
        .x(this.width / 2)
        .y(this.height / 2)

      // let container = svg.append('g')
      svg.call(
        d3.zoom()
          .scaleExtent([.1, 4])
          .on('zoom', function (event) {
            this.g.attr('transform', event.transform)
          })
      )

      // drawing edge
      let links = this.g.append('g')
        .selectAll('line')
        .data(this.edges)
        .enter()
        .append('line')
        .attr('stroke', function (d, i) {
          return colorScale(i)
        })
        .attr('stroke-width', 1)
      // Line text
      let linksText = this.g.append('g')
        .selectAll('text')
        .data(this.edges)
        .enter()
        .append('text')
        .text(function (d) {
          return d.relation
        })
      // Group
      let gs = this.g.selectAll('.circleText')
        .data(this.nodes)
        .enter()
        .append('g')
        .attr('transform', function (d) {
          let cirX = d.x
          let cirY = d.y
          return 'translate(' + cirX + ',' + cirY + ')'
        })
        .call(d3.drag()
          .on('start', started)
          .on('drag', dragged)
          .on('end', ended)
        )
      // Draw nodes
      gs.append('circle')
        .attr('r', 10)
        .attr('fill', function (d, i) {
          return colorScale(i)
        })
      // text
      gs.append('text')
        .attr('x', -10)
        .attr('y', -20)
        .attr('dy', 10)
        .text(function (d) {
          return d.name
        })
      // ticked
      function ticked () {
        links
          .attr('x1', function (d) { return d.source.x })
          .attr('y1', function (d) { return d.source.y })
          .attr('x2', function (d) { return d.target.x })
          .attr('y2', function (d) { return d.target.y })
        linksText
          .attr('x', function (d) { return (d.source.x + d.target.x) / 2 })
          .attr('y', function (d) { return (d.source.y + d.target.y) / 2 })
        gs
          .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')' })
      }
      // drag
      function started (event, d) {
        if (!event.active) {
          forceSimulation.alphaTarget(0.8).restart()
        }
        d.fx = d.x
        d.fy = d.y
      }
      function dragged (event, d) {
        d.fx = event.x
        d.fy = event.y
      }
      function ended (event, d) {
        if (!event.active) {
          forceSimulation.alphaTarget(0)
        }
        d.fx = null
        d.fy = null
      }
    },
  },
}
</script>
