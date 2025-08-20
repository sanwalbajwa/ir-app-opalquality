import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Please add your Mongo URI to environment variables')
}

const options = {
  serverSelectionTimeoutMS: 30000, // Increased from 10000
  connectTimeoutMS: 60000, // Increased timeout
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority',
  
  // Add these for better Vercel compatibility
  maxIdleTimeMS: 30000,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
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
  // In production, create a new client for each request
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Add connection test
clientPromise.catch(console.error)

export default clientPromise