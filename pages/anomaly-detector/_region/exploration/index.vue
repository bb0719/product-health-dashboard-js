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
    <div v-else>
      <v-row justify="center" align="center">
        <v-col cols="3 ma-5">
          <p class="text-center subtitle-1 grey--text text--darken-1">Module</p>
          <v-select
            v-model="module"
            :items="moduleChoiceMappings"
            item-text="module"
            item-value="module"
            label="Module Name"
            hint="Select a module"
            persistent-hint
            return-object
            single-line
            @change="changeRoute"
          ></v-select>
        </v-col>

        <v-col cols="3 ma-5">
          <p class="text-center subtitle-1 grey--text text--darken-1">
            Dimension
          </p>
          <v-select
            v-model="dimension"
            :items="dimensionChoices"
            item-text="dim"
            item-value="dim"
            label="Dimension Name"
            hint="Select a dimension"
            persistent-hint
            return-object
            single-line
            @change="changeRoute"
          ></v-select>
        </v-col>
      </v-row>
      <client-only>
        <div v-if="loading" class="text-center mt-5">
          <v-progress-circular
            :size="200"
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
        <div v-else>
          <div v-for="(pred, i) in predictionData" :key="i" class="mt-5">
            <AnomalyPlot :modelPredictions="pred" :ind="i"></AnomalyPlot>
          </div>
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
      moduleChoiceMappings: [],
      module: null,
      dimension: null,
      predictionData: [],
      dimensionChoices: [],
      loading: true,
    }
  },
  computed: {
    moduleDim() {
      try {
        return this.module.module + '_' + this.dimension.dim
      } catch {
        return null
      }
    },
  },
  watch: {
    moduleDim() {
      this.getPlotData()
    },
    module: {
      deep: true,
      handler(module, oldModule) {
        const choices = []
        if (module) {
          for (const dimension in module.choices) {
            choices.push({
              dim: dimension,
              dimVals: module.choices[dimension],
            })
          }
        }
        this.dimensionChoices = choices
        if (
          !this.dimension ||
          choices.findIndex((element) => element.dim === this.dimension.dim) ===
            -1
        ) {
          this.dimension = choices[0]
        }
      },
    },
  },
  methods: {
    async getPlotData() {
      if (!this.moduleDim) {
        return
      }
      this.loading = true
      const predictions = []
      for (const dimVal of this.dimension.dimVals) {
        try {
          const prediction = await this.$axios
            .get(
              `/api/anomalies/predictions/?region=${this.$route.params.region}&module=${this.module.module}&dim=${this.dimension.dim}&dimVal=${dimVal}`
            )
            .then((res) => res.data)
          predictions.push(prediction)
        } catch (error) {
          console.log(error)
        }
      }
      this.predictionData = predictions
      this.loading = false
    },
    changeRoute() {
      this.$router.push({
        query: { module: this.module.module, dim: this.dimension.dim },
      })
    },
  },
  async fetch() {
    this.moduleChoiceMappings = await this.$axios
      .get(
        '/api/anomalies/predictionsChoices/?region=' + this.$route.params.region
      )
      .then((res) => res.data)
    if (this.$route.query.module && this.$route.query.dim) {
      this.module =
        this.moduleChoiceMappings.find(
          (element) => element.module === this.$route.query.module
        ) || this.moduleChoiceMappings[0]
      for (const dimension in this.module.choices) {
        if (dimension === this.$route.query.dim) {
          this.dimension = {
            dim: dimension,
            dimVals: this.module.choices[dimension],
          }
          break
        }
      }
    } else if (this.moduleChoiceMappings) {
      this.module = this.moduleChoiceMappings[0]
    }
    if (!this.dimension) {
      const key = Object.keys(this.module.choices)[0]
      this.dimension = {
        dim: key,
        dimVals: this.module.choices[key],
      }
    }
  },
}
</script>
