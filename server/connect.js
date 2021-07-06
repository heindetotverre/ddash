/* eslint-disable */
const MongoClient = require('mongodb').MongoClient

const connect = async (res) => {
  const uri = `${process.env.DB_HOST}${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_URL}/${process.env.DB_COLLECTION}?retryWrites=true&w=majority`
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true })
    const connection = await client.connect()
    return connection
  } catch (error) {
    res.status(500).json({ status: 'failed', message: error.message })
  }
}

module.exports = connect