<template>
  <div>
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
      <client-only>
        <v-row justify="center" align="center">
          <v-col
            cols="12"
            xl="6"
            v-for="(plot, ind) in plotData"
            :key="plot.title"
          >
            <v-card class="ma-5">
              <PlotlyLinePlot v-bind="plot" :ind="ind" />
            </v-card>
          </v-col>
        </v-row>
      </client-only>
    </div>
  </div>
</template>

<script>
import PlotlyLinePlot from '~/components/PlotlyLinePlot.vue'

export default {
  components: { PlotlyLinePlot },
  data() {
    return {
      plotData: [],
      startDate: '2021-08-05',
    }
  },
  computed: {
    endDate() {
      return new Date().toISOString().slice(0, 10)
    },
    upgradeCurveQuery() {
      return `
        with users as (
          SELECT
            postdate,
            case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
            case
              when app_sw_version like '1.9%' and stream = 'Phone7' then '1.9 (G6 iOS)'
              when app_sw_version like '1.9%' and stream = 'Phone8' then '1.9 (G6 Android)'
              when app_sw_version not like '1.9%' and stream = 'Phone7' then 'Other Version (G6 iOS)'
              when app_sw_version not like '1.9%' and stream = 'Phone8' then 'Other Version (G6 Android)'
              else 'Other Version'
            end as app_sw_version,            sum(egvs.n_users_posting_egvs) as n_users
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone7", "Phone8")
          GROUP BY 1,2,3
        )
        select postdate, stream, app_sw_version, n_users, sum(n_users) over(partition by postdate, stream) n_users_total,
          n_users/(sum(n_users) over(partition by postdate, stream)) * 100 as percent
        from users
        order by postdate, stream
      `
    },
    bulkDataPostQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone7' then 'All G6 iOS' when stream = 'Phone8' then 'All G6 Android' else 'other' end as stream,
            sum(bulk_data_posts.n_users_posting) as n_users_posting_data
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone7", "Phone8")
          GROUP BY 1,2
          ORDER BY 1,2
      `
    },
    crashesQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
            case
              when app_sw_version like '1.9%' and stream = 'Phone7' then '1.9 (G6 iOS)'
              when app_sw_version like '1.9%' and stream = 'Phone8' then '1.9 (G6 Android)'
              when app_sw_version not like '1.9%' and stream = 'Phone7' then 'Other Version (G6 iOS)'
              when app_sw_version not like '1.9%' and stream = 'Phone8' then 'Other Version (G6 Android)'
              else 'Other Version'
            end as app_sw_version,            sum(egvs.n_users_posting_egvs) as n_users,
            sum(crashes.n_users_crashing) as n_users_crashing,
            sum(crashes.n_users_crashing)/sum(egvs.n_users_posting_egvs) * 100 as percent
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone7", "Phone8")
          GROUP BY 1,2,3
          ORDER BY 1,2,3
      `
    },
    BatteryOptQuery() {
      return `
          SELECT
            postdate,
            case
              when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone7' then '1.9 (G6 iOS)'
              when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone8' then '1.9 (G6 Android)'
              when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone7' then 'Other Version (G6 iOS)'
              when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone8' then 'Other Version (G6 Android)'
              else 'Other Version'
            end as app_sw_version,
            count(distinct if(error_logs.n_ignoring_battery_opt_logs > 0, patientid, null)) as n_users_ignoring_battery_opt,
            count(distinct if(egvs.n_egvs > 0, patientid, null)) as n_users,
            count(distinct if(error_logs.n_ignoring_battery_opt_logs > 0, patientid, null))/count(distinct if(egvs.n_egvs > 0, patientid, null)) * 100 as percent
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.patient_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream = "Phone8"
            and egvs.n_egvs > 0
            and ending_device_info.app_sw_version is not null
          GROUP BY 1,2
          ORDER BY 1,2
      `
    },
    BatteryOptQueryOverall() {
      return `
          SELECT
            postdate,
            'All G6 Android' as app_sw_version,
            count(distinct if(error_logs.n_ignoring_battery_opt_logs > 0, patientid, null)) as n_users_ignoring_battery_opt,
            count(distinct if(egvs.n_egvs > 0, patientid, null)) as n_users,
            count(distinct if(error_logs.n_ignoring_battery_opt_logs > 0, patientid, null))/count(distinct if(egvs.n_egvs > 0, patientid, null)) * 100 as percent
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.patient_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream = "Phone8"
            and egvs.n_egvs > 0
          GROUP BY 1,2
          ORDER BY 1,2
      `
    },
    PacketCaptureQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
            case
              when app_sw_version like '1.9%' and stream = 'Phone7' then '1.9 (G6 iOS)'
              when app_sw_version like '1.9%' and stream = 'Phone8' then '1.9 (G6 Android)'
              when app_sw_version not like '1.9%' and stream = 'Phone7' then 'Other Version (G6 iOS)'
              when app_sw_version not like '1.9%' and stream = 'Phone8' then 'Other Version (G6 Android)'
              else 'Other Version'
            end as app_sw_version,
            sum(egvs.n_realtime_egvs) as n_realtime_egvs,
            sum(egvs.n_distinct_egvs) as n_distinct_egvs,
            sum(egvs.n_realtime_egvs)/sum(egvs.n_distinct_egvs) * 100 as packet_capture
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone7", "Phone8")
          GROUP BY 1,2,3
          ORDER BY 1,2,3
      `
    },
    queries() {
      return [
        {
          query: this.upgradeCurveQuery,
          title: 'Upgrade Curve',
          x: 'postdate',
          y: 'percent',
          colorBy: 'app_sw_version',
          facetBy: 'stream',
          textCol: 'n_users',
          xLabel: 'Post Date',
          yLabel: 'Percent Users',
          colorMapping: {
            'Other Version (G6 Android)': 'blue',
            '1.9 (G6 Android)': 'red',
            'Other Version (G6 iOS)': 'orange',
            '1.9 (G6 iOS)': 'green',
          },
        },
        {
          query: this.bulkDataPostQuery,
          title: 'N Users Making Bulk Data Posts Per Day',
          x: 'postdate',
          y: 'n_users_posting_data',
          colorBy: 'stream',
          facetBy: null,
          xLabel: 'Post Date',
          yLabel: 'N Users',
          colorMapping: {
            'All G6 Android': 'blue',
            'All G6 iOS': 'orange',
          },
        },
        {
          query: this.crashesQuery,
          title: 'Percent of Users Crashing Per Day',
          x: 'postdate',
          y: 'percent',
          colorBy: 'app_sw_version',
          facetBy: 'stream',
          textCol: 'n_users_crashing',
          xLabel: 'Post Date',
          yLabel: 'Percent Users',
          colorMapping: {
            'Other Version (G6 Android)': 'blue',
            '1.9 (G6 Android)': 'red',
            'Other Version (G6 iOS)': 'orange',
            '1.9 (G6 iOS)': 'green',
          },
        },
        {
          query: this.BatteryOptQuery,
          title:
            'Percent of Users Ignoring Battery Optimization By App Version',
          x: 'postdate',
          y: 'percent',
          colorBy: 'app_sw_version',
          textCol: 'n_users_ignoring_battery_opt',
          xLabel: 'Post Date',
          yLabel: 'Percent Users',
          colorMapping: {
            'Other Version (G6 Android)': 'blue',
            '1.9 (G6 Android)': 'red',
          },
        },
        {
          query: this.BatteryOptQueryOverall,
          title: 'Percent of Users Ignoring Battery Optimization Overall',
          x: 'postdate',
          y: 'percent',
          colorBy: 'app_sw_version',
          textCol: 'n_users_ignoring_battery_opt',
          xLabel: 'Post Date',
          yLabel: 'Percent Users',
          colorMapping: {
            'All G6 Android': 'blue',
          },
        },
        {
          query: this.PacketCaptureQuery,
          title: 'Average Daily Packet Capture by App Version',
          x: 'postdate',
          y: 'packet_capture',
          colorBy: 'app_sw_version',
          facetBy: 'stream',
          xLabel: 'Post Date',
          yLabel: 'Packet Capture Percent',
          colorMapping: {
            'Other Version (G6 Android)': 'blue',
            '1.9 (G6 Android)': 'red',
            'Other Version (G6 iOS)': 'orange',
            '1.9 (G6 iOS)': 'green',
          },
        },
      ]
    },
  },
  async fetch() {
    const results = []
    let data
    for (let i = 0; i < this.queries.length; i++) {
      let query = this.queries[i]
      data = await this.$axios
        .get('/api/anomalies/query', {
          params: { query: query.query },
        })
        .then((res) =>
          res.data.map((row) => {
            const newRow = { ...row }
            newRow.postdate = newRow.postdate.value
            return newRow
          })
        )
      results.push({
        ...query,
        sourceData: data,
      })
    }
    this.plotData = results
  },
}
</script>

<style>
</style>
