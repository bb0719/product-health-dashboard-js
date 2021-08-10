<template>
  <div>
    <client-only>
      <PlotlyLinePlot
        v-for="(plot, ind) in plotData"
        :sourceData="plot.data"
        :ind="ind"
        :key="plot.title"
        :x="plot.x"
        :y="plot.y"
        :colorBy="plot.colorBy"
        :facetBy="plot.facetBy"
        :title="plot.title"
      />
    </client-only>
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
            case when app_sw_version like '1.9%' then app_sw_version else 'Other Version' end as app_sw_version,
            sum(egvs.n_users_posting_egvs) as n_users
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
            case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
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
            case when app_sw_version like '1.9%' then app_sw_version else 'Other Version' end as app_sw_version,
            sum(egvs.n_users_posting_egvs) as n_users,
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
            case when app_sw_version like '1.9%' then app_sw_version else 'Other Version' end as app_sw_version,
            sum(error_logs.n_users_battery_opt_on) as n_users_battery_opt_on,
            sum(egvs.n_users_posting_egvs) as n_users,
            sum(error_logs.n_users_battery_opt_on)/sum(egvs.n_users_posting_egvs) * 100 as percent
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream = "Phone8"
          GROUP BY 1,2
          ORDER BY 1,2
      `
    },
    BatteryOptQueryOverall() {
      return `
          SELECT
            postdate,
            sum(error_logs.n_users_battery_opt_on) as n_users_battery_opt_on,
            sum(egvs.n_users_posting_egvs) as n_users,
            sum(error_logs.n_users_battery_opt_on)/sum(egvs.n_users_posting_egvs) * 100 as percent
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream = "Phone8"
          GROUP BY 1
          ORDER BY 1
      `
    },
    PacketCaptureQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
            case when app_sw_version like '1.9%' then app_sw_version else 'Other Version' end as app_sw_version,
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
        },
        {
          query: this.bulkDataPostQuery,
          title: 'N Users Making Bulk Data Posts Per Day',
          x: 'postdate',
          y: 'n_users_posting_data',
          colorBy: 'stream',
          facetBy: null,
        },
        {
          query: this.crashesQuery,
          title: 'Percent of Users Crashing Per Day',
          x: 'postdate',
          y: 'percent',
          colorBy: 'app_sw_version',
          facetBy: 'stream',
        },
        {
          query: this.BatteryOptQuery,
          title: 'Percent of With Battery Optimization On By App Version',
          x: 'postdate',
          y: 'percent',
          colorBy: 'app_sw_version',
        },
        {
          query: this.BatteryOptQueryOverall,
          title: 'Percent of With Battery Optimization On Overall',
          x: 'postdate',
          y: 'percent',
        },
        {
          query: this.PacketCaptureQuery,
          title: 'Average Daily Packet Capture by App Version',
          x: 'postdate',
          y: 'packet_capture',
          colorBy: 'app_sw_version',
          facetBy: 'stream',
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
        title: query.title,
        data: data,
        x: query.x,
        y: query.y,
        colorBy: query.colorBy,
        facetBy: query.facetBy,
      })
    }
    this.plotData = results
  },
}
</script>

<style>
</style>
