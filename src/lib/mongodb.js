import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Please add your Mongo URI to environment variables')
}

// Aggressive SSL workaround for Vercel
const options = {
  // Disable SSL verification (not recommended for production, but might work)
  tls: true,
  tlsInsecure: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  
  // Alternative: try completely disabling SSL
  // ssl: false,
  // tls: false,
  
  // Connection settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  family: 4,
  retryWrites: true,
  w: 'majority',
  
  // Force older server API that might be more compatible
  // serverApi: {
  //   version: '1',
  //   strict: false,
  //   deprecationErrors: false,
  // }
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