// Create this file: src/app/api/setup/create-security-code/route.js
import clientPromise from '@/lib/mongodb'

export async function POST() {
  try {
    console.log('=== SECURITY CODE CREATION START ===')
    
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const securityCodes = db.collection('security_codes')
    
    console.log('Connected to database:', db.databaseName)
    
    // Check if code already exists first
    const existingCode = await securityCodes.findOne({ code: 'MGMT-2025' })
    console.log('Existing code check:', !!existingCode)
    
    if (existingCode) {
      console.log('Code already exists:', existingCode)
      return Response.json({ 
        success: false, 
        error: 'Initial code already exists',
        existingCode: {
          code: existingCode.code,
          role: existingCode.role,
          isUsed: existingCode.isUsed
        }
      })
    }
    
    // Create initial management security code
    const initialCode = {
      code: 'MGMT-2025',
      role: 'management',
      isUsed: false,
      usedBy: null,
      createdBy: null, // System generated
      createdAt: new Date(),
      usedAt: null
    }
    
    console.log('Creating security code:', initialCode)
    
    const result = await securityCodes.insertOne(initialCode)
    
    console.log('Insert result:', {
      insertedId: result.insertedId,
      acknowledged: result.acknowledged
    })
    
    // Verify the code was created
    const verifyCode = await securityCodes.findOne({ _id: result.insertedId })
    console.log('Verification - code created:', !!verifyCode)
    
    if (verifyCode) {
      console.log('Created code details:', {
        _id: verifyCode._id,
        code: verifyCode.code,
        role: verifyCode.role,
        isUsed: verifyCode.isUsed
      })
    }
    
    console.log('=== SECURITY CODE CREATION END ===')
    
    return Response.json({ 
      success: true,
      message: 'Initial management security code created successfully',
      code: 'MGMT-2025',
      insertedId: result.insertedId,
      verification: !!verifyCode
    })
    
  } catch (error) {
    console.error('Security code creation error:', error)
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

// Also allow GET for testing
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const securityCodes = db.collection('security_codes')
    
    const allCodes = await securityCodes.find({}).toArray()
    
    return Response.json({
      success: true,
      message: 'Current security codes',
      codes: allCodes,
      count: allCodes.length,
      database: db.databaseName
    })
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}