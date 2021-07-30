<template>
  <div class="mt-5">
    <AnomalyDetectorToolBar></AnomalyDetectorToolBar>
    <div v-if="$fetchState.pending" class="text-center mt-5">
      <v-progress-circular
        :size="200"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>
    <div v-else-if="$fetchState.error">
      <p>Something went wrong...</p>
      {{ $fetchState.error.message }}
    </div>
    <div v-else class="mt-5">
      <v-data-table
        :headers="headers"
        :items="anomalies"
        hide-default-footer
        class="elevation-1"
      ></v-data-table>
      <client-only>
        <div v-for="(anomaly, i) in anomalyData" :key="i" class="mt-5">
          <AnomalyPlot :modelPredictions="anomaly" :ind="i"></AnomalyPlot>
        </div>
      </client-only>
    </div>
  </div>
</template>

<script>
import AnomalyDetectorToolBar from '~/components/anomaly-detector/AnomalyDetectorToolBar.vue'
import AnomalyPlot from '~/components/anomaly-detector/AnomalyPlot.vue'

export default {
  components: { AnomalyDetectorToolBar, AnomalyPlot },
  data() {
    return {
      anomalies: [],
      anomalyData: [],
      error: '',
      headers: [
        { text: 'Run Date', value: 'run_date', align: 'center' },
        { text: 'Module', value: 'module', align: 'center' },
        {
          text: 'Dimension Type',
          value: 'drilldown_dimension',
          align: 'center',
        },
        {
          text: 'Dimension Value',
          value: 'drilldown_dimension_display_value',
          align: 'center',
        },
        { text: 'Metric', value: 'run_date', align: 'center' },
        {
          text: 'Upper Control Limit Violations',
          value: 'ucl_violations',
          align: 'center',
        },
        {
          text: 'Lower Control Limit Violations',
          value: 'lcl_violations',
          align: 'center',
        },
        {
          text: 'Upper Anomalies',
          value: 'upper_anomaly_violations',
          align: 'center',
        },
        {
          text: 'Lower Anomalies',
          value: 'lower_anomaly_violations',
          align: 'center',
        },
        { text: 'Drifting', value: 'is_drifting', align: 'center' },
      ],
    }
  },
  computed: {
    title() {
      return `${this.$route.params.region} Anomaly Detection & Metric Trending`
    },
  },
  async fetch() {
    this.anomalies = await this.$axios
      .get('/api/anomalies/anomalies/?region=' + this.$route.params.region)
      .then((res) => res.data)
    const predictions = []
    for (let i = 0; i < this.anomalies.length; i++) {
      try {
        const anomaly = this.anomalies[i]
        const prediction = await this.$axios
          .get(
            `/api/anomalies/predictions/?region=${this.$route.params.region}&module=${anomaly.module}&dim=${anomaly.drilldown_dimension}&dimVal=${anomaly.drilldown_dimension_display_value}`
          )
          .then((res) => res.data)
        predictions.push(prediction)
      } catch (error) {
        console.log(error)
      }
    }
    this.anomalyData = predictions
  },
}
</script>
