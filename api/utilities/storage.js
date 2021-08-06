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
  cloudComposerUS: "us-central1-datascience-com-8269ec2f-bucket",
  cloudComposerOUS: "europe-west3-prod-eu-5g-dsc-0b3cdd2d-bucket"
}

const getBucket = (req) => {
  const region = req.query.region ? req.query.region : 'US'
  const projectId = {
    US: projects.cloudComposerUS,
    OUS: projects.cloudComposerOUS
  }[region] || projects.cloudComposerUS

  const bucket = {
    US: buckets.cloudComposerUS,
    OUS: buckets.cloudComposerOUS
  }[region] || buckets.cloudComposerUS

  storageClient.projectId = projectId
  return storageClient.bucket(bucket)
}

const readStorageCSV = async (bucket, fileName) => {
  const file = await bucket.file(fileName).download()
  return csvToJSON(file[0].toString())
}

const readStorageJSON = async (bucket, fileName) => {
  const file = await bucket.file(fileName).download()
  return JSON.parse(file[0].toString())
}


module.exports = {
  storageClient: storageClient,
  projects: projects,
  buckets: buckets,
  getBucket: getBucket,
  readStorageCSV: readStorageCSV,
  readStorageJSON: readStorageJSON
}
