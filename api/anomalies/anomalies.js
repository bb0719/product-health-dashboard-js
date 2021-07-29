const express = require('express')
import e from 'express'
import { readStorageCSV, getBucket } from '../utilities/storage'

const router = express.Router()



router.get('/anomalies', async (req, res, next) => {
  try {
    const region = req.query.region ? req.query.region : 'US'
    const folder = { US: 'anomaly_detection', OUS: 'anomaly_detection_ous' }[region]
    const bucket = getBucket(req)
    const csvData = await readStorageCSV(bucket, `${folder}/anomalies/anomalies.csv`)
    res.status(200).send(csvData)
  } catch (err) {
    next(err)
  }
})

router.get('/predictions', async (req, res, next) => {
  try {
    const bucket = getBucket(req)
    const query = req.query
    const region = query.region ? query.region : 'US'
    const folder = { US: 'anomaly_detection', OUS: 'anomaly_detection_ous' }[region]
    const fileName = `${folder}/predictions/${query.module}/${query.dim}/${query.dimVal}/predictions.csv`
    const csvData = await readStorageCSV(bucket, fileName)
    res.status(200).send(csvData)
  } catch (err) {
    next(err)
  }
})

router.get('/predictionsChoices', async (req, res, next) => {
  try {
    const bucket = getBucket(req)
    const query = req.query
    const region = query.region ? query.region : 'US'
    const folder = { US: 'anomaly_detection', OUS: 'anomaly_detection_ous' }[region]
    const fileName = `${folder}/predictions/choice_mappings.csv`
    const csvData = await readStorageCSV(bucket, fileName)
    for (let i = 0; i < csvData.length; i++) { // we need to fix this on the backend but this csv file
      // does not parse correctly as JSON
      try {
        let word = ''
        let choices = csvData[i].choices
        for (let l = 0; l < choices.length; l++) {
          if (choices[l] == "'") {
            if (l > 0 & l < choices.length - 1) word += '"'
          } else if (choices[l] == '"') {
            if (l > 0 & l < choices.length - 1) word += '"'
          } else {
            word += choices[l]
          }
        }
        csvData[i].choices = JSON.parse(word)
      } catch (err) {
        console.log(err)
      }
    }
    res.status(200).send(csvData)
  } catch (err) {
    next(err)
  }
})

export default router
