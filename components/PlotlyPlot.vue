<template>
  <div>
    <div :id="plotId" />
  </div>
</template>

<script>
import Plotly from 'plotly.js-dist/plotly'

export default {
  props: {
    traces: {
      default: () => [],
      type: Array,
      required: true,
    },
    layout: {
      default: () => {},
      type: Object,
      required: true,
    },
  },
  computed: {
    plotId() {
      return 'plot-' + this.guidGenerator()
    },
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
  },
  watch: {
    traces: {
      deep: true,
      handler() {
        Plotly.newPlot(this.plotId, this.traces, this.layout, {
          responsive: true,
        })
      },
    },
  },
  mounted() {
    if (process.browser) {
      Plotly.newPlot(this.plotId, this.traces, this.layout, {
        responsive: true,
      })
    }
  },
}
</script>

<style>
</style>
