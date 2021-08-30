<template>
  <div>
    <VegaPlot :vlSpec="vlSpec"></VegaPlot>
  </div>
</template>
<script>
import VegaPlot from '~/components/VegaPlot.vue'

export default {
  components: { VegaPlot },
  props: {
    modelPredictions: {
      default: () => [],
      type: Array,
    },
  },
  computed: {
    vlSpec() {
      const spec = {
        description: `Anomaly detection predictions for ${this.modelPredictions[0].module} ${this.modelPredictions[0].drilldown_dimension} = ${this.modelPredictions[0].drilldown_dimension_display_value}`,
        title: {
          text:
            this.modelPredictions[0].drilldown_dimension === 'None'
              ? `${this.modelPredictions[0].module}`
              : `${this.modelPredictions[0].module}: ${this.modelPredictions[0].drilldown_dimension} = ${this.modelPredictions[0].drilldown_dimension_display_value}`,
          fontSize: 24,
          fontWeight: 500,
        },
        data: {
          values: this.modelPredictions,
        },
        layer: [],
        height: 500,
        width: 'container',
        autosize: {
          contains: 'padding',
          type: 'fit',
          resize: true,
        },
        resolve: {
          scale: {
            x: 'shared',
            y: 'shared',
          },
        },
      }
      spec.layer.push({
        mark: {
          type: 'line',
          strokeDash: [6, 6],
        },

        encoding: {
          x: {
            field: 'ds',
            type: 'temporal',
            scale: {
              padding: 20,
            },
            axis: {
              title: this.modelPredictions[0].date_col || 'ds',
              titleFontSize: 16,
              titleFontWeight: 300,
            },
          },
          y: {
            field: 'yhat',
            type: 'quantitative',
            scale: {
              zero: false,
              padding: 20,
            },
            axis: {
              title: this.modelPredictions[0].metric_col || 'yhat',
              titleFontSize: 16,
              titleFontWeight: 300,
            },
          },
          color: {
            value: 'black',
          },
        },
      })

      spec.layer.push({
        mark: {
          type: 'circle',
          size: 100,
        },
        transform: [
          {
            filter: {
              field: 'group',
              equal: 'test',
            },
          },
        ],
        params: [
          {
            name: 'grid',
            select: 'interval',
            bind: 'scales',
          },
        ],
        encoding: {
          x: {
            field: 'ds',
            type: 'temporal',
          },
          y: {
            field: 'yhat',
            type: 'quantitative',
          },
          color: {
            value: 'green',
          },
          tooltip: [
            {
              field: 'ds',
              title: this.modelPredictions[0].date_col || 'ds',
              type: 'temporal',
            },
            {
              field: 'yhat',
              title: this.modelPredictions[0].metric_col || 'yhat',
              type: 'quantitative',
            },
            { field: 'group', title: 'Group', color: 'green' },
          ],
        },
      })

      return spec
    },
  },
}
</script>

<style>
</style>
