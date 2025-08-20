import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

const options = {
  // Force disable SSL for Vercel compatibility
  ssl: false,
  tls: false,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  family: 4,
  retryWrites: true,
  w: 'majority'
}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise