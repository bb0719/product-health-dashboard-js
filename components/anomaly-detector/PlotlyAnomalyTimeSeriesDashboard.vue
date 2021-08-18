<template>
  <div class="mt-5">
    <SpinnerErrorContent :fetchState="$fetchState">
      <div class="text-center">
        <p class="text-h2">{{ title }}</p>
      </div>
      <client-only>
        <v-row justify="center" align="center">
          <v-col
            cols="12"
            xl="6"
            v-for="(plotDef, ind) in plotData"
            :key="plotDef.title"
          >
            <v-card class="ma-5">
              <PlotlyLinePlot v-bind="plotDef" :ind="ind" />
            </v-card>
          </v-col>
        </v-row>
      </client-only>
    </SpinnerErrorContent>
  </div>
</template>

<script>
import PlotlyLinePlot from '~/components/PlotlyLinePlot.vue'
import SpinnerErrorContent from '~/components/SpinnerErrorContent.vue'

export default {
  components: { PlotlyLinePlot, SpinnerErrorContent },
  props: {
    queryDefs: {
      required: true,
      type: Array,
    },
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      plotData: [],
    }
  },
  methods: {
    async getAnomalyDashboardQueryData(query, dateField) {
      try {
        const data = await this.$axios
          .get('/api/anomalies/query', {
            params: { query: query },
          })
          .then((res) =>
            res.data.map((row) => {
              const newRow = { ...row }
              const theDate = newRow[dateField]
              newRow[dateField] = theDate
                ? theDate.value
                  ? theDate.value
                  : theDate
                : theDate
              return newRow
            })
          )

        return data
      } catch (err) {
        console.log(err)
        return []
      }
    },
    async configureDashboard(queryDefs) {
      const results = []
      let data
      for (let i = 0; i < queryDefs.length; i++) {
        let query = queryDefs[i]
        data = await this.getAnomalyDashboardQueryData(
          query.query,
          query.dateField ? query.dateField : 'postdate'
        )
        results.push({
          ...query,
          sourceData: data,
        })
      }
      return results
    },
  },
  async fetch() {
    this.plotData = await this.configureDashboard(this.queryDefs)
  },
}
</script>

<style>
</style>
