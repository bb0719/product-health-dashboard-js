<template>
  <div>
    <client-only>
      <v-row justify="center" align="center">
        <v-col cols="12" xl="6">
          <v-card class="ma-5 pa-5">
            <VegaPlot :vlSpec="p1Spec"></VegaPlot>
          </v-card>
        </v-col>
        <v-col cols="12" xl="6">
          <v-card class="pa-5 text-center">
            <VegaPlot :vlSpec="p2Spec"></VegaPlot>
          </v-card>
        </v-col>
      </v-row>
    </client-only>
  </div>
</template>
<script>
import VegaPlot from '~/components/VegaPlot.vue'
export default {
  components: { VegaPlot },
  data() {
    return {
      p1Spec: {
        description: 'A simple bar chart with embedded data.',
        data: {
          values: [
            { a: 'A', b: 28 },
            { a: 'B', b: 55 },
            { a: 'C', b: 43 },
            { a: 'D', b: 91 },
            { a: 'E', b: 81 },
            { a: 'F', b: 53 },
            { a: 'G', b: 19 },
            { a: 'H', b: 87 },
            { a: 'I', b: 52 },
          ],
        },
        mark: 'bar',
        height: 500,
        encoding: {
          x: { field: 'a', type: 'nominal', axis: { labelAngle: 0 } },
          y: { field: 'b', type: 'quantitative' },
        },
        width: 'container',
      },
      p2Spec: {
        description: 'A simple bar chart with embedded data.',
        data: {
          values: [
            { a: 'A', b: 28 },
            { a: 'B', b: 55 },
            { a: 'C', b: 43 },
            { a: 'D', b: 91 },
            { a: 'E', b: 81 },
            { a: 'F', b: 53 },
            { a: 'G', b: 19 },
            { a: 'H', b: 87 },
            { a: 'I', b: 52 },
          ],
        },
        mark: 'bar',
        height: 500,
        encoding: {
          x: { field: 'a', type: 'nominal', axis: { labelAngle: 0 } },
          y: { field: 'b', type: 'quantitative' },
        },
        width: 'container',
        autosize: {
          contains: 'padding',
          type: 'fit',
          resize: true,
        },
      },
    }
  },
}
</script>

<style>
</style>
