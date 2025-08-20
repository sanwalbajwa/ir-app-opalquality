// Create this file: src/app/api/debug/security-codes/route.js
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const securityCodes = db.collection('security_codes')
    
    // Get all security codes
    const allCodes = await securityCodes.find({}).toArray()
    
    console.log('All security codes:', allCodes)
    
    return Response.json({
      success: true,
      codes: allCodes,
      count: allCodes.length,
      database: db.databaseName
    })
  } catch (error) {
    console.error('Debug error:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}