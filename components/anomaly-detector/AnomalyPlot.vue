<template>
  <div>
    <div :id="plotId" />
  </div>
</template>

<script>
import Plotly from 'plotly.js-dist/plotly'

export default {
  props: {
    modelPredictions: {
      default: () => [],
      type: Array,
    },
    ind: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      confIntLower: {
        x: [],
        y: [],
        mode: 'lines',
        line: { color: 'steelblue', width: 0 },
        hoverinfo: 'none',
      },
      confIntUpper: {
        x: [],
        y: [],
        fill: 'tonexty',
        mode: 'lines',
        line: { color: 'steelblue', width: 0 },
        hoverinfo: 'none',
      },
      trendLine: {
        x: [],
        y: [],
        mode: 'lines',
        line: {
          color: 'darkorange',
          width: 1,
        },
        hoverinfo: 'none',
      },
      predictions: {
        x: [],
        y: [],
        mode: 'lines',
        line: {
          color: 'blue',
          width: 1,
        },
        hoverinfo: 'none',
      },
      anomalies: {
        x: [],
        y: [],
        mode: 'markers',
        marker: {
          size: 25,
          opacity: 0.5,
          color: 'red',
          line: { width: 0 },
        },
        hoverinfo: 'none',
      },
      dataLine: {
        x: [],
        y: [],
        mode: 'lines',
        line: {
          dash: 'dash',
          color: 'black',
          width: 1,
        },
        hoverinfo: 'none',
      },
      trainingData: {
        x: [],
        y: [],
        mode: 'markers',
        marker: {
          size: 12,
          opacity: 1,
          color: 'black',
        },
        hoverinfo: 'training data',
      },
      testingData: {
        x: [],
        y: [],
        mode: 'markers',
        marker: {
          size: 12,
          opacity: 1,
          color: 'green',
        },
        hoverinfo: 'testing data',
      },
      testSeperationLine: {
        x: [],
        y: [],
        mode: 'lines',
        line: {
          dash: 'dash',
          color: 'green',
          width: 2,
        },
        hoverinfo: 'none',
      },
      driftLine: {
        x: [],
        y: [],
        mode: 'lines',
        line: { color: 'red', width: 2 },
        hoverinfo: 'none',
      },
      uclLine: {
        x: [],
        y: [],
        mode: 'lines',
        line: { color: 'purple', width: 1, dash: 'dash' },
        hoverinfo: 'none',
      },
      lclLine: {
        x: [],
        y: [],
        mode: 'lines',
        line: { color: 'purple', width: 1, dash: 'dash' },
        hoverinfo: 'none',
      },
    }
  },
  computed: {
    plotId() {
      return 'plot-' + this.ind
    },
  },
  watch: {
    modelPredictions: {
      deep: true,
      handler() {
        const { data, layout } = this.prepPlotData(this.modelPredictions)
        Plotly.newPlot('plot-' + this.ind, data, layout, { responsive: true })
      },
    },
  },
  methods: {
    clearPlotData() {
      const output = [
        this.confIntLower,
        this.confIntUpper,
        this.trendLine,
        this.predictions,
        this.anomalies,
        this.uclLine,
        this.lclLine,
        this.dataLine,
        this.testingData,
        this.trainingData,
        this.testSeperationLine,
        this.driftLine,
      ]
      for (let arr of output) {
        arr.x = []
        arr.y = []
      }
    },
    prepPlotData() {
      this.clearPlotData()
      this.uclLine.x = [
        this.modelPredictions[0].ds,
        this.modelPredictions[this.modelPredictions.length - 1].ds,
      ]
      this.uclLine.y = [
        this.modelPredictions[0].ucl,
        this.modelPredictions[0].ucl,
      ]
      this.lclLine.x = [
        this.modelPredictions[0].ds,
        this.modelPredictions[this.modelPredictions.length - 1].ds,
      ]
      this.uclLine.y = [
        this.modelPredictions[0].lcl,
        this.modelPredictions[0].lcl,
      ]

      let minBound = Infinity
      let maxBound = -Infinity

      for (let i = 0; i < this.modelPredictions.length; i++) {
        const row = this.modelPredictions[i]
        minBound = Math.min(minBound, row.yhat_lower, row.y, row.lcl)
        maxBound = Math.max(maxBound, row.yhat_upper, row.y, row.ucl)

        this.confIntLower.x.push(row.ds)
        this.confIntLower.y.push(row.yhat_lower)
        this.confIntUpper.x.push(row.ds)
        this.confIntUpper.y.push(row.yhat_upper)
        this.trendLine.x.push(row.ds)
        this.trendLine.y.push(row.trend)
        this.predictions.x.push(row.ds)
        this.predictions.y.push(row.yhat)
        if (
          (row.lower_anomaly_violation === 'True' ||
            row.upper_anomaly_violation === 'True' ||
            row.lcl_violation === 'True' ||
            row.ucl_violation === 'True') &
          (row.group === 'test')
        ) {
          this.anomalies.x.push(row.ds)
          this.anomalies.y.push(row.y)
        }
        this.dataLine.x.push(row.ds)
        this.dataLine.y.push(row.y)
        if (row.group === 'test') {
          this.testingData.x.push(row.ds)
          this.testingData.y.push(row.y)
          if (this.testSeperationLine.x.length === 0) {
            this.testSeperationLine.x.push(row.ds)
            this.testSeperationLine.x.push(row.ds)
          }
        } else {
          this.trainingData.x.push(row.ds)
          this.trainingData.y.push(row.y)
        }

        if (row.drifting === 'True') {
          this.driftLine.x.push(row.ds)
          this.driftLine.y.push(row.y)
        }
      }
      this.testSeperationLine.y.push(minBound)
      this.testSeperationLine.y.push(maxBound)

      const output = [
        this.confIntLower,
        this.confIntUpper,
        this.trendLine,
        this.predictions,
        this.anomalies,
        this.uclLine,
        this.lclLine,
        this.dataLine,
        this.testingData,
        this.trainingData,
        this.testSeperationLine,
        this.driftLine,
      ]

      const layout = {
        xaxis: { title: this.modelPredictions[0].date_col },
        yaxis: { title: this.modelPredictions[0].metric_col },
        hovermode: 'closest',
        showlegend: false,
        title:
          this.modelPredictions[0].drilldown_dimension === 'None'
            ? `${this.modelPredictions[0].module}`
            : `${this.modelPredictions[0].module}: ${this.modelPredictions[0].drilldown_dimension} = ${this.modelPredictions[0].drilldown_dimension_value}`,
        plot_bgcolor: 'white',
        paper_bgcolor: 'white',
      }

      return {
        data: output,
        layout: layout,
      }
    },
  },
  mounted() {
    const { data, layout } = this.prepPlotData(this.modelPredictions)
    Plotly.newPlot('plot-' + this.ind, data, layout, { responsive: true })
  },
}
</script>

<style>
</style>
