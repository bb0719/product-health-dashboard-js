const { BigQuery } = require('@google-cloud/bigquery')
const bqClient = new BigQuery()
const executeQuery = async (queryString) => {
  return await bqClient.query(queryString)
}

module.exports = {
  bqClient: bqClient,
  executeQuery: executeQuery
}
