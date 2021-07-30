const express = require('express')
import { bqClient, executeQuery } from './utilities/bigquery'
import anomaliesRouter from './anomalies/anomalies'

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json()) // To parse the incoming requests with JSON payloads
app.use('/anomalies', anomaliesRouter)


app.get('/test', async (req, res, next) => {
  const query = `SELECT *
  FROM \`g5-dexcom-prod-eu-2.anomaly_detection.anomalies\`
  ORDER BY run_datetime
  `
  let queryResults
  try {
    queryResults = await executeQuery(query)
    res.status(200).json({ data: queryResults })
    return
  } catch (err) {
    next(err)
  }
})


function errorHandler(err, req, res, next) {
  console.log(err)
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).send(err)
}
app.use(errorHandler)

module.exports = {
  path: '/api',
  handler: app
}
