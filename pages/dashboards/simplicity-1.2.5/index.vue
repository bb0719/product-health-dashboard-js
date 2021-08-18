<template>
  <div>
    <PlotlyAnomalyTimeSeriesDashboard
      :queryDefs="queryDefs"
      title="Simplicity 1.2.5 Release"
    ></PlotlyAnomalyTimeSeriesDashboard>
  </div>
</template>

<script>
import PlotlyAnomalyTimeSeriesDashboard from '~/components/anomaly-detector/PlotlyAnomalyTimeSeriesDashboard.vue'

export default {
  components: { PlotlyAnomalyTimeSeriesDashboard },

  data() {
    return {
      plotData: [],
      startDate: '2021-07-25',
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
            case when stream = 'Phone11' then 'Simplicity iOS' when stream = 'Phone12' then 'Simplicity Android' else 'other' end as stream,
            case
              when app_sw_version like '1.2.5%' and stream = 'Phone11' then 'Simplicity iOS 1.2.5'
              when app_sw_version like '1.2.5%' and stream = 'Phone12' then 'Simplicity Android 1.2.5'
              when app_sw_version not like '1.2.5%' and stream = 'Phone11' then 'Simplicity iOS Other Version'
              when app_sw_version not like '1.2.5%' and stream = 'Phone12' then 'Simplicity Android Other Version'
              else 'Other Version'
            end as app_sw_version,
            sum(egvs.n_users_posting_egvs) as n_users
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone11", "Phone12")
          GROUP BY 1,2,3
        )
        select postdate, stream, app_sw_version, n_users, sum(n_users) over(partition by postdate, stream) n_users_total,
          n_users/(sum(n_users) over(partition by postdate, stream)) * 100 as percent
        from users
        order by 3,1
      `
    },
    bulkDataPostQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone11' then 'All Simplicity iOS' when stream = 'Phone12' then 'All Simplicity Android' else 'other' end as stream,
            sum(bulk_data_posts.n_users_posting) as n_users_posting_data
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone11", "Phone12")
          GROUP BY 1,2
          ORDER BY 2,1
      `
    },
    crashesQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone11' then 'Simplicity iOS' when stream = 'Phone12' then 'Simplicity Android' else 'other' end as stream,
            case
              when app_sw_version like '1.2.5%' and stream = 'Phone11' then 'Simplicity iOS 1.2.5'
              when app_sw_version like '1.2.5%' and stream = 'Phone12' then 'Simplicity Android 1.2.5'
              when app_sw_version not like '1.2.5%' and stream = 'Phone11' then 'Simplicity iOS Other Version'
              when app_sw_version not like '1.2.5%' and stream = 'Phone12' then 'Simplicity Android Other Version'
              else 'Other Version'
            end as app_sw_version,
            sum(egvs.n_users_posting_egvs) as n_users,
            sum(crashes.n_users_crashing) as n_users_crashing,
            sum(crashes.n_users_crashing)/sum(egvs.n_users_posting_egvs) * 100 as percent
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone11", "Phone12")
          GROUP BY 1,2,3
          ORDER BY 3,1
      `
    },
    PacketCaptureQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone11' then 'Simplicity iOS' when stream = 'Phone12' then 'Simplicity Android' else 'other' end as stream,
            case
              when app_sw_version like '1.2.5%' and stream = 'Phone11' then 'Simplicity iOS 1.2.5'
              when app_sw_version like '1.2.5%' and stream = 'Phone12' then 'Simplicity Android 1.2.5'
              when app_sw_version not like '1.2.5%' and stream = 'Phone11' then 'Simplicity iOS Other Version'
              when app_sw_version not like '1.2.5%' and stream = 'Phone12' then 'Simplicity Android Other Version'
              else 'Other Version'
            end as app_sw_version,
            sum(egvs.n_realtime_egvs) as n_realtime_egvs,
            sum(egvs.n_distinct_egvs) as n_distinct_egvs,
            sum(egvs.n_realtime_egvs)/sum(egvs.n_distinct_egvs) * 100 as packet_capture
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone11", "Phone12")
          GROUP BY 1,2,3
          ORDER BY 3,1
      `
    },
    LoginScreenQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone11' then 'Simplicity iOS' when stream = 'Phone12' then 'Simplicity Android' else 'other' end as stream,
            case
              when app_sw_version like '1.2.5%' and stream = 'Phone11' then 'Simplicity iOS 1.2.5'
              when app_sw_version like '1.2.5%' and stream = 'Phone12' then 'Simplicity Android 1.2.5'
              when app_sw_version not like '1.2.5%' and stream = 'Phone11' then 'Simplicity iOS Other Version'
              when app_sw_version not like '1.2.5%' and stream = 'Phone12' then 'Simplicity Android Other Version'
              else 'Other Version'
            end as app_sw_version,
            sum(login_screen_views.n_users_viewing_login_screen) n_users_viewing_login_screen,
            sum(egvs.n_users_posting_egvs) n_users_posting_egvs,
            safe_divide(
                sum(login_screen_views.n_users_viewing_login_screen),
                sum(egvs.n_users_posting_egvs)
            ) * 100 as percent_users_viewing_login_screen
        FROM \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`

          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone11", "Phone12")
        GROUP BY 1,2,3
        ORDER BY 3,1
        `
    },
    queryDefs() {
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
            'Simplicity Android Other Version': 'blue',
            'Simplicity Android 1.2.5': 'red',
            'Simplicity iOS Other Version': 'orange',
            'Simplicity iOS 1.2.5': 'green',
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
            'All Simplicity Android': 'blue',
            'All Simplicity iOS': 'orange',
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
            'Simplicity Android Other Version': 'blue',
            'Simplicity Android 1.2.5': 'red',
            'Simplicity iOS Other Version': 'orange',
            'Simplicity iOS 1.2.5': 'green',
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
            'Simplicity Android Other Version': 'blue',
            'Simplicity Android 1.2.5': 'red',
            'Simplicity iOS Other Version': 'orange',
            'Simplicity iOS 1.2.5': 'green',
          },
        },
        {
          query: this.LoginScreenQuery,
          title: 'Percent Users Viewing Login Screen by App Version',
          x: 'postdate',
          y: 'percent_users_viewing_login_screen',
          colorBy: 'app_sw_version',
          facetBy: 'stream',
          textCol: 'n_users_viewing_login_screen',
          xLabel: 'Post Date',
          yLabel: 'Percent Users Viewing Screen',
          colorMapping: {
            'Simplicity Android Other Version': 'blue',
            'Simplicity Android 1.2.5': 'red',
            'Simplicity iOS Other Version': 'orange',
            'Simplicity iOS 1.2.5': 'green',
          },
        },
      ]
    },
  },
}
</script>

<style>
</style>
