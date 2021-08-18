
<template>
  <div>
    <div :id="plotId" :style="{ width: '100%', height: '100%' }" />
  </div>
</template>
<script>
import vegaEmbed from 'vega-embed'

export default {
  props: {
    vlSpec: {
      required: true,
      type: Object,
    },
  },
  watch: {
    vlSpec: {
      deep: true,
      async handler() {
        await this.makePlot()
      },
    },
  },
  computed: {
    plotId() {
      return 'plot' + this.guidGenerator()
    },
  },
  methods: {
    async makePlot() {
      await vegaEmbed('#' + this.plotId, this.vlSpec, {})
    },
    guidGenerator() {
      const S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      }
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
  async mounted() {
    await this.makePlot()
  },
}
</script>

<style>
</style>
