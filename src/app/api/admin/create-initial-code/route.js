import clientPromise from '@/lib/mongodb'

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const securityCodes = db.collection('security_codes')
    
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
    
    // Check if code already exists
    const existingCode = await securityCodes.findOne({ code: 'MGMT-2025' })
    if (existingCode) {
      return Response.json({ 
        success: false, 
        error: 'Initial code already exists' 
      })
    }
    
    const result = await securityCodes.insertOne(initialCode)
    
    return Response.json({ 
      success: true,
      message: 'Initial management security code created',
      code: 'MGMT-2025',
      insertedId: result.insertedId
    })
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}