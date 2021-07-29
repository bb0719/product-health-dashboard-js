<template>
  <div class="mt-5">
    <AnomalyDetectorToolBar></AnomalyDetectorToolBar>
  </div>
</template>

<script>
import AnomalyDetectorToolBar from '~/components/anomaly-detector/AnomalyDetectorToolBar.vue'
export default {
  components: { AnomalyDetectorToolBar },
  data() {
    return {}
  },
  computed: {
    title() {
      return `${this.$route.params.region} Anomaly Detection & Metric Trending`
    },
  },
  methods: {
    async showMessageFromBackend() {
      console.log('clicked')
      try {
        const response = await this.$axios.get(
          '/api/anomalies/predictionsChoices/?region=US'
          // '/api/anomalies/predictions/?region=US&module=InPenDoseLogs&dim=None&dimVal=None'
        )
        console.log(response)
        this.res = response
      } catch (err) {
        this.err = err.response.data
      }
    },
  },
}
</script>
