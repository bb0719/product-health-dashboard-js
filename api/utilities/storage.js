const { Storage } = require('@google-cloud/storage');
import csvToJSON from './csvParser'


const storageClient = new Storage()

const projects = {
  appEngine: "g5-dexcom-prod-eu-2",
  cloudComposerUS: "prod-us-5g-dscomposer-1",
  cloudComposerOUS: "prod-eu-5g-dscomposer-1"
}

const buckets = {
  appEngine: "g5-dexcom-prod-eu-2.appspot.com",
  cloudComposerUS: "prod-us-5g-dscomposer-1",
  cloudComposerOUS: "us-central1-datascience-com-8269ec2f-bucket"
}

const getBucket = (req) => {
  const region = req.query.region ? req.query.region : 'US'
  const projectId = {
    US: projects.appEngine,
    OUS: projects.appEngine
  }[region] || projects.appEngine

  const bucket = {
    US: buckets.appEngine,
    OUS: buckets.appEngine
  }[region] || buckets.appEngine

  storageClient.projectId = projects.appEngine
  return storageClient.bucket(bucket)
}

const readStorageCSV = async (bucket, fileName) => {
  const file = await bucket.file(fileName).download()
  const fileData = file[0]
  return csvToJSON(fileData.toString())
}



module.exports = {
  storageClient: storageClient,
  projects: projects,
  buckets: buckets,
  getBucket: getBucket,
  readStorageCSV: readStorageCSV
}
