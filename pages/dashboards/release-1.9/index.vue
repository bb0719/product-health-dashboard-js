<template>
  <div>
    <PlotlyAnomalyTimeSeriesDashboard
      :queryDefs="queryDefs"
      title="G6 US 1.9 Release"
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
      startDate: '2021-08-01',
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
              when app_sw_version like '1.9%' and stream = 'Phone7' then 'G6 iOS 1.9'
              when app_sw_version like '1.9%' and stream = 'Phone8' then 'G6 Android 1.9'
              when app_sw_version not like '1.9%' and stream = 'Phone7' then 'G6 iOS Other Version'
              when app_sw_version not like '1.9%' and stream = 'Phone8' then 'G6 Android Other Version'
              else 'Other Version'
            end as app_sw_version,
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
        order by 3,1
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
          ORDER BY 2,1
      `
    },
    crashesQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
            case
              when app_sw_version like '1.9%' and stream = 'Phone7' then 'G6 iOS 1.9'
              when app_sw_version like '1.9%' and stream = 'Phone8' then 'G6 Android 1.9'
              when app_sw_version not like '1.9%' and stream = 'Phone7' then 'G6 iOS Other Version'
              when app_sw_version not like '1.9%' and stream = 'Phone8' then 'G6 Android Other Version'
              else 'Other Version'
            end as app_sw_version,
            sum(egvs.n_users_posting_egvs) as n_users,
            sum(crashes.n_users_crashing) as n_users_crashing,
            sum(crashes.n_users_crashing)/sum(egvs.n_users_posting_egvs) * 100 as percent
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.config_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone7", "Phone8")
          GROUP BY 1,2,3
          ORDER BY 3,1
      `
    },
    BatteryOptQuery() {
      return `
          SELECT
            postdate,
            case
              when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone7' then 'G6 iOS 1.9'
              when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone8' then 'G6 Android 1.9'
              when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone7' then 'G6 iOS Other Version'
              when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone8' then 'G6 Android Other Version'
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
            and ending_device_info.app_sw_version is not null and ending_device_info.app_sw_version = incoming_device_info.app_sw_version
          GROUP BY 1,2
          HAVING n_users > 10
          ORDER BY 2,1
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
          ORDER BY 2,1
      `
    },
    PacketCaptureQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
            case
              when app_sw_version like '1.9%' and stream = 'Phone7' then 'G6 iOS 1.9'
              when app_sw_version like '1.9%' and stream = 'Phone8' then 'G6 Android 1.9'
              when app_sw_version not like '1.9%' and stream = 'Phone7' then 'G6 iOS Other Version'
              when app_sw_version not like '1.9%' and stream = 'Phone8' then 'G6 Android Other Version'
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
          ORDER BY 3,1
      `
    },
    SwipeKillPercentageQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
            case
              when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone7' then 'G6 iOS 1.9'
              when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone8' then 'G6 Android 1.9'
              when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone7' then 'G6 iOS Other Version'
              when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone8' then 'G6 Android Other Version'
              else 'Other Version'
            end as app_sw_version,
            countif(swipe_kills.n_swipe_kills > 0)/countif(egvs.n_egvs > 0) * 100 as percent_users_swipe_kill
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.patient_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone7")
            and ending_device_info.app_sw_version = incoming_device_info.app_sw_version
          GROUP BY 1,2,3
          ORDER BY 3,1
      `
    },
    SwipeKillPercentageOverallQuery() {
      return `
          SELECT
            postdate,
            'All G6 iOS' as app_sw_version,
            countif(swipe_kills.n_swipe_kills > 0)/countif(egvs.n_egvs > 0) * 100 as percent_users_swipe_kill
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.patient_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone7")
          GROUP BY 1,2
          ORDER BY 1,2
      `
    },
    SwipeKillDurationQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
            case
              when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone7' then 'G6 iOS 1.9'
              when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone8' then 'G6 Android 1.9'
              when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone7' then 'G6 iOS Other Version'
              when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone8' then 'G6 Android Other Version'
              else 'Other Version'
            end as app_sw_version,
            sum(if(swipe_kills.total_duration > 1440, 1440, swipe_kills.total_duration ))/countif(egvs.n_egvs > 0) as total_kill_duration_per_user
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.patient_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone7")
            and ending_device_info.app_sw_version = incoming_device_info.app_sw_version
            and swipe_kills.n_swipe_kills > 0
          GROUP BY 1,2,3
          ORDER BY 3,1
      `
    },
    SwipeKillDurationCDFQuery() {
      return `
        SELECT app_sw_version, (row_number() over(partition by app_sw_version) - 1) /1000 as cdf, total_duration
          from (
              SELECT
                case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
                case
                  when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone7' then 'G6 iOS 1.9'
                  when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone8' then 'G6 Android 1.9'
                  when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone7' then 'G6 iOS Other Version'
                  when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone8' then 'G6 Android Other Version'
                  else ending_device_info.app_sw_version
                end as app_sw_version,
                  approx_quantiles(if(swipe_kills.total_duration > 1440, 1440, swipe_kills.total_duration), 1000) quantiles
              FROM \`prod-us-5g-dapcurated-1.anomaly_detection.patient_cgm_aggregate_info_daily\`
              WHERE postdate between '${this.startDate}' and '${this.endDate}'
              and stream = "Phone7"
              and swipe_kills.n_swipe_kills > 0
              and ending_device_info.app_sw_version = incoming_device_info.app_sw_version
              and egvs.n_egvs > 0
              GROUP BY 1,2
          ), unnest(quantiles) total_duration
          order by app_sw_version, cdf
          `
    },
    SharePostsDuringWarmupPercentQuery() {
      return `
          SELECT
            postdate,
            case when stream = 'Phone7' then 'G6 iOS' when stream = 'Phone8' then 'G6 Android' else 'other' end as stream,
            case
              when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone7' then 'G6 iOS 1.9'
              when ending_device_info.app_sw_version like '1.9%' and stream = 'Phone8' then 'G6 Android 1.9'
              when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone7' then 'G6 iOS Other Version'
              when ending_device_info.app_sw_version not like '1.9%' and stream = 'Phone8' then 'G6 Android Other Version'
              else 'Other Version'
            end as app_sw_version,
            safe_divide(
              sum(share_posts_puar.n_warmup_successful_logs),
              sum(share_posts_puar.n_warmup_payload_empty_logs) + sum(share_posts_puar.n_warmup_successful_logs)
            ) * 100 as percent_successful_posts_during_warmup,
          FROM
            \`prod-us-5g-dapcurated-1.anomaly_detection.patient_cgm_aggregate_info_daily\`
          WHERE postdate between '${this.startDate}' and '${this.endDate}'
            and stream in ("Phone7")
            and ending_device_info.app_sw_version = incoming_device_info.app_sw_version
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
            'G6 Android Other Version': 'blue',
            'G6 Android 1.9': 'red',
            'G6 iOS Other Version': 'orange',
            'G6 iOS 1.9': 'green',
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
            'G6 Android Other Version': 'blue',
            'G6 Android 1.9': 'red',
            'G6 iOS Other Version': 'orange',
            'G6 iOS 1.9': 'green',
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
            'G6 Android Other Version': 'blue',
            'G6 Android 1.9': 'red',
            'G6 iOS Other Version': 'orange',
            'G6 iOS 1.9': 'green',
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
            'G6 Android Other Version': 'blue',
            'G6 Android 1.9': 'red',
            'G6 iOS Other Version': 'orange',
            'G6 iOS 1.9': 'green',
          },
        },
        {
          query: this.SharePostsDuringWarmupPercentQuery,
          title:
            'Percent of Share Posts that Are Successful During Sensor Warmup',
          x: 'postdate',
          y: 'percent_successful_posts_during_warmup',
          colorBy: 'app_sw_version',
          xLabel: 'Post Date',
          yLabel: 'Percent Successful',
          colorMapping: {
            'G6 Android Other Version': 'blue',
            'G6 Android 1.9': 'red',
            'G6 iOS Other Version': 'orange',
            'G6 iOS 1.9': 'green',
          },
        },
        {
          query: this.SwipeKillDurationCDFQuery,
          title:
            'G6 iOS Total Daily Swipe Kill Duration Per User Cumulative Distribution',
          x: 'total_duration',
          y: 'cdf',
          colorBy: 'app_sw_version',
          xLabel: 'Total Daily Swipe Kill Duration (minutes)',
          yLabel: 'CDF',
          colorMapping: {
            'G6 Android Other Version': 'blue',
            'G6 Android 1.9': 'red',
            'G6 iOS Other Version': 'orange',
            'G6 iOS 1.9': 'green',
          },
          mode: 'line',
        },
        {
          query: this.SwipeKillDurationQuery,
          title:
            'Swipe Kill Average Total Daily Duration per User With Swipe Kills',
          x: 'postdate',
          y: 'total_kill_duration_per_user',
          colorBy: 'app_sw_version',
          xLabel: 'Post Date',
          yLabel: 'Avg Daily Swipe Kill Duration',
          colorMapping: {
            'G6 Android Other Version': 'blue',
            'G6 Android 1.9': 'red',
            'G6 iOS Other Version': 'orange',
            'G6 iOS 1.9': 'green',
          },
        },
        {
          query: this.SwipeKillPercentageQuery,
          title: 'Percent of Users Logging Swipe Kills by App Version',
          x: 'postdate',
          y: 'percent_users_swipe_kill',
          colorBy: 'app_sw_version',
          xLabel: 'Post Date',
          yLabel: 'Packet Capture Percent',
          colorMapping: {
            'G6 Android Other Version': 'blue',
            'G6 Android 1.9': 'red',
            'G6 iOS Other Version': 'orange',
            'G6 iOS 1.9': 'green',
          },
        },
        {
          query: this.SwipeKillPercentageOverallQuery,
          title: 'Percent of Users Logging Swipe Kills',
          x: 'postdate',
          y: 'percent_users_swipe_kill',
          colorBy: 'app_sw_version',
          xLabel: 'Post Date',
          yLabel: 'Packet Capture Percent',
          colorMapping: {
            'All G6 iOS': 'orange',
          },
        },
      ]
    },
  },
}
</script>

<style>
</style>
