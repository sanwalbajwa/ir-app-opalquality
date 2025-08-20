import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('ir-app-opalquality')
    const users = db.collection('users')
    const count = await users.countDocuments()
    
    return Response.json({ 
      success: true, 
      message: 'Database connected', 
      userCount: count 
    })
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}