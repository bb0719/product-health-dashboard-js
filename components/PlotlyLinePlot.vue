<template>
  <div>
    <div :id="plotId" />
  </div>
</template>

<script>
import Plotly from 'plotly.js-dist/plotly'

export default {
  props: {
    sourceData: {
      default: () => [],
      type: Array,
      required: true,
    },
    ind: {
      type: Number,
      default: 0,
    },
    x: {
      type: String,
      required: true,
    },
    y: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: null,
    },
    colorBy: {
      type: String,
      default: null,
    },
    facetBy: {
      type: String,
      default: null,
    },
  },
  data() {
    return {}
  },
  computed: {
    plotId() {
      return 'plot-' + this.ind
    },
  },
  methods: {
    prepPlotData() {
      const plotData = []
      const facetDefs = {}
      const layout = {
        height: 600,
        title: { text: this.title, font: { size: 24 } },
      }
      layout.annotations = []
      let count = 1
      if (this.facetBy) {
        for (let row of this.sourceData) {
          if (!(row[this.facetBy] in facetDefs)) {
            facetDefs[row[this.facetBy]] = count
            count++
          }
        }
      }
      for (let i = 0; i < this.sourceData.length; i++) {
        let row = this.sourceData[i]
        let group = this.colorBy ? row[this.colorBy] : null
        let facet = this.facetBy ? 'y' + facetDefs[row[this.facetBy]] : 'y1'
        let trace
        if (group == null && facet == null) {
          trace = 0
        } else if (facet == null && group != null) {
          trace = plotData.findIndex((line) => line.name === group)
        } else if (group == null && facet != null) {
          trace = plotData.findIndex(
            (line) =>
              line.yaxis === facet || (facet === 'y1' && line.yaxis == null)
          )
        } else {
          trace = plotData.findIndex(
            (line) =>
              line.name === group &&
              (line.yaxis === facet || (facet === 'y1' && line.yaxis == null))
          )
        }
        if (plotData.length === 0) {
          plotData.push({
            x: [row[this.x]],
            y: [row[this.y]],
            mode: 'lines+markers',
            name: group,
          })
          if (this.facetBy) {
            layout.annotations.push({
              text: this.facetBy + ': ' + row[this.facetBy],
              font: {
                size: 16,
              },
              yref: 'y domain',
              xref: 'x domain',
              align: 'center',
              y: 1.1,
              showarrow: false,
            })
          }
        } else if (trace === -1) {
          plotData.push({
            x: [row[this.x]],
            y: [row[this.y]],
            mode: 'lines+markers',
            name: group,
            yaxis: facet === 'y1' ? null : facet,
          })
          if (this.facetBy) {
            layout.annotations.push({
              text: this.facetBy + ': ' + row[this.facetBy],
              font: {
                size: 16,
              },
              xref: 'x domain',
              yref: facet + ' domain',
              align: 'center',
              y: 1.1,
              showarrow: false,
            })
          }
        } else {
          plotData[trace].x.push(row[this.x])
          plotData[trace].y.push(row[this.y])
        }
      }

      for (let i = 1; i < count; i++) {
        if (i == 1) {
          layout.yaxis = {
            domain: [0, 1 / (count - 1) - 0.05],
            rangemode: 'tozero',
          }
        } else {
          layout['yaxis' + i] = {
            domain: [(1 / (count - 1)) * (i - 1), (1 / (count - 1)) * i - 0.05],
            rangemode: 'tozero',
          }
        }
      }

      return {
        plotData,
        layout,
      }
    },
  },
  watch: {
    sourceData: {
      deep: true,
      handler() {
        const { plotData, layout } = this.prepPlotData()
        Plotly.newPlot('plot-' + this.ind, plotData, layout, {
          responsive: true,
        })
      },
    },
  },
  mounted() {
    if (process.browser) {
      const { plotData, layout } = this.prepPlotData()
      Plotly.newPlot('plot-' + this.ind, plotData, layout, {
        responsive: true,
      })
    }
  },
}
</script>

<style>
</style>
