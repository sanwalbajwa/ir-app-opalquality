import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Please add your Mongo URI to environment variables')
}

const options = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority',
  maxIdleTimeMS: 30000,
  tls: true,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
}


let client
let clientPromise

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options)
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise

export default clientPromise
