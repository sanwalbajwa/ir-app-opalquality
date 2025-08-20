// Replace your src/app/api/test-db/route.js content with this:

import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('=== MONGODB CONNECTION TEST START ===')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI)
    console.log('MongoDB URI prefix:', process.env.MONGODB_URI?.substring(0, 30))
    
    // Test the actual MongoDB connection
    console.log('Attempting to connect to MongoDB...')
    const client = await clientPromise
    console.log('✅ MongoDB client connected successfully')
    
    // Test database access
    const db = client.db('ir-app-opalquality')
    console.log('✅ Database selected:', db.databaseName)
    
    // Test a simple operation
    console.log('Testing database operation...')
    const admin = db.admin()
    const serverStatus = await admin.serverStatus()
    console.log('✅ Server status obtained, MongoDB version:', serverStatus.version)
    
    // Test collections access
    const collections = await db.listCollections().toArray()
    console.log('✅ Collections found:', collections.length)
    
    // Test users collection specifically
    const users = db.collection('users')
    const userCount = await users.countDocuments()
    console.log('✅ User count:', userCount)
    
    console.log('=== MONGODB CONNECTION TEST SUCCESS ===')
    
    return Response.json({ 
      success: true, 
      message: 'MongoDB connected successfully',
      details: {
        environment: process.env.NODE_ENV,
        mongoVersion: serverStatus.version,
        userCount: userCount,
        collectionsCount: collections.length,
        databaseName: db.databaseName,
        connectionTime: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('=== MONGODB CONNECTION ERROR ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
    console.error('=== END ERROR ===')
    
    return Response.json({ 
      success: false, 
      error: error.message,
      errorDetails: {
        name: error.name,
        code: error.code,
        environment: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}