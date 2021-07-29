<template>
  <div class="mt-5">
    <p class="text-h2 text-center">
      {{ title }}
    </p>
    <v-tabs fixed-tabs>
      <v-tab v-for="tab in tabs" :key="tab.title" :to="tab.path">{{
        tab.title
      }}</v-tab>
    </v-tabs>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabs: [
        {
          title: 'Daily Anomalies',
          path: `/anomaly-detector/${this.$route.params.region}/daily-anomalies`,
        },
        {
          title: 'Exploration',
          path: `/anomaly-detector/${this.$route.params.region}/exploration`,
        },
      ],
    }
  },
  computed: {
    title() {
      return `${this.$route.params.region} Anomaly Detection & Metric Trending`
    },
  },
}
</script>

<style>
</style>
