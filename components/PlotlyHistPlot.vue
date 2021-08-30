<template>
  <div>
    <PlotlyPlot :traces="traces" :layout="layout" />
  </div>
</template>

<script>
import PlotlyPlot from '~/components/PlotlyPlot.vue'

export default {
  components: { PlotlyPlot },
  props: {
    sourceData: {
      default: () => [],
      type: Array,
      required: true,
    },
    x: {
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
    textCol: {
      type: String,
      default: null,
    },
    xLabel: {
      type: String,
      default: null,
    },
    yLabel: {
      type: String,
      default: null,
    },
    colorMapping: {
      type: Object,
      default: () => {},
    },
    binWidth: {
      type: Number,
      required: false,
    },
  },
  data() {
    return {
      plotData: [],
      traces: [],
      layout: {},
    }
  },
  methods: {
    guidGenerator() {
      const S4 = () =>
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      return (
        S4() +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        S4() +
        S4()
      )
    },
    prepPlotData() {
      const plotData = []
      const facetDefs = {}
      const layout = {
        title: { text: this.title, font: { size: 24 } },
        showlegend: this.colorBy ? true : false,
      }
      layout.annotations = []
      layout.annotations.push({
        x: 0,
        xshift: -50,
        xanchor: 'left',
        yanchor: 'middle',
        text: this.yLabel,
        font: { size: 16 },
        xref: 'paper',
        yref: 'paper',
        textangle: 270,
        showarrow: false,
      })
      layout.annotations.push({
        y: 0,
        yshift: -50,
        xanchor: 'middle',
        yanchor: 'bottom',
        text: this.xLabel,
        font: { size: 16 },
        xref: 'paper',
        yref: 'paper',
        showarrow: false,
      })
      // layout.xaxis = { title: { text: this.xLabel } }
      // layout.yaxis = { title: { text: this.yLabel } }
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
        let color =
          this.colorBy && this.colorMapping && group
            ? this.colorMapping[group]
            : null
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
            type: 'histogram',
            histnorm: 'probability',
            xbins: this.binWidth ? { size: this.binWidth } : null,
            opacity: 0.5,
            name: group,
            text: this.textCol ? [row[this.textCol]] : null,
            hovertemplate: this.textCol
              ? `<b>${this.x}</b>: %{x}<br><b>${this.textCol}</b>: %{text}`
              : null,
            marker: color ? { color: color } : {},
            line: color ? { color: color } : {},
          })
          if (this.facetBy) {
            layout.annotations.push({
              text: row[this.facetBy],
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
            opacity: 0.5,
            type: 'histogram',
            histnorm: 'probability',
            xbins: this.binWidth ? { size: this.binWidth } : null,
            name: group,
            yaxis: facet === 'y1' ? null : facet,
            text: this.textCol ? [row[this.textCol]] : null,
            hovertemplate: this.textCol
              ? `<b>${this.x}</b>: %{x}<br><b>${this.textCol}</b>: %{text}`
              : null,
            marker: color ? { color: color } : {},
            line: color ? { color: color } : {},
          })
          if (this.facetBy) {
            layout.annotations.push({
              text: row[this.facetBy],
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
          if (this.textCol) {
            plotData[trace].text.push(row[this.textCol])
          }
        }
      }

      for (let i = 1; i < count; i++) {
        if (i == 1) {
          layout.yaxis = {
            domain: [0, 1 / (count - 1) - 0.05],
            // rangemode: 'tozero',
          }
        } else {
          layout['yaxis' + i] = {
            domain: [(1 / (count - 1)) * (i - 1), (1 / (count - 1)) * i - 0.05],
            // rangemode: 'tozero',
          }
        }
      }
      // layout.xaxis = { tickformat: '%Y-%m-%d' }
      this.plotData = plotData
      layout.height = (count - 1) * 300
      layout.barmode = 'overlay'

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
        this.traces = plotData
        this.layout = layout
      },
    },
  },
  mounted() {
    if (process.browser) {
      const { plotData, layout } = this.prepPlotData()
      this.traces = plotData
      this.layout = layout
    }
  },
}
</script>

<style>
</style>
