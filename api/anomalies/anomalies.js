const express = require('express')
import { readStorageJSON, getBucket } from '../utilities/storage'
import { executeQuery } from '../utilities/bigquery'

const router = express.Router()



router.get('/anomalies', async (req, res, next) => {
  try {
    const folder = 'anomaly_detection/dashboard/anomalies/anomalies.json'
    const bucket = getBucket(req)
    const data = await readStorageJSON(bucket, folder)
    res.status(200).send(data)
  } catch (err) {
    next(err)
  }
})

router.get('/predictions', async (req, res, next) => {
  try {
    const bucket = getBucket(req)
    const query = req.query
    const fileName = `anomaly_detection/dashboard/predictions/${query.module}/${query.dim}/${query.dimVal}/predictions.json`
    const data = await readStorageJSON(bucket, fileName)
    res.status(200).send(data)
  } catch (err) {
    next(err)
  }
})

router.get('/predictionsChoices', async (req, res, next) => {
  try {
    const bucket = getBucket(req)
    const fileName = `anomaly_detection/dashboard/predictions/choice_mappings.json`
    const data = await readStorageJSON(bucket, fileName)
    res.status(200).send(data)
  } catch (err) {
    next(err)
  }
})

router.get('/query', async (req, res, next) => {
  try {
    const query = req.query.query
    const data = await executeQuery(query)
    res.status(200).send(data[0])
  } catch (err) {
    next(err)
  }
})

export default router
